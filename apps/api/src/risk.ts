import { addHours, differenceInMinutes } from 'date-fns';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import type { AuditLogRepository } from './audit-log';

const disposableDomains = new Set([
  'mailinator.com',
  'tempmail.com',
  'discard.email',
  'trashmail.com',
]);

const metadataValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const riskEvaluationSchema = z.object({
  eventId: z.string().min(1, 'An event identifier is required.'),
  orderId: z.string().min(1, 'An order identifier is required.'),
  userId: z.string().min(1, 'A user identifier is required.'),
  email: z.string().email(),
  ipAddress: z.string().min(1, 'An IP address is required.'),
  deviceId: z.string().min(1, 'A device identifier is required.'),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  couponCode: z.string().min(3).max(50).optional(),
  eventType: z.enum(['pre-payment', 'post-payment']),
  channel: z.enum(['web', 'mobile', 'pos', 'ivr']).default('web'),
  occurredAt: z.coerce.date().default(() => new Date()),
  metadata: z.record(z.string(), metadataValueSchema).optional().default({}),
});

export type RiskEvaluationInput = z.infer<typeof riskEvaluationSchema>;

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskAction = 'allow' | 'manual_review' | 'hold' | 'cancel';

export interface RiskAssessment {
  id: string;
  event: RiskEvaluationInput;
  riskScore: number;
  riskLevel: RiskLevel;
  action: RiskAction;
  reasons: string[];
  evaluatedAt: Date;
}

export type ManualReviewStatus = 'pending' | 'resolved';

export type ManualReviewOutcome = 'approve' | 'cancel' | 'hold';

export interface ManualReviewDecision {
  outcome: ManualReviewOutcome;
  note?: string;
  decidedBy: string;
  decidedAt: Date;
}

export interface ManualReviewItem {
  id: string;
  assessmentId: string;
  orderId: string;
  userId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  action: RiskAction;
  reasons: string[];
  status: ManualReviewStatus;
  createdAt: Date;
  dueAt: Date;
  decision?: ManualReviewDecision;
}

const reviewDecisionSchema = z.object({
  outcome: z.enum(['approve', 'cancel', 'hold']),
  decidedBy: z.string().min(1, 'Reviewer identity is required.'),
  note: z.string().max(500).optional(),
  decidedAt: z.coerce.date().default(() => new Date()),
});

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>;

interface RiskHistoryEntry {
  occurredAt: Date;
  ipAddress: string;
  deviceId: string;
  couponCode?: string;
}

export class ManualReviewQueue {
  private readonly items = new Map<string, ManualReviewItem>();

  constructor(
    private readonly auditLog: AuditLogRepository,
    private readonly slaHours: number,
  ) {}

  async enqueue(assessment: RiskAssessment): Promise<ManualReviewItem> {
    const createdAt = new Date();
    const dueAt = addHours(createdAt, this.slaHours);
    const item: ManualReviewItem = {
      id: randomUUID(),
      assessmentId: assessment.id,
      orderId: assessment.event.orderId,
      userId: assessment.event.userId,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      action: assessment.action,
      reasons: assessment.reasons,
      status: 'pending',
      createdAt,
      dueAt,
    };

    this.items.set(item.id, item);

    await this.auditLog.record({
      actor: 'system',
      action: 'risk.review.enqueued',
      entity: { type: 'manual-review', id: item.id },
      payload: {
        assessmentId: assessment.id,
        dueAt: dueAt.toISOString(),
        riskLevel: assessment.riskLevel,
        action: assessment.action,
      },
    });

    return item;
  }

  list(status?: ManualReviewStatus): ManualReviewItem[] {
    return [...this.items.values()].filter((item) => (status ? item.status === status : true));
  }

  get(id: string): ManualReviewItem | undefined {
    return this.items.get(id);
  }

  async recordDecision(id: string, input: ReviewDecisionInput): Promise<ManualReviewItem> {
    const item = this.requireItem(id);
    const decision = reviewDecisionSchema.parse(input);
    item.status = 'resolved';
    item.decision = {
      outcome: decision.outcome,
      note: decision.note,
      decidedBy: decision.decidedBy,
      decidedAt: decision.decidedAt,
    };

    await this.auditLog.record({
      actor: decision.decidedBy,
      action: 'risk.review.resolved',
      entity: { type: 'manual-review', id },
      payload: {
        outcome: decision.outcome,
        note: decision.note ?? null,
        decidedAt: decision.decidedAt.toISOString(),
      },
    });

    return item;
  }

  private requireItem(id: string): ManualReviewItem {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Manual review item ${id} was not found.`);
    }
    return item;
  }
}

export class RiskScoringService {
  private readonly assessments = new Map<string, RiskAssessment>();
  private readonly historyByUser = new Map<string, RiskHistoryEntry[]>();
  private readonly ipToUsers = new Map<string, Set<string>>();
  private readonly deviceToUsers = new Map<string, Set<string>>();
  private readonly couponUsage = new Map<string, { total: number; users: Set<string> }>();
  private readonly userCouponUsage = new Map<string, Map<string, number>>();

  constructor(
    private readonly auditLog: AuditLogRepository,
    private readonly reviewQueue: ManualReviewQueue,
  ) {}

  async evaluate(
    input: RiskEvaluationInput,
  ): Promise<{ assessment: RiskAssessment; reviewItem?: ManualReviewItem }> {
    const payload = riskEvaluationSchema.parse(input);
    const evaluatedAt = new Date();
    const { score, reasons } = this.calculateRiskScore(payload);
    const assessment: RiskAssessment = {
      id: randomUUID(),
      event: payload,
      riskScore: score,
      riskLevel: this.determineRiskLevel(score),
      action: this.determineAction(score, payload.eventType),
      reasons,
      evaluatedAt,
    };

    this.assessments.set(assessment.id, assessment);
    this.recordHistory(payload);

    await this.auditLog.record({
      actor: payload.userId,
      action: `risk.assessment.${assessment.riskLevel}`,
      entity: { type: 'order', id: payload.orderId },
      payload: {
        assessmentId: assessment.id,
        action: assessment.action,
        riskScore: assessment.riskScore,
        reasons,
      },
    });

    if (assessment.action === 'allow') {
      return { assessment };
    }

    const reviewItem = await this.reviewQueue.enqueue(assessment);
    return { assessment, reviewItem };
  }

  listAssessments(filter?: { riskLevel?: RiskLevel; action?: RiskAction }): RiskAssessment[] {
    return [...this.assessments.values()].filter((assessment) => {
      if (filter?.riskLevel && assessment.riskLevel !== filter.riskLevel) {
        return false;
      }

      if (filter?.action && assessment.action !== filter.action) {
        return false;
      }

      return true;
    });
  }

  private calculateRiskScore(payload: RiskEvaluationInput): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    const domain = payload.email.split('@')[1]?.toLowerCase();
    if (domain && disposableDomains.has(domain)) {
      score += 25;
      reasons.push('Disposable email domain detected.');
    }

    const ipUsers = this.ipToUsers.get(payload.ipAddress);
    if (ipUsers && ipUsers.size >= 3 && !ipUsers.has(payload.userId)) {
      score += 20;
      reasons.push('IP address shared across multiple accounts.');
    }

    const deviceUsers = this.deviceToUsers.get(payload.deviceId);
    if (deviceUsers && deviceUsers.size >= 3 && !deviceUsers.has(payload.userId)) {
      score += 15;
      reasons.push('Device used by several distinct accounts.');
    }

    const userHistory = this.historyByUser.get(payload.userId) ?? [];
    const recentEvents = userHistory.filter(
      (entry) => differenceInMinutes(payload.occurredAt, entry.occurredAt) <= 10,
    );
    if (recentEvents.length >= 3) {
      score += 20;
      reasons.push('Velocity check triggered (multiple attempts within 10 minutes).');
    }

    if (payload.couponCode) {
      const coupon = this.couponUsage.get(payload.couponCode);
      if (coupon) {
        if (!coupon.users.has(payload.userId)) {
          score += 10;
          reasons.push('Coupon used by numerous distinct users.');
        }
        if (coupon.total >= 10) {
          score += 15;
          reasons.push('Coupon redemption count unusually high.');
        }
      }

      const userCouponCounts = this.userCouponUsage.get(payload.userId);
      const couponCount = userCouponCounts?.get(payload.couponCode) ?? 0;
      if (couponCount >= 2) {
        score += 10;
        reasons.push('Repeated coupon usage detected for account.');
      }
    }

    if (payload.amount >= 1000 && payload.eventType === 'pre-payment') {
      score += 10;
      reasons.push('High value pre-payment transaction.');
    }

    if (payload.amount >= 2000 && payload.eventType === 'post-payment') {
      score += 20;
      reasons.push('High value post-payment transaction requires review.');
    }

    return { score: Math.min(score, 100), reasons };
  }

  private determineRiskLevel(score: number): RiskLevel {
    if (score >= 80) {
      return 'critical';
    }
    if (score >= 60) {
      return 'high';
    }
    if (score >= 35) {
      return 'medium';
    }
    return 'low';
  }

  private determineAction(score: number, eventType: RiskEvaluationInput['eventType']): RiskAction {
    if (score >= 85) {
      return 'cancel';
    }
    if (score >= 65) {
      return eventType === 'pre-payment' ? 'hold' : 'cancel';
    }
    if (score >= 45) {
      return 'manual_review';
    }
    return 'allow';
  }

  private recordHistory(payload: RiskEvaluationInput) {
    const history = this.historyByUser.get(payload.userId) ?? [];
    history.push({
      occurredAt: payload.occurredAt,
      ipAddress: payload.ipAddress,
      deviceId: payload.deviceId,
      couponCode: payload.couponCode,
    });
    this.historyByUser.set(payload.userId, history);

    const ipUsers = this.ipToUsers.get(payload.ipAddress) ?? new Set<string>();
    ipUsers.add(payload.userId);
    this.ipToUsers.set(payload.ipAddress, ipUsers);

    const deviceUsers = this.deviceToUsers.get(payload.deviceId) ?? new Set<string>();
    deviceUsers.add(payload.userId);
    this.deviceToUsers.set(payload.deviceId, deviceUsers);

    if (payload.couponCode) {
      const coupon = this.couponUsage.get(payload.couponCode) ?? {
        total: 0,
        users: new Set<string>(),
      };
      coupon.total += 1;
      coupon.users.add(payload.userId);
      this.couponUsage.set(payload.couponCode, coupon);

      const userCouponCounts =
        this.userCouponUsage.get(payload.userId) ?? new Map<string, number>();
      userCouponCounts.set(payload.couponCode, (userCouponCounts.get(payload.couponCode) ?? 0) + 1);
      this.userCouponUsage.set(payload.userId, userCouponCounts);
    }
  }
}
