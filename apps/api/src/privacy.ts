import { addDays } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import type { AuditLogRepository } from './audit-log';

export const dataRightsRequestSchema = z.object({
  userId: z.string().min(1, 'A user identifier is required.'),
  type: z.enum(['export', 'delete']),
  reason: z.string().max(500).optional(),
  requestedAt: z.coerce.date().default(() => new Date()),
});

export type DataRightsSubmission = z.infer<typeof dataRightsRequestSchema>;

export type DataRightsStatus = 'pending' | 'in-progress' | 'completed';

export interface DataRightsRequest {
  id: string;
  userId: string;
  type: DataRightsSubmission['type'];
  reason?: string;
  requestedAt: Date;
  dueAt: Date;
  status: DataRightsStatus;
  completedAt?: Date;
}

export class DataRightsService {
  private readonly requests = new Map<string, DataRightsRequest>();

  constructor(
    private readonly auditLog: AuditLogRepository,
    private readonly slaInDays: number,
  ) {}

  async submitRequest(submission: DataRightsSubmission): Promise<DataRightsRequest> {
    const payload = dataRightsRequestSchema.parse(submission);
    const dueAt = addDays(payload.requestedAt, this.slaInDays);

    const request: DataRightsRequest = {
      id: randomUUID(),
      userId: payload.userId,
      type: payload.type,
      reason: payload.reason,
      requestedAt: payload.requestedAt,
      dueAt,
      status: 'pending',
    };

    this.requests.set(request.id, request);

    await this.auditLog.record({
      actor: payload.userId,
      action: `privacy.request.${payload.type}`,
      entity: { type: 'user', id: payload.userId },
      payload: {
        reason: payload.reason ?? null,
        dueAt: dueAt.toISOString(),
      },
    });

    return request;
  }

  async markInProgress(requestId: string): Promise<DataRightsRequest> {
    const request = this.requireRequest(requestId);
    request.status = 'in-progress';

    await this.auditLog.record({
      actor: 'system',
      action: 'privacy.request.in-progress',
      entity: { type: 'privacy-request', id: requestId },
      payload: { status: request.status },
    });

    return request;
  }

  async completeRequest(requestId: string): Promise<DataRightsRequest> {
    const request = this.requireRequest(requestId);
    request.status = 'completed';
    request.completedAt = new Date();

    await this.auditLog.record({
      actor: 'system',
      action: 'privacy.request.completed',
      entity: { type: 'privacy-request', id: requestId },
      payload: { completedAt: request.completedAt.toISOString() },
    });

    return request;
  }

  listUserRequests(userId: string): DataRightsRequest[] {
    return [...this.requests.values()].filter((request) => request.userId === userId);
  }

  private requireRequest(requestId: string): DataRightsRequest {
    const request = this.requests.get(requestId);
    if (!request) {
      throw new Error(`Data rights request ${requestId} was not found.`);
    }
    return request;
  }
}
