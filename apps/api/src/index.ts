import { env } from '@soulstone/config';
import express, { json, type NextFunction, type Request, type Response } from 'express';
import { ZodError, z } from 'zod';

import { AuditLogRepository, ParameterizedQueryExecutor } from './audit-log';
import { ConsentService, consentSubmissionSchema } from './consent';
import {
  PenTestWorkflow,
  penTestFindingSchema,
  type PenTestFinding,
  type PenTestStatus,
} from './pen-test';
import { DataRightsService, dataRightsRequestSchema } from './privacy';
import {
  ManualReviewQueue,
  RiskScoringService,
  riskEvaluationSchema,
  type ManualReviewStatus,
} from './risk';
import {
  CircuitBreaker,
  createCorsMiddleware,
  createHelmetMiddleware,
  createRateLimiter,
  ensureJsonContent,
  formatValidationError,
  redactError,
  withCircuitBreaker,
} from './security';

export interface ApiContext {
  port: number;
  databaseUrl: string;
  corsAllowlist: readonly string[];
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

export const createApiContext = (): ApiContext => ({
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  corsAllowlist: env.SECURITY_CORS_ALLOWLIST,
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
});

export interface ApiServices {
  consentService: ConsentService;
  dataRightsService: DataRightsService;
  penTestWorkflow: PenTestWorkflow;
  auditLogRepository: AuditLogRepository;
  circuitBreaker: CircuitBreaker;
  riskScoringService: RiskScoringService;
  manualReviewQueue: ManualReviewQueue;
}

export const createServices = (): ApiServices => {
  const executor = new ParameterizedQueryExecutor();
  const auditLogRepository = new AuditLogRepository(executor);
  const consentService = new ConsentService(auditLogRepository);
  const dataRightsService = new DataRightsService(auditLogRepository, env.PRIVACY_EXPORT_SLA_DAYS);
  const penTestWorkflow = new PenTestWorkflow(auditLogRepository);
  const manualReviewQueue = new ManualReviewQueue(auditLogRepository, env.RISK_REVIEW_SLA_HOURS);
  const riskScoringService = new RiskScoringService(auditLogRepository, manualReviewQueue);
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: env.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
    recoveryTimeMs: env.CIRCUIT_BREAKER_RECOVERY_MS,
  });

  return {
    auditLogRepository,
    consentService,
    dataRightsService,
    penTestWorkflow,
    circuitBreaker,
    riskScoringService,
    manualReviewQueue,
  };
};

export const createApp = (services = createServices()) => {
  const app = express();
  app.disable('x-powered-by');

  app.use(createHelmetMiddleware());
  app.use(createCorsMiddleware());
  app.use(createRateLimiter());
  app.use(json({ limit: '100kb' }));

  const sensitiveLimiter = createRateLimiter({
    max: Math.max(1, Math.floor(env.RATE_LIMIT_MAX_REQUESTS / 2)),
    message: 'Sensitive endpoint temporarily rate limited. Try again soon.',
  });

  app.get('/health', (request: Request, response: Response) => {
    response.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post(
    '/v1/consent',
    ensureJsonContent,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const submission = consentSubmissionSchema.parse(request.body);
        const record = await services.consentService.recordConsent(submission);
        response.status(201).json(record);
      } catch (error) {
        next(error);
      }
    },
  );

  app.get('/v1/consent/:userId', (request: Request, response: Response) => {
    const record = services.consentService.getConsent(request.params.userId);
    if (!record) {
      response.status(404).json({ error: 'Consent preferences not found.' });
      return;
    }

    response.json(record);
  });

  app.get('/v1/consent/:userId/sdk/:sdk', (request: Request, response: Response) => {
    const { userId, sdk } = request.params;
    const decision = services.consentService.evaluateSdkAccess(userId, sdk);
    response.json(decision);
  });

  const exportSchema = dataRightsRequestSchema.extend({ type: z.literal('export') });
  const deleteSchema = dataRightsRequestSchema.extend({ type: z.literal('delete') });

  app.post(
    '/v1/privacy/export',
    sensitiveLimiter,
    ensureJsonContent,
    withCircuitBreaker(services.circuitBreaker, async (request, response, next) => {
      try {
        const submission = exportSchema.parse({ ...request.body, type: 'export' });
        const dataRequest = await services.dataRightsService.submitRequest(submission);
        response.status(202).json(dataRequest);
      } catch (error) {
        next(error);
      }
    }),
  );

  app.post(
    '/v1/privacy/delete',
    sensitiveLimiter,
    ensureJsonContent,
    withCircuitBreaker(services.circuitBreaker, async (request, response, next) => {
      try {
        const submission = deleteSchema.parse({ ...request.body, type: 'delete' });
        const dataRequest = await services.dataRightsService.submitRequest(submission);
        response.status(202).json(dataRequest);
      } catch (error) {
        next(error);
      }
    }),
  );

  app.get('/v1/privacy/:userId/requests', (request: Request, response: Response) => {
    const requests = services.dataRightsService.listUserRequests(request.params.userId);
    response.json({ requests });
  });

  app.post(
    '/v1/pentest/findings',
    sensitiveLimiter,
    ensureJsonContent,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const finding = penTestFindingSchema.parse(request.body);
        const record = await services.penTestWorkflow.reportFinding(finding);
        response.status(201).json(record);
      } catch (error) {
        next(error);
      }
    },
  );

  app.post(
    '/v1/pentest/findings/:id/status',
    sensitiveLimiter,
    ensureJsonContent,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const statusSchema = z.object({
          status: z.enum(['open', 'in-progress', 'resolved', 'retested']),
        });
        const payload = statusSchema.parse(request.body);
        const record = await services.penTestWorkflow.transitionStatus(
          request.params.id,
          payload.status,
        );
        response.json(record);
      } catch (error) {
        next(error);
      }
    },
  );

  app.get('/v1/pentest/findings', (request: Request, response: Response) => {
    const filterSchema = z
      .object({
        status: z.enum(['open', 'in-progress', 'resolved', 'retested']).optional(),
        severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
      })
      .partial();

    const filter = filterSchema.safeParse(request.query);
    const findings = services.penTestWorkflow.listFindings(
      filter.success
        ? {
            status: filter.data.status as PenTestStatus | undefined,
            severity: filter.data.severity as PenTestFinding['severity'] | undefined,
          }
        : undefined,
    );

    response.json({ findings });
  });

  app.post(
    '/v1/risk/evaluations',
    sensitiveLimiter,
    ensureJsonContent,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const payload = riskEvaluationSchema.parse(request.body);
        const result = await services.riskScoringService.evaluate(payload);
        response.status(201).json(result);
      } catch (error) {
        next(error);
      }
    },
  );

  app.get('/v1/risk/evaluations', (request: Request, response: Response) => {
    const filterSchema = z
      .object({
        riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        action: z.enum(['allow', 'manual_review', 'hold', 'cancel']).optional(),
      })
      .partial();

    const filter = filterSchema.safeParse(request.query);
    const assessments = services.riskScoringService.listAssessments(
      filter.success
        ? {
            riskLevel: filter.data.riskLevel,
            action: filter.data.action,
          }
        : undefined,
    );

    response.json({ assessments });
  });

  app.get('/v1/risk/reviews', (request: Request, response: Response) => {
    const statusSchema = z
      .object({
        status: z.enum(['pending', 'resolved']).optional(),
      })
      .partial();

    const parsed = statusSchema.safeParse(request.query);
    const statusFilter = parsed.success
      ? (parsed.data.status as ManualReviewStatus | undefined)
      : undefined;
    const items = services.manualReviewQueue.list(statusFilter);

    response.json({
      reviews: items.map((item) => ({
        ...item,
        slaBreached: item.status === 'pending' && item.dueAt.getTime() < Date.now(),
      })),
    });
  });

  app.post(
    '/v1/risk/reviews/:id/decision',
    sensitiveLimiter,
    ensureJsonContent,
    async (request: Request, response: Response, next: NextFunction) => {
      try {
        const decision = request.body;
        const record = await services.manualReviewQueue.recordDecision(request.params.id, decision);
        response.json({
          ...record,
          slaBreached: record.status === 'pending' && record.dueAt.getTime() < Date.now(),
        });
      } catch (error) {
        next(error);
      }
    },
  );

  app.use((error: unknown, request: Request, response: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
      response.status(400).json(formatValidationError(error));
      return;
    }

    if (error instanceof Error) {
      response.status(500).json(redactError(error));
      return;
    }

    next(error);
  });

  app.use((request: Request, response: Response) => {
    response.status(404).json({ error: 'Not Found' });
  });

  return { app, services };
};

export const bootstrap = () => {
  const { app } = createApp();
  const context = createApiContext();
  return app.listen(context.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API bootstrapped on port ${context.port}`);
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = bootstrap();
  const shutdown = (signal: NodeJS.Signals) => {
    // eslint-disable-next-line no-console
    console.log(`Received ${signal}. Shutting down API server.`);

    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('API server shut down gracefully.');
      process.exit(0);
    });

    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
