import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';

import { createCorsOptions } from './config/cors.js';
import { loadConfig } from './config/environment.js';
import logger from './config/logger.js';
import swaggerDocument from './docs/swagger.js';
import { initializeGraphQL } from './graphql/index.js';
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import routes from './routers/index.js';

export const createApp = async () => {
  const app = express();
  const config = loadConfig();

  app.use(cors(createCorsOptions(config.allowedOrigins)));
  app.use(helmet());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  await initializeGraphQL(app);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/api', routes);

  app.use(errorHandler);

  app.use((req, _res, next) => {
    logger.warn('app.not_found', { path: req.originalUrl, method: req.method });
    next();
  });

  return app;
};

export default createApp;
