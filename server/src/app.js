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

app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  }),
);
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
