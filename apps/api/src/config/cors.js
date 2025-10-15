import logger from './logger.js';

/**
 * Normalize an origin string into a canonical form that can be safely compared.
 *
 * Values are trimmed, lower-cased and stripped down to their scheme, host and
 * port components so that different notations of the same origin are treated as
 * equivalent. Invalid origins yield `null` which signals the caller to ignore
 * the entry.
 *
 * @param {string | null | undefined} origin - Raw origin string to normalize.
 * @returns {string | null} - Canonical origin or `null` when invalid.
 */
export const normalizeOrigin = (origin) => {
  if (!origin) {
    return null;
  }

  const trimmed = origin.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed === '*') {
    return '*';
  }

  if (trimmed.toLowerCase() === 'null') {
    return 'null';
  }

  try {
    const url = new URL(trimmed);
    return url.origin.toLowerCase();
  } catch (_error) {
    return null;
  }
};

/**
 * Clean and deduplicate the configured allowed origins list.
 *
 * Any malformed entries are discarded with a warning so that we never expose
 * the API to an unintended origin because of a typo in the configuration.
 *
 * @param {string[]} allowedOrigins - Raw list loaded from configuration.
 * @returns {string[]} - Sanitized and unique origins.
 */
export const sanitizeAllowedOrigins = (allowedOrigins) => {
  if (!allowedOrigins || allowedOrigins.length === 0) {
    return [];
  }

  const sanitized = new Set();

  allowedOrigins.forEach((origin) => {
    const normalized = normalizeOrigin(origin);

    if (!normalized) {
      logger.warn('cors.invalid_allowed_origin', { origin });
      return;
    }

    sanitized.add(normalized);
  });

  return [...sanitized];
};

/**
 * Build the CORS configuration based on the allowed origins list.
 *
 * The configuration supports multiple origins provided via environment
 * variables and gracefully handles requests without an origin (for example
 * from server-to-server calls). When no origins are configured we log a
 * warning and disable cross-origin access entirely to avoid exposing the
 * API inadvertently.
 *
 * @param {string[]} allowedOrigins - List of allowed origins from config.
 * @returns {import('cors').CorsOptions} - Configured CORS options.
 */
export const createCorsOptions = (allowedOrigins) => {
  const sanitizedOrigins = sanitizeAllowedOrigins(allowedOrigins);

  if (sanitizedOrigins.length === 0) {
    logger.warn('cors.no_allowed_origins');
    return {
      origin: false,
      credentials: true,
    };
  }

  if (sanitizedOrigins.includes('*')) {
    return {
      origin: true,
      credentials: true,
    };
  }

  const allowedOriginsSet = new Set(sanitizedOrigins);

  return {
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalized = normalizeOrigin(origin);

      if (normalized && allowedOriginsSet.has(normalized)) {
        callback(null, true);
        return;
      }

      logger.warn('cors.origin_blocked', { origin });
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };
};

export default createCorsOptions;
