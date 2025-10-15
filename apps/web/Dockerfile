# syntax=docker/dockerfile:1
FROM node:20-alpine

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages ./packages
COPY apps/web/package.json ./apps/web/package.json

RUN pnpm install --frozen-lockfile --filter @soulstone/web...

COPY . ./

EXPOSE 5173

CMD ["pnpm", "--filter", "@soulstone/web", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
