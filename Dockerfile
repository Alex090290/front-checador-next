# syntax=docker/dockerfile:1

# Front del Checador (Next.js con SSR, server actions y middleware de auth).
# Necesita un servidor Node: se compila en modo "standalone" y se sirve con node server.js.

ARG NODE_IMAGE=node:22-bookworm-slim

# ---------- 1. Dependencias ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---------- 2. Compilación ----------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables que Next "hornea" en el JavaScript del navegador al compilar.
# Cambiarlas exige volver a compilar la imagen (un restart no basta).
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=""
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}

# Límite de memoria de Node durante el build (el servidor tiene 4 GB)
ARG NODE_BUILD_MEMORY=2560
ENV NODE_OPTIONS=--max-old-space-size=${NODE_BUILD_MEMORY}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- 3. Ejecución ----------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000

# /api/server-time es una ruta ligera que no pasa por el login
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/server-time').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
