# Soulstone Sprint Plan (3-Week Cadence)

Status: Final
Version: v1.0
Last Updated: 2023-10-14

<a id="sec-overview"></a>

## Overview

This plan maps Soulstone’s roadmap into rolling three-week sprints aligned with the master timeline and feature backlog.

Sources: `timeline.md`, `features-stories-tasks.md`.

<a id="sec-table-of-contents"></a>

## Table of Contents

- [Soulstone Sprint Plan (3-Week Cadence)](#soulstone-sprint-plan-3-week-cadence)
  - [Overview](#sec-overview)
  - [Table of Contents](#table-of-contents)
  - [Conventions](#sec-conventions)
  - [Sprint Calendar (Q4 FY24 → Q1 FY26)](#sec-sprint-calendar-q4-fy24-q1-fy26)
  - [Sprint Details and Feature Alignment](#sec-sprint-details-and-feature-alignment)
  - [Cross-Cutting Cadences & Gates](#sec-cross-cutting-cadences-gates)
  - [Notes](#sec-notes)
  - [Version History](#sec-version-history)

<a id="sec-conventions"></a>

## Conventions
- Sprint length: 3 weeks (21 days), dates in dd-mm-yyyy.
- Scope aligns to timeline.md quarters (FY), adapted to 3‑week cadence.
- Feature IDs refer to features-stories-tasks.md (e.g., Feature 8 — Catalog & Search).
- Ownership tags mirror timeline.md (Engineering; Product & Design; …).

<a id="sec-sprint-calendar-q4-fy24-q1-fy26"></a>

## Sprint Calendar (Q4 FY24 → Q1 FY26)

| Sprint | Dates | Quarter | Theme / Key Milestone |
| --- | --- | --- | --- |
| S1 | 01-01-2024 → 21-01-2024 | Q4 FY24 | Foundations: monorepo, CI/CD, infra baseline |
| S2 | 22-01-2024 → 11-02-2024 | Q4 FY24 | API scaffold, auth, data model |
| S3 | 12-02-2024 → 03-03-2024 | Q4 FY24 | Web/app shell, analytics SDKs, observability |
| S4 | 04-03-2024 → 24-03-2024 | Q4 FY24 | Foundations hardening; Gate A readiness |
| Buffer | 25-03-2024 → 31-03-2024 | Q4 FY24 | Planning/bugfix buffer |
| S5 | 01-04-2024 → 21-04-2024 | Q1 FY25 | Catalog + Cart baseline (PLP/PDP, pricing) |
| S6 | 22-04-2024 → 12-05-2024 | Q1 FY25 | Checkout + Payments + Orders v1 |
| S7 | 13-05-2024 → 02-06-2024 | Q1 FY25 | Mobile read-only; analytics dashboards; E2E |
| S8 | 03-06-2024 → 23-06-2024 | Q1 FY25 | Perf, security, rollout; MVP go-live |
| Launch | 24-06-2024 → 30-06-2024 | Q1 FY25 | Launch week, hotfix window |
| S9 | 01-07-2024 → 21-07-2024 | Q2 FY25 | Subscriptions v1 + Reviews/UGC baseline |
| S10 | 22-07-2024 → 11-08-2024 | Q2 FY25 | Loyalty/referrals; search synonyms/fuzzy |
| S11 | 12-08-2024 → 01-09-2024 | Q2 FY25 | Mobile parity; push notifications, deep links |
| S12 | 02-09-2024 → 22-09-2024 | Q2 FY25 | Admin promos/RBAC; ETL/dbt; SRE |
| Buffer | 23-09-2024 → 30-09-2024 | Q2 FY25 | Planning/bugfix buffer |
| S13 | 01-10-2024 → 21-10-2024 | Q3 FY25 | Creator marketplace pilot; SEO pillars |
| S14 | 22-10-2024 → 11-11-2024 | Q3 FY25 | Risk scoring hooks; reviews enh. |
| S15 | 12-11-2024 → 02-12-2024 | Q3 FY25 | Catalog workflows; returns approvals |
| S16 | 03-12-2024 → 23-12-2024 | Q3 FY25 | WAF/DR/cost guardrails; hardening |
| Buffer | 24-12-2024 → 31-12-2024 | Q3 FY25 | Holiday freeze buffer |
| S17 | 01-01-2025 → 21-01-2025 | Q4 FY25 | Community services + notifications center |
| S18 | 22-01-2025 → 11-02-2025 | Q4 FY25 | Community v1 UX + moderation tools |
| S19 | 12-02-2025 → 04-03-2025 | Q4 FY25 | Tax/GST reports; community dashboards |
| S20 | 05-03-2025 → 25-03-2025 | Q4 FY25 | i18n scaffolding; prep for Q1 FY26 |
| Buffer | 26-03-2025 → 31-03-2025 | Q4 FY25 | Planning/bugfix buffer |
| S21 | 01-04-2025 → 21-04-2025 | Q1 FY26 | Community launch; moderation workflows |
| S22 | 22-04-2025 → 12-05-2025 | Q1 FY26 | Intl shipping pilot plumbing |
| S23 | 13-05-2025 → 02-06-2025 | Q1 FY26 | Incident automation; read-replica plan |
| S24 | 03-06-2025 → 23-06-2025 | Q1 FY26 | Pilot polish, metrics, wrap |
| Buffer | 24-06-2025 → 30-06-2025 | Q1 FY26 | Retros and H2 planning |

---

<a id="sec-sprint-details-and-feature-alignment"></a>

## Sprint Details and Feature Alignment

For each sprint, feature references are from features-stories-tasks.md.

### S1 — 01-01-2024 → 21-01-2024 (Q4 FY24)
- Goals
  - Foundations: monorepo, CI/CD, local envs, IaC baseline.
- Feature focus
  - Feature 1 — Engineering Foundations & Dev Environment
  - Feature 2 — Infrastructure as Code (AWS)
  - Feature 3 — CI/CD Pipelines
  - Feature 26 — Performance & Load Testing (harness setup only)
- Deliverables
  - Monorepo with workspaces; shared TS/ESLint/Prettier; pre-commit hooks.
  - Docker Compose services; Taskfile/Makefile; onboarding docs (<15 min setup).
  - CI for lint/type/test/build; basic IaC for core services.
- Owners: Engineering; DevOps; Product & Design

### S2 — 22-01-2024 → 11-02-2024 (Q4 FY24)
- Goals
  - API scaffold, auth baseline, schema/migrations.
- Feature focus
  - Feature 6 — API Platform (Express/TypeScript)
  - Feature 7 — Authentication & Accounts
  - Feature 5 — Database & Data Modeling (Prisma/Postgres)
  - Feature 4 — Security & Compliance (baseline controls)
- Deliverables
  - Auth (signup/login/refresh), rate limiting, error model, DTO validation.
  - Prisma schema for Users/Products/Orders/Cart; initial migrations and seeds.
- Owners: Engineering; DevOps

### S3 — 12-02-2024 → 03-03-2024 (Q4 FY24)
- Goals
  - Web and mobile shells; analytics SDKs; ops/observability.
- Feature focus
  - Feature 14 — Web Frontend (Next.js)
  - Feature 21 — Mobile App (React Native)
  - Feature 15 — Analytics & Telemetry
  - Feature 18 — Reliability & SRE Operations
- Deliverables
  - Web app shell (routing, layout); RN bootstrap (navigation, theming).
  - SDK wrappers; logging/metrics baseline; perf budgets established.
- Owners: Engineering; Product & Design; Data & Analytics

### S4 — 04-03-2024 → 24-03-2024 (Q4 FY24)
- Goals
  - Foundations hardening; Gate A readiness.
- Feature focus
  - Feature 20 — Governance & Quality (quality gates)
  - Feature 35 — Eventing & Tracing (enablers)
  - Feature 26 — Performance & Load Testing (smoke harness)
- Deliverables
  - CI quality gates; basic tracing; smoke perf runs; platform readiness for MVP build.
- Owners: Engineering; DevOps

### S5 — 01-04-2024 → 21-04-2024 (Q1 FY25)
- Goals
  - Catalog and cart baseline (MVP start).
- Feature focus
  - Feature 8 — Catalog & Search (PLP/PDP)
  - Feature 9 — Cart & Pricing
  - Feature 14 — Web Frontend (PLP/PDP UI)
- Deliverables
  - PLP/PDP with search/collections; cart operations; pricing rules skeleton.
- Owners: Engineering; Product & Design

### S6 — 22-04-2024 → 12-05-2024 (Q1 FY25)
- Goals
  - Checkout, payments, addresses, order lifecycle; admin minimal.
- Feature focus
  - Feature 10 — Checkout & Payments
  - Feature 11 — Orders, Fulfillment & Returns (orders created/paid)
  - Feature 22 — Admin Portal & Backoffice (minimal)
  - Feature 24 — Shipping & Logistics Integration (address/shipping calc)
- Deliverables
  - Payments intents + webhooks; checkout flow; address/shipping; admin edits (price/inventory), order view.
- Owners: Engineering; Finance & Legal; Product & Design

### S7 — 13-05-2024 → 02-06-2024 (Q1 FY25)
- Goals
  - Analytics dashboards; mobile read-only; E2E tests and load testing.
- Feature focus
  - Feature 21 — Mobile App (browse/PDP, auth, cart)
  - Feature 15 — Analytics & Telemetry (dashboards)
  - Feature 26 — Performance & Load Testing
  - Feature 18 — Reliability & SRE Operations
- Deliverables
  - KPI dashboards; E2E smoke (browse→PDP→cart→checkout); load test hot paths; accessibility baseline.
- Owners: Engineering; Data & Analytics; QA

### S8 — 03-06-2024 → 23-06-2024 (Q1 FY25)
- Goals
  - Perf/security hardening; WAF/runbooks; staged rollout; MVP go-live.
- Feature focus
  - Feature 4 — Security & Compliance
  - Feature 18 — Reliability & SRE Operations
  - Feature 34 — Marketing & CRM (launch basics)
- Deliverables
  - Blue/green deploys; alarms/runbooks; WAF/rate limits; backup/restore tested; staged rollout; go‑live.
- Owners: Engineering; DevOps; QA; Brand & Growth

### S9 — 01-07-2024 → 21-07-2024 (Q2 FY25)
- Goals
  - Subscriptions v1; reviews/UGC baseline.
- Feature focus
  - Feature 13 — Subscriptions, Loyalty & Referrals (subscriptions)
  - Feature 12 — Reviews & UGC (baseline + moderation)
- Deliverables
  - Subscription plans + billing hooks; reviews service with moderation tools.
- Owners: Engineering; Product & Design; Data & Analytics

### S10 — 22-07-2024 → 11-08-2024 (Q2 FY25)
- Goals
  - Loyalty/referrals; search synonyms/fuzzy; web flows.
- Feature focus
  - Feature 13 — Subscriptions, Loyalty & Referrals (loyalty/referrals)
  - Feature 8 — Catalog & Search (synonyms/fuzzy)
  - Feature 14 — Web Frontend (loyalty UI)
- Deliverables
  - Loyalty tiers/referrals; enhanced search; web UI flows.
- Owners: Engineering; Product & Design

### S11 — 12-08-2024 → 01-09-2024 (Q2 FY25)
- Goals
  - Mobile parity; notifications and deep links.
- Feature focus
  - Feature 21 — Mobile App (cart/checkout parity)
  - Feature 16 — Notifications & Communications (push, deep links)
- Deliverables
  - Mobile checkout parity; push notifications; deep link routes.
- Owners: Engineering; Product & Design; QA

### S12 — 02-09-2024 → 22-09-2024 (Q2 FY25)
- Goals
  - Admin promos/RBAC; data ETL/dbt; SRE capacity.
- Feature focus
  - Feature 22 — Admin Portal & Backoffice (promos, RBAC, audit)
  - Feature 15 — Analytics & Telemetry (ETL/dbt v1)
  - Feature 18 — Reliability & SRE Operations (synthetic checks, error budget)
- Deliverables
  - Promotions/coupons; RBAC + audit; ETL to warehouse; capacity tuning and SRE policy.
- Owners: Engineering; Data & Analytics; DevOps

### S13 — 01-10-2024 → 21-10-2024 (Q3 FY25)
- Goals
  - Creator marketplace pilot; SEO pillars.
- Feature focus
  - Feature 28 — Creator/Influencer Marketplace (pilot endpoints/UI)
  - Feature 14 — Web Frontend (SEO pillar pages)
- Deliverables
  - Pilot marketplace endpoints and UI; initial SEO content pillars.
- Owners: Engineering; Product & Design; Brand & Growth

### S14 — 22-10-2024 → 11-11-2024 (Q3 FY25)
- Goals
  - Fraud/risk hooks; review enhancements.
- Feature focus
  - Feature 33 — Payments Advanced (risk scoring hooks)
  - Feature 12 — Reviews & UGC (enhancements)
- Deliverables
  - Risk/fraud scoring hooks; improved review features and moderation tooling.
- Owners: Engineering; Finance & Legal; QA

### S15 — 12-11-2024 → 02-12-2024 (Q3 FY25)
- Goals
  - Catalog workflows and returns approvals.
- Feature focus
  - Feature 22 — Admin Portal & Backoffice (catalog workflows)
  - Feature 11 — Orders, Fulfillment & Returns (returns approvals)
- Deliverables
  - Bulk adjust/reservations; returns approvals flow; admin UX polish.
- Owners: Engineering; Operations & Sourcing; CX

### S16 — 03-12-2024 → 23-12-2024 (Q3 FY25)
- Goals
  - Pen-test remediation; WAF tuning; DR/cost guardrails; hardening.
- Feature focus
  - Feature 4 — Security & Compliance
  - Feature 18 — Reliability & SRE Operations
- Deliverables
  - Remediations; WAF tuning; DR drill; cost guardrails implemented; platform hardening.
- Owners: Engineering; DevOps; Security

### S17 — 01-01-2025 → 21-01-2025 (Q4 FY25)
- Goals
  - Community services scaffolding; notifications center; i18n scaffolding.
- Feature focus
  - Feature 29 — Community & Gamification
  - Feature 16 — Notifications & Communications
  - Feature 30 — Internationalization & Localization (scaffolding)
- Deliverables
  - Community/forum services and data model; notifications center; i18n groundwork.
- Owners: Engineering; Product & Design

### S18 — 22-01-2025 → 11-02-2025 (Q4 FY25)
- Goals
  - Community v1 UX; moderation tools.
- Feature focus
  - Feature 29 — Community & Gamification (v1 UX)
  - Feature 17 — Support & Help Center (moderation support flows)
- Deliverables
  - Community v1 UI, onboarding; moderation tooling and workflows.
- Owners: Engineering; Product & Design; CX

### S19 — 12-02-2025 → 04-03-2025 (Q4 FY25)
- Goals
  - Tax/GST reporting; community dashboards.
- Feature focus
  - Feature 23 — Tax & Invoicing (India GST)
  - Feature 15 — Analytics & Telemetry (community engagement dashboards)
- Deliverables
  - GST/tax reports; community dashboards and KPIs; experiment/A/B infra wiring.
- Owners: Engineering; Finance & Legal; Data & Analytics

### S20 — 05-03-2025 → 25-03-2025 (Q4 FY25)
- Goals
  - i18n scaffolding across services; readiness for Q1 FY26.
- Feature focus
  - Feature 30 — Internationalization & Localization
  - Feature 18 — Reliability & SRE Operations (readiness)
- Deliverables
  - i18n message scaffolding; locale toggles; readiness checklist and fixes for Q1 FY26.
- Owners: Engineering; Product & Design

### S21 — 01-04-2025 → 21-04-2025 (Q1 FY26)
- Goals
  - Community launch with moderation + notifications.
- Feature focus
  - Feature 29 — Community & Gamification (launch)
  - Feature 16 — Notifications & Communications (polish)
- Deliverables
  - Community launch; moderation workflows; notifications polish.
- Owners: Engineering; Product & Design; CX

### S22 — 22-04-2025 → 12-05-2025 (Q1 FY26)
- Goals
  - International shipping pilot plumbing; duties/taxes validation.
- Feature focus
  - Feature 24 — Shipping & Logistics Integration (intl carriers)
  - Feature 23 — Tax & Invoicing (duties/taxes)
- Deliverables
  - Cross-border logistics integration for select SKUs; address validation; duty/tax calculation pilot.
- Owners: Operations & Sourcing; Engineering; Finance & Legal; CX

### S23 — 13-05-2025 → 02-06-2025 (Q1 FY26)
- Goals
  - Multi-region readiness; incident automation improvements.
- Feature focus
  - Feature 18 — Reliability & SRE Operations (read replica, DR, incidents)
- Deliverables
  - Read-replica plan; improved incident automation; runbook updates; drills.
- Owners: Engineering; DevOps

### S24 — 03-06-2025 → 23-06-2025 (Q1 FY26)
- Goals
  - Pilot polish; metrics; prepare H2 plan.
- Feature focus
  - Feature 34 — Marketing & CRM (pilot comms/feedback)
  - Feature 20 — Governance & Quality (retros/OKRs)
- Deliverables
  - Pilot metrics readout; polish and bugfixes; H2 plan and OKRs.
- Owners: Engineering; Product & Design; Brand & Growth

---

<a id="sec-cross-cutting-cadences-gates"></a>

## Cross-Cutting Cadences & Gates
- Demos: End of each sprint (week 3, Thu/Fri).
- Retro/Planning: Last 1–2 days of each sprint; buffers used for launch/hardening.
- Gates (ref: timeline.md Critical Path)
  - Gate A (Q4 FY24 W4): Foundations ready (S4 complete).
  - Gate B (Q1 FY25 W4): Checkout + webhooks stabilized; Admin minimal (by S6).
  - Gate C (Q1 FY25 W6): Perf/security/QA baselines (by S7).
  - Gate D (Q1 FY25 W8–10): Beta, bug bash, staged rollout; go‑live (S8 + Launch week).

<a id="sec-notes"></a>

## Notes
- This plan adapts the 2‑week engineering cadence in timeline.md to 3‑week sprints per request.
- Non‑engineering timeline items (e.g., hiring, legal filings) occur in parallel and are not fully itemized here; owners remain accountable within quarter goals.
- Adjust sprint scope with throughput data after S6.

<a id="sec-version-history"></a>

## Version History

- v1.0 (2023-10-14) — Finalized: added status header, anchors, table of contents, and aligned cadence summary with project.md timeline.
