import { GraphQLError } from 'graphql';

import {
  findProductsConnection,
  getProductBySlug,
  listCollectionsSummary,
} from '../modules/catalog/catalog.service.js';

const INR_CURRENCY_CODE = 'INR';

export const resolvers = {
  Query: {
    products: async (_parent, args) => {
      try {
        return await findProductsConnection({
          filter: args.filter,
          sort: args.sort,
          first: args.first,
          after: args.after,
        });
      } catch (error) {
        if (error instanceof RangeError) {
          throw new GraphQLError(error.message, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        throw error;
      }
    },
    productBySlug: async (_parent, { slug }) => {
      const product = await getProductBySlug(slug);
      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return product;
    },
    collections: async () => listCollectionsSummary(),
  },
  Product: {
    price: (product) => ({
      amount: typeof product.price === 'number' ? product.price : Number(product.price),
      currency: INR_CURRENCY_CODE,
    }),
    energyTags: (product) => product.tags ?? [],
    createdAt: (product) =>
      product.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : new Date(product.createdAt).toISOString(),
    updatedAt: (product) =>
      product.updatedAt instanceof Date
        ? product.updatedAt.toISOString()
        : new Date(product.updatedAt).toISOString(),
  },
};

export default resolvers;
