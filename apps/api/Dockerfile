# syntax=docker/dockerfile:1.6

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH="${PNPM_HOME}:$PATH"
RUN corepack enable
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/tsconfig/package.json ./packages/tsconfig/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @soulstone/api... build
RUN pnpm deploy --filter @soulstone/api --prod /workspace/deploy

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

COPY --from=base /workspace/deploy/ ./

USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD ["node", "-e", "(async()=>{try{const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),4000);const res=await fetch('http://127.0.0.1:3000/health',{signal:controller.signal});clearTimeout(timeout);if(!res.ok){process.exit(1);}process.exit(0);}catch(error){process.exit(1);}})()"]
CMD ["node", "dist/index.js"]
