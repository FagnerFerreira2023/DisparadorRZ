# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências necessárias para compilação (se houver node-gyp)
RUN apk add --no-cache python3 make g++ 

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Productive Runtime
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# Instala apenas dependências de produção
RUN npm install --omit=dev && npm cache clean --force

# Copia apenas os arquivos compilados e os estáticos
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/schema.sql ./dist/db/schema.sql
COPY --from=builder /app/src/db/migrations ./dist/db/migrations
COPY --from=builder /app/public ./public

# Cria a pasta de sessões para persistência
RUN mkdir -p auth && chmod 777 auth

EXPOSE 8787

CMD ["node", "dist/index.js"]
