import { env } from '@soulstone/config';
import http from 'node:http';
import process from 'node:process';

const request = http.request(
  {
    host: '127.0.0.1',
    port: env.PORT,
    path: '/healthz',
    method: 'GET',
    timeout: 5_000,
  },
  (response) => {
    response.resume();

    if (response.statusCode && response.statusCode < 400) {
      process.exit(0);
      return;
    }

    process.exit(1);
  },
);

request.on('error', () => {
  process.exit(1);
});

request.on('timeout', () => {
  request.destroy(new Error('Healthcheck timed out'));
  process.exit(1);
});

request.end();
