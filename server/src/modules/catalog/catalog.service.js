import prisma from '../../integrations/prismaClient.js';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const CURSOR_PREFIX = 'product:';

const encodeCursor = (id) => Buffer.from(`${CURSOR_PREFIX}${id}`, 'utf8').toString('base64');

const decodeCursor = (cursor) => {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    if (!decoded.startsWith(CURSOR_PREFIX)) {
      throw new Error('Invalid cursor prefix');
    }

    const id = decoded.slice(CURSOR_PREFIX.length);
    if (!id) {
      throw new Error('Cursor missing identifier');
    }

    return id;
  } catch (error) {
    const rangeError = new RangeError('Invalid cursor provided');
    rangeError.cause = error;
    throw rangeError;
  }
};

const buildPriceFilter = (minPrice, maxPrice) => {
  const priceFilter = {};

  if (typeof minPrice === 'number') {
    priceFilter.gte = minPrice;
  }

  if (typeof maxPrice === 'number') {
    priceFilter.lte = maxPrice;
  }

  return Object.keys(priceFilter).length > 0 ? priceFilter : undefined;
};

const buildWhereClause = (filter = {}) => {
  const where = {};

  if (typeof filter.isPublished === 'boolean') {
    where.isPublished = filter.isPublished;
  }

  if (Array.isArray(filter.tags) && filter.tags.length > 0) {
    where.tags = { hasSome: filter.tags };
  }

  if (filter.search) {
    where.OR = [
      { name: { contains: filter.search, mode: 'insensitive' } },
      { description: { contains: filter.search, mode: 'insensitive' } },
    ];
  }

  const priceFilter = buildPriceFilter(filter.minPrice, filter.maxPrice);
  if (priceFilter) {
    where.price = priceFilter;
  }

  return where;
};

const resolveSort = (sort = {}) => {
  const direction = sort.direction === 'ASC' ? 'asc' : 'desc';

  switch (sort.field) {
    case 'PRICE':
      return { price: direction };
    case 'NAME':
      return { name: direction };
    case 'CREATED_AT':
    default:
      return { createdAt: direction };
  }
};

const toTitleCase = (value) =>
  value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const slugify = (value) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

/**
 * Fetches product details by slug.
 * @param {string} slug
 */
export const getProductBySlug = (slug) =>
  prisma.product.findUnique({ where: { slug } });

/**
 * Returns a paginated connection of products based on provided filters.
 * @param {{
 *   filter?: {
 *     search?: string;
 *     tags?: string[];
 *     minPrice?: number;
 *     maxPrice?: number;
 *     isPublished?: boolean;
 *   };
 *   sort?: { field?: 'PRICE' | 'NAME' | 'CREATED_AT'; direction?: 'ASC' | 'DESC' };
 *   first?: number;
 *   after?: string | null;
 * }} params
 */
export const findProductsConnection = async ({ filter, sort, first, after } = {}) => {
  const pageSize = first ?? DEFAULT_PAGE_SIZE;

  if (!Number.isInteger(pageSize) || pageSize <= 0) {
    throw new RangeError('`first` must be a positive integer');
  }

  if (pageSize > MAX_PAGE_SIZE) {
    throw new RangeError(`Page size cannot exceed ${MAX_PAGE_SIZE}`);
  }

  const where = buildWhereClause(filter);
  const orderBy = resolveSort(sort);

  let cursor;
  if (after) {
    cursor = decodeCursor(after);
  }

  const query = {
    where,
    orderBy,
    take: pageSize + 1,
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const products = await prisma.product.findMany(query);
  const hasNextPage = products.length > pageSize;
  const nodes = hasNextPage ? products.slice(0, pageSize) : products;

  const edges = nodes.map((product) => ({
    cursor: encodeCursor(product.id),
    node: product,
  }));

  const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;
  const totalCount = await prisma.product.count({ where });

  return {
    edges,
    pageInfo: {
      hasNextPage,
      endCursor,
    },
    totalCount,
  };
};

/**
 * Aggregates product tags into lightweight collection summaries.
 * @param {{ onlyPublished?: boolean }} [options]
 */
export const listCollectionsSummary = async ({ onlyPublished = true } = {}) => {
  const where = onlyPublished ? { isPublished: true } : {};
  const products = await prisma.product.findMany({
    where,
    select: { tags: true },
  });

  const aggregates = new Map();

  for (const product of products) {
    for (const tag of product.tags ?? []) {
      const normalized = slugify(tag);
      if (!normalized) {
        continue;
      }

      const entry = aggregates.get(normalized);
      if (entry) {
        entry.productCount += 1;
      } else {
        aggregates.set(normalized, {
          id: normalized,
          slug: normalized,
          title: toTitleCase(tag),
          productCount: 1,
        });
      }
    }
  }

  return Array.from(aggregates.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
  );
};

export default {
  listProducts,
  getProductById,
  getProductBySlug,
  findProductsConnection,
  listCollectionsSummary,
};
