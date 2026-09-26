# Patel Networks — Compact System Reference (`compact.md`)

## 1. Stack & Architecture
* **Framework**: Next.js 15/16 App Router, TypeScript (Strict, 0 `any` types), Tailwind CSS v4.
* **Database**: PostgreSQL 16 on Supabase Cloud via Prisma ORM 6.19.3.
* **Storage Constraint**: **NO `.webp` browser recordings**.
* **Integrations (Dual-Mode Live + Deterministic Simulation)**:
  * **Razorpay**: Key/secret in `.env`; interactive test modal simulation on placeholder keys.
  * **Shiprocket / Delhivery**: AWB generation (`DELH...`, `BLUD...`) and webhook tracking state machine.
  * **WhatsApp Cloud API**: Meta Graph API HSM payloads, formatted terminal logs, and DB audit logging.

## 2. Invariants & Key ADRs
* **Hierarchy**: `Category ➔ Brand ➔ Product ➔ Variant ➔ SKU ➔ Inventory`. Stock tracked strictly at SKU level.
* **ADR-002**: Hybrid B2C & B2B Billing with 15-character GSTIN for 18% Input Tax Credit.
* **ADR-003 / ADR-011**: Mobile Number primary identity + 6-digit SMS OTP + Edge-compatible JWT session cookie (`pn_session`).
* **ADR-004**: Selective COD (₹15,000 ceiling, air-cargo exclusion, per-product disqualification).
* **ADR-006**: Interactive 5-Step CCTV Kit Builder with automatic 5% bundle discount.
* **ADR-010**: Row-level inventory locking inside Prisma interactive transactions.
* **ADR-012**: 6-digit Pincode Engine + Shiprocket/Delhivery AWB generation + 5-stage tracking timeline.
* **ADR-013**: WhatsApp Business Cloud API real-time lifecycle notifications & B2B inquiry modal.
* **ADR-014**: Admin Console (`/admin`, `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/settings/cod`) + SKU stock adjustments + hardware serial tracking.
* **ADR-015**: Master Loopback Regression + Dynamic XML Sitemaps + Google Rich Snippet JSON-LD schemas.
* **ADR-016**: Public Policy Infrastructure (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`, `/contact`, `/about`, `/faq`).
* **ADR-017**: Admin Commercial Reporting, GSTR-1 Tax Analytics & B2B Customer Directory (`/admin/customers`, `/admin/reports`).
* **ADR-018**: Storefront UI/UX Polish, Custom 404/Error Boundaries (`src/app/not-found.tsx`, `src/app/error.tsx`), and Admin CSV Export Engine (Orders & GSTR-1 tax data).
* **ADR-019**: Admin Command Center Authentication, Session Isolation (`pn_admin_session`) & Edge Middleware Guards (`/admin/login`).
* **ADR-020**: AI Studio In-Memory Dual-Mode Database Adapter (`src/server/db/mock-db.ts`) + Next.js Standalone Build Optimization.
* **ADR-021**: Real Photographic Assets in Supabase `product_images`, Admin Image & Asset Manager (`ProductImageManagerModal` / `/api/admin/upload-image`), Pure Typography Categories (zero SVGs).
* **ADR-022**: Retail Electronics Storefront, Category Discovery & Account Architecture (Light commerce theme, 9-category discovery, filterable featured products, faceted catalog, compare drawer, account subroutes).

## 3. Key Routes & Endpoints (26+ Total Platform Endpoints Tested)
* **Storefront Core**: `/`, `/products`, `/products/[slug]`, `/kit-builder`, `/cart`, `/checkout`, `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`, `/account/wishlist`, `/account/profile`, `/account/login`, `/order-success/[orderNumber]`.
* **Policy & Corporate**: `/about`, `/contact`, `/faq`, `/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`.
* **Admin Command Center**: `/admin/login`, `/admin`, `/admin/orders`, `/admin/products`, `/admin/inventory`, `/admin/customers`, `/admin/reports`, `/admin/settings/cod`.
* **SEO & Protocols**: `/sitemap.xml`, `/robots.txt`.
* **Error Boundaries**: Custom branded `/not-found.tsx` (HTTP 404), `error.tsx` client recovery.
* **Webhooks**:
  * `POST /api/webhooks/razorpay` (Payment capture)
  * `POST /api/webhooks/shipping` (Tracking status sync)
  * `GET|POST /api/webhooks/whatsapp` (Meta verification & status callbacks)

## 4. Verification Commands
```bash
npx tsc --noEmit
npx tsx scripts/comprehensive_loopback_test.ts
npx tsx scripts/master_loopback_test.ts
```

## 5. Documentation Map
* `continue.md`: Universal AI & developer handoff guide, active operational status, credentials, and roadmap.
* `decisions.md`: All 19 Architectural Decision Records (ADR-001 – ADR-019).
* `review-test-followup.md`: Executive operations handover, production configuration guide, smoke test matrix.
* `changelog.md`: Full version release notes (v0.1.0 – v1.2.0).
* `technical-dcoumentation.md`: Exhaustive architecture, database models, transaction locks, and API specs.
* `business-documentation.md`: Commercial policies, B2B invoicing, selective COD, and RMA rules.
* `help.md`: Admin operator handbook, credentials reference, and GSTR-1 returns.



