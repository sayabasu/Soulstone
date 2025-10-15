import { z } from 'zod';

import type { AuditLogRepository } from './audit-log';

const consentPreferencesSchema = z.object({
  marketing: z.boolean(),
  analytics: z.boolean(),
  personalization: z.boolean().optional().default(false),
});

export const consentSubmissionSchema = z.object({
  userId: z.string().min(1, 'A user identifier is required.'),
  channel: z.enum(['web', 'mobile', 'email', 'sms']),
  sdk: z.string().min(1).optional(),
  consent: consentPreferencesSchema,
  metadata: z.record(z.string(), z.string()).optional().default({}),
  timestamp: z.coerce.date().default(() => new Date()),
});

export type ConsentSubmission = z.infer<typeof consentSubmissionSchema>;
export type ConsentPreferences = z.infer<typeof consentPreferencesSchema>;

export interface ConsentRecord {
  userId: string;
  channel: ConsentSubmission['channel'];
  consent: ConsentPreferences;
  metadata: Record<string, string>;
  updatedAt: Date;
}

const sdkPreferenceRequirements: Record<string, keyof ConsentPreferences> = {
  'facebook-pixel': 'marketing',
  'google-analytics': 'analytics',
  'personalization-engine': 'personalization',
};

export class ConsentService {
  private readonly records = new Map<string, ConsentRecord>();

  constructor(private readonly auditLog: AuditLogRepository) {}

  async recordConsent(input: ConsentSubmission): Promise<ConsentRecord> {
    const payload = consentSubmissionSchema.parse(input);

    const record: ConsentRecord = {
      userId: payload.userId,
      channel: payload.channel,
      consent: payload.consent,
      metadata: payload.metadata,
      updatedAt: payload.timestamp,
    };

    this.records.set(payload.userId, record);

    await this.auditLog.record({
      actor: payload.userId,
      action: 'consent.updated',
      entity: { type: 'user', id: payload.userId },
      payload: {
        channel: payload.channel,
        metadata: payload.metadata,
        consent: payload.consent,
      },
    });

    return record;
  }

  getConsent(userId: string): ConsentRecord | undefined {
    return this.records.get(userId);
  }

  evaluateSdkAccess(userId: string, sdk: string): { allowed: boolean; reason: string } {
    const record = this.records.get(userId);
    const requiredPreference = sdkPreferenceRequirements[sdk];

    if (!requiredPreference) {
      return { allowed: true, reason: 'SDK is not gated by consent preferences.' };
    }

    if (!record) {
      return { allowed: false, reason: 'No consent preferences recorded for user.' };
    }

    if (record.consent[requiredPreference]) {
      return { allowed: true, reason: `User granted ${requiredPreference} consent.` };
    }

    return {
      allowed: false,
      reason: `User has not granted ${requiredPreference} consent required by ${sdk}.`,
    };
  }

  listSdkRequirements(): Readonly<Record<string, keyof ConsentPreferences>> {
    return sdkPreferenceRequirements;
  }
}
