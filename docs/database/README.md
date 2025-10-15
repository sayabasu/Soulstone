# Soulstone Database Operations

This guide outlines how to manage Prisma migrations, seed data, and scheduled backups for the Soulstone commerce platform.

## Prisma Workflow

All Prisma assets live in `apps/api/prisma`.

### Generate the Client

```bash
pnpm --filter @soulstone/api exec prisma generate
```

### Apply Migrations

Apply migrations against the targeted environment using a valid `DATABASE_URL`:

```bash
# Development (creates new migrations as needed)
pnpm --filter @soulstone/api exec prisma migrate dev

# Staging/Production (runs already generated migrations)
pnpm --filter @soulstone/api exec prisma migrate deploy
```

### Create a New Migration

```bash
pnpm --filter @soulstone/api exec prisma migrate dev --name <description>
```

### Seed Data

Seed fixtures are defined in `apps/api/prisma/seed.ts` and provide anonymised sample data covering the core models (users, products, collections, carts, orders, payments, reviews, articles, subscriptions, and media).

```bash
pnpm --filter @soulstone/api exec prisma db seed
```

Seeds are idempotent because the script truncates dependent tables before recreating fixtures.

## Backup & Restore Strategy

### Automated Backups

Backups are performed via `pg_dump` against the PostgreSQL service. The following cron entry (configured via your infrastructure tooling) creates compressed dumps every night and uploads them to object storage:

```cron
0 2 * * * pg_dump "$DATABASE_URL" \
  --format=custom \
  --file="/backups/soulstone-$(date +\%Y\%m\%d).dump" && \
  aws s3 cp /backups/soulstone-$(date +\%Y\%m\%d).dump s3://soulstone-backups/prod/
```

Retention is managed with an S3 lifecycle rule that keeps 30 daily, 12 monthly, and 3 yearly snapshots. Backup jobs emit CloudWatch metrics and trigger an alert if the latest successful run is older than 26 hours.

### Quarterly Restore Drill

Once per quarter, operations restores the most recent production snapshot into an isolated staging database and validates integrity:

1. Provision a fresh PostgreSQL instance or schema (e.g. `soulstone-restore-<quarter>`).
2. Restore the snapshot:
   ```bash
   aws s3 cp s3://soulstone-backups/prod/<snapshot>.dump restore.dump
   pg_restore --clean --create --dbname=postgres --host=<host> --username=<user> restore.dump
   ```
3. Run migrations in dry-run mode to ensure schema alignment:
   ```bash
   pnpm --filter @soulstone/api exec prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel apps/api/prisma/schema.prisma
   ```
4. Execute smoke checks against the restored data set using the API health checks and read queries.
5. Document findings (duration, any issues) in the operations runbook.

### Local Snapshotting

For local development, developers can create lightweight snapshots while iterating on features:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=./local.dump
pg_restore --clean --dbname=soulstone --host=localhost --username=soulstone ./local.dump
```

These dumps should never include real customer data; anonymised fixtures from the seed script are sufficient for testing.
