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
});

export type AppEnv = z.infer<typeof envSchema>;
export const env: AppEnv = envSchema.parse(process.env);
