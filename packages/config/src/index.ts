import { config as loadEnv } from 'dotenv-safe';
import path from 'node:path';
import { z } from 'zod';

const NODE_ENV = (process.env.NODE_ENV ?? 'development') as string;
const envFileName =
  NODE_ENV === 'test' ? '.env.test' : NODE_ENV === 'production' ? '.env' : '.env.dev';
const rootDir = process.cwd();

loadEnv({
  allowEmptyValues: true,
  example: path.join(rootDir, '.env.example'),
  path: path.join(rootDir, envFileName),
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MAILHOG_SMTP_URL: z.string().url(),
  SECURITY_CORS_ALLOWLIST: z
    .string()
    .default('http://localhost:3000')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    )
    .pipe(z.array(z.string().url()).min(1, 'At least one CORS origin must be configured.')),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(100),
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: z.coerce.number().int().min(1).default(5),
  CIRCUIT_BREAKER_RECOVERY_MS: z.coerce.number().int().min(1000).default(30_000),
  PRIVACY_EXPORT_SLA_DAYS: z.coerce.number().int().min(1).max(7).default(7),
});

export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = envSchema.parse(process.env);
