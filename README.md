# Soulstone

Soulstone is a full-stack commerce and learning platform delivered through a monorepo that houses the web frontend, API backend, shared tooling, and infrastructure assets.

## Repository Structure

- `apps/api` – Node.js/Express API with Prisma, GraphQL, and REST surface areas.
- `apps/web` – React client powered by Vite and Material UI.
- `packages/config` – Shared helpers for environment loading and configuration management.
- `packages/ui` – Design system and reusable UI primitives (placeholder scaffolding for now).
- `packages/tsconfig` – Shared TypeScript compiler options for Node and React targets.
- `packages/eslint-config` – Centralized ESLint rules consumed across the workspace.
- `infra/terraform` – Terraform modules and stacks (scaffolding).
- `ops` – Operational tooling and runbooks (scaffolding).
- `docs` – Product and engineering documentation, including onboarding instructions.

## Tooling Requirements

- Node.js 20 (managed via `.nvmrc`)
- PNPM 9 (Corepack included with Node 20)
- Docker Engine with Compose v2

## Getting Started

1. Install dependencies and bring up backing services:
   ```bash
   make bootstrap
   ```
2. Start all applications in watch mode:
   ```bash
   pnpm dev
   ```

Consult [`docs/ONBOARDING.md`](docs/ONBOARDING.md) for the full setup checklist.

## Workspace Scripts

These scripts can be executed from the repository root and will fan out to every workspace.

```bash
pnpm build      # Build all packages/apps (generates Prisma client for the API)
pnpm lint       # Run ESLint with the shared configuration
pnpm typecheck  # Perform TypeScript checks using shared configs
pnpm test       # Execute package-specific test suites
pnpm format     # Run Prettier in check mode
```

## Docker Compose Environment

The repository ships with a Compose stack that provisions Postgres 15, Redis 7, MailHog, LocalStack, and the application containers. Health checks ensure dependencies are ready before services start.

```bash
docker compose up --build
```

Environment variables live in `.env.dev`, `.env.test`, and `.env.local` (ignored by Git). `.env.example` documents all required variables.

## Contributing

- Follow the feature-based structure documented in `Agents.md`.
- Keep API contracts and shared types in sync between `apps/api` and `packages`.
- Update relevant documents in `docs/` when introducing or changing functionality.
- Never commit secrets; update `.env.example` whenever new variables are required.
