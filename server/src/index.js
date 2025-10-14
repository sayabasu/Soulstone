import { createServer } from 'http';
import app from './app.js';
import { loadConfig } from './config/environment.js';
import logger from './config/logger.js';

const config = loadConfig();

const server = createServer(app);

server.listen(config.port, () => {
  logger.info('server.started', {
    port: config.port,
    environment: config.nodeEnv,
  });
});

process.on('unhandledRejection', (error) => {
  logger.error('server.unhandledRejection', { error });
});

process.on('uncaughtException', (error) => {
  logger.error('server.uncaughtException', { error });
  process.exit(1);
});
