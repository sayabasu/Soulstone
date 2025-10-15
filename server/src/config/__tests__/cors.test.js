import { jest } from '@jest/globals';

const loggerWarn = jest.fn();

await jest.unstable_mockModule('../logger.js', () => ({
  default: {
    warn: loggerWarn,
  },
}));

const { createCorsOptions, normalizeOrigin, sanitizeAllowedOrigins } = await import('../cors.js');

beforeEach(() => {
  loggerWarn.mockClear();
});

const invokeOriginCallback = (options, origin) => new Promise((resolve) => {
  options.origin(origin, (error, allowed) => {
    resolve({ error, allowed });
  });
});

describe('sanitizeAllowedOrigins', () => {
  it('removes empty and malformed entries', () => {
    const sanitized = sanitizeAllowedOrigins(['', '   ', 'http://valid.com', 'notaurl']);

    expect(sanitized).toEqual(['http://valid.com']);
  });

  it('deduplicates origins after normalization', () => {
    const sanitized = sanitizeAllowedOrigins(['http://valid.com', 'HTTP://VALID.com']);

    expect(sanitized).toEqual(['http://valid.com']);
  });
});

describe('normalizeOrigin', () => {
  it('normalizes case differences', () => {
    expect(normalizeOrigin('HTTP://Example.com')).toBe('http://example.com');
  });

  it('returns null for malformed origins', () => {
    expect(normalizeOrigin('notaurl')).toBeNull();
  });

  it('supports wildcard origin', () => {
    expect(normalizeOrigin('*')).toBe('*');
  });
});

describe('createCorsOptions', () => {
  it('denies all origins when configuration is empty', async () => {
    const options = createCorsOptions([]);

    expect(options.origin).toBe(false);
    expect(options.credentials).toBe(true);
  });

  it('allows all origins when wildcard is configured', () => {
    const options = createCorsOptions(['*']);

    expect(options.credentials).toBe(true);
    expect(options.origin).toBe(true);
  });

  it('allows matching configured origins', async () => {
    const options = createCorsOptions(['http://allowed.com']);

    const { error, allowed } = await invokeOriginCallback(options, 'http://allowed.com');

    expect(error).toBeNull();
    expect(allowed).toBe(true);
  });

  it('blocks non configured origins', async () => {
    const options = createCorsOptions(['http://allowed.com']);

    const { error, allowed } = await invokeOriginCallback(options, 'http://blocked.com');

    expect(error).toBeInstanceOf(Error);
    expect(allowed).toBeUndefined();
  });

  it('treats origins with differing cases as equal', async () => {
    const options = createCorsOptions(['HTTP://Allowed.COM']);

    const { error, allowed } = await invokeOriginCallback(options, 'http://allowed.com');

    expect(error).toBeNull();
    expect(allowed).toBe(true);
  });
});
