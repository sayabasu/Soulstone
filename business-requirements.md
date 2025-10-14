# Soulstone — Business Requirements (PERN, DevSecOps-ready)

## [ Epic ] - Soulstone

### 1. [ Feature ] - Engineering Foundations & Dev Environment

#### 1.1. [ User Story ] - Monorepo and Tooling Setup
##### 1.1.1. [ Task ] - Initialize monorepo (pnpm or yarn workspaces)
###### 1.1.1.1. [ Subtask ] - Create structure: apps/api, apps/web, packages/ui, packages/config, packages/tsconfig, packages/eslint-config, infra/terraform, ops/
###### 1.1.1.2. [ Subtask ] - Configure workspace root package.json with scripts (build, dev, test, lint, format)
###### 1.1.1.3. [ Subtask ] - Add .editorconfig, .nvmrc, .gitattributes, .gitignore
##### 1.1.2. [ Task ] - TypeScript baselines
###### 1.1.2.1. [ Subtask ] - Define shared tsconfig in packages/tsconfig and extend in apps
###### 1.1.2.2. [ Subtask ] - Enable strict mode, path aliases, incremental builds
##### 1.1.3. [ Task ] - Linting/formatting standards
###### 1.1.3.1. [ Subtask ] - ESLint with TypeScript rules; Prettier with import/order
###### 1.1.3.2. [ Subtask ] - Add lint-staged + Husky pre-commit hooks
##### 1.1.4. [ Task ] - Commit and branch conventions
###### 1.1.4.1. [ Subtask ] - Configure commitlint (Conventional Commits)
###### 1.1.4.2. [ Subtask ] - Define branch protection and PR template

#### 1.2. [ User Story ] - Local Dev Environment
##### 1.2.1. [ Task ] - Docker Compose services
###### 1.2.1.1. [ Subtask ] - postgres (15), redis, mailhog, localstack (optional)
###### 1.2.1.2. [ Subtask ] - Seed volumes and healthchecks; named networks
##### 1.2.2. [ Task ] - Env management
###### 1.2.2.1. [ Subtask ] - .env.example with required vars; dotenv-safe loading
###### 1.2.2.2. [ Subtask ] - Split envs: .env.dev, .env.test, .env.local
##### 1.2.3. [ Task ] - Developer bootstrap script
###### 1.2.3.1. [ Subtask ] - Makefile/Taskfile for install, db:up, db:migrate, db:seed, dev
###### 1.2.3.2. [ Subtask ] - Onboarding doc covering prerequisites and commands

### 2. [ Feature ] - Infrastructure as Code (AWS)

#### 2.1. [ User Story ] - Core Networking & Security
##### 2.1.1. [ Task ] - VPC with public/private subnets and NAT
###### 2.1.1.1. [ Subtask ] - Terraform module for VPC, subnet, route tables
###### 2.1.1.2. [ Subtask ] - Security groups least privilege; SSM Session Manager access
##### 2.1.2. [ Task ] - DNS/CDN
###### 2.1.2.1. [ Subtask ] - Route 53 hosted zones; ACM certs
###### 2.1.2.2. [ Subtask ] - CloudFront for web with S3 origin and WAF

#### 2.2. [ User Story ] - Compute & Containers
##### 2.2.1. [ Task ] - ECR repositories and lifecycle policies
###### 2.2.1.1. [ Subtask ] - Private ECR with immutability and tag scanning
##### 2.2.2. [ Task ] - ECS Fargate services
###### 2.2.2.1. [ Subtask ] - API service behind ALB; health/readiness checks
###### 2.2.2.2. [ Subtask ] - Web SSR service (if Next SSR) or static S3 hosting

#### 2.3. [ User Story ] - Data Stores
##### 2.3.1. [ Task ] - RDS PostgreSQL (Multi-AZ) with security
###### 2.3.1.1. [ Subtask ] - Parameter groups, backups, encryption at rest
###### 2.3.1.2. [ Subtask ] - Read replica plan; connection limits and alerts
##### 2.3.2. [ Task ] - ElastiCache Redis for sessions/cache

#### 2.4. [ User Story ] - Secrets & Keys
##### 2.4.1. [ Task ] - Secrets Manager/SSM Parameter Store structure
###### 2.4.1.1. [ Subtask ] - Namespace by env (dev/stage/prod)
###### 2.4.1.2. [ Subtask ] - Rotation policy and IAM access boundaries

#### 2.5. [ User Story ] - Observability Base
##### 2.5.1. [ Task ] - CloudWatch log groups and metrics
###### 2.5.1.1. [ Subtask ] - Log retention policies; metric filters for errors/latency
##### 2.5.2. [ Task ] - Alarms and notifications
###### 2.5.2.1. [ Subtask ] - SNS + Slack/webhook integration for alerts

### 3. [ Feature ] - CI/CD Pipelines

#### 3.1. [ User Story ] - Continuous Integration
##### 3.1.1. [ Task ] - GitHub Actions workflows
###### 3.1.1.1. [ Subtask ] - Jobs: lint, type-check, unit tests, build
###### 3.1.1.2. [ Subtask ] - Cache node modules and build artifacts
##### 3.1.2. [ Task ] - Security scanning in CI
###### 3.1.2.1. [ Subtask ] - eslint-plugin-security, npm audit, trivy image scan
###### 3.1.2.2. [ Subtask ] - Secret scanning (gitleaks)

#### 3.2. [ User Story ] - Build & Release Artifacts
##### 3.2.1. [ Task ] - Dockerfiles (multi-stage) for api and web
###### 3.2.1.1. [ Subtask ] - Non-root user, minimal base (alpine or distroless)
###### 3.2.1.2. [ Subtask ] - Healthcheck and SIGTERM handling
##### 3.2.2. [ Task ] - Image versioning and SBOM
###### 3.2.2.1. [ Subtask ] - Tagging with sha/semver; syft/grype SBOM

#### 3.3. [ User Story ] - Continuous Delivery
##### 3.3.1. [ Task ] - Deploy API to ECS with blue/green
###### 3.3.1.1. [ Subtask ] - Auto rollback on health check failure
##### 3.3.2. [ Task ] - Deploy Web
###### 3.3.2.1. [ Subtask ] - S3+CloudFront invalidations (SSG) or ECS (SSR)
##### 3.3.3. [ Task ] - Database migrations
###### 3.3.3.1. [ Subtask ] - Gate deploy on successful migrate; rollback plan
##### 3.3.4. [ Task ] - Preview environments per PR
###### 3.3.4.1. [ Subtask ] - Ephemeral API + web URLs; tear-down job

### 4. [ Feature ] - Security & Compliance

#### 4.1. [ User Story ] - AppSec Baseline
##### 4.1.1. [ Task ] - OWASP top 10 controls
###### 4.1.1.1. [ Subtask ] - Input/output validation (Zod) and parameterized queries
###### 4.1.1.2. [ Subtask ] - Helmet/CSP, HSTS, CORS allowlist
##### 4.1.2. [ Task ] - Rate limiting and abuse prevention
###### 4.1.2.1. [ Subtask ] - Per-IP and per-token quotas; circuit breaker

#### 4.2. [ User Story ] - Privacy & DPDP/GDPR
##### 4.2.1. [ Task ] - Consent management and preferences store
###### 4.2.1.1. [ Subtask ] - Cookie banner and SDK gating
##### 4.2.2. [ Task ] - Data rights portal
###### 4.2.2.1. [ Subtask ] - Export/delete with audit log; SLA ≤ 7 days

### 5. [ Feature ] - Database & Data Modeling (PostgreSQL + Prisma)

#### 5.1. [ User Story ] - Schema Foundation
##### 5.1.1. [ Task ] - Define core models (User, Address, Product, Collection, Inventory, Cart, CartItem, Order, Payment, Review, Subscription, Article, Media)
###### 5.1.1.1. [ Subtask ] - Prisma schema and enums; migrations
###### 5.1.1.2. [ Subtask ] - Foreign keys, cascades, unique constraints
##### 5.1.2. [ Task ] - Indexing and performance
###### 5.1.2.1. [ Subtask ] - B-tree/GiST indexes for search/facets; partial indexes

#### 5.2. [ User Story ] - Data Lifecycle
##### 5.2.1. [ Task ] - Seed data for dev/test
###### 5.2.1.1. [ Subtask ] - Factories and fixtures; anonymized sample content
##### 5.2.2. [ Task ] - Backups and restore drills
###### 5.2.2.1. [ Subtask ] - Automated snapshots; quarterly restore test

### 6. [ Feature ] - API Platform (Express/Node, TypeScript)

#### 6.1. [ User Story ] - API Server Scaffolding
##### 6.1.1. [ Task ] - Express app with modular structure (routes/controllers/services/repos)
###### 6.1.1.1. [ Subtask ] - Request ID correlation and structured logging (pino)
###### 6.1.1.2. [ Subtask ] - Health, readiness, and metrics endpoints

#### 6.2. [ User Story ] - Error Handling & Validation
##### 6.2.1. [ Task ] - Global error handler and error shape
###### 6.2.1.1. [ Subtask ] - Map to codes: AUTH_FAILED, FORBIDDEN, NOT_FOUND, VALIDATION_ERROR, RATE_LIMITED
##### 6.2.2. [ Task ] - DTO validation
###### 6.2.2.1. [ Subtask ] - Zod schemas; sanitize and normalize inputs

#### 6.3. [ User Story ] - Auth Endpoints
##### 6.3.1. [ Task ] - /auth/signup, /auth/login, /auth/refresh, /auth/logout
###### 6.3.1.1. [ Subtask ] - JWT (RS256) access/refresh; rotation and revocation store (Redis)
###### 6.3.1.2. [ Subtask ] - Email verification, password reset tokens

#### 6.4. [ User Story ] - Rate Limiting & Security
##### 6.4.1. [ Task ] - IP and user-based throttles
###### 6.4.1.1. [ Subtask ] - Redis-backed token bucket; per-route configs

### 7. [ Feature ] - Authentication & Accounts

#### 7.1. [ User Story ] - User Profile & Address Book
##### 7.1.1. [ Task ] - CRUD profile and addresses
###### 7.1.1.1. [ Subtask ] - Indian address validation; default selection
##### 7.1.2. [ Task ] - Session/device management
###### 7.1.2.1. [ Subtask ] - List/revoke active sessions

### 8. [ Feature ] - Catalog & Search

#### 8.1. [ User Story ] - Catalog Browse (PLP)
##### 8.1.1. [ Task ] - Products list with facets (type, intention, chakra, price, size, origin, rating)
###### 8.1.1.1. [ Subtask ] - Cursor/offset pagination; sort options
###### 8.1.1.2. [ Subtask ] - Zero-result handling with suggested intents

#### 8.2. [ User Story ] - Product Detail (PDP)
##### 8.2.1. [ Task ] - PDP data: images, price, origin, authenticity, energy tags
###### 8.2.1.1. [ Subtask ] - Related products by intent/type; JSON-LD

#### 8.3. [ User Story ] - Search Service
##### 8.3.1. [ Task ] - Typeahead and full-text search
###### 8.3.1.1. [ Subtask ] - Synonyms (e.g., Amethyst <-> Jamunia); fuzzy match
###### 8.3.1.2. [ Subtask ] - Recent searches and clear history

### 9. [ Feature ] - Cart & Pricing

#### 9.1. [ User Story ] - Cart Service
##### 9.1.1. [ Task ] - Add/update/remove items; totals (subtotal, tax, shipping, discounts)
###### 9.1.1.1. [ Subtask ] - Server cart persistence; guest cart local persistence
##### 9.1.2. [ Task ] - Merge-on-login
###### 9.1.2.1. [ Subtask ] - Conflict resolution and price recalc

### 10. [ Feature ] - Checkout & Payments (Razorpay/Stripe)

#### 10.1. [ User Story ] - Address & Shipping
##### 10.1.1. [ Task ] - Address capture and validation; shipping methods
###### 10.1.1.1. [ Subtask ] - Pin code and phone validation

#### 10.2. [ User Story ] - Payment Intent & Confirmation
##### 10.2.1. [ Task ] - Create payment intent; handle success/failure
###### 10.2.1.1. [ Subtask ] - Idempotency keys on writes
##### 10.2.2. [ Task ] - Webhooks
###### 10.2.2.1. [ Subtask ] - Signature validation; retries and DLQ

### 11. [ Feature ] - Orders, Fulfillment & Returns

#### 11.1. [ User Story ] - Order Lifecycle
##### 11.1.1. [ Task ] - Order states and transitions (created, paid, fulfilled, refunded)
###### 11.1.1.1. [ Subtask ] - Event emission for state changes
##### 11.1.2. [ Task ] - Shipment tracking
###### 11.1.2.1. [ Subtask ] - Carrier tracking link and status sync

#### 11.2. [ User Story ] - Returns & Refunds
##### 11.2.1. [ Task ] - RMA creation and eligibility checks
###### 11.2.1.1. [ Subtask ] - Refund processing and ledger updates

### 12. [ Feature ] - Reviews & UGC

#### 12.1. [ User Story ] - Verified Reviews
##### 12.1.1. [ Task ] - Review CRUD with verification and moderation
###### 12.1.1.1. [ Subtask ] - Media uploads via presigned URLs; virus scan
##### 12.1.2. [ Task ] - Anti-spam and rate limiting

### 13. [ Feature ] - Subscriptions, Loyalty & Referrals

#### 13.1. [ User Story ] - Subscription Lifecycle
##### 13.1.1. [ Task ] - Create/pause/resume/cancel; billing scheduler
###### 13.1.1.1. [ Subtask ] - Provider webhook reconciliation

#### 13.2. [ User Story ] - Loyalty & Referrals
##### 13.2.1. [ Task ] - Referral link generation and attribution
###### 13.2.1.1. [ Subtask ] - Fraud checks (device/IP/email heuristics)

### 14. [ Feature ] - Web Frontend (React/Next.js)

#### 14.1. [ User Story ] - App Shell & Routing
##### 14.1.1. [ Task ] - Next.js app with SSR/SSG where applicable
###### 14.1.1.1. [ Subtask ] - Layouts, error boundaries, i18n baseline (en-IN)

#### 14.2. [ User Story ] - Design System
##### 14.2.1. [ Task ] - Tokens, theming, components (buttons, cards, inputs, modals, nav)
###### 14.2.1.1. [ Subtask ] - Accessibility-first (WCAG AA), keyboard focus states

#### 14.3. [ User Story ] - Core Pages
##### 14.3.1. [ Task ] - PLP with facets and sort
###### 14.3.1.1. [ Subtask ] - Responsive grid and skeleton loaders
##### 14.3.2. [ Task ] - PDP with gallery and sourcing block
###### 14.3.2.1. [ Subtask ] - JSON-LD Product and Breadcrumb
##### 14.3.3. [ Task ] - Cart and Checkout flows
###### 14.3.3.1. [ Subtask ] - Address, shipping, payment steps
##### 14.3.4. [ Task ] - Account (orders, addresses, returns)

#### 14.4. [ User Story ] - Performance & SEO
##### 14.4.1. [ Task ] - Image optimization (AVIF/WebP), prefetching, code splitting
###### 14.4.1.1. [ Subtask ] - Core Web Vitals budgets and monitoring
##### 14.4.2. [ Task ] - Sitemaps, robots.txt, canonical URLs
###### 14.4.2.1. [ Subtask ] - Structured data (Article, FAQ, Organization)

### 15. [ Feature ] - Analytics & Telemetry

#### 15.1. [ User Story ] - Event Taxonomy & SDKs
##### 15.1.1. [ Task ] - Define events (view_item, add_to_cart, begin_checkout, purchase, subscribe, refund_initiated, search, view_article)
###### 15.1.1.1. [ Subtask ] - Implement wrappers on web and server; consistent ids and timestamps

#### 15.2. [ User Story ] - Data Pipeline & Dashboards
##### 15.2.1. [ Task ] - ETL to warehouse and BI
###### 15.2.1.1. [ Subtask ] - dbt models; retention and consent filters
##### 15.2.2. [ Task ] - Alerts
###### 15.2.2.1. [ Subtask ] - Checkout CR dip > 20%, payment failure > 2%, LCP > 3s

### 16. [ Feature ] - Notifications & Communications

#### 16.1. [ User Story ] - Email & Templates
##### 16.1.1. [ Task ] - Transactional emails (order confirmation, shipping, refund)
###### 16.1.1.1. [ Subtask ] - Template system and localization hooks

#### 16.2. [ User Story ] - Push & SMS
##### 16.2.1. [ Task ] - Push topics (orders, content, offers) and SMS for order events (where applicable)
###### 16.2.1.1. [ Subtask ] - Preferences and consent toggles

### 17. [ Feature ] - Support & Help Center

#### 17.1. [ User Story ] - Help Center
##### 17.1.1. [ Task ] - CMS-driven articles and categories
###### 17.1.1.1. [ Subtask ] - Search and feedback on articles

#### 17.2. [ User Story ] - Chat & Escalation
##### 17.2.1. [ Task ] - Integrate chat widget and ticketing
###### 17.2.1.1. [ Subtask ] - Escalation rules and CSAT survey

### 18. [ Feature ] - Reliability & SRE Operations

#### 18.1. [ User Story ] - SLOs & Runbooks
##### 18.1.1. [ Task ] - Define SLOs for uptime, latency, errors
###### 18.1.1.1. [ Subtask ] - Error budget policy and dashboards

#### 18.2. [ User Story ] - DR & Backups
##### 18.2.1. [ Task ] - RPO/RTO targets, snapshots, cross-region read replica plan
###### 18.2.1.1. [ Subtask ] - Quarterly restore and failover drills

### 19. [ Feature ] - Content & CMS

#### 19.1. [ User Story ] - Learn Hub CMS Integration
##### 19.1.1. [ Task ] - Article, ritual, glossary types and rendering
###### 19.1.1.1. [ Subtask ] - Webhook ingestion and cache invalidation

### 20. [ Feature ] - Governance & Quality

#### 20.1. [ User Story ] - Testing Strategy
##### 20.1.1. [ Task ] - Unit tests (critical paths ≥ 80%), integration (API), e2e (checkout smoke)
###### 20.1.1.1. [ Subtask ] - Test data factories and fixtures

#### 20.2. [ User Story ] - Release & Versioning
##### 20.2.1. [ Task ] - Semantic versioning and changelog automation
###### 20.2.1.1. [ Subtask ] - Release notes template and distribution

### 21. [ Feature ] - Mobile App (React Native)

#### 21.1. [ User Story ] - React Native Bootstrap
##### 21.1.1. [ Task ] - Create apps/mobile package with TS, ESLint, Prettier
###### 21.1.1.1. [ Subtask ] - Configure navigation (React Navigation), theming, env handling
###### 21.1.1.2. [ Subtask ] - Set up native modules config (Android/iOS), app icons/splash

#### 21.2. [ User Story ] - Onboarding & Navigation
##### 21.2.1. [ Task ] - Onboarding screens with variant flags (education-first/quick-start)
###### 21.2.1.1. [ Subtask ] - Persist onboarding completion; deep link routing
##### 21.2.2. [ Task ] - Tab/stack structure (Home, Shop, Learn, Account, Cart)

#### 21.3. [ User Story ] - Mobile Catalog & PDP
##### 21.3.1. [ Task ] - PLP with facets/sort and infinite scroll
###### 21.3.1.1. [ Subtask ] - Facet drawer UX, skeletons, empty state
##### 21.3.2. [ Task ] - PDP with gallery, energy tags, origin/certification
###### 21.3.2.1. [ Subtask ] - Share, wishlist, related products modules

#### 21.4. [ User Story ] - Mobile Cart & Checkout
##### 21.4.1. [ Task ] - Cart screens (items, totals, coupons)
###### 21.4.1.1. [ Subtask ] - Persist cart securely (async storage) and merge-on-login
##### 21.4.2. [ Task ] - Checkout flow (address, shipping, payment)
###### 21.4.2.1. [ Subtask ] - Integrate Razorpay/Stripe RN SDKs; handle success/failure callbacks

#### 21.5. [ User Story ] - Push, Deep Links, and Device Metrics
##### 21.5.1. [ Task ] - Push notifications (orders, content, offers)
###### 21.5.1.1. [ Subtask ] - Permission prompts with value proposition; topic subscriptions
##### 21.5.2. [ Task ] - Deep links and universal links/app links
###### 21.5.2.1. [ Subtask ] - Cold/warm start routing tests

#### 21.6. [ User Story ] - Store Readiness & Compliance
##### 21.6.1. [ Task ] - Device matrix QA (Android 8–14, iOS 15+); performance targets
###### 21.6.1.1. [ Subtask ] - Crash-free > 99.5%, ANR ≤ 0.3%, cold start ≤ 2.5s
##### 21.6.2. [ Task ] - App Store/Play store listings and release pipeline
###### 21.6.2.1. [ Subtask ] - TestFlight/Play internal tracks; staged rollout and monitoring

### 22. [ Feature ] - Admin Portal & Backoffice

#### 22.1. [ User Story ] - RBAC & Audit
##### 22.1.1. [ Task ] - Roles/scopes (staff, admin) and permissions
###### 22.1.1.1. [ Subtask ] - API guard middleware; audit logs for admin actions

#### 22.2. [ User Story ] - Catalog Management
##### 22.2.1. [ Task ] - Product CRUD, variants, pricing, collections
###### 22.2.1.1. [ Subtask ] - Bulk upload (CSV) and validation; preview before publish

#### 22.3. [ User Story ] - Inventory & Fulfillment
##### 22.3.1. [ Task ] - Inventory adjustments and reservations
###### 22.3.1.1. [ Subtask ] - Stock thresholds and alerts

#### 22.4. [ User Story ] - Orders & Returns Ops
##### 22.4.1. [ Task ] - Order search, status updates, refunds/RMA approvals
###### 22.4.1.1. [ Subtask ] - Notes/timeline per order; permission checks

#### 22.5. [ User Story ] - Promotions & Coupons
##### 22.5.1. [ Task ] - Create/disable coupons, rules, limits
###### 22.5.1.1. [ Subtask ] - Stacking rules and eligibility conditions

#### 22.6. [ User Story ] - Reviews Moderation
##### 22.6.1. [ Task ] - Queue, approve/reject with reasons; policy enforcement
###### 22.6.1.1. [ Subtask ] - Media review and takedown workflow

### 23. [ Feature ] - Tax & Invoicing (India GST)

#### 23.1. [ User Story ] - GST Tax Calculation
##### 23.1.1. [ Task ] - Apply GST rates by HSN and destination
###### 23.1.1.1. [ Subtask ] - Maintain HSN catalog and rate tables

#### 23.2. [ User Story ] - Invoices & GSTIN
##### 23.2.1. [ Task ] - Capture GSTIN (B2B), validate formats; invoice numbering scheme
###### 23.2.1.1. [ Subtask ] - Generate PDF invoices; email to customer; store for download

#### 23.3. [ User Story ] - Reports & Reconciliation
##### 23.3.1. [ Task ] - Tax summary reports by period
###### 23.3.1.1. [ Subtask ] - Export CSV for filing and audit trail

### 24. [ Feature ] - Shipping & Logistics Integration

#### 24.1. [ User Story ] - Carrier Aggregator Integration
##### 24.1.1. [ Task ] - Integrate Shiprocket/Delhivery (or chosen partner)
###### 24.1.1.1. [ Subtask ] - Rate shopping, serviceability, pickup scheduling

#### 24.2. [ User Story ] - Labels & Tracking
##### 24.2.1. [ Task ] - Label generation and manifesting
###### 24.2.1.1. [ Subtask ] - Tracking webhooks → order updates and notifications

#### 24.3. [ User Story ] - Exceptions Handling
##### 24.3.1. [ Task ] - RTO/failed delivery flows and customer comms
###### 24.3.1.1. [ Subtask ] - Automatic ticket creation and refund/Reship options

### 25. [ Feature ] - Media & CDN Pipeline

#### 25.1. [ User Story ] - Uploads & Derivatives
##### 25.1.1. [ Task ] - Signed uploads to S3; image variants (thumb, PDP, zoom)
###### 25.1.1.1. [ Subtask ] - Lambda/Image CDN transformation; AVIF/WebP

#### 25.2. [ User Story ] - Caching & Invalidations
##### 25.2.1. [ Task ] - CloudFront caching strategy and invalidation hooks
###### 25.2.1.1. [ Subtask ] - Cache keys by device DPR and format

#### 25.3. [ User Story ] - Safety Pipeline
##### 25.3.1. [ Task ] - Malware scan and content-type validation for uploads
###### 25.3.1.1. [ Subtask ] - Quarantine bucket and review workflow

### 26. [ Feature ] - Performance & Load Testing

#### 26.1. [ User Story ] - API Load Tests
##### 26.1.1. [ Task ] - k6/Artillery scenarios for hot paths (browse, PDP, checkout)
###### 26.1.1.1. [ Subtask ] - Targets: p95 < 200ms cached reads; 5k concurrent users baseline

#### 26.2. [ User Story ] - Web Performance Budgets
##### 26.2.1. [ Task ] - Lighthouse CI and budgets in CI
###### 26.2.1.1. [ Subtask ] - LCP ≤ 2.5s P75; JS ≤ 200KB gz critical path

#### 26.3. [ User Story ] - Synthetic Monitoring
##### 26.3.1. [ Task ] - Uptime and transaction checks from multiple regions
###### 26.3.1.1. [ Subtask ] - Alert thresholds and on-call rotation

### 27. [ Feature ] - Mobile Crash & Performance Analytics

#### 27.1. [ User Story ] - Crash Reporting
##### 27.1.1. [ Task ] - Integrate Sentry/Crashlytics for iOS/Android
###### 27.1.1.1. [ Subtask ] - Symbol upload (dSYM/ProGuard mappings); release tagging

#### 27.2. [ User Story ] - App Performance
##### 27.2.1. [ Task ] - Track cold start, TTI, memory, ANR
###### 27.2.1.1. [ Subtask ] - Dashboards and alerts for regressions
