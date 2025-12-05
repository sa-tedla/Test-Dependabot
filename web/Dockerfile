#################################
# Base
#################################
FROM node:18.20.6-slim AS base

RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean

#################################
# Build
#################################
FROM base AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm ci

COPY schema.prisma ./
RUN npx prisma generate --schema schema.prisma --generator client


COPY . .

RUN npm run build

#################################
# Run
#################################
FROM base

WORKDIR /app

## ビルド用のレイヤからコピーする
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules

## Svelteが動く5173ポートを開けておく
EXPOSE 3000

CMD ["node", "./build"]
