.PHONY: install bootstrap dev lint test typecheck format db-up db-down db-logs db-seed db-reset clean

install:
corepack enable pnpm
pnpm install

bootstrap: install db-up

dev:
pnpm dev

lint:
pnpm lint

test:
pnpm test

typecheck:
pnpm typecheck

format:
pnpm format

clean:
pnpm clean || true
docker compose down -v || true

# Database helpers
db-up:
docker compose up -d postgres redis mailhog localstack
docker compose ps

db-down:
docker compose down

db-logs:
docker compose logs -f postgres redis mailhog localstack

db-seed:
pnpm exec tsx scripts/seed.ts

db-reset: db-down clean db-up
