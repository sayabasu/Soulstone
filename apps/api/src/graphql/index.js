import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js';
import logger from '../config/logger.js';

export const initializeGraphQL = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
  });

  await server.start();

  app.use('/graphql', expressMiddleware(server));
  logger.info('graphql.ready', { path: '/graphql' });
};

export default initializeGraphQL;
