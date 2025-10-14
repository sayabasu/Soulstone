# Soulstone — Business Requirements (Software Only)

🧭 1. Epic — High-level business goal

Purpose: Capture major outcomes for the Soulstone web and mobile software products. Scope includes product, APIs, data, security, reliability, and app distribution. No budgets, hiring, or legal.


Epic: Core Shopping Experience (Browse → PDP)
Description: Deliver a fast, trustworthy catalog browsing experience with rich product detail pages including energy attributes, origins, and certifications.
Success criteria:
- P95 web LCP ≤ 2.5s; app TTI ≤ 2.0s on mid-range Android.
- Search-to-PDP success ≥ 90%; PDP bounce < 40%.
- Add-to-cart rate from PDP ≥ 8% across top categories.

Feature: Product Listing & Filtering (PLP)
Description: Category pages with robust facets (type, intention, chakra, price, size, origin, rating).
Acceptance Criteria:
- Supports multi-select facets and sort (relevance, newest, price, popularity, rating).
- Zero-result state with suggested intents and top searches.
- Cursor/offset pagination with SEO-friendly URLs and canonicals.

User Story:
As a shopper, I want to quickly filter by “intention” and “stone type” so I can find a crystal aligned with my needs.
Acceptance Criteria:
- Applying/removing filters updates results < 300ms (cache hit) or < 1s (origin).
- URL captures filters for share/deep-linking.
- Selected facets are keyboard accessible and screen-reader friendly.
Tasks:
- Implement GraphQL queries for product collections with facet metadata.
- Build PLP UI with facet chips, filter drawer, and sort controls (web + app).
- Add SEO slugs and canonical URLs for categories.
- Implement zero-result recommendations using top intents.
Subtasks:
- Add Prisma models/indexes for facet fields.
- Configure CDN caching and `stale-while-revalidate` for collections.
- Add analytics events: `view_collection`, `search`, `filter_apply`.
- Unit/e2e tests for filter state and URL sync.

User Story:
As an accessibility-focused user, I want keyboard-navigable filters so I can refine results without a mouse.
Acceptance Criteria:
- All filter controls reachable by Tab order; visible focus state; ARIA labels on checkboxes.
- Screen readers announce selected/cleared states correctly.
Tasks:
- Add ARIA attributes and focus management to filter controls.
- Validate with WCAG AA checklist and axe.
Subtasks:
- Write a11y unit tests; include storybook a11y checks.
- QA pass on NVDA/VoiceOver baseline.

Feature: Product Detail Page (PDP)
Description: Rich PDP with images, price, origin, energy tags, certification, care, and related content.
Acceptance Criteria:
- PDP renders above-the-fold in < 1.2s from cache; images optimized (AVIF/WebP).
- Shows energy tags, chakra mapping, and sourcing story block.
- Surfaces back-in-stock alerts and variant availability.

User Story:
As a shopper, I want to understand the authenticity and origin of a crystal so I can trust my purchase.
Acceptance Criteria:
- Origin, certification badge, and authenticity grade visible near title.
- “Learn more” links to sourcing story and care article.
Tasks:
- Add PDP schema and components for origin/certification.
- Integrate CMS-driven sourcing story block.
- Add JSON-LD (Product, Breadcrumb) markup.
Subtasks:
- Image zoom and gallery with lazy-loading.
- Unit tests for schema rendering and JSON-LD.


Epic: Cart, Checkout & Payments
Description: Provide an intuitive cart and a reliable, secure checkout supporting UPI, cards, BNPL via Razorpay/Stripe.
Success criteria:
- Checkout completion ≥ 65% of initiated carts; payment failures < 2%/provider.
- Payment intent creation < 500ms P95; idempotent write ops.
- Refund/partial return flows available via account.

Feature: Cart & Offers
Description: Add/update/remove items, show shipping, taxes, and discounts in real time.
Acceptance Criteria:
- Accurate cart totals and coupon validation; handles OOS and min/max qty.
- Persist cart across sessions (secure storage) and devices (signed user).
User Story:
As a shopper, I want my cart to persist across devices so I don’t lose my selections.
Acceptance Criteria:
- Signed-in users see the same cart on web and app.
- Guest cart persists locally for 14 days.
Tasks:
- Implement server-side cart with merge-on-login.
- Local persistence using encrypted storage (app) and HTTP-only cookies (web).
Subtasks:
- GraphQL mutations for add/update/remove; totals calculation service.
- Unit tests for merge-on-login and price recalculation.

Feature: Checkout & Payments
Description: Multi-step checkout with address, shipping, payment.
Acceptance Criteria:
- Razorpay/Stripe payment intents; retries with backoff on failures.
- PCI-DSS compliant tokenization; no sensitive data stored.
User Story:
As a shopper, I want to pay with UPI or card so I can complete my purchase with my preferred method.
Acceptance Criteria:
- UPI, cards, BNPL available when provider supports it; relevant error messages on failure.
- Successful payment updates order status to “paid” and triggers confirmation.
Tasks:
- Integrate payment providers and webhooks with signature validation.
- Create order/payment domain models and state machine.
- Implement address validation and shipping options.
Subtasks:
- Idempotency keys on all write operations.
- Webhook retry handling and dead-letter queue.
- E2E checkout smoke tests.


Epic: Accounts, Orders & Returns
Description: Enable account creation/login, address book, order history, tracking, returns/refunds.
Success criteria:
- Account creation success ≥ 95%; password reset ≤ 5 minutes.
- Return requests resolved within SLA; defect rate < 2%.

Feature: Authentication & Profile
Description: Email/password auth with session/refresh tokens; optional 2FA later.
Acceptance Criteria:
- JWT-based sessions; refresh rotation; secure cookie on web.
- Rate-limited login; device/session management.
User Story:
As a customer, I want to manage my profile and addresses so I can checkout faster next time.
Acceptance Criteria:
- CRUD addresses; default address selection; validation for Indian formats.
Tasks:
- Implement `/auth` REST endpoints and GraphQL `me` queries.
- Profile and address book UIs (web/app).
Subtasks:
- Email verification and reset flows.
- Brute-force protection and captcha on suspicious IPs.

Feature: Orders & Returns
Description: View past orders, track shipments, initiate returns/refunds.
User Story:
As a customer, I want to initiate a return from my order details so I can get a refund for damaged items.
Acceptance Criteria:
- Return eligibility check and reason capture; RMA issuance.
- Refund webhook updates order and wallet/bank as applicable.
Tasks:
- Order detail UI with shipment tracking.
- Returns micro-flow and refund integration.
Subtasks:
- Notifications on status changes (email/push/SMS where applicable).
- Audit log entries for returns and refunds.


Epic: Search & Discovery
Description: Deliver fast, relevant search with synonyms and intent-based discovery.
Success criteria:
- Search latency < 300ms P95; zero-result rate < 5%.
- Search → PDP success ≥ 90%.

Feature: Query, Facets, Synonyms
Description: Typeahead, fuzzy match, localized synonyms (e.g., Amethyst ↔ Jamunia).
User Story:
As a shopper, I want helpful suggestions as I type so I can discover relevant crystals faster.
Acceptance Criteria:
- Autosuggest with recent searches and popular intents.
- Handles typos and synonym expansion.
Tasks:
- Implement search API with facets and synonyms.
- Add autosuggest UI, recent searches, and clear history.
Subtasks:
- Configure indexes, analyzers, and ranking.
- Track `search`, `autosuggest_select`, and zero-result metrics.

Feature: Recommendations
Description: Cross-sell on PDP and personalized trending collections.
User Story:
As a returning shopper, I want recommendations aligned to my interests so I can find products I’m likely to buy.
Acceptance Criteria:
- PDP shows related by intent/stone; home shows trending collections.
Tasks:
- Rules-based recommendations (v1) using tags and co-views.
- UI blocks for PDP and home modules.
Subtasks:
- Feature flag rollout and A/B test hooks.


Epic: Content & Education Hub
Description: Education-first content (guides, rituals, sourcing stories) via CMS.
Success criteria:
- Content-assisted conversion uplift +5% ATC on PDP.
- Organic sessions +10% MoM from content pages.

Feature: CMS-driven Learn Hub
Description: Guides, rituals, sourcing & ethics, care & cleansing.
User Story:
As a learner, I want trustworthy articles and rituals so I can use crystals safely and effectively.
Acceptance Criteria:
- CMS entities for article/ritual with author and reviewed date.
- JSON-LD (Article, FAQ); internal linking to PDP.
Tasks:
- Integrate CMS webhooks and content fetchers.
- Build Learn hub, article pages, and ritual templates.
Subtasks:
- Add glossary and FAQ components.
- Lighthouse SEO checks for Core Web Vitals.

Feature: PDP↔Content Cross-linking
Description: Deep links between PDP and related content to build trust.
User Story:
As a shopper, I want to read authenticity and care information from the PDP so I can make a confident choice.
Acceptance Criteria:
- PDP shows sourcing block; Learn articles link back to product intents.
Tasks:
- Add cross-link resolver by tags and categories.
- Track engagement impact on ATC.
Subtasks:
- Create UTM tagging and cohort analysis in BI.


Epic: Trust, Reviews & UGC
Description: Transparent reviews, photo/video UGC, and anti-gaming safeguards.
Success criteria:
- Publish all compliant reviews (incl. critical) within SLA.
- Review volume per product ≥ industry median; fraud rate < 1%.

Feature: Verified Reviews
Description: Allow verified buyers to rate and review with media.
User Story:
As a buyer, I want my honest review to be visible so I can help others make decisions.
Acceptance Criteria:
- Moderation pipeline with clear guidelines; no suppression of critical but compliant reviews.
- “Verified purchase” badge and media uploads.
Tasks:
- Build reviews service with verification and moderation states.
- Add PDP reviews UI with filters (rating, media).
Subtasks:
- Storage via S3 presigned URLs; virus scan pipeline.
- Rate limiting and anti-spam protections.

Feature: Community Stories
Description: Curated testimonials and journeys, distinct from reviews.
User Story:
As a community member, I want to share my story so others can learn from my experience.
Acceptance Criteria:
- CMS-driven curation; separate from product reviews; clear labeling.
Tasks:
- Build stories content type and display templates.
- Add submission flow with consent and rights management.
Subtasks:
- Legal disclaimers and content policy notices.


Epic: Loyalty, Subscriptions & Referrals
Description: Drive retention via subscription boxes, loyalty tiers, and referrals.
Success criteria:
- Repeat purchase rate ≥ 30%; subscription churn ≤ 3%/mo.
- Referral-attributed orders ≥ 10% of monthly volume.

Feature: Subscription Box (v1)
Description: Simple monthly/quarterly curation with pause/resume.
User Story:
As a subscriber, I want to pause or resume my plan so I have flexibility when needed.
Acceptance Criteria:
- Pause/resume in ≤ 3 taps; takes effect within 5 minutes.
- Billing history visible; proration rules documented.
Tasks:
- Subscription domain models and billing scheduler.
- Pause/resume/cancel GraphQL mutations and UI flows.
Subtasks:
- Webhook reconciliation with payment provider.
- E2E tests for lifecycle events.

Feature: Loyalty & Referrals
Description: Tiered loyalty and referral links/codes.
User Story:
As a loyal customer, I want to refer friends and earn rewards so I save on future purchases.
Acceptance Criteria:
- Unique referral links; attribution and fraud checks; reward issuance on first purchase.
Tasks:
- Implement referral tracking and reward ledger.
- Loyalty tier computation and benefits display.
Subtasks:
- Anti-abuse rules (same device/IP/email heuristics).
- BI dashboards for referral performance.


Epic: Mobile App Experience & Distribution
Description: High-quality React Native app with push notifications and store-compliant release.
Success criteria:
- Crash-free sessions > 99.5%; ANR ≤ 0.3%; cold start ≤ 2.5s.
- Successful staged rollout with no critical issues.

Feature: Onboarding & Push Opt-in
Description: Guided onboarding with optional education-first or quick-start variants.
User Story:
As a new app user, I want a simple onboarding so I can start shopping quickly while discovering useful content.
Acceptance Criteria:
- A/B tested onboarding variants; push opt-in with clear value proposition.
Tasks:
- Implement onboarding screens and experiment hooks.
- Integrate push notifications (topics: orders, content, offers).
Subtasks:
- Deep link routing and cold-start handling.
- Event tracking: `push_opt_in`, `notification_open`.

Feature: Store Readiness & Compliance
Description: Prepare assets/metadata and fulfill Play/App Store policies.
User Story:
As a release manager, I want a repeatable store submission process so we can ship updates smoothly.
Acceptance Criteria:
- Complete store listings with localized screenshots/descriptions.
- Privacy/DCI labels accurate; internal testing tracks configured.
Tasks:
- CI job to build signed artifacts (`.ipa`, `.aab`).
- Checklist automation and release notes templating.
Subtasks:
- Test credentials and review notes for reviewers.
- Post-launch monitoring dashboard.


Epic: Analytics & Telemetry
Description: End-to-end event taxonomy and observability for product, growth, and reliability.
Success criteria:
- Funnels and cohorts available in BI; consent-compliant tracking.
- Alerts for checkout dips, payment failures, and performance regressions.

Feature: Event Instrumentation
Description: Web/app SDKs and server spans/metrics with stable schemas.
User Story:
As a product analyst, I want reliable events so I can measure funnels and attribution.
Acceptance Criteria:
- GA4/app analytics for core events; OpenTelemetry traces on backend.
- PII minimization; consent gating; schema versioning.
Tasks:
- Implement event wrappers; ensure consistent `user_id`, `session_id`, `device_id`.
- Define dbt models and daily ETL to warehouse and BI.
Subtasks:
- Dashboards: funnel, search success, performance, crash rate.
- Alerting for checkout CR dip > 20% and PDP LCP > 3s.

Feature: Experimentation Hooks
Description: A/B testing for onboarding and PDP layout.
User Story:
As a PM, I want safe experiment toggles so we can validate improvements without risking the whole user base.
Acceptance Criteria:
- Feature flags with targetable cohorts; guardrails for KPIs.
Tasks:
- Integrate flag system; add experiment assignment/arms to events.
- Build experiment results template in BI.
Subtasks:
- Exposure logging and sample ratio mismatch checks.


Epic: API Platform & Integrations
Description: Public GraphQL for app/web and REST for webhooks/auth/payments/admin.
Success criteria:
- Backwards-compatible changes; error rate < 0.5%; p95 latency < 200ms for cached reads.

Feature: GraphQL Core
Description: Catalog, cart, checkout, account, content, subscriptions.
User Story:
As a frontend dev, I want typed GraphQL schemas so I can build features quickly and safely.
Acceptance Criteria:
- Additive changes only in minor versions; deprecations flagged.
Tasks:
- Define schemas and resolvers; persisted queries and caching.
- Cursor pagination; standardized `Error` shape with `traceId`.
Subtasks:
- GraphQL codegen for TS typings.
- Load tests for hot queries.

Feature: Webhooks & Payments REST
Description: Signed webhooks for Razorpay/Stripe; admin endpoints where needed.
User Story:
As a payments engineer, I want idempotent webhook handling so I can ensure consistent order states.
Acceptance Criteria:
- HMAC signature validation; retries with exponential backoff; DLQ on repeated failures.
Tasks:
- Implement `/v1/webhooks/*` endpoints and idempotency keys.
- Add payment intent creation and status reconciliation.
Subtasks:
- Audit logs for admin actions; strict CORS allowlist.


Epic: Security, Privacy & Compliance
Description: Protect user data, secure payments, and comply with DPDP/GDPR and PCI-DSS.
Success criteria:
- No P1 security incidents; regular pen-tests; successful policy audits.

Feature: App & API Hardening
Description: OWASP coverage, input/output validation, rate limiting, secrets hygiene.
User Story:
As a security lead, I want standardized safeguards so the platform resists common attacks.
Acceptance Criteria:
- WAF rules (bot, SQLi, XSS), CSP/HSTS enforced; JWT (RS256) rotation 90d.
Tasks:
- Add Zod/Yup validation and parameterized queries.
- Implement per-IP and per-token rate limits.
Subtasks:
- Secret scanning in CI and dependency audits.
- Regular key rotation runbook.

Feature: Privacy & Consent
Description: Consent management, data deletion/export flows, minimal PII tracking.
User Story:
As a privacy-conscious user, I want control over my data so I can trust the brand.
Acceptance Criteria:
- Consent logs; opt-out honored; data deletion/export within 7 days.
Tasks:
- Build consent banner/storage and user data portal.
- Implement deletion/export jobs with audit trail.
Subtasks:
- BI segregation of PII and role-based access control.


Epic: Reliability & DevOps
Description: Robust CI/CD, observability, and SLO-driven operations on AWS.
Success criteria:
- Uptime 99.9%; RPO 15m, RTO 60m; automated rollbacks.

Feature: CI/CD & Environments
Description: Dev/Staging/Prod with safe deploys (blue/green or canary).
User Story:
As an engineer, I want reliable pipelines so I can ship changes confidently.
Acceptance Criteria:
- Lint, type-check, tests, build; preview envs; coverage gate on critical paths.
Tasks:
- GitHub Actions workflows; infra as code (Terraform) for core resources.
- Database migrations gating and smoke tests pre-deploy.
Subtasks:
- Conventional Commits and semantic versioning automation.
- Secret management via AWS Secrets Manager.

Feature: Observability & SRE
Description: Centralized logs, tracing, metrics, dashboards, and alerting.
User Story:
As an on-call engineer, I want actionable alerts so I can resolve incidents quickly.
Acceptance Criteria:
- RED/USE metrics; dashboards for latency, errors, saturation; on-call runbooks.
Tasks:
- Configure log shipping and tracing (OpenTelemetry) with sampling.
- Set SLOs and alert policies; incident classification.
Subtasks:
- Backup/restore drills and failover health checks.


Epic: Customer Support & Knowledge Base
Description: In-app chat, help center, and escalation flows.
Success criteria:
- First-response time ≤ 2 minutes (chat); CSAT ≥ 90.

Feature: Support Chat & Help Center
Description: Embedded chat and searchable help center with categories.
User Story:
As a customer, I want instant help so I can resolve issues during checkout.
Acceptance Criteria:
- Chat accessible across PDP/cart/checkout; ticket creation on escalation.
- Help Center articles searchable with categories and intents.
Tasks:
- Integrate chat SDK and build Help Center with CMS.
- Add escalation workflow and ticketing integration.
Subtasks:
- Event logging for support interactions and outcomes.
- Satisfaction survey post-resolution.


— End of business requirements document —

