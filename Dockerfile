# ============================================================
# Dockerfile — Backend Pekarang.in
# Multi-stage: development & production
# ============================================================

# ---- Stage: base ----
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Stage: development ----
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- Stage: production ----
FROM base AS production
ENV NODE_ENV=production
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
