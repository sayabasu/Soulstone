import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenvSafe from 'dotenv-safe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MONOREPO_ROOT = path.resolve(__dirname, '../../..');
const DEFAULT_EXAMPLE = path.resolve(MONOREPO_ROOT, '.env.example');

const resolveCandidate = (directories, filenames) => {
  for (const directory of directories) {
    for (const filename of filenames) {
      const candidate = path.resolve(directory, filename);

      if (existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

/**
 * Load and validate environment variables using dotenv-safe. Preference is given to
 * developer-specific configuration files while still falling back to the shared templates
 * committed to the repository.
 *
 * @param {object} [options]
 * @param {string} [options.mode] - Optional environment mode override.
 * @param {string} [options.cwd] - Directory to search first for env files.
 * @param {string[]} [options.filenames] - Explicit filenames to check in order.
 * @returns {{ envFile: string | null, exampleFile: string }} Metadata describing the resolved env files.
 */
export const loadEnvironment = (options = {}) => {
  const mode = options.mode ?? process.env.NODE_ENV ?? 'development';
  const directories = [options.cwd ?? process.cwd(), MONOREPO_ROOT];
  const defaultFilenames = ['.env.local', mode === 'test' ? '.env.test' : '.env.dev', '.env'];
  const filenames = options.filenames ?? defaultFilenames;

  const envFile = resolveCandidate(directories, filenames);

  dotenvSafe.config({
    allowEmptyValues: false,
    example: DEFAULT_EXAMPLE,
    path: envFile ?? DEFAULT_EXAMPLE,
  });

  if (envFile) {
    process.env.ENV_FILE_USED = path.basename(envFile);
  } else if (!process.env.ENV_FILE_USED) {
    process.env.ENV_FILE_USED = 'process environment';
  }

  return {
    envFile,
    exampleFile: DEFAULT_EXAMPLE,
  };
};

export default {
  loadEnvironment,
};
