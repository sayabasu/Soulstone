import { PrismaClient } from '@prisma/client';
import { loadConfig } from '../config/environment.js';
import logger from '../config/logger.js';

const config = loadConfig();

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
