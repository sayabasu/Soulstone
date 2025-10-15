import { existsSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import logger from './logger.js';

const ENV_FILENAMES = ['.env', '.env.example'];
const SEARCH_DIRECTORIES = [process.cwd(), path.resolve(process.cwd(), '..')];

/**
 * Resolve the environment file that should be loaded. Preference is given to `.env`
 * files when they exist; otherwise the first available `.env.example` file is used.
 *
 * @returns {string | null} The basename of the environment file that was loaded or `null` when none were found.
 */
const resolveActiveEnvFile = () => {
  for (const filename of ENV_FILENAMES) {
    for (const directory of SEARCH_DIRECTORIES) {
      const candidate = path.resolve(directory, filename);

      if (existsSync(candidate)) {
        dotenv.config({ path: candidate, override: true });
        return filename;
      }
    }
  }

  dotenv.config();
  return null;
};

const activeEnvFile = resolveActiveEnvFile();

if (!process.env.ENV_FILE_USED && activeEnvFile) {
  process.env.ENV_FILE_USED = activeEnvFile;
}

const envSource = process.env.ENV_FILE_USED ?? 'process environment';

logger.info('Loaded environment configuration', { source: envSource });

/**
 * Convert a comma or newline separated string of origins into a sanitized list.
 *
 * @param {string | undefined} value - Raw environment variable value containing allowed origins.
 * @returns {string[]} List of trimmed origin values.
 */
const parseAllowedOrigins = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(/,|\n/)
    .map((origin) => origin.trim())
    .filter(Boolean);
};

/**
 * Load the runtime configuration from the current process environment.
 *
 * @returns {{
 *   nodeEnv: string,
 *   port: number,
 *   jwtSecret: string,
 *   tokenExpiresIn: string,
 *   databaseUrl: string,
 *   allowedOrigins: string[],
 * }}
 */
export const loadConfig = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '4000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'changeme',
  tokenExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  databaseUrl: process.env.DATABASE_URL ?? '',
  allowedOrigins: parseAllowedOrigins(process.env.CORS_ORIGINS ?? ''),
});

export default loadConfig;
