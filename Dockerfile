FROM node:20-bookworm-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

ENV NODE_ENV=production

# Default command: sync DB then start (deploy commands + run bot)
CMD sh -lc "npm run sync-db && npm run start"