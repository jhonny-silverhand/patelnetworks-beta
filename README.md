# CCTV & Security Products E-Commerce Platform

> **Fullstack E-Commerce Platform for CCTV, Surveillance, and Networking Hardware**  
> Serving retail customers, enterprise clients, system integrators, and security equipment installers.

---

## 📌 Project Overview

This platform is a unified, high-reliability e-commerce ecosystem dedicated to CCTV, surveillance, and networking equipment (brands including **Hikvision, Dahua, CP Plus, MTC, D-Link, DGSoal, Axpial, Optilink, Lapcare, AOC**).

The system is built as a **Unified Fullstack Next.js Application** containing:
1. **Customer Storefront (`app/(storefront)`)**: High-performance customer discovery, search, filtering, custom kit builder, cart, checkout, and OTP account management.
2. **Back-Office Admin Portal (`app/(admin)`)**: Operations portal for inventory adjustments, order fulfillment, product catalog, selective COD rules, pricing, and analytics.
3. **Core Server Services (`src/server/services`)**: Transaction-safe inventory reservation, order state machines, payment webhook processing, and carrier logistics integrations.

---

## 📚 Documentation Index

- ⚖️ [Architectural & Business Decisions (ADRs)](file:///d:/work/megatech/patelnetworks/decisions.md): **The single source of truth** for all locked-in technical and business decisions (ADR-001 through ADR-020).
- 🔍 [Review, Testing & Follow-Up Guide](file:///d:/work/megatech/patelnetworks/review-test-followup.md): Detailed user action checklist, production configuration steps, smoke test matrix, and maintenance protocols.
- 📋 [Business Documentation](file:///d:/work/megatech/patelnetworks/business-documentation.md): Product scope, taxonomy, B2B/B2C logic, pricing, GST compliance, inventory policies, and operational lifecycles.
- ⚙️ [Technical Documentation](file:///d:/work/megatech/patelnetworks/technical-dcoumentation.md): Architecture specifications, Prisma database models, transaction boundaries, idempotent webhooks, API security, and deployment guidelines.
- 📖 [Help & Operations Guide](file:///d:/work/megatech/patelnetworks/help.md): Admin user handbook, order fulfillment workflow, stock adjustments, and GSTR-1 tax reporting.
- 📝 [Changelog](file:///d:/work/megatech/patelnetworks/changelog.md): Chronological history of releases, milestones, architectural decisions, and changes.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router, Server Actions) | Unified Fullstack application for Storefront and Admin |
| **Styling & Design** | Tailwind CSS + Radix UI Primitives | Responsive storefront design & dense administrative data tables |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety across server services, DB, and UI |
| **Database & ORM** | PostgreSQL 16+ & Prisma ORM | Relational data, ACID transactions, row-level locking |
| **Payments** | Razorpay (UPI, Netbanking, Cards, EMI) | Server-side signature verification & idempotent webhooks |
| **Cash on Delivery** | Selective COD (Admin-Controlled) | Per-SKU enable/disable, pincode check, risk management |
| **Shipping Logistics** | Shiprocket / Delhivery APIs | Carrier abstraction, rate check, AWB generation, live tracking |
| **Customer Auth** | Phone Number + 6-digit SMS OTP | Fast2SMS / MSG91 / Firebase for frictionless mobile login |
| **Admin Auth** | Email + Password + RBAC (JWT) | Multi-role access control for operations and inventory staff |
| **Media Storage** | Cloudinary / AWS S3 | Optimized product galleries, datasheets, spec PDFs |

---

## 🏛️ Directory Structure

```text
patelnetworks/
├── src/
│   ├── app/
│   │   ├── (storefront)/        # Public Storefront (Home, Catalog, Product, Kit Builder, Cart, Checkout)
│   │   ├── (admin)/             # Back-office Admin Portal (Dashboard, Catalog, Inventory, Orders, CMS)
│   │   ├── api/                 # Webhooks (Razorpay, Shiprocket) & external REST endpoints
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Core design tokens and base styles
│   ├── components/
│   │   ├── storefront/          # Product cards, dynamic variant selectors, kit builder, checkout
│   │   ├── admin/               # Operational data tables, stock drawers, order status managers
│   │   └── ui/                  # Reusable UI primitives (buttons, modals, badges, inputs, drawers)
│   ├── server/
│   │   ├── services/            # Domain services (catalog, inventory, orders, payments, shipping, auth)
│   │   ├── db/                  # Prisma client instance & transaction helpers
│   │   └── security/            # RBAC guards, session cookies, rate limiting
│   └── lib/                     # Shared utilities (GST math, currency formatting, OTP client)
├── prisma/
│   ├── schema.prisma            # Unified database schema
│   ├── migrations/              # Database migration history
│   └── seed.ts                  # Realistic CCTV catalog seed script
├── docker-compose.yml          # Local PostgreSQL & Redis environment
├── decisions.md                 # All locked-in architectural & business decisions
├── business-documentation.md    # Business rules, taxonomy, GST, order lifecycle
├── technical-dcoumentation.md   # Technical architecture, Prisma models, security
├── changelog.md                 # Project version history
└── readme.md                    # Main project overview & setup guide
```

---

## 🛡️ Core Engineering Rules

1. **Hierarchy Rule**: `Category ➔ Brand ➔ Product ➔ Variant ➔ SKU ➔ Inventory`.
   * Stock is **only** tracked and decremented at the **SKU / Variant level**. Product-level stock is purely derived.
2. **Zero-Trust Pricing**:
   * Never trust client-submitted prices, discounts, GST amounts, or shipping fees. Every line item is revalidated against the database on the server at checkout.
3. **Concurrency-Safe Inventory**:
   * Database transactions (`SELECT ... FOR UPDATE` or Prisma `$transaction`) govern stock reservation, order placement, and payment capture. **No overselling, no race conditions, no negative inventory.**
4. **Idempotent Webhook Processing**:
   * Every payment (Razorpay) and shipping webhook must store an idempotent event log and deduplicate on event ID / payment ID.
5. **Strict TypeScript & RBAC**:
   * No `any` types. Business logic resides strictly in domain services. Hidden UI buttons do not substitute for server-side authorization guards.

---

## 🚀 Phased Build Roadmap

- [x] **Phase 0 — Project Setup & Architecture**: Fullstack Next.js scaffold, Supabase PostgreSQL, Prisma setup, domain services, ground rules, and decision records.
- [x] **Phase 1 — Database & Core Domain Foundation**: Complete Prisma schema with 29 relational models, taxonomy, SKU-level inventory, catalog seed, and cloud migration.
- [x] **Phase 2 — Storefront: Browse & Discover**: Modern homepage, category navigation, dynamic variant matrix selector, faceted catalog filters, and Interactive CCTV Kit Builder (ADR-006).
- [x] **Phase 3 — Cart, Checkout, Payments & Concurrency-Safe Orders**: Server-validated cart, dual-mode Razorpay gateway with test simulation (ADR-007), selective COD rules, B2B GSTIN input tax credit invoicing, row-level inventory reservation (ADR-010), idempotent webhooks, and formal GST Tax Invoices.
- [x] **Phase 4 — Customer Authentication, OTP Login & Account Portal**: Phone Number + 6-digit SMS OTP (MSG91 / Fast2SMS / Firebase - ADR-003, ADR-011), customer order history, saved addresses, and B2B GSTIN profile management.
- [x] **Phase 5 — Shipping Integration & Pincode Intelligence**: Indian postal circle engine, carrier provider abstraction (Shiprocket/Delhivery - ADR-012), AWB generation, idempotent tracking webhooks, delivery SLA estimator, and 5-stage live tracking stepper.
- [x] **Phase 6 — WhatsApp Business API & Real-Time Alerts**: Automated WhatsApp lifecycle messages (Order Placed, AWB Dispatched, Out for Delivery - ADR-013), Meta Graph API dual-mode engine, global floating chat widget, and B2B contractor quote inquiry modal.
- [x] **Phase 7 — Admin Operations Portal & SKU Stock Management**: Real-time business KPI dashboard, order fulfillment console with AWB booking, hardware serial number tracking (ADR-014), SKU inventory adjustments with immutable audit trail, and selective COD toggles.
- [x] **Phase 8 — Performance Hardening, SEO & Launch Preparation (ADR-015)**: Dynamic XML sitemaps (`/sitemap.xml`), robots crawl policy (`/robots.txt`), Google Rich Snippet JSON-LD schemas (`Product`, `AggregateOffer`, `BreadcrumbList`), and master loopback regression testing.
- [x] **Phase 9 — Commercial Launch, Corporate Policies & Legal Infrastructure (ADR-016)**: Public policy suite (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`), corporate consult desk (`/contact`, `/about`, `/faq`), 7-day DOA RMA rules, and B2B wholesale quotation desk.
- [x] **Phase 10 — Admin CRM Directory & GSTR-1 Tax Reporting (ADR-017)**: Customer & contractor matrix with lifetime spend aggregation (`/admin/customers`), GSTR-1 tax schedules with CGST/SGST/IGST breakdown, warehouse capital valuation, and live search autocomplete.
- [x] **Phase 11 — UI/UX Polish, Custom Error Boundaries & Commercial CSV Engine (ADR-018)**: Custom branded 404 feed loss page (`/not-found.tsx`), client error boundary (`/error.tsx`), mobile search parity with outside-click dismiss, and one-click CSV exports for customer orders and statutory GSTR-1 returns.
- [x] **Phase 12 — Admin Command Center Authentication & Security Guards (ADR-019)**: Dedicated session cookie (`pn_admin_session`), Edge-compatible route middleware (`src/middleware.ts`), high-tech login portal (`/admin/login`), session profile header, and secure sign-out.

---

## 🗺️ Complete Platform Routes (26 Endpoints Verified)

### Storefront & Customer Operations
* `GET /`: Modern surveillance homepage with hero banner, brand marquee, kit promo, and featured products.
* `GET /products`: Faceted catalog browser with brand/category filters and price sorting.
* `GET /products/[slug]`: Product Detail Page with multi-attribute matrix selector, specifications, and mobile sticky bar.
* `GET /kit-builder`: Interactive 5-step custom CCTV kit builder with automatic 5% bundle discount.
* `GET /cart`: Live cart drawer and page with server-calculated 18% GST tax summary.
* `GET /checkout`: Unified checkout with 6-digit Indian PIN engine, Razorpay online payments, and selective COD.
* `GET /account`: Customer portal with phone OTP login, order history, and saved addresses (307 redirect).
* `GET /account/login`: Passwordless 6-digit SMS OTP authentication interface.
* `GET /order-success/[orderNumber]`: Order confirmation screen with 5-stage shipment stepper and GST invoice.

### Corporate & Statutory Policies
* `GET /about`: Authorized distributor partnerships, warranty assurances, and Surat central hub history.
* `GET /contact`: Wholesale consultation desk, interactive quotation inquiry, warehouse coordinates, and NEFT/RTGS bank details.
* `GET /faq`: Categorized surveillance FAQ covering HD Analog vs IP, H.265 storage math, and GST tax credits.
* `GET /shipping-policy`: Pan-India postal circle SLAs, same-day 4:00 PM cutoff, and air-cargo COD exclusions.
* `GET /return-policy`: 7-day DOA replacement guarantee, manufacturer brand warranties, and hardware serial tracking.
* `GET /privacy-policy`: IT Act 2000 compliance, zero payment credential storage, and transactional WhatsApp opt-ins.
* `GET /terms`: Commercial terms of sale, 18% GST invoice legal liabilities, and Surat legal jurisdiction.

### Admin Command Center Operations (Protected via ADR-019)
* `GET /admin/login`: Secure 256-bit Command Center authentication portal with demo credentials helper.
* `GET /admin`: Operations console with gross revenue (GMV), total orders, average order value, and quick links.
* `GET /admin/orders`: Order fulfillment console with carrier AWB booking, hardware serial recording, and CSV export.
* `GET /admin/products`: Catalog management console with variant matrix pricing and stock availability.
* `GET /admin/inventory`: SKU-level physical stock drawer with concurrency-safe adjustments and audit trails.
* `GET /admin/customers`: CRM directory with customer lifetime spend, B2B verification badges, and WhatsApp link.
* `GET /admin/reports`: Commercial accounting and GSTR-1 tax reporting dashboard with statutory CSV export.
* `GET /admin/settings/cod`: Selective Cash on Delivery engine toggles and air-cargo restrictions.

### SEO & Exception Boundaries
* `GET /sitemap.xml`: Dynamic XML sitemap indexing all active categories, products, and policy routes.
* `GET /robots.txt`: Search engine crawling policy protecting administrative and checkout routes.
* `GET /not-found.tsx`: Custom branded 404 page ("Camera Feed Lost") with quick recovery routes and emergency WhatsApp support.
* `GET /error.tsx`: Client-side error boundary with automatic exception recovery and retry actions.

---

## 💻 Quick Start & Automated Verification

### Prerequisites
* Node.js 20+ (LTS)
* npm or pnpm
* Supabase PostgreSQL Cloud or Docker

### 1. Database & Migrations
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Automated Test Verification Suites
Run the comprehensive regression suites to verify all 11 testing domains and all 24 platform endpoints:
```bash
# 1. Strict TypeScript type check (Zero errors, Zero any types)
npx tsc --noEmit

# 2. Comprehensive 36-point loopback suite (All 24 endpoints, GST math, AWBs, WhatsApp, CRM, Tax, 404)
npx tsx scripts/comprehensive_loopback_test.ts

# 3. Master domain loopback suite
npx tsx scripts/master_loopback_test.ts
```

