# Soulstone

Soulstone is a full-stack learning platform that combines a React-based client, a Node.js/Express server, and shared type definitions to deliver a cohesive experience for learners and instructors. This repository hosts the complete monorepo, including frontend, backend, shared utilities, and documentation resources.

## Repository Structure
- `client/` – React application organized by feature folders under `src/features`.
- `server/` – Node.js backend exposing REST APIs, with modules that mirror frontend features and integrations for external services.
- `shared/` – Reusable types and helpers consumed by both the client and server.
- `docs/` – Project documentation, including API specs, database schema references, and feature notes.
- `package.json` – Root package manifest that coordinates workspace scripts and dependencies.

## Development Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL and MongoDB instances for persistent storage

Install dependencies from the repository root:

```bash
npm install
```

## Running with Docker
The repository includes Docker images for the client and server. Docker Compose now attempts to load
configuration from a local `.env` file first and falls back to `.env.example` if the local override is
missing. Update `.env` to customize your host port bindings or other secrets while keeping `.env.example`
as the shared template.

```bash
docker compose up --build
```

The default configuration exposes the client at <http://localhost:5173> and the API at <http://localhost:4000>.
Adjust the `PORT` and `CLIENT_PORT` values in your `.env` to change the ports published on your machine. Set
the `DATABASE_URL` in `.env.example` (or your local `.env`) to point at your hosted PostgreSQL instance.

## Common Scripts
Run scripts from the repository root unless otherwise noted.

```bash
npm run dev          # Start client and server in development mode
npm run lint         # Lint the codebase with ESLint
npm run test         # Execute the test suite
npm run prisma:migrate # Apply database migrations for the Prisma-managed Postgres schema
```

## Contribution Guidelines
- Follow the feature-based folder structure for both frontend and backend additions.
- Write JSDoc comments for all functions and APIs.
- Update the documentation in `docs/` when introducing new features or modifying existing behavior.
- Do not commit sensitive configuration values; rely on environment variables and update `.env.example` when needed.

For more detailed standards, review the project-wide guidelines in `Agents.md`.
