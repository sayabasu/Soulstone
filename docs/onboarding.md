# Soulstone Engineering Onboarding

Welcome to the Soulstone engineering team! This guide walks you through prerequisites and the commands required to get your development environment running in under 15 minutes.

## Prerequisites

- macOS, Linux, or WSL2 with Docker Desktop or Docker Engine installed.
- Node.js \>= 18.18.0 (use `nvm install` with the provided `.nvmrc`).
- [Corepack](https://nodejs.org/api/corepack.html) enabled to supply `pnpm`.
- Docker Compose v2.

## Bootstrap Steps

1. **Clone the repository** and move into it.
2. **Install dependencies**:
   ```bash
   make install
   ```
3. **Copy environment variable templates** for the modes you plan to run:
   - Development defaults live in `.env.dev` (copy from `.env.dev.example`).
   - Local overrides that should stay on your machine go in `.env.local` (copy from `.env.local.example`).
   - Automated tests read from `.env.test` (copy from `.env.test.example`).

   The configuration loader will read `.env.local` first when `NODE_ENV=development`, then fall back to `.env.dev` if no override exists. Create only the files you need—each template is ignored by Git once copied so you can safely customise secrets locally.

4. **Start dependent services**:
   ```bash
   make db-up
   ```
5. **Run the development workspace** (runs all apps in watch mode):
   ```bash
   make dev
   ```

## Workspace Commands

- `make lint` — Run ESLint across all packages.
- `make typecheck` — Execute TypeScript in no-emit mode.
- `make test` — Execute package-level tests (currently placeholders).
- `make db-logs` — Tail logs from the Docker services.
- `make db-down` — Stop the Compose stack.

## Troubleshooting

- Ensure Docker Desktop is running before `make db-up`.
- Delete volumes with `docker compose down -v` if you need a clean slate.
- Reach out in #engineering-foundations for access or tooling issues.
