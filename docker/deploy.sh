#!/usr/bin/env bash
# Despliega el front del Checador en Docker.
# Uso: bash docker/deploy.sh prod|staging
set -euo pipefail

ENV_NAME="${1:-}"
case "$ENV_NAME" in
  prod)    HOST_PORT=3003 ;;
  staging) HOST_PORT=3004 ;;
  *) echo "Uso: $0 prod|staging" >&2; exit 2 ;;
esac

CONFIG_DIR="${CHECADOR_FRONT_CONFIG_DIR:-/opt/checador-front}"
ENV_FILE="$CONFIG_DIR/$ENV_NAME.env"
DEPLOY_DIR="$CONFIG_DIR/$ENV_NAME"
CURRENT_FILE="$CONFIG_DIR/$ENV_NAME.current"
PROJECT="checador-front-$ENV_NAME"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HEALTH_TIMEOUT=120

log() { echo "[deploy $ENV_NAME] $*"; }

if [[ ! -f "$ENV_FILE" ]]; then
  echo "No existe $ENV_FILE. Créalo con las variables del ambiente (ver docker/README.md)." >&2
  exit 1
fi

# El checkout del runner se reescribe en cada deploy y lo comparten las dos ramas:
# se trabaja con una copia del compose fuera del repo.
mkdir -p "$DEPLOY_DIR"
cp "$REPO_DIR/docker/docker-compose.yml" "$DEPLOY_DIR/docker-compose.yml"
COMPOSE_FILE="$DEPLOY_DIR/docker-compose.yml"

# Las variables se hornean en la imagen, así que el tag lleva el ambiente.
SHA="$(git -C "$REPO_DIR" rev-parse --short HEAD)"
IMAGE_TAG="$SHA-$ENV_NAME"
PREV_TAG="$(cat "$CURRENT_FILE" 2>/dev/null || true)"

# Las variables NEXT_PUBLIC_* se leen al compilar: se pasan como --build-arg.
# Se leen del .env sin ejecutarlo (sin "source") y se quitan las comillas.
BUILD_ARGS=()
while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%$'\r'}"
  [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?(NEXT_PUBLIC_[A-Za-z0-9_]+)[[:space:]]*=(.*)$ ]] || continue
  key="${BASH_REMATCH[2]}"
  value="${BASH_REMATCH[3]}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  if [[ "$value" =~ ^\"(.*)\"$ || "$value" =~ ^\'(.*)\'$ ]]; then
    value="${BASH_REMATCH[1]}"
  fi
  BUILD_ARGS+=(--build-arg "$key=$value")
  log "build-arg $key"
done < "$ENV_FILE"

compose() {
  local tag="$1"; shift
  IMAGE_TAG="$tag" HOST_PORT="$HOST_PORT" ENV_FILE="$ENV_FILE" \
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" "$@"
}

# Espera a que el contenedor quede healthy. Devuelve 1 si queda unhealthy,
# se detiene o se acaba el tiempo.
wait_healthy() {
  local tag="$1" waited=0 cid status
  while (( waited < HEALTH_TIMEOUT )); do
    cid="$(compose "$tag" ps -q web || true)"
    if [[ -n "$cid" ]]; then
      status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || echo unknown)"
      case "$status" in
        healthy) return 0 ;;
        unhealthy|exited|dead) log "Estado del contenedor: $status"; return 1 ;;
      esac
    fi
    sleep 5
    waited=$(( waited + 5 ))
  done
  log "No quedó healthy en ${HEALTH_TIMEOUT}s"
  return 1
}

log "Compilando checador-front:$IMAGE_TAG"
docker build "${BUILD_ARGS[@]}" -t "checador-front:$IMAGE_TAG" "$REPO_DIR"

log "Levantando $PROJECT en 127.0.0.1:$HOST_PORT"
compose "$IMAGE_TAG" up -d --remove-orphans

if wait_healthy "$IMAGE_TAG"; then
  echo "$IMAGE_TAG" > "$CURRENT_FILE"
  log "OK: checador-front:$IMAGE_TAG está sano"
  docker image prune -af --filter "until=336h" >/dev/null || true
  exit 0
fi

log "El deploy falló. Últimos logs:"
compose "$IMAGE_TAG" logs --tail 100 web || true

if [[ -n "$PREV_TAG" && "$PREV_TAG" != "$IMAGE_TAG" ]] && docker image inspect "checador-front:$PREV_TAG" >/dev/null 2>&1; then
  log "Regresando a checador-front:$PREV_TAG"
  compose "$PREV_TAG" up -d --remove-orphans
  if wait_healthy "$PREV_TAG"; then
    log "Rollback OK: sigue corriendo checador-front:$PREV_TAG"
  else
    log "El rollback a $PREV_TAG tampoco quedó sano. Revisar a mano."
  fi
else
  log "No hay una versión anterior para regresar."
fi
exit 1
