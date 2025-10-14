import morgan from 'morgan';
import logger from '../config/logger.js';

const stream = {
  write: (message) => {
    const trimmed = message.trim();
    if (trimmed) {
      logger.info('http.access', { message: trimmed });
    }
  },
};

const requestLogger = morgan('combined', { stream });

export default requestLogger;
