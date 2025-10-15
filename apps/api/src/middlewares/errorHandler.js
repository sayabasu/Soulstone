import logger from '../config/logger.js';

/**
 * Centralized error handling middleware.
 * @param {import('express').ErrorRequestHandler} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  logger.error('app.error', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode ?? 500;

  res.status(status).json({
    error: err.name ?? 'Error',
    message: err.message ?? 'Unexpected error',
    details: err.details ?? null,
  });
};

export default errorHandler;
