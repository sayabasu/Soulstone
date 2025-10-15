import { env } from '@soulstone/config';
import http from 'node:http';

import { getThemeSnapshot } from './index';

export const createServer = () => {
  const server = http.createServer((request, response) => {
    if (!request.url) {
      response.statusCode = 400;
      response.end('Bad Request');
      return;
    }

    if (request.method === 'GET' && request.url === '/health') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    }

    if (request.method === 'GET' && request.url === '/theme') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify(getThemeSnapshot()));
      return;
    }

    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Not Found' }));
  });

  return server;
};

export const bootstrap = () => {
  const server = createServer();
  const port = env.PORT;

  return server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Web server listening on port ${port}`);
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const listener = bootstrap();
  const shutdown = (signal: NodeJS.Signals) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Closing web server.`);

    listener.close(() => {
      // eslint-disable-next-line no-console
      console.log('Web server shut down gracefully.');
      process.exit(0);
    });

    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
