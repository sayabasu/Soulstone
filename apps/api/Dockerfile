# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

RUN apk add --no-cache openssl && corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile --filter @soulstone/api...

COPY . ./

RUN pnpm --filter @soulstone/api run build

EXPOSE 4000

CMD ["pnpm", "--filter", "@soulstone/api", "run", "start"]
