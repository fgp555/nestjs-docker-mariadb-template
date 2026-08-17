# syntax=docker/dockerfile:1

################################
# Base: dependencias comunes
################################
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl
COPY package*.json ./

################################
# Development: usada por docker-compose.yml (con --watch)
################################
FROM base AS development
ENV NODE_ENV=development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

################################
# Build: compila el proyecto (dependencias completas)
################################
FROM base AS build
ENV NODE_ENV=production
RUN npm install
COPY . .
RUN npm run build
# Deja solo dependencias de producción listas para copiar
RUN npm prune --omit=dev

################################
# Production: imagen final, liviana
################################
FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/public ./public
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
USER nestjs
EXPOSE 3000
CMD ["node", "dist/main.js"]
