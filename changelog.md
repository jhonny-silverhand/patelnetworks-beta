# Changelog

All notable changes to the **Patel Networks CCTV & Security E-Commerce Platform** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned for Production Launch
- Production deployment on Vercel / Railway with Supabase production tier.
- Custom domain SSL binding (`patelnetworks.in`).

---

## [1.5.0] - 2026-09-26

### Added (Professional Retail Electronics Storefront, Category Discovery & Account Architecture — ADR-022)
- **Light Commerce Design System**:
  - Re-architected storefront from dark SaaS aesthetic to a professional electronics retail store with white/light neutral surfaces, navy typography (`#0f172a`), restrained blue accents (`#2563eb`), emerald green for stock, and red for discounts.
  - Zero decorative SVGs or emoji icons; strict reliance on `lucide-react`.
- **Commerce-First Homepage**:
  - Compact hero with authentic camera/DVR hardware lineup and 4-item Trust / Value Proposition strip (18% GST Invoice, Razorpay, Shiprocket/Delhivery, Technical Assistance).
  - 9-category retail discovery grid with clean product photography on white backgrounds.
  - Featured products section with interactive client-side category filter tabs (`All`, `CCTV Cameras`, `DVR/NVR`, `Hard Drives`, `Networking`, `Cables`, `Monitors`).
  - Secondary custom CCTV kit builder callout and technical assistance banner.
  - Top brands grid with verified brand styling (Hikvision, Dahua, CP Plus, D-Link, AOC, Seagate, TP-Link, Lapcare, MTC, Optilink).
  - Technical specification buying guide (by resolution, housing, channels, 24/7 storage days, and PoE).
- **Technical Catalog Page (`/products`)**:
  - Breadcrumb navigation, sorting dropdown (relevance, price low-to-high, price high-to-low, newest), active filter tags with individual removal buttons, and a rich filter sidebar.
  - Multi-term search query parser supporting compound terms ("4mp hikvision", "2tb seagate").
- **Product Detail Page Upgrades (`/products/[slug]`)**:
  - Large photographic gallery with multi-angle thumbnails.
  - Interactive variant selector updating SKU, price, MRP, available stock, 18% GST breakdown, pincode check, quantity stepper, Add to Cart, and Buy Now.
  - Structured engineering specifications table, technical overview, and related hardware recommendations.
- **Product Comparison Drawer (`ProductCompareDrawer`)**:
  - Floating comparison bar and side-by-side comparison modal evaluating up to 4 items on resolution, housing, night vision, PoE, HSN code, price, and warranty.
- **Customer Account Portal & Sub-Routes**:
  - Added dedicated customer routes: `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`, `/account/wishlist`, and `/account/profile`.
  - Added persistent wishlist tab in customer portal with direct cart integration.
  - Order details view with visual shipment tracking timeline, AWB tracking, and printable GST tax invoices.
- **Regression Verification**:
  - Static typecheck: 0 errors (`npx tsc --noEmit`).
  - Next.js build compilation: Succeeded (`compile_applet`).

---

## [1.4.0] - 2026-09-26

### Added (Real Photographic Assets, Supabase Images Storage, & Pure Typography Categories — ADR-021)
- **Real High-Resolution Photographic Hardware Imagery**:
  - Purged all hardcoded, synthetic `.svg` product and category placeholders.
  - Sourced genuine high-definition surveillance hardware photography from internet CDNs (Unsplash verified high-resolution photography) covering Bullet cameras, Eyeball dome cameras, PoE IP cameras, AcuSense AI DVRs, 24/7 Surveillance HDDs, Cat6 cable reels, Gigabit PoE switches, SMPS power units, pure copper BNC joints, and 24/7 CCTV surveillance monitors.
  - Directly updated all 10 products in the live Supabase PostgreSQL database (`product_images` table) with multiple photo angles and descriptive alt texts.
  - Synchronized `src/server/db/mock-db.ts` to guarantee 100% parity across live Supabase and mock stores.
- **Admin Command Center Image & Asset Manager (`ProductImageManagerModal`)**:
  - Enhanced `/admin/products` catalog table with live photo thumbnails and interactive image count badges.
  - Built an interactive management modal allowing administrators to:
    - View all images in the database with primary cover photo indicators.
    - Paste any image URL from the web/CDN with real-time live preview before saving to Supabase.
    - Upload image files from local devices via dedicated `/api/admin/upload-image` endpoint.
    - Choose from curated high-resolution hardware photography presets with one click.
    - Promote any photo to primary cover image or delete obsolete images with atomic database synchronization.
- **Storefront Image & Gallery Upgrades**:
  - Built client-side `ProductGallery` component (`src/components/storefront/ProductGallery.tsx`) with interactive multi-angle photo switching and hover inspection.
  - Configured `next.config.ts` remote patterns to allow all HTTPS remote image sources (`{ protocol: 'https', hostname: '**' }`).
  - Enforced `referrerPolicy="no-referrer"` across all `<Image>` tags.
- **Pure Typography Category Presentation**:
  - Upgraded homepage (`src/app/page.tsx`) and catalog (`src/app/products/page.tsx`) to present categories purely by their database names, descriptions, subcategory tags, and statutory HSN/GST tax classifications. Zero SVG dependencies.
- **Regression Verification**:
  - Static typecheck: 0 errors (`npx tsc --noEmit`).
  - Master loopback test: 28/28 assertions passed (100%) against live Supabase.
  - Next.js build compilation: Succeeded (`compile_applet`).

---

## [1.3.0] - 2026-09-26

### Added (Google AI Studio Migration, In-Memory Dual-Mode Database Adapter — ADR-020)
- **AI Studio In-Memory Database Adapter (`src/server/db/mock-db.ts`)**:
  - Implemented complete in-memory mock repository (`MockDataStore`) pre-seeded with CCTV catalog records (CP Plus cameras, Hikvision DVRs, Seagate SkyHawk HDDs, D-Link Cat6 spools, SMPS units), B2B customer accounts, admin accounts, and order history.
  - Provided full Prisma ORM API simulation with relational includes, nested creates (`items.create`, `shippingAddress.create`), transactions (`$transaction`), and raw SQL stubs (`$queryRaw`, `$executeRaw`).
  - Implemented high-precision `Decimal` simulation ensuring zero floating-point arithmetic drift in 18% GST and INR calculations.
- **Dual-Mode Prisma Proxy (`src/server/db/index.ts`)**:
  - Exported typed `PrismaClient` proxy wrapper routing queries to live PostgreSQL when `DATABASE_URL` is set, with seamless fallback to in-memory store if the remote database is unreachable.
- **Next.js Standalone Build & Port Configuration (`next.config.ts` & `package.json`)**:
  - Added `output: 'standalone'` to `next.config.ts`.
  - Configured dev server to bind to `0.0.0.0:3000` via `"dev": "next dev -p 3000 -H 0.0.0.0"`.
- **Metadata Registration (`metadata.json`)**:
  - Initialized application metadata registering Patel Networks commercial surveillance distribution platform.
- **Regression Verification**:
  - Verified 100% pass on `npx tsc --noEmit`.
  - Verified 100% pass on `scripts/comprehensive_loopback_test.ts` (all 12 phases, 24 endpoints).
  - Verified 100% pass on `scripts/master_loopback_test.ts` (28/28 assertions).

---

## [1.2.0] - 2026-09-26

### Added (Admin Command Center Authentication & Edge Middleware Security — ADR-019)
- **Admin Command Center Authentication Service (`src/server/services/admin-auth.service.ts`)**:
  - Isolated HTTP-only session cookie (`pn_admin_session`) separate from customer OTP sessions (`pn_session`).
  - Signed 256-bit JWT (HS256) carrying admin identity, email, full name, and role (`SUPER_ADMIN`, `ADMIN`).
  - Secure credential verification supporting database users and environment variable defaults (`superadmin@patelnetworks.in` / `patel@admin2026`).
- **Command Center Login Portal (`src/app/admin/login/page.tsx`)**:
  - Dark-mode surveillance aesthetic matching brand guidelines with 256-bit encryption badge.
  - Secret access key input with show/hide password toggle.
  - One-click demo credentials autofill button for instant operator login during development/testing.
- **Next.js Edge Middleware Route Guards (`src/middleware.ts`)**:
  - Middleware intercepting all `/admin/*` routes to enforce valid `pn_admin_session` JWT verification.
  - Automatic HTTP 307 redirect to `/admin/login?next=[path]` for unauthenticated requests.
  - Customer account route protection redirecting to `/account/login` when `pn_session` is missing.
- **Admin Header Session Integration (`src/components/admin/AdminHeader.tsx`)**:
  - Live session display with operator initials, full name, email, and role badge.
  - Interactive "Sign Out" button executing `adminLogoutAction` and cookie invalidation.
- **Regression Test Expansion (`scripts/comprehensive_loopback_test.ts` & `scripts/master_loopback_test.ts`)**:
  - Added assertions for admin credential rejection and successful superadmin JWT authentication.
  - Updated route assertions verifying HTTP 200 on `/admin/login` and HTTP 307 on protected `/admin/*` routes.

---

## [1.1.0] - 2026-09-26

### Added (UI/UX Polish, Custom 404 & Error Boundaries, Commercial CSV Export Engine — ADR-018)
- **Custom Branded Error & 404 Pages**:
  - `src/app/not-found.tsx`: Sleek dark-mode "Surveillance Feed Lost" 404 page with radar pulse animation, quick recovery navigation (Central Hub, Products Catalog, CCTV Kit Builder, Order Tracking), and instant WhatsApp Commercial Support escalation.
  - `src/app/error.tsx`: Client-side error boundary with automatic exception logging, session preservation, error digest inspection, and retry/home recovery buttons.
- **Commercial CSV Export Engine**:
  - `OrderFulfillmentConsole.tsx`: Added one-click "Export CSV" feature to download filtered orders including Order ID, date, customer recipient, phone, GSTIN, total INR, 18% GST amount, status, payment method, and carrier AWB numbers.
  - `CommercialReportsConsole.tsx`: Added statutory "Export CSV" feature on GSTR-1 Tax card, generating immediate schedules for Intra-State CGST (9%) + SGST (9%) and Inter-State IGST (18%) returns.
- **Enhanced Live Search Autocomplete UX (`Header.tsx`)**:
  - Added `useRef` click-outside dismiss listeners and `Escape` key handlers.
  - Added instant one-click clear button (`X`) to reset query and hide suggestions.
  - Extended live autocomplete dropdown into the mobile navigation drawer for responsive parity across phones and tablets.
- **Resilient Automated Loopback Regression (`scripts/comprehensive_loopback_test.ts`)**:
  - Expanded test suite to 36 automated assertions across 11 domains.
  - Added cloud Supabase pooler retry backoffs to prevent false negatives on transient network reconnects.
  - Added test assertion for custom branded 404 error response (`/non-existent-feed-404`), verifying 24 platform routes in total.
  - Achieved **100% pass rate (36/36 assertions)**.
- **Review, Testing & Follow-Up Guide (`review-test-followup.md`)**:
  - Authored comprehensive operational and deployment guide detailing user action items for production Supabase, Razorpay, Shiprocket/Delhivery, Meta WhatsApp Cloud API, and Fast2SMS credentials.
  - Provided 12-step manual smoke testing checklist and monthly GSTR-1 tax audit workflows.

---

## [1.0.0] - 2026-09-26

### Added (Commercial Launch — Governance, Policy Engine, Admin CRM & Tax Analytics)
- **Public Corporate & Policy Infrastructure (Section 12 Master Plan — ADR-016)**:
  - `/shipping-policy`: Comprehensive dispatch SLA guidelines, 6-digit Indian postal zone breakdowns, same-day cutoff at 4:00 PM IST, and selective COD air-cargo exclusions.
  - `/return-policy`: Commercial RMA guidelines, 7-day Dead On Arrival (DOA) replacement guarantee, authorized brand warranties (CP Plus, Hikvision, Dahua, Western Digital), and hardware serial invoice verification.
  - `/privacy-policy`: Compliance with Indian Information Technology Act 2000, SPDI rules, 15-character GSTIN storage, and Razorpay PCI-DSS Level 1 encryption.
  - `/terms`: Terms of sale, statutory 18% GST invoicing liabilities, title transfer, and Surat, Gujarat jurisdiction.
  - `/contact`: Interactive commercial consultation desk, wholesale quotation form (`submitB2BQuoteInquiryAction`), central Surat warehouse coordinates, direct WhatsApp launcher, and official bank transfer (NEFT/RTGS) details.
  - `/about`: Company history, authorized distributor alliances, and quality control procedures.
  - `/faq`: Categorized interactive accordion covering HD Analog vs IP Network cameras, H.265 storage calculation formulas, and B2B Input Tax Credit claims.
- **Admin Customer & Contractor CRM Directory (`/admin/customers` — ADR-017)**:
  - Backend service `getAdminCustomersList`: Aggregates customer profiles, user mobile numbers, total orders placed, lifetime spend, default shipping cities, and B2B credentials (`companyName`, `gstin`, `isB2BVerified`).
  - Interactive table `CustomerDirectoryTable.tsx` with search by customer, phone, company, or GSTIN, filter chips (All Accounts, B2B Contractors, Retail Buyers), and 1-click WhatsApp customer support links.
- **Admin Commercial Reports & Accounting Analytics (`/admin/reports` — ADR-017)**:
  - Backend service `getAdminCommercialReports`: Computes gross revenue (GMV), total orders, average order value (AOV), GSTR-1 tax reconciliation (intra-state CGST 9% + SGST 9% vs inter-state IGST 18%), and live warehouse inventory capital asset valuations.
  - Visual reporting dashboard `CommercialReportsConsole.tsx` with payment channel distribution (Razorpay prepaid vs COD) and 30-day daily sales velocity bars.
- **Storefront UI/UX Enhancements (Header Autocomplete & Mobile Sticky Bar)**:
  - `Header.tsx`: Added debounced (200ms) live search autocomplete dropdown powered by `searchProductsQuick` returning instant camera/DVR suggestions with brand tags, model numbers, and INR prices.
  - `DynamicVariantSelector.tsx`: Integrated mobile-optimized sticky bottom action bar displaying the selected variant, price inclusive of 18% GST, and instant Add to Cart button.
- **Zero-`any` Strict TypeScript Audit (ADR-008)**:
  - Eliminated remaining `any` types across `whatsapp.service.ts`, `DynamicVariantSelector.tsx`, `ProductCard.tsx`, `OrderFulfillmentConsole.tsx`, and `checkout.actions.ts`.
  - Replaced ad-hoc error casts with safe `unknown` error narrowing.
- **Comprehensive Loopback Regression Suite (`scripts/comprehensive_loopback_test.ts`)**:
  - Automated 35-point end-to-end regression covering all 11 testing domains and validating HTTP 200/307 status codes across all 23 platform endpoints.
  - 100% pass rate.

---

## [0.9.0] - 2026-09-26

### Added (Phase 8 — Production Hardening, Sitemaps, SEO JSON-LD & Master Loopback Suite)
- **Dynamic XML Sitemap Generator (`src/app/sitemap.ts` - ADR-015)**:
  - Generates standard XML sitemaps querying live products and categories from database with accurate priority, lastmod, and changefreq tags.
- **Search Engine Crawling Policies (`src/app/robots.ts` - ADR-015)**:
  - Allows public crawling of catalog, kit builder, and homepage while strictly protecting `/admin`, `/account`, `/checkout`, and `/api/*`.
- **Google Search Rich Snippets (JSON-LD Schemas - ADR-015)**:
  - Injected `Product`, `AggregateOffer` (low/high prices in INR, in-stock availability), and `BreadcrumbList` structured data into PDP ([ProductDetailPage.tsx](file:///d:/work/megatech/patelnetworks/src/app/products/[slug]/page.tsx)).
- **Master Loopback Automated Regression Suite (`scripts/master_loopback_test.ts` - ADR-015)**:
  - 25-point comprehensive end-to-end regression covering catalog taxonomy, pincode routing, GST math, B2B order creation, carrier AWB booking, WhatsApp lifecycle alerts, admin dashboard telemetry, and hardware serial tracking.
  - Achieved **100% pass rate (25/25 assertions)**.
- **Cloud Database Latency Optimization**:
  - Configured `{ maxWait: 15000, timeout: 30000 }` on `prisma.$transaction` in `adjustSkuStock`, eliminating cross-region latency timeouts.
- **Storefront & Admin UI/UX Polish**:
  - Integrated direct Operations Portal administrative link in storefront footer.

---

## [0.8.0] - 2026-09-26


### Added (Phase 7 — Admin Operations Portal, SKU Inventory Adjustments & Hardware Serial Tracking)
- **Executive Operations Dashboard (`/admin` - ADR-014)**:
  - Real-time aggregation of Gross Merchandise Value (GMV), 18% GST collections, active pipeline orders, and completed deliveries via `getAdminDashboardMetrics`.
  - Payment channel telemetry displaying Razorpay prepaid vs Cash on Delivery volume and value distribution.
  - Critical low-stock alert monitoring for SKUs falling below their minimum warehouse threshold (`currentStock - reservedStock ≤ lowStockThreshold`).
  - Recent orders pipeline data table with quick fulfillment links.
- **Order Fulfillment & Dispatch Console (`/admin/orders` - ADR-014)**:
  - Interactive search filtering across order number, customer recipient, phone, and carrier AWB.
  - Order status filter tabs (`PENDING_PAYMENT`, `COD_PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
  - 1-Click logistics dispatch booking generating real Shiprocket/Delhivery AWBs.
  - Controlled order state machine advancement buttons with immediate Server Action execution.
  - Quick action to view and print official 18% GST Tax Invoices.
- **Hardware Serial Number Management (Warranty & RMA Tracking - ADR-014)**:
  - Integrated serial number editor on order items allowing warehouse packagers to scan or record individual hardware serial numbers prior to dispatch.
  - Optimistic UI persistence via `saveSerialNumbersAction` updating `OrderItem.serialNumbers` array in PostgreSQL.
- **SKU Inventory & Concurrency-Safe Stock Adjustments (`/admin/inventory` - ADR-014)**:
  - Dense inventory matrix detailing SKU Code, Product, Variant, Brand, Physical Stock, Locked Order Reservations, Net Available Stock, and Min Threshold.
  - Stock Adjustment modal supporting reasons: `PURCHASE_RECEIPT` (PO Arrival), `MANUAL_ADJUSTMENT` (Audit Count), `DAMAGED_WRITE_OFF` (Defective), and `RETURN_RESTOCK` (RMA/Customer Return).
  - Concurrency-safe Prisma interactive transaction recording immutable `InventoryMovement` entries.
- **Selective Cash on Delivery Control Panel (`/admin/settings/cod` - ADR-004)**:
  - Centralized policy dashboard detailing the ₹15,000 order value ceiling and remote air-cargo postal circle boundaries.
  - Per-product COD eligibility toggle list with instant database persistence via `toggleProductCodAction`.
- **Admin Layout & Navigation Architecture**:
  - `AdminSidebar.tsx`: Fixed enterprise navigation with live node indicators and quick links.
  - `AdminHeader.tsx`: Location identity, Surat Hub node status, GSTIN badge, and administrative profile.
  - `AdminLayout.tsx`: Deep dark slate/navy theme adhering to modern enterprise design principles.
- **Automated Verification Suite (`scripts/verify_phase7.ts`)**:
  - 15 automated test assertions covering metrics aggregation, order search, COD toggles, stock adjustments, movement audits, and hardware serial tracking with 100% pass rate.


### Added (Phase 6 — WhatsApp Business API & Real-Time Lifecycle Notifications)
- **WhatsApp Cloud API Service (`src/server/services/whatsapp.service.ts` - ADR-013)**:
  - Dual-mode Meta Graph API client supporting direct cloud dispatch (`POST /v20.0/${PHONE_NUMBER_ID}/messages`) when live credentials are set, and developer simulation mode when placeholder keys are detected.
  - Indian mobile number normalization (`91XXXXXXXXXX`).
  - Standard Meta HSM template payload formatting with dynamic body parameters and dynamic CTA button URLs.
  - Formatted terminal notification cards and persistent DB logging in `audit_logs` for every outbound notification.
- **Event-Driven E-Commerce Notification Hooks**:
  - `sendOrderConfirmationWhatsApp`: Triggered upon online payment capture (via webhook / client confirmation) and COD checkout placement, providing total INR amount, line items summary, and direct link to GST Tax Invoice.
  - `sendShipmentDispatchedWhatsApp`: Triggered upon AWB generation and order dispatch, delivering carrier partner name, tracking number, and live tracking link.
  - `sendOutForDeliveryWhatsApp`: Triggered when courier scans consignment as out for delivery.
  - `sendOrderDeliveredWhatsApp`: Triggered upon delivery confirmation.
  - `sendB2BQuoteInquiryWhatsApp`: Dispatches immediate commercial quote inquiry confirmations.
- **Meta WhatsApp Webhook Route (`src/app/api/webhooks/whatsapp` - ADR-013)**:
  - `GET`: Handles Meta Webhook verification handshake with `hub.verify_token` and `hub.challenge` response.
  - `POST`: Processes delivery status updates (`sent`, `delivered`, `read`, `failed`) and inbound customer replies, storing audit entries in database.
- **Storefront Customer & Contractor UI Components**:
  - `WhatsAppSupportWidget.tsx`: Floating interactive WhatsApp launcher in bottom-right corner of entire application with quick-prompt chips ("Track My Order", "B2B Contractor Pricing", "CCTV Architecture Advice", "Warranty & Support Desk") and custom inquiry composer launching direct WhatsApp chats.
  - `B2BQuoteModal.tsx`: Project bulk quotation modal with quantity selector, company name, and project scope notes.
  - `B2BContractorCallout.tsx`: Embedded on PDP ([DynamicVariantSelector.tsx](file:///d:/work/megatech/patelnetworks/src/components/storefront/DynamicVariantSelector.tsx)) allowing security installers to request wholesale project pricing.
- **Automated Verification Suite (`scripts/verify_phase6.ts`)**:
  - Verified phone normalization, Order Confirmation, Shipment Dispatched, Out for Delivery, and Delivered alerts.
  - Verified B2B contractor quote inquiry submission and database audit records.
  - Verified Meta GET handshake challenge and POST status callbacks with 100% pass rate.

---

## [0.6.0] - 2026-09-25

### Added (Phase 5 — Shipping Logistics, Carrier Integration & Pincode Intelligence)
- **Indian Postal Code & Geo-Logistics Engine (`src/lib/pincodes.ts` - ADR-012)**:
  - 6-digit Indian PIN prefix matching across Intra-State (Surat Hub), Metro (Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata), Regional, and Special Logistics Zones (North East, J&K, Andaman).
  - Accurate transit SLA calculation with business-day projection excluding Sundays and late-evening cutoff handling.
  - Granular Cash on Delivery restriction detection: special air cargo zones automatically flagged as prepaid-only.
  - Zero-dependency postal circle resolver fallback for all 19,000+ Indian PIN codes.
- **Enterprise Shipping Service (`src/server/services/shipping.service.ts`)**:
  - Dual-mode carrier gateway: seamlessly switches between live Shiprocket REST APIs (`/orders/create/adhoc`, `/couriers/assign/awb`, `/auth/login`) and senior test simulation mode with deterministic AWB generation (`DELH...`, `BLUD...`).
  - Automated AWB and `Shipment` record generation upon order payment or confirmation.
  - Gross and volumetric parcel weight calculation tailored for CCTV cameras, NVRs, and Cat6 spool drums.
  - Full tracking state machine mapping: `MANIFESTED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RTO_INITIATED`, `RTO_DELIVERED`.
- **Carrier Tracking Webhook Route (`POST /api/webhooks/shipping` - ADR-012)**:
  - Normalized payload handler compatible with Shiprocket, Delhivery, and custom courier webhook schemas.
  - Concurrency-safe event deduplication via unique `eventId` indexing.
  - Automatic Order state synchronization: transitions order to `SHIPPED` (triggering physical stock decrement and `MovementReason.ORDER_DISPATCHED`), `OUT_FOR_DELIVERY`, and `DELIVERED` (auto-marking COD payments as `SUCCESS`).
- **Storefront Shipping Components & UI Enhancements**:
  - `PincodeChecker.tsx`: Interactive 6-digit postal checker with estimated delivery date badge, COD indicator, and carrier partner display; embedded on PDP (`DynamicVariantSelector.tsx`).
  - `OrderTrackingTimeline.tsx`: 5-Stage visual progress stepper with active pulse animations, courier partner details, AWB copy tool, direct tracking link, chronological scan history, and test simulation controls for staff/evaluator testing.
  - `CheckoutPage.tsx`: Real-time pincode validation under address form, delivery SLA display, and dynamic Cash on Delivery disabling if destination PIN is in a restricted air cargo zone.
  - `OrderSuccessPage.tsx`: Auto-manifests shipment and renders live `OrderTrackingTimeline`.
  - `AccountPortalClient.tsx`: Added direct "Track" action link next to each order for instant tracking visibility.
- **Automated Verification Suite (`scripts/verify_phase5.ts`)**:
  - Validated 11 Indian postal codes across all 4 zones, SLAs, and COD restrictions.
  - Verified order creation, payment capture, AWB generation, and auto-transition to `PACKED`.
  - Verified tracking webhook progression through `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, physical inventory decrement, and duplicate event deduplication with 100% pass rate.

---

## [0.5.0] - 2026-09-25

### Added (Phase 4 — Customer Authentication, Phone OTP Login & Account Portal)
- **Auth Service & Indian Mobile Normalization (`src/server/services/auth.service.ts` - ADR-003, ADR-011)**:
  - Phone normalization to standard Indian E.164 format (`+91[6-9]\d{9}`).
  - Rate-limited 6-digit OTP generation (maximum 3 requests per 10 minutes) with 5-minute database expiry.
  - Dual-mode SMS client: Auto-detects placeholder API keys (`SMS_GATEWAY_API_KEY`) and operates in sandbox mode logging test OTPs to console, with zero-code switchover to Fast2SMS/MSG91 endpoints.
  - Customer auto-provisioning: Automatically provisions `User` (role: `CUSTOMER`) and linked `Customer` record on first login.
  - Edge-compatible JWT session management using `jose` with signed 7-day HTTP-only secure cookies (`pn_session`).
  - Active guest cart auto-association upon login.
- **Auth Server Actions (`src/app/actions/auth.actions.ts`)**:
  - `sendOtpAction`, `verifyOtpAction`, `logoutAction`, `getCurrentUserAction`.
  - `updateProfileAction`: Updates legal entity name and 15-character Indian GSTIN for B2B input tax credit.
  - `saveAddressAction` & `deleteAddressAction`: Manages customer address book with default selection.
- **Phone OTP Customer Login Page (`/account/login` & `/login`)**:
  - Modern 2-step passwordless login UI with 10-digit validation.
  - Automatic 30-second resend countdown timer.
  - Developer sandbox banner with 1-click test OTP auto-fill in mock mode.
  - Full redirect parameter support (e.g. `?redirect=/checkout`).
- **Comprehensive Customer Account Portal (`/account`)**:
  - Protected server page verifying JWT session with automatic redirect to login for unauthenticated visitors.
  - Profile Overview Card with customer name, phone number, and B2B Verified badge.
  - **Orders Tab**: Displays full order history with color-coded status badges, line items preview, and 1-click links to GST Tax Invoices.
  - **Delivery Addresses Tab**: Interactive address cards, default dispatch indicator, and modal for adding new addresses with Indian PIN code checks.
  - **B2B Tax Profile Tab**: Enables contractors to configure their registered company name and GSTIN once for automatic reuse across all future checkouts.
- **Storefront Auth Integration**:
  - `Header.tsx`: Dynamically detects logged-in customer session and displays personalized greeting (`Hi, [Name]`) and direct account links.
  - `CheckoutPage.tsx`: Automatically pre-fills recipient name, mobile number, saved delivery address, and B2B GSTIN profile for authenticated customers.
- **Automated Verification Suite (`scripts/verify_phase4.ts`)**:
  - End-to-end verification covering phone normalization, OTP dispatch, database record validation, invalid OTP rejection, customer provisioning, address creation, B2B tax profile updates, and order relation queries with 100% pass rate.

---

## [0.4.0] - 2026-09-25

### Added (Phase 3 — Cart, Checkout, Razorpay & Concurrency-Safe Orders)
- **High-Performance Cart Service (`src/server/services/cart.service.ts`)**:
  - Anonymous session cookie (`pn_cart_id`) linked to persistent customer cart records.
  - Live server-side price revalidation against database SKUs on every retrieval (preventing client-side price tampering).
  - Real-time stock availability thresholds, 18% GST taxable base calculation, and cart-level Cash on Delivery eligibility enforcement.
- **Server Actions for Cart & Checkout (`cart.actions.ts`, `checkout.actions.ts`)**:
  - `addToCartAction`, `updateCartItemAction`, `removeFromCartAction`, `getCartAction`.
  - `processCheckoutAction`: Robust Zod schema validation for Indian 10-digit mobile numbers, 6-digit PIN codes, and 15-character Indian GSTIN format (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
- **Storefront Cart Page (`/cart`)**:
  - Clean responsive grid layout with line item management, quantity steppers, and single-click removal.
  - Sticky order summary calculating Taxable Base + 18% GST (CGST/SGST breakdown) + Free Shipping.
  - B2B Input Tax Credit callout highlighting claimable GST amount.
  - Automatic COD warning banner if any cart item disallows cash on delivery.
- **Storefront Interactivity Updates**:
  - Wired `DynamicVariantSelector.tsx` with asynchronous `addToCartAction` and 1-Click `handleBuyNow`.
  - Updated `Header.tsx` to display dynamic, live cart item count listening for `'cart-updated'` events without page reload.
  - Wired `KitBuilderPage.tsx` step 5 to batch-add DVR, camera channels, and surveillance hard drive directly into customer cart.
- **Production-Grade Checkout Page (`/checkout`)**:
  - Recipient and shipping address form with Indian state selection and PIN validation.
  - B2B GST Invoicing toggle allowing customers to provide Legal Company Name and 15-character GSTIN.
  - Payment method selector: Razorpay Online (Instant confirmation) vs. Cash on Delivery (enforced by cart eligibility).
  - Sticky checkout order summary and direct manufacturer warranty trust badges.
- **Dual-Mode Razorpay Gateway & Test Simulator (ADR-007 & ADR-010)**:
  - Automatic detection of placeholder keys (`rzp_test_placeholder`) activating an interactive test payment modal.
  - Seamless switchover to live Razorpay checkout script when merchant keys are configured in `.env`.
- **Order State Machine & Concurrency-Safe Reservation (`src/server/services/order.service.ts`)**:
  - ACID transaction using PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) preventing inventory overselling.
  - Atomic reservation of stock (`ORDER_RESERVED`) in `inventory` and movement audit logging.
  - Strict status transitions: `PENDING_PAYMENT` / `COD_PENDING` ➔ `PAID` ➔ `CONFIRMED` ➔ `SHIPPED`.
- **Order Success & GST Tax Invoice View (`/order-success/[orderNumber]`)**:
  - Confirmation banner, courier tracking progress bar, and comprehensive Indian GST Tax Invoice.
  - Detailed HSN breakdown (8525 / 8471 / 8544), CGST (9%) + SGST (9%), customer GSTIN, and reverse charge declaration.
  - Printable `@media print` layout with `PrintInvoiceButton` client component.
- **Idempotent Razorpay Webhook Handler (`/api/webhooks/razorpay`)**:
  - HMAC SHA-256 webhook signature verification.
  - Deduplicated processing for `order.paid` and `payment.captured` preventing redundant status transitions.
- **End-to-End Automated Verification (`scripts/verify_phase3.ts`)**:
  - Automated test script validating cart creation, inventory reservation, order generation, simulated payment completion, order query with full relation graph, and webhook idempotency.

---

## [0.3.0] - 2026-09-25

### Added (Phase 2 — Storefront Browsing, Discovery & Kit Builder)
- **Storefront Header & Navigation**:
  - Live search bar with debounced query submission.
  - Value proposition header: Genuine Hikvision/CP Plus/Dahua, 18% GST Input Credit, Pan-India Dispatch.
  - Quick action links for Custom Kit Builder, Customer Account, and Cart.
- **Modern Homepage (`/`)**:
  - High-impact surveillance hero section with animated status tags and direct CTAs.
  - Interactive product category tiles with clean iconography for Analog, IP, Recorders, Storage, Cabling, and Power accessories.
  - Featured products grid backed by live Supabase PostgreSQL data with real-time stock counters.
  - Interactive Custom CCTV Kit Builder spotlight banner.
  - Authorized brand marquee for CP Plus, Hikvision, Dahua, D-Link, Seagate, Optilink.
- **Faceted Product Catalog (`/products`)**:
  - Category and brand sidebar filtering with real-time product counts.
  - In-stock only filter toggle.
  - Dynamic result counters and responsive grid layout.
- **Product Detail Page (`/products/[slug]`)**:
  - Dynamic variant selector client component cycling through 2MP, 4MP, 8MP, and 16MP variants.
  - Instant client-side state recalculation for price, MRP, discount percentage, SKU code, and stock thresholds.
  - Live GST tax breakdown (Taxable base + 18% GST calculation).
  - Technical engineering specification sheet and B2B wholesale inquiry contact banner.
- **Interactive 5-Step Custom CCTV Kit Builder (`/kit-builder` - ADR-006)**:
  - Step 1: DVR/NVR Channel selection (4-CH, 8-CH).
  - Step 2: Camera allocation with channel capacity validation (mix & match Dome and Bullet cameras with resolution tiers).
  - Step 3: 24/7 Surveillance Hard Drive selection with recording retention day estimates.
  - Step 4: Cable selection with auto-paired SMPS power supply and BNC/DC connector pack.
  - Step 5: Final kit summary applying automated 5% Combo Package Discount.
  - Dual action CTAs: Sticky summary card and 1-Click "Add Complete Kit to Cart".
- **Visual Browser Verification**:
  - Automated browser subagent walkthrough captured and verified across all pages.

## [0.2.0] - 2026-09-25

### Added
- **Architectural & Business Decision Records (`decisions.md`)**:
  - Established [decisions.md](file:///d:/work/megatech/patelnetworks/decisions.md) as the single source of truth for all project decisions.
  - **ADR-001**: Accepted Unified Next.js Fullstack Architecture (App Router, Server Actions, Route Handlers, PostgreSQL + Prisma).
  - **ADR-002**: Accepted Hybrid B2C & B2B Billing with Indian GSTIN Input Tax Credit capture.
  - **ADR-003**: Accepted Phone Number + 6-digit SMS OTP (MSG91 / Fast2SMS / Firebase) as primary customer authentication.
  - **ADR-004**: Accepted Selective Cash on Delivery (COD) controlled per-SKU via the Admin Panel.
  - **ADR-005**: Accepted Multi-Attribute Flexible JSONB Product Variants & SKUs.
  - **ADR-006**: Accepted Interactive Custom CCTV Kit / Combo Builder (Recorder ➔ Cameras ➔ Storage ➔ Accessories ➔ Bundle discount).
  - **ADR-007**: Accepted Integration Readiness & Placeholder Fallback Architecture for Razorpay and WhatsApp Business API.
  - **ADR-008**: Accepted Senior Lead Production-Grade Engineering Standard & Enterprise Principles.
  - **ADR-009**: Accepted Managed Cloud Database on Supabase PostgreSQL (Connection Pooling & Direct URL).
- **Schema & Architecture Synchronization**:
  - Updated [technical-dcoumentation.md](file:///d:/work/megatech/patelnetworks/technical-dcoumentation.md) with WhatsApp notification service, Razorpay mock mode, environment variable specifications (`.env.example`), and RBAC guards.
  - Updated [business-documentation.md](file:///d:/work/megatech/patelnetworks/business-documentation.md) with WhatsApp transactional message templates (OTP, Order Placed, COD Verification, Shipped with AWB, Out for Delivery, Refund).
  - Updated [readme.md](file:///d:/work/megatech/patelnetworks/readme.md) directory map, tech stack table, and quick start commands.

---

## [0.1.0] - 2026-09-25

### Added
- Ingested and parsed `CCTV_Security_Ecommerce_Website_Plan.docx`.
- Ingested and analyzed the 8-phase implementation roadmap (`Phases 0 through 7`).
- Initial creation of `readme.md`, `business-documentation.md`, `technical-dcoumentation.md`, and `changelog.md`.
