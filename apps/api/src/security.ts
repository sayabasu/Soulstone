import { env } from '@soulstone/config';
import cors from 'cors';
import type { RequestHandler, Response } from 'express';
import rateLimitMiddleware from 'express-rate-limit';
import helmet from 'helmet';

export const createHelmetMiddleware = () =>
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'strict-dynamic'"],
        'style-src': ["'self'", 'https:'],
        'connect-src': ["'self'", ...env.SECURITY_CORS_ALLOWLIST],
        'frame-ancestors': ["'none'"],
        'img-src': ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-origin' },
    hsts: {
      maxAge: 63_072_000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'no-referrer' },
  });

export const createCorsMiddleware = () =>
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (env.SECURITY_CORS_ALLOWLIST.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not permitted by CORS policy'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

export interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const createRateLimiter = (options: RateLimiterOptions = {}) =>
  rateLimitMiddleware({
    windowMs: options.windowMs ?? env.RATE_LIMIT_WINDOW_MS,
    max: options.max ?? env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    message: {
      error: options.message ?? 'Too many requests. Please retry shortly.',
    },
    keyGenerator: (request) => {
      const apiKey = request.header('x-api-key');
      return apiKey ?? request.ip;
    },
  });

export interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeMs: number;
}

export class CircuitBreakerOpenError extends Error {
  readonly statusCode = 503;

  constructor(message = 'Circuit breaker is open.') {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreaker {
  private failureCount = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private nextAttemptTimestamp = 0;

  constructor(private readonly options: CircuitBreakerOptions) {}

  async run<T>(action: () => Promise<T>): Promise<T> {
    const now = Date.now();

    if (this.state === 'open') {
      if (now < this.nextAttemptTimestamp) {
        throw new CircuitBreakerOpenError();
      }

      this.state = 'half-open';
    }

    try {
      const result = await action();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount += 1;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open';
      this.nextAttemptTimestamp = Date.now() + this.options.recoveryTimeMs;
    }
  }

  private reset() {
    this.failureCount = 0;
    this.state = 'closed';
    this.nextAttemptTimestamp = 0;
  }
}

export const withCircuitBreaker = (
  breaker: CircuitBreaker,
  handler: RequestHandler,
): RequestHandler => {
  const wrapped: RequestHandler = async (request, response, next) => {
    try {
      await breaker.run(async () => {
        await Promise.resolve(handler(request, response, next));
      });
    } catch (error) {
      if (error instanceof CircuitBreakerOpenError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
      }

      next(error);
    }
  };

  return wrapped;
};

export const safeError = (response: Response, error: unknown) => {
  if (error instanceof CircuitBreakerOpenError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: 'Unexpected error occurred.' });
};

export const ensureJsonContent: RequestHandler = (request, response, next) => {
  if (!request.is('application/json')) {
    response.status(415).json({ error: 'Only application/json payloads are accepted.' });
    return;
  }

  next();
};

export const redactError = (error: unknown): { error: string } => {
  if (error instanceof Error) {
    return { error: error.message };
  }

  return { error: 'Unknown error occurred.' };
};

export const formatValidationError = (error: unknown) => {
  if (error && typeof error === 'object' && 'issues' in error) {
    const validationError = error as { issues: Array<{ message: string }> };
    return {
      error: 'Validation failed.',
      details: validationError.issues.map((issue) => issue.message),
    };
  }

  return { error: 'Validation failed.' };
};
