import { randomUUID } from 'node:crypto';

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  entity: {
    type: string;
    id: string;
  };
  payload: Record<string, unknown>;
  occurredAt: Date;
}

export interface QueryExecutor {
  execute: (query: string, params: unknown[]) => Promise<void>;
}

const parameterTokenExpression = /\$\d+/;

export class ParameterizedQueryExecutor implements QueryExecutor {
  private readonly operations: Array<{ query: string; params: unknown[] }> = [];

  async execute(query: string, params: unknown[]): Promise<void> {
    if (!parameterTokenExpression.test(query)) {
      throw new Error('Query rejected: parameter tokens are required.');
    }

    if (params.length === 0) {
      throw new Error('Query rejected: parameters must be supplied.');
    }

    this.operations.push({ query, params });
  }

  getOperationHistory(): ReadonlyArray<{ query: string; params: unknown[] }> {
    return this.operations;
  }
}

export class AuditLogRepository {
  private readonly entries: AuditLogEntry[] = [];

  constructor(private readonly executor: QueryExecutor) {}

  async record(
    entry: Omit<AuditLogEntry, 'id' | 'occurredAt'> & { occurredAt?: Date },
  ): Promise<AuditLogEntry> {
    const record: AuditLogEntry = {
      id: randomUUID(),
      occurredAt: entry.occurredAt ?? new Date(),
      ...entry,
    };

    await this.executor.execute(
      'INSERT INTO audit_log (id, actor, action, entity_type, entity_id, payload, occurred_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        record.id,
        record.actor,
        record.action,
        record.entity.type,
        record.entity.id,
        JSON.stringify(record.payload),
        record.occurredAt.toISOString(),
      ],
    );

    this.entries.push(record);
    return record;
  }

  listByEntity(entityId: string): AuditLogEntry[] {
    return this.entries.filter((entry) => entry.entity.id === entityId);
  }

  listAll(): AuditLogEntry[] {
    return [...this.entries];
  }
}
