# ─── Build stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for better layer caching
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

RUN npm ci

COPY packages/shared ./packages/shared
COPY packages/server ./packages/server

RUN npm run build --workspace=@forms/shared
RUN npx prisma generate --schema=packages/server/prisma/schema.prisma
RUN npm run build --workspace=server

# ─── Production stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/

RUN npm ci --omit=dev

# Built JS artifacts
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/src/generated ./packages/server/src/generated

# Prisma: migration files + config (needed for migrate deploy)
COPY packages/server/prisma ./packages/server/prisma
COPY packages/server/prisma.config.ts ./packages/server/prisma.config.ts

WORKDIR /app/packages/server

EXPOSE 4000

# Run migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]