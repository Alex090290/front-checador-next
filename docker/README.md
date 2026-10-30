# Front del Checador en Docker

## Qué corre

Un contenedor por ambiente con el servidor de Next.js (`node server.js`, modo standalone, usuario `node`).
Escucha en el puerto 3000 dentro del contenedor y se publica solo en `127.0.0.1`.
Se entra por el túnel de Cloudflare.

| Ambiente | Rama      | Proyecto compose          | Puerto            | Dominio                                 |
|----------|-----------|---------------------------|-------------------|-----------------------------------------|
| prod     | `master`  | `checador-front-prod`     | `127.0.0.1:3003`  | checador.gamaconsumibles.com.mx         |
| staging  | `staging` | `checador-front-staging`  | `127.0.0.1:3004`  | stagingcheck.gamaconsumibles.com.mx     |

Cada push a `master` o `staging` corre `.github/workflows/deploy.yml`, que llama a `bash docker/deploy.sh prod|staging`.

## Dónde van las variables

Fuera del repo, en el servidor:

```
/opt/checador-front/prod.env
/opt/checador-front/staging.env
```

La carpeta se puede cambiar con la variable `CHECADOR_FRONT_CONFIG_DIR`.
El script también guarda ahí:

- `/opt/checador-front/<env>/docker-compose.yml`: copia del compose que se usa en el deploy.
- `/opt/checador-front/<env>.current`: tag de la imagen que está corriendo; sirve para el rollback.

Formato: una variable por línea, `NOMBRE="valor"`, sin espacios alrededor del `=`.

## Cómo cambiar una variable

Hay dos tipos:

- **De ejecución** (`AUTH_SECRET`, `API_URL`, `NEXTAUTH_URL`, `ENVIROMENT`, `ID_DEV_SISTEM_*`, …):
  se leen al arrancar el contenedor. Edita el `.env` y recrea el contenedor (no basta con `docker restart`, porque no vuelve a leer el archivo):

  ```bash
  cd /opt/checador-front/prod
  IMAGE_TAG=$(cat ../prod.current) HOST_PORT=3003 ENV_FILE=/opt/checador-front/prod.env \
    docker compose -p checador-front-prod up -d --force-recreate
  ```

  O simplemente vuelve a desplegar (ver abajo).

- **De compilación** (todas las `NEXT_PUBLIC_*`, hoy solo `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`):
  quedan horneadas en el JavaScript de la imagen. Después de editarlas **hay que volver a desplegar** para compilar una imagen nueva; un restart no las cambia.
  Si agregas una `NEXT_PUBLIC_*` nueva, declárala también como `ARG`/`ENV` en el `Dockerfile`.

## Comandos útiles

```bash
# Contenedores del front y su estado (healthy / unhealthy)
docker ps --filter name=checador-front

# Logs
docker logs -f --tail 200 checador-front-prod-web-1
docker logs -f --tail 200 checador-front-staging-web-1

# Imagen que está corriendo
cat /opt/checador-front/prod.current

# Deploy manual (desde un checkout del repo en la rama correcta)
git checkout master && git pull
bash docker/deploy.sh prod

# También se puede volver a correr el job "Deploy frontend" desde GitHub Actions (Re-run jobs).
```

## Qué hace `deploy.sh`

1. Copia `docker/docker-compose.yml` a `/opt/checador-front/<env>/`.
2. Compila la imagen `checador-front:<commit>-<env>` pasando las `NEXT_PUBLIC_*` del `.env` como `--build-arg`.
3. Levanta el contenedor y espera hasta 2 minutos a que quede `healthy` (healthcheck a `/api/server-time`).
4. Si queda sano: guarda el tag en `<env>.current` y borra imágenes sin usar de más de 14 días.
5. Si no: muestra los últimos logs, regresa al tag de `<env>.current` y termina con error.
