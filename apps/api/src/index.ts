import { env } from '@soulstone/config';
import http from 'node:http';
import process from 'node:process';

export interface ApiContext {
  port: number;
  databaseUrl: string;
}

export const createApiContext = (): ApiContext => ({
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
});

const createRequestListener =
  (context: ApiContext): http.RequestListener =>
  (request, response) => {
    if (!request.url) {
      response.statusCode = 404;
      response.end();
      return;
    }

    if (request.url === '/healthz') {
      response.statusCode = 200;
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        message: 'Soulstone API ready',
        port: context.port,
        databaseUrl: context.databaseUrl,
      }),
    );
  };

export const createServer = (context: ApiContext): http.Server =>
  http.createServer(createRequestListener(context));

export interface RunningServer {
  server: http.Server;
  context: ApiContext;
}

export const startServer = async (context = createApiContext()): Promise<RunningServer> => {
  const server = createServer(context);

  await new Promise<void>((resolve) => {
    server.listen(context.port, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on port ${context.port}`);
      resolve();
    });
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  return { server, context };
};

export const shutdownServer = async (server: http.Server): Promise<void> =>
  new Promise((resolve) => {
    server.close((error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error during API shutdown', error);
      }
      resolve();
    });
  });

if (import.meta.url === `file://${process.argv[1]}`) {
  const { server } = await startServer();

  const handleSignal = async (signal: NodeJS.Signals) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Shutting down API gracefully.`);
    await shutdownServer(server);
    process.exit(0);
  };

  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);
}
