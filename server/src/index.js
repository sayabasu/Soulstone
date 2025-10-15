import { createServer } from 'http';
import createApp from './app.js';
import { loadConfig } from './config/environment.js';
import logger from './config/logger.js';

const config = loadConfig();

if (!config.databaseUrl) {
  logger.error('server.startup.missingDatabaseUrl', {
    message:
      'DATABASE_URL environment variable is required before starting the API server. Check your .env file or deployment secrets.',
  });

  process.exit(1);
}

const startServer = async () => {
  try {
    const app = await createApp();
    const server = createServer(app);

    server.listen(config.port, () => {
      logger.info('server.started', {
        port: config.port,
        environment: config.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('server.startup.failed', { error });
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (error) => {
  logger.error('server.unhandledRejection', { error });
});

process.on('uncaughtException', (error) => {
  logger.error('server.uncaughtException', { error });
  process.exit(1);
});
