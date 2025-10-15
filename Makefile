SHELL := /bin/bash

.PHONY: install dev lint typecheck test build format db:up db:down db:migrate db:seed bootstrap

install:
	pnpm install

dev:
	pnpm dev

lint:
	pnpm lint

typecheck:
	pnpm typecheck

test:
	pnpm test

build:
	pnpm build

format:
	pnpm format

db:up:
	docker compose up -d postgres redis mailhog localstack

db:down:
	docker compose down

db:migrate:
	pnpm --filter @soulstone/api run prisma:migrate

db:seed:
	@echo "No seed script defined yet. Add prisma seeders in apps/api when available."

bootstrap: install db:up
	@echo "Environment is ready. Use 'pnpm dev' to start application services."
