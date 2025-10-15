import { env } from '@soulstone/config';
import { colorPalette, getSpacing } from '@soulstone/ui';
import http from 'node:http';
import process from 'node:process';

export interface ThemeSnapshot {
  colors: typeof colorPalette;
  spacing: Record<string, string>;
  apiBaseUrl: string;
}

export const getThemeSnapshot = (): ThemeSnapshot => ({
  colors: colorPalette,
  spacing: {
    compact: getSpacing('xs'),
    comfortable: getSpacing('md'),
    spacious: getSpacing('xl'),
  },
  apiBaseUrl: env.DATABASE_URL,
});

const createRequestListener =
  (snapshot: ThemeSnapshot): http.RequestListener =>
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
    response.end(JSON.stringify({ theme: snapshot }));
  };

export const createServer = (snapshot = getThemeSnapshot()): http.Server =>
  http.createServer(createRequestListener(snapshot));

export interface RunningServer {
  server: http.Server;
  port: number;
}

export const startServer = async (
  port = env.PORT,
  snapshot = getThemeSnapshot(),
): Promise<RunningServer> => {
  const server = createServer(snapshot);

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Web server listening on port ${port}`);
      resolve();
    });
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  return { server, port };
};

export const shutdownServer = async (server: http.Server): Promise<void> =>
  new Promise((resolve) => {
    server.close((error) => {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error during web shutdown', error);
      }
      resolve();
    });
  });

if (import.meta.url === `file://${process.argv[1]}`) {
  const { server, port } = await startServer();

  const handleSignal = async (signal: NodeJS.Signals) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Shutting down web server on port ${port}.`);
    await shutdownServer(server);
    process.exit(0);
  };

  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);
}
