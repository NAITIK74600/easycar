# Multi-stage Docker build for Easy Cars Biel
FROM node:22-alpine AS builder

WORKDIR /app

# Build backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy built frontend assets
COPY dist /app/dist

# Setup backend runtime
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/server/dist ./dist
COPY server/data ./data
COPY server/.env.example ./.env

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
