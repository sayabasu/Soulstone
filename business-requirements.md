# Launch Soulstone’s trusted commerce platform for ethically sourced crystals.

Enable wellness-conscious consumers in India to discover, learn about, and purchase ethically sourced crystals through a transparent, high-performing web and mobile experience reinforced by education, subscriptions, loyalty, and community partnerships.

**Success criteria:**

- MVP live within 3 months with web + mobile, 100+ SKUs, payments, and Learn Hub v1.
- Year‑1 traction: ≥ 25,000 paying users; repeat purchase rate ≥ 30%.
- Conversion and checkout: sitewide conversion ≥ 3.5%; checkout success ≥ 65%; payment failures ≤ 2%.
- Performance and reliability: P75 page load < 2.0s (web); crash‑free sessions > 99.5% (app).
- Unit economics: CAC ≤ ₹500; LTV:CAC ≥ 8:1; AOV ≈ ₹1,800.
- Quality and experience: returns ≤ 4% and defects < 2%; CSAT ≥ 90 with first‑response time ≤ 2 minutes; partner‑attributed revenue ≥ 15% and partner NPS ≥ 60 by Month 12.

## 1. [ Feature ] - Engineering Foundations & Dev Environment
Description: Establish a monorepo, coding standards, and a reproducible local development environment to enable fast, consistent engineering workflows.
Acceptance Criteria:
- Monorepo structure created with apps/packages/infra as specified and workspace scripts working.
- Shared TypeScript config with strict mode and path aliases adopted by all apps.
- ESLint/Prettier configured with pre-commit hooks; commitlint and PR template in place.
- Docker Compose services (Postgres, Redis, Mailhog, etc.) start via one command; healthchecks green.
- Onboarding docs and Makefile/Taskfile allow new devs to bootstrap in < 15 minutes.

### 1.1. [ User Story ] - Monorepo and Tooling Setup
#### 1.1.1. [ Task ] - Initialize monorepo (pnpm or yarn workspaces)
**1.1.1.1. [ Subtask ] - Create structure: apps/api, apps/web, packages/ui, packages/config, packages/tsconfig, packages/eslint-config, infra/terraform, ops**

**1.1.1.2. [ Subtask ] - Configure workspace root package.json with scripts (build, dev, test, lint, format)**

**1.1.1.3. [ Subtask ] - Add .editorconfig, .nvmrc, .gitattributes, .gitignore**

#### 1.1.2. [ Task ] - TypeScript baselines
**1.1.2.1. [ Subtask ] - Define shared tsconfig in packages/tsconfig and extend in apps**
**1.1.2.2. [ Subtask ] - Enable strict mode, path aliases, incremental builds**
#### 1.1.3. [ Task ] - Linting/formatting standards
**1.1.3.1. [ Subtask ] - ESLint with TypeScript rules; Prettier with import/order**
**1.1.3.2. [ Subtask ] - Add lint-staged + Husky pre-commit hooks**
#### 1.1.4. [ Task ] - Commit and branch conventions
**1.1.4.1. [ Subtask ] - Configure commitlint (Conventional Commits)**
**1.1.4.2. [ Subtask ] - Define branch protection and PR template**

### 1.2. [ User Story ] - Local Dev Environment
#### 1.2.1. [ Task ] - Docker Compose services
**1.2.1.1. [ Subtask ] - postgres (15), redis, mailhog, localstack (optional)**
**1.2.1.2. [ Subtask ] - Seed volumes and healthchecks; named networks**
#### 1.2.2. [ Task ] - Env management
**1.2.2.1. [ Subtask ] - .env.example with required vars; dotenv-safe loading**
**1.2.2.2. [ Subtask ] - Split envs: .env.dev, .env.test, .env.local**
#### 1.2.3. [ Task ] - Developer bootstrap script
**1.2.3.1. [ Subtask ] - Makefile/Taskfile for install, db:up, db:migrate, db:seed, dev**
**1.2.3.2. [ Subtask ] - Onboarding doc covering prerequisites and commands**

## 2. [ Feature ] - Infrastructure as Code (AWS)
Description: Provision secure, scalable AWS foundations using Terraform for networking, compute, data, secrets, and observability.
Acceptance Criteria:
- VPC with public/private subnets, NAT, least-privilege security groups, and SSM access provisioned.
- Route53 + ACM for domains/certs; CloudFront + WAF fronting the web workload.
- ECR repos and ECS Fargate services for API and web with passing health checks.
- RDS Postgres Multi-AZ with encryption, backups, parameter groups; Redis cluster provisioned.
- Secrets structure in Secrets Manager/SSM; CloudWatch log retention and alarms wired to Slack/webhook.

### 2.1. [ User Story ] - Core Networking & Security
#### 2.1.1. [ Task ] - VPC with public/private subnets and NAT
**2.1.1.1. [ Subtask ] - Terraform module for VPC, subnet, route tables**
**2.1.1.2. [ Subtask ] - Security groups least privilege; SSM Session Manager access**
#### 2.1.2. [ Task ] - DNS/CDN
**2.1.2.1. [ Subtask ] - Route 53 hosted zones; ACM certs**
**2.1.2.2. [ Subtask ] - CloudFront for web with S3 origin and WAF**

### 2.2. [ User Story ] - Compute & Containers
#### 2.2.1. [ Task ] - ECR repositories and lifecycle policies
**2.2.1.1. [ Subtask ] - Private ECR with immutability and tag scanning**
#### 2.2.2. [ Task ] - ECS Fargate services
**2.2.2.1. [ Subtask ] - API service behind ALB; health/readiness checks**
**2.2.2.2. [ Subtask ] - Web SSR service (if Next SSR) or static S3 hosting**

### 2.3. [ User Story ] - Data Stores
#### 2.3.1. [ Task ] - RDS PostgreSQL (Multi-AZ) with security
**2.3.1.1. [ Subtask ] - Parameter groups, backups, encryption at rest**
**2.3.1.2. [ Subtask ] - Read replica plan; connection limits and alerts**
#### 2.3.2. [ Task ] - ElastiCache Redis for sessions/cache

### 2.4. [ User Story ] - Secrets & Keys
#### 2.4.1. [ Task ] - Secrets Manager/SSM Parameter Store structure
**2.4.1.1. [ Subtask ] - Namespace by env (dev/stage/prod)**
**2.4.1.2. [ Subtask ] - Rotation policy and IAM access boundaries**

### 2.5. [ User Story ] - Observability Base
#### 2.5.1. [ Task ] - CloudWatch log groups and metrics
**2.5.1.1. [ Subtask ] - Log retention policies; metric filters for errors/latency**
#### 2.5.2. [ Task ] - Alarms and notifications
**2.5.2.1. [ Subtask ] - SNS + Slack/webhook integration for alerts**

## 3. [ Feature ] - CI/CD Pipelines
Description: Automate build, test, security scanning, artifact creation, and deployments with preview environments.
Acceptance Criteria:
- GitHub Actions run lint, type-check, unit tests, and build with caching on every PR.
- Dependency, image, and secret scans gate merges; SBOMs produced for images.
- Docker images are non-root, multi-stage, with healthchecks and graceful shutdown.
- API deploys via blue/green with auto-rollback; web deploys with invalidations; DB migrations gated.
- Per-PR preview environments spin up and tear down automatically.

### 3.1. [ User Story ] - Continuous Integration
#### 3.1.1. [ Task ] - GitHub Actions workflows
**3.1.1.1. [ Subtask ] - Jobs: lint, type-check, unit tests, build**
**3.1.1.2. [ Subtask ] - Cache node modules and build artifacts**
#### 3.1.2. [ Task ] - Security scanning in CI
**3.1.2.1. [ Subtask ] - eslint-plugin-security, npm audit, trivy image scan**
**3.1.2.2. [ Subtask ] - Secret scanning (gitleaks)**

### 3.2. [ User Story ] - Build & Release Artifacts
#### 3.2.1. [ Task ] - Dockerfiles (multi-stage) for api and web
**3.2.1.1. [ Subtask ] - Non-root user, minimal base (alpine or distroless)**
**3.2.1.2. [ Subtask ] - Healthcheck and SIGTERM handling**
#### 3.2.2. [ Task ] - Image versioning and SBOM
**3.2.2.1. [ Subtask ] - Tagging with sha/semver; syft/grype SBOM**

### 3.3. [ User Story ] - Continuous Delivery
#### 3.3.1. [ Task ] - Deploy API to ECS with blue/green
**3.3.1.1. [ Subtask ] - Auto rollback on health check failure**
#### 3.3.2. [ Task ] - Deploy Web
**3.3.2.1. [ Subtask ] - S3+CloudFront invalidations (SSG) or ECS (SSR)**
#### 3.3.3. [ Task ] - Database migrations
**3.3.3.1. [ Subtask ] - Gate deploy on successful migrate; rollback plan**
#### 3.3.4. [ Task ] - Preview environments per PR
**3.3.4.1. [ Subtask ] - Ephemeral API + web URLs; tear-down job**

## 4. [ Feature ] - Security & Compliance
Description: Implement application security controls, privacy rights, fraud protection, and pen-test remediation workflows.
Acceptance Criteria:
- OWASP controls enforced (validation, headers, CORS, CSRF where relevant).
- IP/user rate limits and circuit breakers protect critical routes.
- Consent management and privacy rights portal operational (export/delete ≤ 7 days SLA).
- Pen-test triage, remediation, verification, and reporting tracked to closure.
- Pre/post-payment risk scoring with actions (hold/cancel/manual review) enabled.

### 4.1. [ User Story ] - AppSec Baseline
#### 4.1.1. [ Task ] - OWASP top 10 controls
**4.1.1.1. [ Subtask ] - Input/output validation (Zod) and parameterized queries**
**4.1.1.2. [ Subtask ] - Helmet/CSP, HSTS, CORS allowlist**
#### 4.1.2. [ Task ] - Rate limiting and abuse prevention
**4.1.2.1. [ Subtask ] - Per-IP and per-token quotas; circuit breaker**

### 4.2. [ User Story ] - Privacy & DPDP/GDPR
#### 4.2.1. [ Task ] - Consent management and preferences store
**4.2.1.1. [ Subtask ] - Cookie banner and SDK gating**
#### 4.2.2. [ Task ] - Data rights portal
**4.2.2.1. [ Subtask ] - Export/delete with audit log; SLA ≤ 7 days**

### 4.3. [ User Story ] - Penetration Testing & Remediation
#### 4.3.1. [ Task ] - Triage and severity classification
**4.3.1.1. [ Subtask ] - SLAs by severity; owner assignment and tracking**
#### 4.3.2. [ Task ] - Remediation and verification
**4.3.2.1. [ Subtask ] - Re-test and regression tests wired into CI**
#### 4.3.3. [ Task ] - Reporting and change management
**4.3.3.1. [ Subtask ] - Approvals, audit trail, and post-mortems**

### 4.4. [ User Story ] - Fraud & Risk Scoring Hooks
#### 4.4.1. [ Task ] - Pre/post-payment risk evaluation
**4.4.1.1. [ Subtask ] - Signals: device/IP/email heuristics, velocity, coupon abuse**
#### 4.4.2. [ Task ] - Actions & workflows
**4.4.2.1. [ Subtask ] - Manual review queue; auto-cancel/hold rules; audit logs**

## 5. [ Feature ] - Database & Data Modeling (PostgreSQL + Prisma)
Description: Define robust relational models and performance patterns for core entities with repeatable migrations.
Acceptance Criteria:
- Prisma schema covers core domain models with keys, constraints, and enums.
- Migrations apply cleanly across dev/stage/prod; rollback procedure documented.
- Indexes exist for search/facets and hot queries; partial indexes where appropriate.
- Seed data and anonymized fixtures available for dev/test.
- Automated backups configured; quarterly restore drill documented.

### 5.1. [ User Story ] - Schema Foundation
#### 5.1.1. [ Task ] - Define core models (User, Address, Product, Collection, Inventory, Cart, CartItem, Order, Payment, Review, Subscription, Article, Media)
**5.1.1.1. [ Subtask ] - Prisma schema and enums; migrations**
**5.1.1.2. [ Subtask ] - Foreign keys, cascades, unique constraints**
#### 5.1.2. [ Task ] - Indexing and performance
**5.1.2.1. [ Subtask ] - B-tree/GiST indexes for search/facets; partial indexes**

### 5.2. [ User Story ] - Data Lifecycle
#### 5.2.1. [ Task ] - Seed data for dev/test
**5.2.1.1. [ Subtask ] - Factories and fixtures; anonymized sample content**
#### 5.2.2. [ Task ] - Backups and restore drills
**5.2.2.1. [ Subtask ] - Automated snapshots; quarterly restore test**

## 6. [ Feature ] - API Platform (Express/Node, TypeScript)
Description: Provide a modular, observable REST API with validation, errors, security, and auth primitives.
Acceptance Criteria:
- Express app structured by routes/controllers/services/repos with request ID logging and health/metrics endpoints.
- Standardized error shape and codes; DTO validation/sanitization via Zod.
- Auth endpoints support JWT access/refresh rotation, email verification, and password reset.
- Route-level rate limits enforced via Redis token bucket.
- Metrics and structured logs available in CloudWatch/Sentry.

### 6.1. [ User Story ] - API Server Scaffolding
#### 6.1.1. [ Task ] - Express app with modular structure (routes/controllers/services/repos)
**6.1.1.1. [ Subtask ] - Request ID correlation and structured logging (pino)**
**6.1.1.2. [ Subtask ] - Health, readiness, and metrics endpoints**

### 6.2. [ User Story ] - Error Handling & Validation
#### 6.2.1. [ Task ] - Global error handler and error shape
**6.2.1.1. [ Subtask ] - Map to codes: AUTH_FAILED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, RATE_LIMITED**
#### 6.2.2. [ Task ] - DTO validation
**6.2.2.1. [ Subtask ] - Zod schemas; sanitize and normalize inputs**

### 6.3. [ User Story ] - Auth Endpoints
#### 6.3.1. [ Task ] - /auth/signup, /auth/login, /auth/refresh, /auth/logout
**6.3.1.1. [ Subtask ] - JWT (RS256) access/refresh; rotation and revocation store (Redis)**
**6.3.1.2. [ Subtask ] - Email verification, password reset tokens**

### 6.4. [ User Story ] - Rate Limiting & Security
#### 6.4.1. [ Task ] - IP and user-based throttles
**6.4.1.1. [ Subtask ] - Redis-backed token bucket; per-route configs**

## 7. [ Feature ] - Authentication & Accounts
Description: Manage user identities, profiles, addresses, and active sessions with security controls.
Acceptance Criteria:
- Profile CRUD and Indian address validation with default address selection.
- Session/device listing and revocation available from account settings.
- Data model ensures uniqueness and referential integrity for users/addresses.
- API permissions enforced for protected profile endpoints.

### 7.1. [ User Story ] - User Profile & Address Book
#### 7.1.1. [ Task ] - CRUD profile and addresses
**7.1.1.1. [ Subtask ] - Indian address validation; default selection**
#### 7.1.2. [ Task ] - Session/device management
**7.1.2.1. [ Subtask ] - List/revoke active sessions**

### 7.2. [ User Story ] - Account Lifecycle (Delete/Close)
#### 7.2.1. [ Task ] - Account deletion and data export requests
**7.2.1.1. [ Subtask ] - Identity verification; queue with SLA**
**7.2.1.2. [ Subtask ] - Soft-delete window; purge job and audit log**

### 7.3. [ User Story ] - Contact Changes & Reverification
#### 7.3.1. [ Task ] - Change email/phone with re-verification
**7.3.1.1. [ Subtask ] - Verify new contact; migrate login identifiers**
**7.3.1.2. [ Subtask ] - Notify old contact; recovery lockout window**

### 7.4. [ User Story ] - Anti-automation on Auth
#### 7.4.1. [ Task ] - CAPTCHA/risk checks on auth endpoints
**7.4.1.1. [ Subtask ] - Apply to signup/login/forgot; global rate limits (see 6.4)**
**7.4.1.2. [ Subtask ] - Device/IP heuristic scoring and throttles**

## 8. [ Feature ] - Catalog & Search
Description: Enable rich product discovery with facets, search, and informative PDPs.
Acceptance Criteria:
- PLP supports facets, sorting, and pagination with empty-state handling.
- PDP shows images, price, origin, authenticity, energy tags; related products present.
- Search includes typeahead, synonyms, fuzzy match, and recent searches.
- JSON-LD structured data present for PDP and breadcrumbs.

### 8.1. [ User Story ] - Catalog Browse (PLP)
#### 8.1.1. [ Task ] - Products list with facets (type, intention, chakra, price, size, origin, rating)
**8.1.1.1. [ Subtask ] - Cursor/offset pagination; sort options**
**8.1.1.2. [ Subtask ] - Zero-result handling with suggested intents**

### 8.2. [ User Story ] - Product Detail (PDP)
#### 8.2.1. [ Task ] - PDP data: images, price, origin, authenticity, energy tags
**8.2.1.1. [ Subtask ] - Related products by intent/type; JSON-LD**

### 8.3. [ User Story ] - Search Service
#### 8.3.1. [ Task ] - Typeahead and full-text search
**8.3.1.1. [ Subtask ] - Synonyms (e.g., Amethyst <-> Jamunia); fuzzy match**
**8.3.1.2. [ Subtask ] - Recent searches and clear history**

### 8.4. [ User Story ] - Variants & Options
#### 8.4.1. [ Task ] - Variant modeling and selection UI
**8.4.1.1. [ Subtask ] - Option swatches; canonical SKU selection**

### 8.5. [ User Story ] - Indexing Pipeline
#### 8.5.1. [ Task ] - Incremental indexing and reindex jobs
**8.5.1.1. [ Subtask ] - Publish hooks; background reindex; partial updates**

### 8.6. [ User Story ] - Search Analytics & Curation
#### 8.6.1. [ Task ] - Zero-result analytics and synonyms curation
**8.6.1.1. [ Subtask ] - Curate synonyms/redirects; promote/demote rules**

## 9. [ Feature ] - Cart & Pricing
Description: Provide accurate carts with discounts, tax, shipping, and guest/server persistence.
Acceptance Criteria:
- Add/update/remove items recalculates subtotal, tax, shipping, and discounts.
- Server cart persists for auth users; guest cart persists locally.
- Merge-on-login resolves conflicts and recalculates totals deterministically.
- Idempotent cart mutations and consistent pricing across sessions.

### 9.1. [ User Story ] - Cart Service
#### 9.1.1. [ Task ] - Add/update/remove items; totals (subtotal, tax, shipping, discounts)
**9.1.1.1. [ Subtask ] - Server cart persistence; guest cart local persistence**
#### 9.1.2. [ Task ] - Merge-on-login
**9.1.2.1. [ Subtask ] - Conflict resolution and price recalc**

### 9.2. [ User Story ] - Inventory Reservations
#### 9.2.1. [ Task ] - Reserve items on add-to-cart
**9.2.1.1. [ Subtask ] - TTL and release on abandon**
**9.2.1.2. [ Subtask ] - Oversell guardrails and alerts**

### 9.3. [ User Story ] - Estimators & Gifting
#### 9.3.1. [ Task ] - Shipping/tax estimate pre-login
**9.3.1.1. [ Subtask ] - Pin code estimator on cart**
#### 9.3.2. [ Task ] - Gift wrap and messages
**9.3.2.1. [ Subtask ] - Fees, preview, and packing slip handling**

## 10. [ Feature ] - Checkout & Payments (Razorpay/Stripe)
Description: Deliver a secure, reliable checkout with address/shipping, payment intents, and robust webhooks.
Acceptance Criteria:
- Address capture validates PIN/phone; shipping methods selectable and priced.
- Payment intents created with idempotency; success/failure states handled.
- Webhook signatures verified; retries with DLQ; orders reflect payment state.
- PCI scope limited (no PAN storage); sensitive data never logged.
- Happy-path checkout completes under target latency; failure paths recover gracefully.

### 10.1. [ User Story ] - Address & Shipping
#### 10.1.1. [ Task ] - Address capture and validation; shipping methods
**10.1.1.1. [ Subtask ] - Pin code and phone validation**
**10.1.1.2. [ Subtask ] - Reuse address validation engine (see 7.1.1.1)**

### 10.2. [ User Story ] - Payment Intent & Confirmation
#### 10.2.1. [ Task ] - Create payment intent; handle success/failure
**10.2.1.1. [ Subtask ] - Idempotency keys on writes**
#### 10.2.2. [ Task ] - Webhooks
**10.2.2.1. [ Subtask ] - Signature validation; retries and DLQ**

### 10.3. [ User Story ] - Regulatory & Risk Controls
#### 10.3.1. [ Task ] - 3DS/SCA and terms acceptance
**10.3.1.1. [ Subtask ] - Provider challenge UI; error states**
**10.3.1.2. [ Subtask ] - Terms/return policy checkbox and logging**
#### 10.3.2. [ Task ] - COD eligibility and fees
**10.3.2.1. [ Subtask ] - PIN serviceability, order value caps, fee toggles**

### 10.4. [ User Story ] - Provider Resilience & Retries
#### 10.4.1. [ Task ] - Payment provider failover and retry logic
**10.4.1.1. [ Subtask ] - Retry/backoff; fallback provider routing**

## 11. [ Feature ] - Orders, Fulfillment & Returns
Description: Manage order lifecycle, shipments, returns, and refunds with full auditability.
Acceptance Criteria:
- Order state transitions tracked with emitted domain events.
- Shipment tracking synced from carrier webhooks; status visible to users.
- Returns created with eligibility checks; refunds posted to ledger.
- Full timeline and notes maintained for each order.

### 11.1. [ User Story ] - Order Lifecycle
#### 11.1.1. [ Task ] - Order states and transitions (created, paid, fulfilled, refunded)
**11.1.1.1. [ Subtask ] - Event emission for state changes**
#### 11.1.2. [ Task ] - Shipment tracking
**11.1.2.1. [ Subtask ] - Carrier tracking link and status sync**

### 11.2. [ User Story ] - Returns & Refunds
#### 11.2.1. [ Task ] - RMA creation and eligibility checks
**11.2.1.1. [ Subtask ] - Refund processing and ledger updates**

### 11.3. [ User Story ] - Split Shipments & Partial Fulfillment
#### 11.3.1. [ Task ] - Partial fulfillment and multi-tracking
**11.3.1.1. [ Subtask ] - Shipment items and status aggregation**

### 11.4. [ User Story ] - Cancellations & Exchanges
#### 11.4.1. [ Task ] - Cancellation windows and fees
**11.4.1.1. [ Subtask ] - Pre-ship/after-ship rules; notifications**
#### 11.4.2. [ Task ] - Exchange flow
**11.4.2.1. [ Subtask ] - Exchange order creation; stock checks**

### 11.5. [ User Story ] - Guest Tracking & Invoices
#### 11.5.1. [ Task ] - Guest order lookup via email/phone + OTP
**11.5.1.1. [ Subtask ] - Invoice PDF download with GST details**

## 12. [ Feature ] - Reviews & UGC
Description: Collect verified product reviews and media with moderation and anti-abuse.
Acceptance Criteria:
- Review CRUD restricted to verified purchasers; media uploads via presigned URLs with AV scanning.
- Anti-spam enforced leveraging global rate limiting (see 6.4); moderation queue operational.
- Published reviews meet content policy; takedown workflow exists.
- Review events tracked for analytics.

### 12.1. [ User Story ] - Verified Reviews
#### 12.1.1. [ Task ] - Review CRUD with verification and moderation
**12.1.1.1. [ Subtask ] - Media uploads via presigned URLs; virus scan**
#### 12.1.2. [ Task ] - Anti-spam (uses global rate limiting; see 6.4)

### 12.2. [ User Story ] - Quality Signals & Merchant Replies
#### 12.2.1. [ Task ] - Helpful votes and merchant replies
**12.2.1.1. [ Subtask ] - One-vote-per-user; reply moderation**
#### 12.2.2. [ Task ] - Flagged content workflow
**12.2.2.1. [ Subtask ] - Reasons, SLAs, takedown audit**

### 12.3. [ User Story ] - Media Handling
#### 12.3.1. [ Task ] - EXIF strip, size limits, and safety
**12.3.1.1. [ Subtask ] - Image processing and AV scanning**

## 13. [ Feature ] - Subscriptions, Loyalty & Referrals
Description: Drive retention via subscription billing, loyalty points, and referrals with fraud checks.
Acceptance Criteria:
- Subscription create/pause/resume/cancel with scheduler; provider reconciliation in place.
- Loyalty accrual/redeem rules persisted and displayed to users.
- Referral links generate attribution; fraud heuristics applied to block abuse.
- Churn and dunning outcomes tracked.

### 13.1. [ User Story ] - Subscription Lifecycle
#### 13.1.1. [ Task ] - Create/pause/resume/cancel; billing scheduler
**13.1.1.1. [ Subtask ] - Provider webhook reconciliation**

### 13.2. [ User Story ] - Loyalty & Referrals
#### 13.2.1. [ Task ] - Referral link generation and attribution
**13.2.1.1. [ Subtask ] - Fraud checks (device/IP/email heuristics)**

## 14. [ Feature ] - Web Frontend (React/Next.js)
Description: Ship an accessible, SEO-friendly Next.js storefront with core shopping flows.
Acceptance Criteria:
- App shell, routing, and error boundaries implemented; base i18n (en-IN) configured.
- Design system components meet WCAG AA; focus and keyboard navigation verified.
- PLP, PDP, Cart, Checkout, and Account pages function end-to-end.
- Core Web Vitals budgets monitored; image optimization and code-splitting in place.
- Sitemaps, robots.txt, canonical URLs, and structured data configured.

### 14.1. [ User Story ] - App Shell & Routing
#### 14.1.1. [ Task ] - Next.js app with SSR/SSG where applicable
**14.1.1.1. [ Subtask ] - Layouts, error boundaries, i18n baseline (en-IN)**

### 14.2. [ User Story ] - Design System
#### 14.2.1. [ Task ] - Tokens, theming, components (buttons, cards, inputs, modals, nav)
**14.2.1.1. [ Subtask ] - Accessibility-first (WCAG AA), keyboard focus states**

### 14.3. [ User Story ] - Core Pages
#### 14.3.1. [ Task ] - PLP with facets and sort
**14.3.1.1. [ Subtask ] - Responsive grid and skeleton loaders**
#### 14.3.2. [ Task ] - PDP with gallery and sourcing block
**14.3.2.1. [ Subtask ] - JSON-LD Product and Breadcrumb**
#### 14.3.3. [ Task ] - Cart and Checkout flows
**14.3.3.1. [ Subtask ] - Address, shipping, payment steps**
#### 14.3.4. [ Task ] - Account (orders, addresses, returns)

### 14.4. [ User Story ] - Performance & SEO
#### 14.4.1. [ Task ] - Image optimization (AVIF/WebP), prefetching, code splitting
**14.4.1.1. [ Subtask ] - Core Web Vitals budgets and monitoring**
#### 14.4.2. [ Task ] - Sitemaps, robots.txt, canonical URLs
**14.4.2.1. [ Subtask ] - Structured data (Article, FAQ, Organization)**

## 15. [ Feature ] - Analytics & Telemetry
Description: Standardize event tracking, pipeline, alerts, and experimentation for data-driven decisions.
Acceptance Criteria:
- Event taxonomy defined; SDK wrappers implemented with consistent IDs and timestamps.
- ETL to warehouse operational; dbt models apply consent/retention filters.
- Alerts for checkout CR dip, payment failures, and LCP breaches notify Slack/webhook.
- Feature flags with deterministic bucketing and exposure events; holdouts supported.
- KPI dashboards available to stakeholders.

### 15.1. [ User Story ] - Event Taxonomy & SDKs
#### 15.1.1. [ Task ] - Define events (view_item, add_to_cart, begin_checkout, purchase, subscribe, refund_initiated, search, view_article)
**15.1.1.1. [ Subtask ] - Implement wrappers on web and server; consistent ids and timestamps**

### 15.2. [ User Story ] - Data Pipeline & Dashboards
#### 15.2.1. [ Task ] - ETL to warehouse and BI
**15.2.1.1. [ Subtask ] - dbt models; retention and consent filters**
#### 15.2.2. [ Task ] - Alerts
**15.2.2.1. [ Subtask ] - Checkout CR dip > 20%, payment failure > 2%, LCP > 3s**

### 15.3. [ User Story ] - Experimentation & Feature Flags
#### 15.3.1. [ Task ] - Feature flag SDK and bucketing
**15.3.1.1. [ Subtask ] - Deterministic assignment; exposure events and holdouts**
#### 15.3.2. [ Task ] - A/B test lifecycle
**15.3.2.1. [ Subtask ] - Hypothesis, guardrails, rollout/rollback procedures**
#### 15.3.3. [ Task ] - Analysis & governance
**15.3.3.1. [ Subtask ] - Segmentation and stats checks; archive of results**

## 16. [ Feature ] - Notifications & Communications
Description: Deliver transactional and lifecycle communications across email, push, and SMS with preferences.
Acceptance Criteria:
- Transactional email templates built and localized; rendered correctly on major clients.
- Push/SMS set up for key events with user preferences and quiet hours.
- In-app notification center shows categorized messages with deep links.
- Delivery orchestration handles de-duplication and channel failover.

### 16.1. [ User Story ] - Email & Templates
#### 16.1.1. [ Task ] - Transactional emails (order confirmation, shipping, refund)
**16.1.1.1. [ Subtask ] - Template system and localization hooks**

### 16.2. [ User Story ] - Push & SMS
#### 16.2.1. [ Task ] - Push topics (orders, content, offers) and SMS for order events (where applicable)
**16.2.1.1. [ Subtask ] - Preferences and consent toggles**

### 16.3. [ User Story ] - Notifications Center
#### 16.3.1. [ Task ] - Unified in-app inbox (web/mobile)
**16.3.1.1. [ Subtask ] - Read/unread, categories, deep links**
#### 16.3.2. [ Task ] - Preferences and digests
**16.3.2.1. [ Subtask ] - Per-channel/topic; quiet hours and batching**
#### 16.3.3. [ Task ] - Delivery orchestration
**16.3.3.1. [ Subtask ] - De-duplication and channel failover (push/email/SMS)**

### 16.4. [ User Story ] - India DLT & Templates
#### 16.4.1. [ Task ] - Register sender IDs and templates
**16.4.1.1. [ Subtask ] - Map events to DLT templates; compliance logs**

### 16.5. [ User Story ] - WhatsApp Business & Routing
#### 16.5.1. [ Task ] - WhatsApp notifications for key events
**16.5.1.1. [ Subtask ] - Fallback to SMS/email; opt-in and quiet hours**

## 17. [ Feature ] - Support & Help Center
Description: Provide self-serve help content and real-time chat with escalation and CSAT collection.
Acceptance Criteria:
- CMS-driven help center with categories, search, and article feedback.
- Chat widget integrated with ticketing; escalation rules enforced; CSAT captured.
- SLAs and first-response times visible to support leads.
- Content management roles and workflow defined.

### 17.1. [ User Story ] - Help Center
#### 17.1.1. [ Task ] - CMS-driven articles and categories
**17.1.1.1. [ Subtask ] - Search and feedback on articles**

### 17.2. [ User Story ] - Chat & Escalation
#### 17.2.1. [ Task ] - Integrate chat widget and ticketing
**17.2.1.1. [ Subtask ] - Escalation rules and CSAT survey**

## 18. [ Feature ] - Reliability & SRE Operations
Description: Define SLOs, cost guardrails, DR, and automation to maintain reliable operations.
Acceptance Criteria:
- SLOs and error budgets defined per service with dashboards.
- DR plan with RPO/RTO targets; cross-region DR strategy; quarterly drills executed.
- Cost budgets, anomaly alerts, and allocation tagging in place; monthly review.
- Automated runbooks for common incidents; ChatOps triggers and approvals.
- Blameless postmortems with action items tracked to closure.

### 18.1. [ User Story ] - SLOs & Runbooks
#### 18.1.1. [ Task ] - Define SLOs for uptime, latency, errors
**18.1.1.1. [ Subtask ] - Error budget policy and dashboards**

### 18.2. [ User Story ] - DR & Backups
#### 18.2.1. [ Task ] - RPO/RTO targets, snapshots, cross-region read replica plan
**18.2.1.1. [ Subtask ] - Quarterly restore and failover drills**

### 18.3. [ User Story ] - Cost Guardrails & FinOps
#### 18.3.1. [ Task ] - Budgets and anomaly alerts
**18.3.1.1. [ Subtask ] - Per-service cost allocation via tags and accounts**
#### 18.3.2. [ Task ] - Dashboards and reports
**18.3.2.1. [ Subtask ] - Unit economics KPIs; monthly reviews and actions**

### 18.4. [ User Story ] - Incident Automation
#### 18.4.1. [ Task ] - Runbook automation for common failures
**18.4.1.1. [ Subtask ] - Auto-remediation playbooks; ChatOps triggers and approvals**
#### 18.4.2. [ Task ] - Post-incident follow-ups
**18.4.2.1. [ Subtask ] - Blameless postmortems; action items tracked to closure**

## 19. [ Feature ] - Content & CMS
Description: Power the Learn Hub with a flexible content model, webhooks, and SEO-friendly templates.
Acceptance Criteria:
- Article/ritual/glossary types defined and rendered; preview flows supported.
- Webhook ingestion triggers cache invalidation; content publishes within seconds.
- SEO pillar page templates shipped with internal linking.
- Role-based editorial permissions configured in CMS.

### 19.1. [ User Story ] - Learn Hub CMS Integration
#### 19.1.1. [ Task ] - Article, ritual, glossary types and rendering
**19.1.1.1. [ Subtask ] - Webhook ingestion and cache invalidation**
**19.1.1.2. [ Subtask ] - SEO pillar pages templates and internal linking**

## 20. [ Feature ] - Governance & Quality
Description: Enforce quality gates and versioned releases with clear changelogs and test strategy.
Acceptance Criteria:
- Unit/integration/e2e tests cover critical paths to agreed thresholds.
- Semantic versioning and automated changelog generation in CI.
- Release notes produced and distributed each release; rollback procedure documented.
- CI blocks merges when quality gates fail.

### 20.1. [ User Story ] - Testing Strategy
#### 20.1.1. [ Task ] - Unit tests (critical paths ≥ 80%), integration (API), e2e (checkout smoke)
**20.1.1.1. [ Subtask ] - Test data factories and fixtures**

### 20.2. [ User Story ] - Release & Versioning
#### 20.2.1. [ Task ] - Semantic versioning and changelog automation
**20.2.1.1. [ Subtask ] - Release notes template and distribution**

## 21. [ Feature ] - Mobile App (React Native)
Description: Deliver a performant RN app with core shopping flows, push, deep linking, and store readiness.
Acceptance Criteria:
- App boots with navigation/theming; icons/splash configured; env handling works.
- Onboarding variants functional; deep links route correctly; completion state persists.
- PLP, PDP, cart, and checkout screens operate end-to-end.
- Push notifications and deep linking integrated; performance metrics tracked with alerts.
- Store listings prepared; staged rollout configured; crash-free > 99.5%, ANR ≤ 0.3%, cold start ≤ 2.5s.

### 21.1. [ User Story ] - React Native Bootstrap
#### 21.1.1. [ Task ] - Create apps/mobile package with TS, ESLint, Prettier
**21.1.1.1. [ Subtask ] - Configure navigation (React Navigation), theming, env handling**
**21.1.1.2. [ Subtask ] - Set up native modules config (Android/iOS), app icons/splash**

### 21.2. [ User Story ] - Onboarding & Navigation
#### 21.2.1. [ Task ] - Onboarding screens with variant flags (education-first/quick-start)
**21.2.1.1. [ Subtask ] - Persist onboarding completion; deep link routing**
#### 21.2.2. [ Task ] - Tab/stack structure (Home, Shop, Learn, Account, Cart)

### 21.3. [ User Story ] - Mobile Catalog & PDP
#### 21.3.1. [ Task ] - PLP with facets/sort and infinite scroll
**21.3.1.1. [ Subtask ] - Facet drawer UX, skeletons, empty state**
#### 21.3.2. [ Task ] - PDP with gallery, energy tags, origin/certification
**21.3.2.1. [ Subtask ] - Share, wishlist, related products modules**

### 21.4. [ User Story ] - Mobile Cart & Checkout
#### 21.4.1. [ Task ] - Cart screens (items, totals, coupons)
**21.4.1.1. [ Subtask ] - Persist cart securely (async storage) and merge-on-login**
#### 21.4.2. [ Task ] - Checkout flow (address, shipping, payment)
**21.4.2.1. [ Subtask ] - Integrate Razorpay/Stripe RN SDKs; handle success/failure callbacks**

### 21.5. [ User Story ] - Push, Deep Links, and Device Metrics
#### 21.5.1. [ Task ] - Push notifications (orders, content, offers)
**21.5.1.1. [ Subtask ] - Permission prompts with value proposition; topic subscriptions**
#### 21.5.2. [ Task ] - Deep links and universal links/app links
**21.5.2.1. [ Subtask ] - Cold/warm start routing tests**

### 21.6. [ User Story ] - Store Readiness & Compliance
#### 21.6.1. [ Task ] - Device matrix QA (Android 8–14, iOS 15+); performance targets
**21.6.1.1. [ Subtask ] - Crash-free > 99.5%, ANR ≤ 0.3%, cold start ≤ 2.5s**
#### 21.6.2. [ Task ] - App Store/Play store listings and release pipeline
**21.6.2.1. [ Subtask ] - TestFlight/Play internal tracks; staged rollout and monitoring**

## 22. [ Feature ] - Admin Portal & Backoffice
Description: Equip staff with secure tools to manage catalog, inventory, orders/returns, and promotions.
Acceptance Criteria:
- RBAC with audit logs on admin actions; permission checks enforced server-side.
- Catalog CRUD and bulk import with validation and preview.
- Inventory adjustments/reservations tracked; stock alerts generated.
- Order ops supports status changes, refund approvals, and finance exports.

### 22.1. [ User Story ] - RBAC & Audit
#### 22.1.1. [ Task ] - Roles/scopes (staff, admin) and permissions
**22.1.1.1. [ Subtask ] - API guard middleware; audit logs for admin actions**

### 22.2. [ User Story ] - Catalog Management
#### 22.2.1. [ Task ] - Product CRUD, variants, pricing, collections
**22.2.1.1. [ Subtask ] - Bulk upload (CSV) and validation; preview before publish**

### 22.3. [ User Story ] - Inventory & Fulfillment
#### 22.3.1. [ Task ] - Inventory adjustments and reservations
**22.3.1.1. [ Subtask ] - Stock thresholds and alerts**

### 22.4. [ User Story ] - Orders & Returns Ops
#### 22.4.1. [ Task ] - Order search, status updates, refunds/RMA approvals
**22.4.1.1. [ Subtask ] - Notes/timeline per order; permission checks**
**22.4.1.2. [ Subtask ] - Refunds export (CSV) for finance reconciliation**

### 22.5. [ User Story ] - Promotions & Coupons
#### 22.5.1. [ Task ] - Create/disable coupons, rules, limits
**22.5.1.1. [ Subtask ] - Stacking rules and eligibility conditions**

### 22.6. [ User Story ] - Reviews Moderation
#### 22.6.1. [ Task ] - Queue, approve/reject with reasons; policy enforcement
**22.6.1.1. [ Subtask ] - Media review and takedown workflow**

### 22.7. [ User Story ] - Customer Support Tools
#### 22.7.1. [ Task ] - Customer search and impersonation
**22.7.1.1. [ Subtask ] - Audit logs; impersonation consent banner**

### 22.8. [ User Story ] - Fraud Review Queue
#### 22.8.1. [ Task ] - Manual review for risky orders
**22.8.1.1. [ Subtask ] - Decisions (approve/hold/cancel); notes and SLAs**

### 22.9. [ User Story ] - Bulk Operations
#### 22.9.1. [ Task ] - Bulk price/inventory updates
**22.9.1.1. [ Subtask ] - CSV upload with validation; preview + rollback**

### 22.10. [ User Story ] - Feature Flags & Toggles
#### 22.10.1. [ Task ] - Admin control of flags
**22.10.1.1. [ Subtask ] - Targeting rules; audit and approvals**

## 23. [ Feature ] - Tax & Invoicing (India GST)
Description: Comply with Indian GST for pricing, invoices, and reporting; prepare for cross-border duties.
Acceptance Criteria:
- GST rates applied by HSN and destination; HSN tables maintained.
- GSTIN capture/validation (B2B); invoice numbering scheme defined; PDFs generated and stored.
- Tax summary reports exportable for filing with audit trails.
- Cross-border landed cost and compliance document generation supported.

### 23.1. [ User Story ] - GST Tax Calculation
#### 23.1.1. [ Task ] - Apply GST rates by HSN and destination
**23.1.1.1. [ Subtask ] - Maintain HSN catalog and rate tables**

### 23.2. [ User Story ] - Invoices & GSTIN
#### 23.2.1. [ Task ] - Capture GSTIN (B2B), validate formats; invoice numbering scheme
**23.2.1.1. [ Subtask ] - Generate PDF invoices; email to customer; store for download**

### 23.3. [ User Story ] - Reports & Reconciliation
#### 23.3.1. [ Task ] - Tax summary reports by period
**23.3.1.1. [ Subtask ] - Export CSV for filing and audit trail**

### 23.4. [ User Story ] - Cross-border Duties & Taxes
#### 23.4.1. [ Task ] - Landed cost estimation (HS codes, duties, VAT)
**23.4.1.1. [ Subtask ] - Provider integration and fallback rate tables**
#### 23.4.2. [ Task ] - Compliance documents
**23.4.2.1. [ Subtask ] - Commercial invoice and customs declarations**

### 23.5. [ User Story ] - Rounding & Labels
#### 23.5.1. [ Task ] - India rounding policies and GST labels
**23.5.1.1. [ Subtask ] - MRP/compare-at display with GST notes**

### 23.6. [ User Story ] - GST Filing Exports
#### 23.6.1. [ Task ] - GSTR-1/3B exports
**23.6.1.1. [ Subtask ] - Period selection; CSV with audit trail**

### 23.7. [ User Story ] - TCS/TDS & COD Nuances
#### 23.7.1. [ Task ] - Handle TCS/TDS where applicable
**23.7.1.1. [ Subtask ] - COD-specific tax reporting adjustments**

## 24. [ Feature ] - Shipping & Logistics Integration
Description: Integrate carriers for rates, labels, tracking, and exception handling, including international.
Acceptance Criteria:
- Aggregator integration for rate shopping, serviceability, pickups.
- Label generation and manifesting operational; tracking webhooks update orders.
- Exceptions (RTO/failed delivery) flows create tickets and customer comms.
- International shipping pilot supports region restrictions and address validation.

### 24.1. [ User Story ] - Carrier Aggregator Integration
#### 24.1.1. [ Task ] - Integrate Shiprocket/Delhivery (or chosen partner)
**24.1.1.1. [ Subtask ] - Rate shopping, serviceability, pickup scheduling**

### 24.2. [ User Story ] - Labels & Tracking
#### 24.2.1. [ Task ] - Label generation and manifesting
**24.2.1.1. [ Subtask ] - Tracking webhooks → order updates and notifications**

### 24.3. [ User Story ] - Exceptions Handling
#### 24.3.1. [ Task ] - RTO/failed delivery flows and customer comms
**24.3.1.1. [ Subtask ] - Automatic ticket creation and refund/Reship options**

### 24.4. [ User Story ] - International Shipping Pilot
#### 24.4.1. [ Task ] - Country/zone serviceability and carriers
**24.4.1.1. [ Subtask ] - Region-based SKU restrictions and lead times**
#### 24.4.2. [ Task ] - Address validation (international formats)
**24.4.2.1. [ Subtask ] - Postal code and address verification APIs**
#### 24.4.3. [ Task ] - Cross-border returns & CX
**24.4.3.1. [ Subtask ] - RTO and refund SLAs; customer communications**

### 24.5. [ User Story ] - Packaging & DIM Weight
#### 24.5.1. [ Task ] - Packaging rules and DIM calculations
**24.5.1.1. [ Subtask ] - Auto-boxing and rate selection impact**

### 24.6. [ User Story ] - NDR & Delivery Retries
#### 24.6.1. [ Task ] - NDR workflows and customer comms
**24.6.1.1. [ Subtask ] - Retry attempts; return-to-origin handling**

### 24.7. [ User Story ] - COD Remittance Tracking
#### 24.7.1. [ Task ] - Track COD settlements and reconciliation
**24.7.1.1. [ Subtask ] - Expected vs received; aging reports**

### 24.8. [ User Story ] - Aggregator Failover
#### 24.8.1. [ Task ] - Provider failover rules
**24.8.1.1. [ Subtask ] - Health-based routing and alerts**

## 25. [ Feature ] - Media & CDN Pipeline
Description: Provide secure media uploads, derivatives, and global delivery with smart caching.
Acceptance Criteria:
- Signed uploads to S3; image variants generated via Lambda/CDN (AVIF/WebP).
- CloudFront caching strategy with invalidation hooks; cache keys vary by DPR/format.
- Safety pipeline scans uploads; quarantine and review workflow available.
- Access URLs are time-bound and least-privileged.

### 25.1. [ User Story ] - Uploads & Derivatives
#### 25.1.1. [ Task ] - Signed uploads to S3; image variants (thumb, PDP, zoom)
**25.1.1.1. [ Subtask ] - Lambda/Image CDN transformation; AVIF/WebP**

### 25.2. [ User Story ] - Caching & Invalidations
#### 25.2.1. [ Task ] - CloudFront caching strategy and invalidation hooks
**25.2.1.1. [ Subtask ] - Cache keys by device DPR and format**

### 25.3. [ User Story ] - Safety Pipeline
#### 25.3.1. [ Task ] - Malware scan and content-type validation for uploads
**25.3.1.1. [ Subtask ] - Quarantine bucket and review workflow**

## 26. [ Feature ] - Performance & Load Testing
Description: Validate performance budgets and scale under load with synthetic checks and alerts.
Acceptance Criteria:
- k6/Artillery scenarios hit targets (p95, concurrencies) for critical journeys.
- Lighthouse budgets enforced in CI (LCP ≤ 2.5s P75; JS ≤ 200KB gz critical path).
- Synthetic monitoring covers uptime/transactions from multiple regions with alert thresholds.
- Performance regressions block releases until resolved or waived.

### 26.1. [ User Story ] - API Load Tests
#### 26.1.1. [ Task ] - k6/Artillery scenarios for hot paths (browse, PDP, checkout)
**26.1.1.1. [ Subtask ] - Targets: p95 < 200ms cached reads; 5k concurrent users baseline**

### 26.2. [ User Story ] - Web Performance Budgets
#### 26.2.1. [ Task ] - Lighthouse CI and budgets in CI
**26.2.1.1. [ Subtask ] - LCP ≤ 2.5s P75; JS ≤ 200KB gz critical path**

### 26.3. [ User Story ] - Synthetic Monitoring
#### 26.3.1. [ Task ] - Uptime and transaction checks from multiple regions
**26.3.1.1. [ Subtask ] - Alert thresholds and on-call rotation**

## 27. [ Feature ] - Mobile Crash & Performance Analytics
Description: Monitor app stability and performance to ensure store-readiness and user experience.
Acceptance Criteria:
- Crashlytics/Sentry integrated with symbol uploads and release versions.
- Cold start, TTI, memory, and ANR metrics tracked with dashboards and alerts.
- Crash-free sessions > 99.5% maintained; regression alarms configured.
- Triage and ownership for crash groups defined.

### 27.1. [ User Story ] - Crash Reporting
#### 27.1.1. [ Task ] - Integrate Sentry/Crashlytics for iOS/Android
**27.1.1.1. [ Subtask ] - Symbol upload (dSYM/ProGuard mappings); release tagging**

### 27.2. [ User Story ] - App Performance
#### 27.2.1. [ Task ] - Track cold start, TTI, memory, ANR
**27.2.1.1. [ Subtask ] - Dashboards and alerts for regressions**

## 28. [ Feature ] - Creator/Influencer Marketplace
Description: Manage creator listings, briefs, deliverables, and compliance with attribution.
Acceptance Criteria:
- Creator profiles/listings and campaign briefs support availability and rates.
- Deliverables tracked with attribution parameters; analytics events emitted.
- Contract terms, approvals, and compliance checks enforced with audit trails.
- Dispute workflow documented with service-level targets.

### 28.1. [ User Story ] - Listings & Briefs
#### 28.1.1. [ Task ] - Creator profiles, listings, and campaign briefs
**28.1.1.1. [ Subtask ] - Availability, rates, and supported content formats**

### 28.2. [ User Story ] - Deliverables & Attribution
#### 28.2.1. [ Task ] - Track deliverables, links, and performance
**28.2.1.1. [ Subtask ] - Attribution parameters and analytics events**

### 28.3. [ User Story ] - Reviews & Compliance
#### 28.3.1. [ Task ] - Contract terms, approvals, and policy checks
**28.3.1.1. [ Subtask ] - Audit trail and dispute workflow**

## 29. [ Feature ] - Community & Gamification
Description: Build community engagement and retention through forums and gamified progression.
Acceptance Criteria:
- Topics/threads/comments/reactions shipped with moderation tools and reports.
- Points, badges, levels, and streaks granted by rules engine with abuse checks.
- Community notifications delivered; role-based moderation available.
- Escalation workflows measured with CSAT.

### 29.1. [ User Story ] - Forums & Threads
#### 29.1.1. [ Task ] - Topics, threads, comments, reactions
**29.1.1.1. [ Subtask ] - Moderation tools and community reports**

### 29.2. [ User Story ] - Gamification
#### 29.2.1. [ Task ] - Points, badges, levels, streaks
**29.2.1.1. [ Subtask ] - Rules engine and abuse checks**

### 29.3. [ User Story ] - Notifications & Moderation
#### 29.3.1. [ Task ] - Community notifications and role-based moderation
**29.3.1.1. [ Subtask ] - Escalation workflows; CSAT on resolutions**

## 30. [ Feature ] - Internationalization & Localization
Description: Prepare the platform for multilingual content and locale-aware rendering.
Acceptance Criteria:
- Locale negotiation on server; consistent message/date/number formatting.
- Translation pipeline supports export/import and fallbacks; missing-keys monitored.
- SEO signals (hreflang/canonicals) compatible with localized pages.
- Key flows localized to target languages as prioritized.

### 30.1. [ User Story ] - Service-wide i18n Scaffolding
#### 30.1.1. [ Task ] - Locale-aware messages, dates, and numbers
**30.1.1.1. [ Subtask ] - Server-side locale negotiation and formatting**

### 30.2. [ User Story ] - Content & Translation Pipeline
#### 30.2.1. [ Task ] - Translation management and fallbacks
**30.2.1.1. [ Subtask ] - Missing-key monitoring; export/import tooling**

## 31. [ Feature ] - Identity Enhancements
Description: Strengthen identity with MFA, SSO, passwordless, and device trust for higher security.
Acceptance Criteria:
- TOTP/SMS MFA enrollment and recovery codes; enforced for staff, optional for customers.
- SSO for staff (SAML/OIDC) with JIT provisioning and role mapping.
- Passwordless login via OTP/magic link; biometric unlock on mobile where supported.
- Step-up re-auth for sensitive actions; anomalous session detection and device trust.

### 31.1. [ User Story ] - Multi-Factor Authentication (MFA)
#### 31.1.1. [ Task ] - Add TOTP/SMS MFA for customers; enforce for staff
**31.1.1.1. [ Subtask ] - Enrollment, recovery codes, step-up flows**

### 31.2. [ User Story ] - Staff SSO (Google/O365)
#### 31.2.1. [ Task ] - SAML/OIDC SSO with JIT provisioning
**31.2.1.1. [ Subtask ] - Role mapping to RBAC; optional SCIM sync**

### 31.3. [ User Story ] - Passwordless & Device Trust
#### 31.3.1. [ Task ] - OTP/email magic link; mobile biometric unlock
**31.3.1.1. [ Subtask ] - Trusted devices, anomalous session detection; re-auth for sensitive actions**

## 32. [ Feature ] - Wishlists, Alerts & Recovery
Description: Improve retention with wishlists, stock/price alerts, and abandoned recovery journeys.
Acceptance Criteria:
- Wishlist and recently viewed work for guest and auth users; merge-on-login supported.
- Back-in-stock and price-drop alerts configurable with frequency caps and consent.
- Abandoned cart/checkout journeys trigger across channels with guardrails.
- Event attribution tracked to measure uplift and suppression.

### 32.1. [ User Story ] - Wishlist & Recently Viewed (Web)
#### 32.1.1. [ Task ] - API + UI for wishlist and recently viewed
**32.1.1.1. [ Subtask ] - Guest + auth modes; merge-on-login**

### 32.2. [ User Story ] - Back-in-Stock & Price-Drop Alerts
#### 32.2.1. [ Task ] - Subscriptions and notifications routing
**32.2.1.1. [ Subtask ] - Frequency caps; consent/preferences integration**

### 32.3. [ User Story ] - Abandoned Cart/Checkout Recovery
#### 32.3.1. [ Task ] - Triggered journeys via email/SMS/push
**32.3.1.1. [ Subtask ] - Guardrails: frequency, recency, discount limits**

## 33. [ Feature ] - Payments Advanced
Description: Expand payment method coverage and robustness while keeping PCI scope minimal.
Acceptance Criteria:
- UPI, NetBanking, cards, and COD options available with regional toggles.
- Tokenized saved methods via provider vault; SAQ A scope confirmed.
- Partial capture, split refunds, and retry strategies implemented; subscription dunning configured.
- Payment success/failure monitored with alerts and dashboards.

### 33.1. [ User Story ] - India Payment Methods Coverage
#### 33.1.1. [ Task ] - UPI, NetBanking, Cards, COD toggle
**33.1.1.1. [ Subtask ] - COD fraud guardrails; provider fallback**

### 33.2. [ User Story ] - Saved Methods & PCI Scope
#### 33.2.1. [ Task ] - Tokenized storage via provider vault
**33.2.1.1. [ Subtask ] - SAQ A scope; vault lifecycle (add/remove)**

### 33.3. [ User Story ] - Capture, Refunds, Retries
#### 33.3.1. [ Task ] - Partial capture/split refunds; payment retry
**33.3.1.1. [ Subtask ] - Subscription dunning logic and notifications**

## 34. [ Feature ] - Marketing & CRM
Description: Enable compliant messaging, segmentation, and attribution for lifecycle marketing.
Acceptance Criteria:
- SPF/DKIM/DMARC configured; DMARC reports monitored; sender warmup plan executed.
- ESP/CRM integrated; segments and consent states synced bidirectionally.
- GTM and server-side tagging honor consent; PII redaction applied.
- Post-purchase automations (reviews/winback/replenishment) deliver with holdouts.

### 34.1. [ User Story ] - Deliverability & Domain Auth
#### 34.1.1. [ Task ] - SPF, DKIM, DMARC (+BIMI optional)
**34.1.1.1. [ Subtask ] - DMARC reporting and warmup plan**

### 34.2. [ User Story ] - CRM/ESP Integration
#### 34.2.1. [ Task ] - Klaviyo/Mailchimp sync for profiles/events
**34.2.1.1. [ Subtask ] - Segments, list hygiene, consent states**

### 34.3. [ User Story ] - Tag Management & Server-Side Tagging
#### 34.3.1. [ Task ] - GTM setup + server-side tagging options
**34.3.1.1. [ Subtask ] - Consent-gated pixels; PII redaction**

### 34.4. [ User Story ] - Post-Purchase Automations
#### 34.4.1. [ Task ] - Review requests, winback, replenishment
**34.4.1.1. [ Subtask ] - Holdouts and attribution tagging**

### 34.5. [ User Story ] - UTM Governance
#### 34.5.1. [ Task ] - UTM validation and mapping
**34.5.1.1. [ Subtask ] - Auto-tagging rules; PII stripping**

### 34.6. [ User Story ] - WhatsApp CRM Integration
#### 34.6.1. [ Task ] - Sync profiles and events
**34.6.1.1. [ Subtask ] - Consent sync and opt-out handling (integrates with 4.2.1)**

## 35. [ Feature ] - Eventing & Tracing
Description: Ensure reliable domain event delivery and end-to-end observability.
Acceptance Criteria:
- Outbox pattern implemented with SNS/SQS; retries and DLQs configured.
- OpenTelemetry tracing across API/web/jobs with propagation headers.
- Web error tracking (Sentry) includes release tagging and source maps.
- Log scrubbing removes PII; retention policies enforced.

### 35.1. [ User Story ] - Domain Events & Outbox
#### 35.1.1. [ Task ] - Outbox pattern + SNS/SQS backbone
**35.1.1.1. [ Subtask ] - Idempotency, retries, and DLQs**

### 35.2. [ User Story ] - Distributed Tracing
#### 35.2.1. [ Task ] - OpenTelemetry across API/web/jobs
**35.2.1.1. [ Subtask ] - Trace propagation headers; sampling policy**

### 35.3. [ User Story ] - Web Error Tracking
#### 35.3.1. [ Task ] - Sentry instrumentation for web
**35.3.1.1. [ Subtask ] - Release tagging and source maps**

### 35.4. [ User Story ] - Log Scrubbing & Retention
#### 35.4.1. [ Task ] - PII redaction filters; retention policies
**35.4.1.1. [ Subtask ] - Access controls and audit trail**

## 36. [ Feature ] - Legal & Compliance
Description: Publish policies, handle vuln disclosures, and implement retention aligned to regulation.
Acceptance Criteria:
- Terms/Privacy/Returns/Shipping pages managed via CMS with version history.
- /.well-known/security.txt published; vulnerability disclosure intake defined with SLAs.
- E-invoicing/e-way bill readiness assessed; sandbox integrations validated if applicable.
- Data retention schedule executed with automated purges and legal holds.

### 36.1. [ User Story ] - Policy Pages & Disclosure
#### 36.1.1. [ Task ] - Terms, Privacy, Returns, Shipping via CMS
**36.1.1.1. [ Subtask ] - Footer links, versioning, approval workflow**

### 36.2. [ User Story ] - Security.txt & VDP
#### 36.2.1. [ Task ] - /.well-known/security.txt and intake process
**36.2.1.1. [ Subtask ] - Triage SLAs; optional public key**

### 36.3. [ User Story ] - India E-Invoicing/E-Way Bill Readiness
#### 36.3.1. [ Task ] - Threshold evaluation and provider integration
**36.3.1.1. [ Subtask ] - Sandbox tests and fallback procedures**

### 36.4. [ User Story ] - Data Retention & Purges
#### 36.4.1. [ Task ] - Retention schedule + automated purge jobs
**36.4.1.1. [ Subtask ] - Legal holds and reporting**

## 37. [ Feature ] - Quality Gates & Visual Testing
Description: Prevent regressions via accessibility, visual, and contract testing with release gates.
Acceptance Criteria:
- Accessibility audits (manual + automated) pass on critical flows.
- Visual regression suite runs in CI; baseline management documented.
- Pact contract tests verify client/server agreements.
- UAT sign-off checklist and rollback plan enforced before release.

### 37.1. [ User Story ] - Accessibility Audits
#### 37.1.1. [ Task ] - Manual + automated (axe/Pa11y)
**37.1.1.1. [ Subtask ] - Screen reader checks; keyboard-only flows**

### 37.2. [ User Story ] - Visual Regression Testing
#### 37.2.1. [ Task ] - Storybook/Chromatic or Playwright snapshots
**37.2.1.1. [ Subtask ] - Baseline management and PR checks**

### 37.3. [ User Story ] - Contract Testing
#### 37.3.1. [ Task ] - Pact provider/consumer tests
**37.3.1.1. [ Subtask ] - CI verification and contracts registry**

### 37.4. [ User Story ] - Release/UAT Gates
#### 37.4.1. [ Task ] - UAT checklist and sign-off criteria
**37.4.1.1. [ Subtask ] - Verified rollback plan**

## 38. [ Feature ] - Catalog Extensions
Description: Enhance catalog with bundles, advanced inventory, PDP Q&A, and compliant pricing.
Acceptance Criteria:
- Bundles/kits priced and purchasable; cross-sell/upsell placements configured.
- Multi-warehouse/backorder/preorder flows modeled with reservations and lead times.
- PDP Q&A available with moderation and notifications.
- India pricing fields (MRP, compare-at, GST labels) displayed correctly.

### 38.1. [ User Story ] - Bundles/Kits & Merchandising
#### 38.1.1. [ Task ] - Bundle SKUs and pricing rules
**38.1.1.1. [ Subtask ] - Cross-sell/upsell placements**

### 38.2. [ User Story ] - Inventory Models
#### 38.2.1. [ Task ] - Multi-warehouse, backorder, preorder
**38.2.1.1. [ Subtask ] - Reservations and lead times**

### 38.3. [ User Story ] - PDP Q&A
#### 38.3.1. [ Task ] - Customer questions and moderation
**38.3.1.1. [ Subtask ] - Notifications and reporting**

### 38.4. [ User Story ] - India Pricing Display
#### 38.4.1. [ Task ] - MRP, compare-at, GST inclusive labels
**38.4.1.1. [ Subtask ] - UX toggles and SEO tags**

## 39. [ Feature ] - Mobile Store Compliance
Description: Meet iOS/Android store policies for privacy, ratings, and versioning.
Acceptance Criteria:
- iOS ATT prompt implemented; Google Play Data Safety declarations accurate.
- In-app review prompts deep link to stores with frequency caps.
- Version gating supports force-upgrade and soft prompts; remote kill switches available.
- Compliance items reviewed before every release.

### 39.1. [ User Story ] - Privacy Disclosures
#### 39.1.1. [ Task ] - iOS ATT and Play Data Safety
**39.1.1.1. [ Subtask ] - Consent logging and audit**

### 39.2. [ User Story ] - Ratings & Reviews
#### 39.2.1. [ Task ] - In-app review prompts and deep links
**39.2.1.1. [ Subtask ] - Frequency caps and locales**

### 39.3. [ User Story ] - Version Gating
#### 39.3.1. [ Task ] - Force-upgrade and soft prompts
**39.3.1.1. [ Subtask ] - Remote config and kill switches**

## 40. [ Feature ] - Multi-Currency Pricing
Description: Support FX-driven price display and SEO for international audiences.
Acceptance Criteria:
- FX rates fetched with defined cadence and fallback provider; rounding rules applied.
- Prices render in selected currency consistently across web and mobile.
- SEO canonicals and hreflang configured for price variants where applicable.
- Automated tests verify price math and formatting.

### 40.1. [ User Story ] - FX and Rounding
#### 40.1.1. [ Task ] - Currency rates and rounding rules
**40.1.1.1. [ Subtask ] - Cadence, provider fallback**

### 40.2. [ User Story ] - Price Presentation
#### 40.2.1. [ Task ] - Multi-currency UI and SEO tags
**40.2.1.1. [ Subtask ] - Canonicals and hreflang updates**

## 41. [ Feature ] - Ethical Sourcing & Provenance
Description: Provide transparent provenance via supplier KYC, certifications, lot-level traceability, and PDP trust signals.
Acceptance Criteria:
- Supplier onboarding with KYC and document verification; expiries tracked with alerts.
- Lot-level chain-of-custody linked to SKUs; PDP shows verified badges and sourcing info.
- Partner profile pages published with attribution; audit trails recorded for changes.
- Compliance checks and audit schedules tracked to closure.

### 41.1. [ User Story ] - Supplier Onboarding & KYC
#### 41.1.1. [ Task ] - Collect KYC and certifications
**41.1.1.1. [ Subtask ] - Upload/store docs; expiry reminders**

### 41.2. [ User Story ] - Lot-Level Traceability
#### 41.2.1. [ Task ] - Link lots to inventory and orders
**41.2.1.1. [ Subtask ] - Scan/import lots; chain-of-custody record**

### 41.3. [ User Story ] - PDP Trust & Partner Pages
#### 41.3.1. [ Task ] - Display verified badges and sourcing
**41.3.1.1. [ Subtask ] - Partner pages with certificates and stories**

### 41.4. [ User Story ] - Audits & Compliance
#### 41.4.1. [ Task ] - Audit scheduling and outcomes
**41.4.1.1. [ Subtask ] - Findings, remediation, and public transparency notes**
