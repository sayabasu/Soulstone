import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import type { AuditLogRepository } from './audit-log';

export const penTestFindingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  owner: z.string().min(1),
  discoveredAt: z.coerce.date().default(() => new Date()),
});

export type PenTestFindingInput = z.infer<typeof penTestFindingSchema>;

export type PenTestStatus = 'open' | 'in-progress' | 'resolved' | 'retested';

export interface PenTestFinding {
  id: string;
  title: string;
  description: string;
  severity: PenTestFindingInput['severity'];
  owner: string;
  discoveredAt: Date;
  status: PenTestStatus;
  updatedAt: Date;
}

export class PenTestWorkflow {
  private readonly findings = new Map<string, PenTestFinding>();

  constructor(private readonly auditLog: AuditLogRepository) {}

  async reportFinding(input: PenTestFindingInput): Promise<PenTestFinding> {
    const payload = penTestFindingSchema.parse(input);
    const finding: PenTestFinding = {
      id: randomUUID(),
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      owner: payload.owner,
      discoveredAt: payload.discoveredAt,
      status: 'open',
      updatedAt: new Date(),
    };

    this.findings.set(finding.id, finding);

    await this.auditLog.record({
      actor: payload.owner,
      action: `pentest.finding.${payload.severity}.reported`,
      entity: { type: 'pentest-finding', id: finding.id },
      payload: { title: payload.title },
    });

    return finding;
  }

  async transitionStatus(id: string, status: PenTestStatus): Promise<PenTestFinding> {
    const finding = this.requireFinding(id);
    finding.status = status;
    finding.updatedAt = new Date();

    await this.auditLog.record({
      actor: 'system',
      action: `pentest.finding.status.${status}`,
      entity: { type: 'pentest-finding', id },
      payload: { status },
    });

    return finding;
  }

  listFindings(filter?: {
    status?: PenTestStatus;
    severity?: PenTestFinding['severity'];
  }): PenTestFinding[] {
    return [...this.findings.values()].filter((finding) => {
      if (filter?.status && finding.status !== filter.status) {
        return false;
      }

      if (filter?.severity && finding.severity !== filter.severity) {
        return false;
      }

      return true;
    });
  }

  private requireFinding(id: string): PenTestFinding {
    const finding = this.findings.get(id);
    if (!finding) {
      throw new Error(`Pen-test finding ${id} was not found.`);
    }
    return finding;
  }
}
