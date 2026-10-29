# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
# Pages are pre-built and images pre-sized, so the server needs little memory.
# A small heap keeps Railway RAM low (about 85 MB idle, ~105 MB under load).
ENV NODE_OPTIONS="--max-old-space-size=96 --max-semi-space-size=2"
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
USER app
EXPOSE 3000
CMD ["node", "server.js"]
