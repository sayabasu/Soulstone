import fs from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

import { env } from '@soulstone/config';

async function ensureMigrationsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function loadMigrationFiles(): Promise<string[]> {
  const migrationsDir = path.join(process.cwd(), 'ops', 'migrations');
  try {
    const files = await fs.readdir(migrationsDir);
    return files.filter((fileName) => fileName.endsWith('.sql')).sort((a, b) => a.localeCompare(b));
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function hasMigrationRun(client: Client, name: string): Promise<boolean> {
  const result = await client.query<{ exists: boolean }>(
    'SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE name = $1) AS exists',
    [name],
  );

  return result.rows[0]?.exists ?? false;
}

async function applyMigration(client: Client, name: string, sql: string) {
  console.log(`\u001b[36m→ Applying migration:\u001b[0m ${name}`);
  await client.query('BEGIN');
  try {
    if (sql.trim().length > 0) {
      await client.query(sql);
    }
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`\u001b[32m✓ Migration applied:\u001b[0m ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`\u001b[31m✗ Migration failed:\u001b[0m ${name}`);
    throw error;
  }
}

async function runMigrations() {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await ensureMigrationsTable(client);

    const migrationFiles = await loadMigrationFiles();
    if (migrationFiles.length === 0) {
      console.log('No migrations to run.');
      return;
    }

    for (const fileName of migrationFiles) {
      if (await hasMigrationRun(client, fileName)) {
        console.log(`Skipping already applied migration: ${fileName}`);
        continue;
      }

      const safeFileName = path.basename(fileName);
      if (safeFileName !== fileName) {
        throw new Error(`Refusing to load migration with invalid path segment: ${fileName}`);
      }

      const filePath = path.join(process.cwd(), 'ops', 'migrations', safeFileName);
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Safe after basename validation above.
      const sql = await fs.readFile(filePath, 'utf8');
      await applyMigration(client, fileName, sql);
    }
  } finally {
    await client.end();
  }
}

runMigrations().catch((error) => {
  console.error('Migration execution failed:', error);
  process.exitCode = 1;
});
