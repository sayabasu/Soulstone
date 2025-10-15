import { PrismaClient } from '@prisma/client';
import { loadConfig } from '../config/environment.js';
import logger from '../config/logger.js';

const config = loadConfig();

if (!config.databaseUrl) {
  const errorMessage =
    'DATABASE_URL environment variable is missing. Provide a valid Postgres connection string before starting the API server.';

  logger.error('prisma.missingDatabaseUrl', {
    message: errorMessage,
  });

  throw new Error(errorMessage);
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.databaseUrl,
    },
  },
  log: ['error'],
});

process.once('beforeExit', async () => {
  logger.info('process.beforeExit.prismaDisconnect');
  await prisma.$disconnect();
});

export default prisma;
