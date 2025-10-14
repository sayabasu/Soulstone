import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { loadConfig } from './config/environment.js';
import logger from './config/logger.js';
import requestLogger from './middlewares/requestLogger.js';
import errorHandler from './middlewares/errorHandler.js';
import routes from './routers/index.js';
import swaggerDocument from './docs/swagger.js';

const app = express();
const config = loadConfig();

/**
 * Build the CORS configuration based on the allowed origins list.
 *
 * The configuration supports multiple origins provided via environment
 * variables and gracefully handles requests without an origin (for example
 * from server-to-server calls). When no origins are configured we log a
 * warning and disable cross-origin access entirely to avoid exposing the
 * API inadvertently.
 *
 * @param {string[]} allowedOrigins - List of allowed origins from config.
 * @returns {import('cors').CorsOptions} - Configured CORS options.
 */
const createCorsOptions = (allowedOrigins) => {
  if (!allowedOrigins || allowedOrigins.length === 0) {
    logger.warn('cors.no_allowed_origins');
    return {
      origin: false,
      credentials: true,
    };
  }

  if (allowedOrigins.includes('*')) {
    return {
      origin: true,
      credentials: true,
    };
  }

  const allowedOriginsSet = new Set(allowedOrigins);

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOriginsSet.has(origin)) {
        callback(null, true);
        return;
      }

      logger.warn('cors.origin_blocked', { origin });
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };
};

app.use(cors(createCorsOptions(config.allowedOrigins)));
app.use(helmet());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', routes);

app.use(errorHandler);

app.use((req, _res, next) => {
  logger.warn('app.not_found', { path: req.originalUrl, method: req.method });
  next();
});

export default app;
