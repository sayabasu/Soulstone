import { Client } from 'pg';

import { env } from '@soulstone/config';

type EnvironmentSeed = {
  name: string;
  slug: string;
  isDefault?: boolean;
};

type FeatureFlagSeed = {
  key: string;
  description: string;
  enabled: boolean;
};

type AuditChannelSeed = {
  key: string;
  description: string;
};

const organizationSeed = {
  slug: 'soulstone',
  name: 'Soulstone Labs',
};

const environmentSeeds: EnvironmentSeed[] = [
  { name: 'Development', slug: 'development', isDefault: true },
  { name: 'Staging', slug: 'staging' },
  { name: 'Production', slug: 'production' },
];

const featureFlagSeeds: FeatureFlagSeed[] = [
  {
    key: 'onboarding-checklist',
    description: 'Enables the onboarding checklist experience for new teams.',
    enabled: true,
  },
  {
    key: 'beta-dashboard',
    description: 'Provides access to the beta analytics dashboard.',
    enabled: false,
  },
];

const auditChannelSeeds: AuditChannelSeed[] = [
  {
    key: 'security',
    description: 'Security related configuration and access changes.',
  },
  {
    key: 'compliance',
    description: 'Compliance events such as exports and policy acknowledgements.',
  },
  {
    key: 'integrations',
    description: 'Integration creation, updates, and failures.',
  },
];

async function seedDatabase() {
  const client = new Client({ connectionString: env.DATABASE_URL });
  await client.connect();

  try {
    await client.query('BEGIN');

    const organizationResult = await client.query<{ id: string }>(
      `INSERT INTO organizations (slug, name)
       VALUES ($1, $2)
       ON CONFLICT (slug)
       DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
       RETURNING id`,
      [organizationSeed.slug, organizationSeed.name],
    );

    const organizationId = organizationResult.rows[0]?.id;
    if (!organizationId) {
      throw new Error('Failed to upsert base organization.');
    }

    for (const environment of environmentSeeds) {
      await client.query(
        `INSERT INTO environments (organization_id, name, slug, is_default)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (organization_id, slug)
         DO UPDATE SET
           name = EXCLUDED.name,
           is_default = EXCLUDED.is_default,
           updated_at = NOW()`,
        [organizationId, environment.name, environment.slug, Boolean(environment.isDefault)],
      );
    }

    const defaultEnvironment = environmentSeeds.find((environment) => environment.isDefault);
    if (defaultEnvironment) {
      await client.query(
        `UPDATE environments
         SET is_default = CASE WHEN slug = $1 THEN TRUE ELSE FALSE END,
             updated_at = NOW()
         WHERE organization_id = $2`,
        [defaultEnvironment.slug, organizationId],
      );
    }

    for (const featureFlag of featureFlagSeeds) {
      await client.query(
        `INSERT INTO feature_flags (key, description, enabled)
         VALUES ($1, $2, $3)
         ON CONFLICT (key)
         DO UPDATE SET
           description = EXCLUDED.description,
           enabled = EXCLUDED.enabled,
           updated_at = NOW()`,
        [featureFlag.key, featureFlag.description, featureFlag.enabled],
      );
    }

    for (const channel of auditChannelSeeds) {
      await client.query(
        `INSERT INTO audit_log_channels (key, description)
         VALUES ($1, $2)
         ON CONFLICT (key)
         DO UPDATE SET description = EXCLUDED.description`,
        [channel.key, channel.description],
      );
    }

    await client.query('COMMIT');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seedDatabase().catch((error) => {
  console.error('Unexpected error while seeding database:', error);
  process.exitCode = 1;
});
