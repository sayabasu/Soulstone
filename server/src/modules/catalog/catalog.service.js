import prisma from '../../integrations/prismaClient.js';

/**
 * Fetches all published products.
 * @returns {Promise<import('@prisma/client').Product[]>}
 */
export const listProducts = () =>
  prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  });

/**
 * Fetches product details by id.
 * @param {string} id
 */
export const getProductById = (id) =>
  prisma.product.findUnique({ where: { id } });

export default {
  listProducts,
  getProductById,
};
