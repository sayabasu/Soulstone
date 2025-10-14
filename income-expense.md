# Soulstone — Income & Expense Projections (Runway‑Aligned)

This document translates the business and financial context in `project.md`, `business-requirements.md`, and `timeline.md` into a pragmatic, runway‑aligned income/expense plan. It uses the stated unit economics and market‑standard Indian pricing for D2C e‑commerce.

## Executive Snapshot
- Year 1 revenue target: ₹1.5 Cr (ref: Project.md 4.4)
- AOV: ₹1,800; Conversion: 3.5–4.5%; Gross margin (product): ~55% (ref: Project.md 4.1)
- Revenue mix: 70% product, 20% subscriptions, 10% workshops/events (ref: Project.md 2.5)
- Marketing spend: ~30% of revenue in early stage (ref: Project.md 4.1/2.7)
- Target runway: 18 months post‑seed (₹1.5 Cr seed) (ref: Project.md 4.5/4.6)
- Strategy: Lean headcount ramp in Year 1 to protect runway; scale hiring as revenue grows.

## Core Assumptions
- Demand: Year 1 monthly revenue ramp (₹ Lakh): 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20 → ~₹1.49–₹1.50 Cr.
- Unit economics per order (AOV ₹1,800):
  - Product COGS: 45% (₹810)
  - Shipping + packaging: ~₹105/order (₹80 courier avg within India + ₹25 packaging) ≈ 5.83% of GMV
  - Payment gateway MDR (blended cards/UPI) + GST: ~2.1% of GMV (1.8% × 1.18 GST)
  - Returns reserve (4% return rate, logistics/restocking impact): ~1.7% of GMV (~₹30/order)
  - Marketing: 30% of GMV in early stage
  - Contribution margin after marketing ≈ 15.4% of revenue (baseline planning figure)
- Hiring: Year 1 prioritizes lean core (founders cover PM/Brand in early months), then stage‑gated hires as revenue scales (ref: Project.md 7.1, Timeline.md).
- Infra/SaaS: AWS (Fargate/RDS/S3/CloudFront), email/SMS/WhatsApp, analytics, CI/CD, design/dev tools per market rates.

## Revenue Plan (Year 1)
- Monthly GMV (₹ Lakh): 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 20
- Orders/month ≈ GMV ÷ 1,800 (e.g., ₹5L → ~278 orders; ₹20L → ~1,111 orders)
- Mix target by channel: 70% catalog sales, 20% subscriptions (grows from Q3), 10% workshops/events.

## Unit Economics (Illustrative, per order)
- Revenue (AOV): ₹1,800
- Less Product COGS (45%): ₹810
- Less Shipping + Packaging (~5.83%): ~₹105
- Less Payment (2.1%): ~₹38
- Less Returns Reserve (~1.7%): ~₹30
- Gross after variable ops (pre‑marketing): ~₹817 (~45.4%)
- Less Marketing (30%): ₹540
- Contribution after marketing: ~₹277 (~15.4%)

## Expenses — Categorized

### One‑Time / Upfront (CapEx & Setup)
Market‑standard estimates for India (₹ Lakh):
- Company incorporation, licenses, GST, basic policies/legal: 1.5
- Trademark/brand/IP filings (2 classes): 0.4
- Brand system, packaging dielines, launch creative shoot: 3.0
- Initial inventory buffer (≈6–8 weeks COGS): 8.0
- Packaging tooling/first bulk (boxes, fillers, labels): 0.8
- Photo/video gear + lightbox or studio rental pack: 1.0
- Laptops/peripherals for early team (mix new/refurb): 3.5
- Warehouse/security deposit + racking: 2.0
- Payment gateway/onboarding/compliance misc: 0.3
- Contingency (unplanned): 1.5
- Total upfront (rounded): ~22.0 Lakh

### Recurring — Variable (scale with revenue)
- Product COGS: 45% of revenue (target GM ~55%)
- Shipping + Packaging: ~5.83% of revenue (₹105/order at ₹1,800 AOV)
- Payment MDR + GST: ~2.1% of revenue
- Returns reserve: ~1.7% of revenue
- Marketing & creators: 30% of revenue (front‑loaded in Year 1 per GTM)

### Recurring — Fixed (largely monthly, runway‑aligned)
Lean baseline to sustain ~18‑month runway; hires are staged.
- Payroll (cash comp, excluding founders early): avg ~₹7.2 L/month in Y1
  - Early months: 2 FS (SDE‑2), 1 RN Mobile, 1 QA, 1 DevOps (PT/contract), 2 CX (PT)
  - Founders absorb PM/Brand until Q3; PM + Designer added in H2
  - Bands (Bengaluru reference): SDE‑2 ₹18–28 LPA, PM ₹18–28 LPA, Designer ₹12–20 LPA, Ops ₹8–14 LPA, CX ₹4–8 LPA (ref: Project.md 7.1)
- Employer on‑costs (PF/bonus/fees): ~10% of payroll (included in avg)
- Cloud & Dev Tooling (AWS, CI/CD, analytics, email/SMS): avg ~₹1.2 L/month (ramps ₹1.0 → ₹1.6 L)
- SaaS & Productivity (GWS/Slack/Figma/GitHub/Linear/Sentry): ~₹0.3–0.5 L/month (included above or itemized as needed)
- Office/Warehouse rent & utilities: ~₹0.5–0.7 L/month (starter footprint + shared services)
- Legal/compliance/audit (retainer): ~₹0.2 L/month
- Misc/Travel/Community: ~₹0.3 L/month
- Fixed opex baseline (blended average): ~₹9.4 L/month in Y1

## Year 1 P&L Roll‑Up (₹ Lakh)
- Revenue (target): 150.0
- Variable costs (percent of revenue):
  - Product COGS (45%): 67.5
  - Shipping + Packaging (~5.83%): 8.7
  - Payment MDR + GST (~2.1%): 3.2
  - Returns reserve (~1.7%): 2.5
  - Marketing (30%): 45.0
  - Total variable: ~126.9
- Contribution margin (Revenue − Variable): ~23.1
- Fixed opex (9.4 L/month × 12): ~112.8
- EBITDA (Contribution − Fixed): ~−89.7
- Upfront (one‑time): ~22.0
- Year 1 Net Cash Burn: ~111.7
- Seed cash left for runway after Y1 (assuming ₹150 seed inflow and no other inflows): ~38.3

Notes
- The above supports ~5 additional months of runway at the baseline net monthly burn (~₹7–8 L after contribution) → ~17–18 months total runway, consistent with target.
- Hiring beyond this model (e.g., the full 15–18 FTE org in Project.md) requires either higher Year 1 revenue, lower CAC, or more capital.

## Month‑By‑Month (Concise View)
For each month, Contribution ≈ 15.4% × Revenue; Fixed ≈ ₹9.4 L (avg); Net Burn ≈ Fixed − Contribution.

| Month | Revenue (₹ L) | Orders (~) | Contribution (₹ L) | Fixed (₹ L) | Net Burn (₹ L) |
|---|---:|---:|---:|---:|---:|
| M1 | 5 | 278 | 0.77 | 9.4 | 8.6 |
| M2 | 7 | 389 | 1.08 | 9.4 | 8.3 |
| M3 | 9 | 500 | 1.39 | 9.4 | 8.0 |
| M4 | 10 | 556 | 1.54 | 9.6 | 8.1 |
| M5 | 11 | 611 | 1.69 | 9.6 | 7.9 |
| M6 | 12 | 667 | 1.85 | 9.8 | 8.0 |
| M7 | 13 | 722 | 2.00 | 10.0 | 8.0 |
| M8 | 14 | 778 | 2.16 | 10.2 | 8.0 |
| M9 | 15 | 833 | 2.31 | 10.5 | 8.2 |
| M10 | 16 | 889 | 2.46 | 10.8 | 8.3 |
| M11 | 17 | 944 | 2.62 | 11.1 | 8.5 |
| M12 | 20 | 1,111 | 3.08 | 11.8 | 8.7 |

Notes: Fixed opex grows modestly with hires and infra; exact ramp by quarter can be tuned.

## What Counts As “Upfront” vs “Monthly”
- Upfront: legal setup, IP filings, brand/packaging design, initial inventory and packaging bulk, equipment, deposits, compliance onboarding, contingency.
- Monthly: salaries/on‑costs, AWS + SaaS, rent/utilities, legal retainer, marketing (variable), logistics (variable), payment fees (variable), returns reserve (variable).

## Market‑Standard Pricing References (India)
- Shipping (surface/air) for ≤1 kg intra‑zone: ₹60–₹120; packaging (box + fillers + label): ₹20–₹35.
- Payment MDR domestic blended: 0–1% UPI, 1.8–2.2% cards/wallets; GST applies on MDR.
- D2C early stage marketing: 25–35% of revenue (front‑loaded), tapering with loyalty/referrals by Y2.
- Compensation bands (Bengaluru): SDE‑2 ₹18–28 LPA; PM ₹18–28 LPA; Designer ₹12–20 LPA; Ops ₹8–14 LPA; CX ₹4–8 LPA (ref: Project.md 7.1).

## Risks & Sensitivities
- CAC creep or lower conversion → raises marketing %; guardrails via CAC/LTV gates.
- Shipping/returns volatility → monitor DIM weight, packaging optimization, and return reason codes.
- Subscription adoption slower/faster → impacts repeat purchase and CAC amortization.
- Hiring timing → strict gates tied to revenue contribution and runway checks.

## Suggested Guardrails & KPIs
- Maintain LTV:CAC ≥ 8:1 (target 10:1 per plan); CAC ≤ ₹500 by Q3.
- Keep product gross margin ≥ 55%; contribution after marketing ≥ 12% while scaling.
- Returns ≤ 4%; payment success ≥ 90%; checkout success ≥ 65% (ref: Project.md OKRs).
- Burn discipline: monthly runway review; hires unlocked only when contribution trend > plan.

## Year 2 (Directional)
- Mix shifts: subscriptions to ~25–30% GMV; marketing % tapers toward 22–25% with loyalty/referrals.
- Infra/SaaS grows with traffic; unit costs fall with CDN/cache and negotiated courier slabs.
- Hiring expands toward the full org in Project.md; stage against revenue milestones and seed‑to‑A bridge.

---
Appendix: This model can be re‑parameterized by changing AOV, CAC, marketing %, and headcount ramp to produce conservative/base/aggressive scenarios for board updates.
