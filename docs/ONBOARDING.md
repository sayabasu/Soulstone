# Soulstone Engineering Onboarding

Welcome to Soulstone! This guide helps you bootstrap the engineering environment in under 15 minutes.

## Prerequisites

- Node.js 20 (use `nvm install 20` and `nvm use`)
- PNPM 9 (Corepack will enable it automatically)
- Docker Desktop or Docker Engine + Docker Compose v2
- Make (installed by default on macOS/Linux; Windows developers can use WSL2)

## First-Time Setup

1. Clone the repository and `cd` into the project root.
2. Copy `.env.dev` to `.env.local` if you need to override any defaults:
   ```bash
   cp .env.dev .env.local
   ```
3. Install dependencies and start the shared services:
   ```bash
   make bootstrap
   ```
4. Start the application servers:
   ```bash
   pnpm dev
   ```

The API runs on http://localhost:4000 and the web client on http://localhost:5173.

## Common Tasks

- Run tests: `pnpm test`
- Lint code: `pnpm lint`
- Type-check: `pnpm typecheck`
- Format code: `pnpm format`
- Apply database migrations: `make db:migrate`
- Start feature branches from `main` following the `feature/*`, `fix/*`, or `chore/*` naming scheme.
- Write commits using the Conventional Commits format (`type(scope): summary`); commitlint runs automatically in Husky hooks.

## Troubleshooting

- Ensure Docker containers are healthy via `docker compose ps`.
- Remove volumes if Postgres migrations fail: `docker compose down -v`.
- Regenerate Prisma client after schema changes: `pnpm --filter @soulstone/api run prisma:generate`.
