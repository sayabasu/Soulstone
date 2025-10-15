import { env } from '@soulstone/config';

export interface ApiContext {
  port: number;
  databaseUrl: string;
}

export const createApiContext = (): ApiContext => ({
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
});

export const bootstrap = () => {
  const context = createApiContext();
  return `API bootstrapped on port ${context.port} using ${context.databaseUrl}`;
};

if (import.meta.url === `file://${process.argv[1]}`) {
  // eslint-disable-next-line no-console
  console.log(bootstrap());
}
