import dotenv from 'dotenv';

dotenv.config();

const parseAllowedOrigins = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(/,|\n/)
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const loadConfig = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number.parseInt(process.env.PORT ?? '4000', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'changeme',
  tokenExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  databaseUrl: process.env.DATABASE_URL ?? '',
  allowedOrigins: parseAllowedOrigins(process.env.CORS_ORIGINS ?? ''),
});

export default loadConfig;
