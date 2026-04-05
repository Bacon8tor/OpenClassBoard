# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Update Alpine packages to fix known CVEs
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

# Build-time flag to disable poll feature (set to "true" for nopoll image)
ARG VITE_DISABLE_POLL=false
ENV VITE_DISABLE_POLL=$VITE_DISABLE_POLL

RUN npm run build

# ── Stage 2: Serve ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN apk update && apk upgrade --no-cache && \
    npm install -g serve --ignore-scripts && \
    rm -rf /root/.npm

WORKDIR /app
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# serve: SPA mode (-s), port 3000, no directory listings
CMD ["serve", "-s", "dist", "-l", "3000"]
