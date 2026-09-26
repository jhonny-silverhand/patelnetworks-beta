# Patel Networks (MegaTech) — Developer & AI Continuity Handoff Guide (`continue.md`)

> **IMPORTANT DIRECTIVE FOR ANY AI ASSISTANT / DEVELOPER IN GOOGLE AI STUDIO OR ANY WORKSPACE:**  
> 1. **Read This File First**: This document is the primary source of truth for repository history, active architecture, credentials, environment configurations, and current operational state.  
> 2. **Continuous Maintenance Rule**: **You MUST continuously update and modify this `continue.md` file (along with `changelog.md`, `decisions.md`, `compact.md`, `README.md`, `technical-dcoumentation.md`, `business-documentation.md`, `help.md`, and `review-test-followup.md`) whenever you make changes, add features, or progress through milestones.** Even if the underlying model, workspace, or chat session resets, this file preserves full continuity.

---

## 📌 1. Project Overview & Business Identity

* **Brand / Company**: **Patel Networks / MegaTech**
* **Business Domain**: Authorized Commercial CCTV, Video Surveillance, Security Recorders (DVR/NVR), Surveillance Storage (HDD), and Structured Networking Hardware E-Commerce Platform (India).
* **Central Hub / HQ**: Surat, Gujarat (Primary fulfillment node with Pan-India dispatch).
* **Authorized Brand Alliances**: CP Plus, Hikvision, Dahua, Western Digital (Purple), D-Link.
* **Target Audience**:
  * **Retail Consumers (B2C)**: Homeowners, retail shops, standalone office security.
  * **Commercial Contractors / System Integrators (B2B)**: Electrical contractors, CCTV installers, corporate IT procurement requiring statutory 18% GST Input Tax Credit (ITC) invoices with 15-character GSTIN.

---

## 🛠️ 2. Technology Stack & Runtime Invariants

* **Framework**: Next.js 15/16 with App Router (Turbopack development runtime).
* **Language**: TypeScript with **Strict Mode** (Strict zero-`any` policy across all components, actions, and services).
* **Styling**: Tailwind CSS v4 with curated dark-mode surveillance palettes (Slate 950, Indigo 950, Sapphire/Sky glows).
* **Database**: PostgreSQL 16+ on Supabase Cloud via Prisma ORM 6.19.3 (29 relational models).
* **Prisma Connection Tuning**: Interactive transaction limits set to `{ maxWait: 15000, timeout: 30000 }` to accommodate remote cloud transaction poolers.
* **Authentication**:
  * **Storefront Customer Portal**: Passwordless 6-Digit SMS OTP + Edge JWT cookie (`pn_session`).
  * **Admin Command Center**: Role-isolated password authentication + Edge JWT cookie (`pn_admin_session`) + Next.js Edge Middleware route guards (`src/middleware.ts`).
* **Integrations (Dual-Mode Design: Live API + Deterministic Simulation Fallback)**:
  * **Payments**: Razorpay (Interactive modal test simulation when placeholder keys are present).
  * **Logistics**: Shiprocket / Delhivery AWB Generation (`DELH...`, `BLUD...`) with 5-stage tracking state machine.
  * **WhatsApp API**: Meta Graph API HSM templates with formatted console payload simulation and database audit logging.
  * **SMS OTP**: Fast2SMS / MSG91 with terminal OTP logging for frictionless local verification.
* **Storage Constraint**: **Strictly NO `.webp` browser recordings** (to preserve workspace disk storage).

---

## 🔑 3. Credentials & Environment Configurations

### 3.1 Admin Command Center Portal (ADR-019)
* **Login URL**: `http://localhost:3000/admin/login` (or production URL `/admin/login`)
* **Superadmin Email**: `superadmin@patelnetworks.in` (Configurable via `ADMIN_EMAIL` in `.env`)
* **Secret Access Key**: `patel@admin2026` (Configurable via `ADMIN_PASSWORD` in `.env`)
* **Role**: `SUPER_ADMIN` with full access across Dashboard, Orders, Products, Inventory, Customers CRM, GSTR-1 Tax Reports, and COD Settings.
* **One-Click Demo Helper**: An **"Autofill Credentials"** button is built directly into `/admin/login` for instant testing.

### 3.2 Customer & Contractor Storefront Login (ADR-003 / ADR-011)
* **Login URL**: `http://localhost:3000/account/login` (or `/account`)
* **Auth Method**: 10-Digit Indian Mobile Number (e.g., `9876543210` for existing seeded B2B Contractor account, or any valid Indian mobile number).
* **OTP Behavior**: In development/testing mode without paid SMS gateway keys, OTP is displayed on screen or logged to terminal.

### 3.3 Database & Supabase Connection
* **Database Provider**: PostgreSQL on Supabase Cloud (Live Connected).
* **Live Status**: Successfully connected to `aws-0-ap-northeast-1.pooler.supabase.com:6543`.
* **Verified Counts**: 7 categories, 10 brands, 4 products, 23 orders, 7 customer accounts active.
* **Connection Strings** (configured in `.env`):
  * `DATABASE_URL`: Transaction connection pooler URL (Port 6543, with `?sslmode=require&pgbouncer=true`).
  * `DIRECT_URL`: Direct session connection URL (Port 5432, for Prisma migrations and schema push).
* **Schema Management**:
  ```bash
  npx prisma db push       # Sync schema with Supabase
  npx tsx prisma/seed.ts   # Seed categories, brands, products, SKUs, inventory, and test accounts
  ```

### 3.4 Complete `.env` Reference
```env
# Application
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="patel_networks_secure_jwt_secret_key_32_bytes!"
JWT_EXPIRES_IN="7d"

# Admin Portal Credentials
ADMIN_EMAIL="superadmin@patelnetworks.in"
ADMIN_PASSWORD="patel@admin2026"

# Database (Supabase PostgreSQL 16)
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Razorpay Payments (Dual-Mode)
RAZORPAY_KEY_ID="rzp_test_placeholder_key_id"
RAZORPAY_KEY_SECRET="placeholder_secret_key"
RAZORPAY_WEBHOOK_SECRET="placeholder_webhook_secret"

# WhatsApp Cloud API (Dual-Mode)
WHATSAPP_API_URL="https://graph.facebook.com/v20.0"
WHATSAPP_ACCESS_TOKEN="placeholder_whatsapp_access_token"
WHATSAPP_PHONE_NUMBER_ID="placeholder_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="placeholder_business_account_id"

# Shipping & Logistics (Shiprocket / Delhivery)
SHIPROCKET_EMAIL="placeholder@patelnetworks.com"
SHIPROCKET_PASSWORD="placeholder_shiprocket_password"
SHIPROCKET_API_URL="https://apiv2.shiprocket.in/v1/external"

# SMS OTP Gateway
SMS_GATEWAY_API_KEY="placeholder_sms_api_key"
SMS_SENDER_ID="PTLNET"
```

---

## 🗺️ 4. Verified Platform Endpoints (26 Routes Total)

All 26 platform endpoints have been implemented and verified with automated test suites:

### Storefront & Customer Operations
1. `GET /` — Modern surveillance homepage (Hero, authorized brand marquee, kit builder promo banner, featured products, footer).
2. `GET /products` — Faceted catalog browser with brand/category multi-filter chips, price sorting, and stock status.
3. `GET /products/[slug]` — Product Detail Page with dynamic variant matrix selector (resolution, channels, storage), specifications, JSON-LD schemas, and mobile sticky purchase bar.
4. `GET /kit-builder` — Interactive 5-step custom CCTV kit builder with automatic 5% bundle discount calculation.
5. `GET /cart` — Live cart drawer and dedicated cart page with server-calculated 18% GST tax summary.
6. `GET /checkout` — Concurrency-safe checkout with 6-digit Indian PIN intelligence, B2B GSTIN 15-char input, selective COD check, and Razorpay modal.
7. `GET /account` — Protected customer account portal (HTTP 307 redirect when unauthenticated).
8. `GET /account/login` — Passwordless 6-digit mobile SMS OTP login interface.
9. `GET /order-success/[orderNumber]` — Order confirmation screen with 5-stage shipment stepper and printable B2B Tax Invoice.

### Corporate Policies & Governance Desk
10. `GET /about` — Corporate history, authorized brand distributor alliances, and Surat warehouse quality testing standards.
11. `GET /contact` — Commercial consultation desk with interactive wholesale quotation submission form and Surat hub coordinates.
12. `GET /faq` — Interactive accordion covering storage formulas, IP vs Analog cameras, and B2B Input Tax Credit.
13. `GET /shipping-policy` — SLA dispatch timelines, same-day cutoff at 4:00 PM IST, and postal zone breakdown.
14. `GET /return-policy` — 7-Day DOA replacement guarantee, hardware serial verification, and RMA claim guidelines.
15. `GET /privacy-policy` — Indian IT Act 2000 & SPDI compliance, GSTIN data security, and PCI-DSS payment encryption.
16. `GET /terms` — Commercial terms of sale, 18% GST statutory tax liability, title transfer, and Surat legal jurisdiction.

### Admin Command Center Operations (Protected via ADR-019)
17. `GET /admin/login` — Secure 256-bit Command Center authentication portal with credentials autofill helper.
18. `GET /admin` — Operations console with gross revenue (GMV), total orders, average order value, and quick links.
19. `GET /admin/orders` — Order fulfillment console with carrier AWB booking, serial number scanning, and **One-Click Orders CSV Export**.
20. `GET /admin/products` — Catalog management console with variant matrix pricing and selective COD toggles.
21. `GET /admin/inventory` — SKU-level physical stock drawer with concurrency-safe adjustments and audit trails.
22. `GET /admin/customers` — B2B Contractor & customer CRM directory with lifetime spend (LTV) and 1-click WhatsApp customer support link.
23. `GET /admin/reports` — Statutory GSTR-1 tax reporting dashboard (Intra-State CGST/SGST vs Inter-State IGST) and **One-Click GSTR-1 CSV Export**.
24. `GET /admin/settings/cod` — Cash on Delivery threshold rules and air-cargo zone exclusion policies.

### Protocols, SEO & Custom Error Boundaries
25. `GET /sitemap.xml` — Dynamic XML sitemap indexing all active static pages, category filters, and products.
26. `GET /robots.txt` — Search engine crawling policy protecting administrative and checkout routes.
* `src/app/not-found.tsx` — Custom branded 404 page ("Camera Feed Lost") with radar animation, quick recovery links, and WhatsApp support.
* `src/app/error.tsx` — Client-side error boundary with automatic exception recovery and retry actions.

---

## 📜 5. Architectural Decision Records (ADR Log: ADR-001 – ADR-020)

| ADR | Title | Status | Core Impact |
| :--- | :--- | :--- | :--- |
| **ADR-001** | Unified Next.js Fullstack Architecture | ACCEPTED | Single fullstack codebase, App Router, shared Prisma singleton, zero API duplication. |
| **ADR-002** | Hybrid B2C & B2B Billing with GSTIN | ACCEPTED | Mandatory 18% GST tax breakdown; 15-character GSTIN persistence for Input Tax Credit. |
| **ADR-003** | Phone Number + SMS OTP Authentication | ACCEPTED | 10-digit Indian mobile primary identity, E.164 normalization, and passwordless OTP. |
| **ADR-004** | Selective Cash on Delivery (COD) | ACCEPTED | ₹15,000 ceiling, air-cargo zone disqualification, product-level admin toggles. |
| **ADR-005** | Flexible Multi-Attribute Variant Modeling | ACCEPTED | `Category ➔ Brand ➔ Product ➔ Variant ➔ SKU ➔ Inventory`. Stock tracked strictly at SKU level. |
| **ADR-006** | Interactive Stepped CCTV Kit Builder | ACCEPTED | 5-step guided combo builder with automatic 5% bundle discount. |
| **ADR-007** | Integration Readiness & Simulation Fallbacks | ACCEPTED | Dual-mode architecture for Razorpay, WhatsApp Cloud API, and Shiprocket. |
| **ADR-008** | Senior Lead Engineering Standards | ACCEPTED | Zero `any` types, Decimal financial math, row-level locks, idempotent webhooks. |
| **ADR-009** | Managed Cloud DB on Supabase | ACCEPTED | PostgreSQL 16 on Supabase with PgBouncer connection pooling (`DATABASE_URL` + `DIRECT_URL`). Connected & Verified live. |
| **ADR-010** | Concurrency-Safe Orders & Row-Level Locking | ACCEPTED | Prisma interactive transactions with row locks on SKU stock during order creation. |
| **ADR-011** | Customer Auth & JWT Sessions | ACCEPTED | `pn_session` secure HTTP-only cookie with 7-day signed JWT. |
| **ADR-012** | Carrier Logistics & Pincode Intelligence | ACCEPTED | 6-digit PIN engine (Intra-State, Metro, Special Zone) + Shiprocket/Delhivery AWB generation. |
| **ADR-013** | WhatsApp Cloud API Lifecycle Engine | ACCEPTED | Order Placed, Dispatch with AWB, Out for Delivery alerts + Floating widget + B2B quote modal. |
| **ADR-014** | Admin Console & Hardware RMA Serials | ACCEPTED | Inventory adjustments with audit reason codes (`PURCHASE_RECEIPT`) + Hardware serial tracking. |
| **ADR-015** | SEO, Sitemaps & Structured Data JSON-LD | ACCEPTED | Dynamic `/sitemap.xml`, `/robots.txt`, and Google Rich Snippet JSON-LD schemas on PDP. |
| **ADR-016** | Corporate Policies & Public Governance | ACCEPTED | Legal policies (`/shipping-policy`, `/return-policy`, `/privacy-policy`, `/terms`) & Contact desk. |
| **ADR-017** | Admin CRM & GSTR-1 Tax Analytics | ACCEPTED | `/admin/customers` with customer LTV & `/admin/reports` with statutory GSTR-1 schedules. |
| **ADR-018** | UI/UX Polish, Custom 404 & CSV Export Engine | ACCEPTED | Radar 404 page, error boundary, search outside-click dismiss, and Orders & GSTR-1 CSV exports. |
| **ADR-019** | Admin Command Center Authentication | ACCEPTED | Dedicated `pn_admin_session` cookie, `/admin/login` portal, Edge middleware guards, Sign Out. |
| **ADR-020** | AI Studio In-Memory Dual-Mode DB Adapter & Standalone Optimization | ACCEPTED | Pre-seeded mock DB fallback, Next.js standalone container optimization, port 3000 host binding. |
| **ADR-021** | Real Photographic Assets, Supabase Images & Pure Typography Categories | ACCEPTED | Real photos in Supabase `product_images`, admin image manager & upload API, pure typography categories (zero SVGs). |
| **ADR-022** | Retail Electronics Storefront, Category Discovery & Account Architecture | ACCEPTED | Light commerce theme, 9-category discovery grid, filterable featured products, faceted catalog, compare drawer, account subroutes. |

---

## 🧪 6. Verification Commands & Regression Suites

Run these commands in terminal to verify 100% platform integrity:

```bash
# 1. Typecheck: Zero any types, strict type compilation
npx tsc --noEmit

# 2. Next.js Applet Production Build
npm run build
```

> **NOTE:** Do NOT run `comprehensive_loopback_test.ts` during interactive workspace sessions per operational directive ("DONT ever Run comprehensive_loopback_test.ts YOU GET STUCK"). Rely on `npx tsc --noEmit` and `npm run build` / `compile_applet`.

---

## 🔮 7. Future Scope & Next Steps for Google AI Studio

When continuing development in Google AI Studio, focus on the following high-priority enhancements:

1. **Production Cloud Deployment & Custom Domain**:
   - Push repository to GitHub.
   - Connect repository to **Vercel** or **Railway**.
   - Configure production environment variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, etc.).
   - Bind custom domain `patelnetworks.in` with SSL certificates.
2. **Live Production Credentials Onboarding**:
   - **Razorpay**: Swap placeholder test keys for live Production API Key & Secret; set live Webhook URL pointing to `https://patelnetworks.in/api/webhooks/razorpay`.
   - **Meta WhatsApp Cloud API**: Obtain permanent System User Access Token; register HSM message templates (`order_confirmation`, `order_dispatched`, `order_out_for_delivery`, `b2b_inquiry_received`) in Meta WhatsApp Business Manager.
   - **Shiprocket / Delhivery**: Add live courier API tokens in `.env`.
   - **SMS Gateway**: Configure Fast2SMS or MSG91 DLT-approved template ID for Indian SMS delivery.
3. **Advanced Storefront & Commercial Features**:
   - **Bulk B2B Price Matrix**: Tiered pricing discounts for verified contractors ordering >10 units.
   - **Multi-Warehouse Support**: Ahmedabad / Rajkot satellite warehouse routing in addition to Surat Central Hub.
   - **Automated PDF Invoices**: Server-side PDF generation via `@react-pdf/renderer` for instant invoice download attachments.

---

## 📚 8. Master Documentation Map & Sync Policy

| File | Purpose | When to Update |
| :--- | :--- | :--- |
| **`continue.md`** *(This file)* | Universal AI & developer handoff context, credentials, roadmap | **With every session or feature change** |
| **`decisions.md`** | Complete Architectural Decision Records (ADR-001 – ADR-020) | When any technical or architectural decision is made |
| **`changelog.md`** | Chronological version release notes (v0.1.0 – v1.3.0) | With every bugfix, UI update, or feature release |
| **`compact.md`** | Ultra-concise cheatsheet of stack, ADRs, routes, and tests | With route or major stack modifications |
| **`README.md`** | Public GitHub overview, installation, roadmap, and quickstart | When user-facing features or installation steps change |
| **`technical-dcoumentation.md`** | Deep technical architecture, Prisma models, locks, and API specs | When backend services, schemas, or APIs change |
| **`business-documentation.md`** | Commercial business rules, GSTIN invoicing, RMA, and policies | When business rules, tax logic, or legal terms change |
| **`help.md`** | Back-office operator handbook and credentials guide | When admin console tools or workflows change |
| **`review-test-followup.md`** | Operations handover, deployment guide, and smoke test checklist | When preparing releases or deployment instructions |

---

> **FINAL INSTRUCTION FOR ALL FUTURE AI SESSIONS:**  
> When you resume in Google AI Studio or another IDE:  
> 1. Read `continue.md` and `compact.md` to establish context.  
> 2. Implement the requested feature adhering to the strict TypeScript and architectural standards.  
> 3. Run `npx tsc --noEmit` and verify builds without running `comprehensive_loopback_test.ts`.  
> 4. Append all new changes to `continue.md`, `changelog.md`, `decisions.md`, and related `.md` files.
