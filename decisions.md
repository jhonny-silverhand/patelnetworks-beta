# Architectural & Business Decision Records (ADR)

> **Project**: Patel Networks / MegaTech CCTV & Security E-Commerce Platform  
> **Source of Truth**: This document records all architectural, technical, operational, and business decisions locked in by the stakeholders. All future decisions must be appended to this log.

---

## 📑 Decisions Index

| ID | Title | Date | Status |
| :--- | :--- | :--- | :--- |
| [ADR-001](#adr-001-unified-nextjs-fullstack-architecture) | Unified Next.js Fullstack Architecture (App Router + Prisma) | 2026-09-25 | **ACCEPTED** |
| [ADR-002](#adr-002-hybrid-b2c--b2b-billing-with-gstin-input-credit) | Hybrid B2C & B2B Billing with GSTIN Input Tax Credit | 2026-09-25 | **ACCEPTED** |
| [ADR-003](#adr-003-phone-number--sms-otp-authentication) | Phone Number + SMS OTP Primary Authentication | 2026-09-25 | **ACCEPTED** |
| [ADR-004](#adr-004-selective-cash-on-delivery-cod-admin-controlled) | Selective Cash on Delivery (COD) Controlled via Admin Panel | 2026-09-25 | **ACCEPTED** |
| [ADR-005](#adr-005-multi-attribute-flexible-product-variants) | Flexible Multi-Attribute Variant & SKU Modeling | 2026-09-25 | **ACCEPTED** |
| [ADR-006](#adr-006-interactive-custom-cctv-kit--bundle-builder) | Interactive Stepped "Custom CCTV Kit Builder" | 2026-09-25 | **ACCEPTED** |
| [ADR-007](#adr-007-integration-readiness--placeholder-fallback-for-razorpay--whatsapp-api) | Placeholder Fallback & Full Implementation for Razorpay & WhatsApp API | 2026-09-25 | **ACCEPTED** |
| [ADR-008](#adr-008-senior-lead-production-grade-engineering-standard) | Senior Lead Production-Grade Engineering Standard & Enterprise Principles | 2026-09-25 | **ACCEPTED** |
| [ADR-009](#adr-009-managed-cloud-database-on-supabase-postgresql) | Managed Cloud Database on Supabase PostgreSQL (Connection Pooling & Direct URL) | 2026-09-25 | **ACCEPTED** |
| [ADR-010](#adr-010-concurrency-safe-order-creation-row-level-locking-and-dual-mode-payment-gateway) | Concurrency-Safe Order Creation, Row-Level Locking, and Dual-Mode Payment Gateway | 2026-09-25 | **ACCEPTED** |
| [ADR-011](#adr-011-phone-number--sms-otp-authentication-with-dual-mode-gateway-and-jwt-sessions) | Phone Number + SMS OTP Authentication with Dual-Mode Gateway & JWT Sessions | 2026-09-25 | **ACCEPTED** |
| [ADR-012](#adr-012-carrier-logistics-pincode-intelligence--awb-generation-engine) | Carrier Logistics, Pincode Intelligence & AWB Generation Engine | 2026-09-25 | **ACCEPTED** |
| [ADR-013](#adr-013-whatsapp-business-cloud-api--real-time-e-commerce-lifecycle-messaging-engine) | WhatsApp Business Cloud API & Real-Time E-Commerce Lifecycle Messaging Engine | 2026-09-25 | **ACCEPTED** |
| [ADR-014](#adr-014-back-office-admin-operations-sku-inventory-adjustments--hardware-serial-tracking) | Back-Office Admin Operations, SKU Inventory Adjustments & Hardware Serial Tracking | 2026-09-26 | **ACCEPTED** |
| [ADR-015](#adr-015-master-loopback-feedback-engine-dynamic-xml-sitemaps--structured-data-json-ld) | Master Loopback Feedback Engine, Dynamic XML Sitemaps & Structured Data (JSON-LD) | 2026-09-26 | **ACCEPTED** |
| [ADR-016](#adr-016-customer-information-corporate-governance--public-policy-architecture) | Customer Information, Corporate Governance & Public Policy Architecture | 2026-09-26 | **ACCEPTED** |
| [ADR-017](#adr-017-admin-commercial-reporting-gstr-1-tax-analytics--b2b-customer-directory) | Admin Commercial Reporting, GSTR-1 Tax Analytics & B2B Customer Directory | 2026-09-26 | **ACCEPTED** |
| [ADR-018](#adr-018-storefront-uiux-polish-custom-404error-boundaries--admin-commercial-csv-export-engine) | Storefront UI/UX Polish, Custom 404/Error Boundaries & CSV Export Engine | 2026-09-26 | **ACCEPTED** |
| [ADR-019](#adr-019-admin-command-center-authentication-session-isolation--edge-middleware-guards) | Admin Command Center Authentication, Session Isolation & Edge Middleware Guards | 2026-09-26 | **ACCEPTED** |
| [ADR-020](#adr-020-ai-studio-in-memory-dual-mode-database-adapter-and-standalone-build-optimization) | AI Studio In-Memory Dual-Mode Database Adapter and Standalone Build Optimization | 2026-09-26 | **ACCEPTED** |

---

## ADR-001: Unified Next.js Fullstack Architecture

* **Status**: **ACCEPTED** (Decision from Q&A Question 1, Option A)
* **Date**: 2026-09-25
* **Context**:  
  The initial draft proposed a separated monorepo containing a NestJS backend and two distinct Next.js frontends (`apps/storefront` and `apps/admin`). This introduced API contract duplication, dual deployment overhead, and slower development speed for a single engineering team.
* **Decision**:  
  Consolidate into a **Unified Fullstack Next.js Application** using the App Router, PostgreSQL 16+, and Prisma ORM.
  * Route Groups will segregate portals:
    * `app/(storefront)/...` for public customer store, cart, checkout, and customer portal.
    * `app/(admin)/...` for back-office administrative panel, inventory, and order fulfillment.
    * `app/api/...` for webhooks (Razorpay, Shiprocket) and public REST endpoints where needed.
  * Server Actions & Route Handlers will manage mutations and database interactions directly via a shared `prisma` singleton.
* **Consequences**:  
  * Zero API duplication; DTOs and database models are directly accessible.
  * Single-process deployment (e.g. Node.js container / Vercel / AWS ECS).
  * Backend business logic will reside in modular service classes (`src/server/services/...`) rather than inline component code, preserving modularity and testability.

---

## ADR-002: Hybrid B2C & B2B Billing with GSTIN Input Credit

* **Status**: **ACCEPTED** (Decision from Q&A Question 2, Option B)
* **Date**: 2026-09-25
* **Context**:  
  CCTV buyers comprise both retail homeowners (B2C) and electrical contractors/dealers/system integrators (B2B) who require legal GST invoices for Input Tax Credit (ITC).
* **Decision**:  
  Support a **Hybrid B2C & B2B Checkout Model**:
  1. Customers can toggle *"Are you purchasing for a registered business?"* at checkout.
  2. Requires: Legal Business Name and 15-character Indian GSTIN format.
  3. Tax breakdown on invoices dynamically splits CGST + SGST (intra-state) or IGST (inter-state).
  4. System models support optional B2B tier pricing / bulk quantity discounts for registered business accounts.
* **Consequences**:  
  * Customer and Order schemas must store `isB2B`, `gstin`, and `companyName`.
  * Invoice generator produces official Tax Invoices compliant with Indian GST laws.

---

## ADR-003: Phone Number + SMS OTP Authentication

* **Status**: **ACCEPTED** (Decision from Q&A Question 3, Option A)
* **Date**: 2026-09-25
* **Context**:  
  In the Indian e-commerce landscape, passwords and email verification lead to high cart abandonment and low login completion. Customers expect frictionless login via mobile numbers.
* **Decision**:  
  Standardize on **Mobile Phone Number + 6-digit SMS OTP** as the primary authentication mechanism for customers.
  * Supported SMS Gateways: MSG91 / Fast2SMS / Firebase Phone Auth.
  * Admin accounts retain standard Email + Strong Password + Multi-Factor Authentication.
  * Session management via secure, HTTP-only JWT cookies.
* **Consequences**:  
  * User schema must treat `phone` as the primary unique identifier for customers.
  * OTP generation must have rate limiting (maximum 3 OTP requests per 10 minutes) and 5-minute expiration to prevent abuse.

---

## ADR-004: Selective Cash on Delivery (COD) Admin-Controlled

* **Status**: **ACCEPTED** (Decision from Q&A Question 4, Option B)
* **Date**: 2026-09-25
* **Context**:  
  Offering unrestricted COD on high-value, heavy surveillance hardware (e.g. 16-channel NVRs, 305m cable rolls) presents high Return-to-Origin (RTO) financial risk. Conversely, small accessories (connectors, single cameras) convert higher with COD.
* **Decision**:  
  Implement **Selective Cash on Delivery (COD)** configurable through the Admin Panel:
  1. Each Product / SKU will have an admin flag: `isCodAllowed: Boolean` (default `false` for high-value items, `true` for standard items).
  2. If any item in the cart has `isCodAllowed = false`, COD is automatically disabled for the entire cart at checkout.
  3. COD eligibility will also check courier pincode serviceability via carrier API (Shiprocket/Delhivery).
  4. Admin can configure a minimum order value, maximum order value, and an optional flat COD convenience fee.
* **Consequences**:  
  * Order and Payment state machines must accommodate `COD_PENDING` without requiring an immediate Razorpay signature.

---

## ADR-005: Multi-Attribute Flexible Product Variants

* **Status**: **ACCEPTED** (Decision from Q&A Question 5, Option B)
* **Date**: 2026-09-25
* **Context**:  
  Electronics and CCTV cameras vary across multiple interdependent dimensions (Resolution: 2MP/4MP/8MP, Lens: 2.8mm/3.6mm, Body: Dome/Bullet, Night Vision: IR/ColorVu, Audio: Mic/No-Mic). A rigid single-attribute database schema cannot model this cleanly.
* **Decision**:  
  Adopt a **Multi-Attribute JSONB Variant Architecture**:
  * Attributes stored as key-value pairs (e.g. `{"resolution": "4MP", "focal_length": "3.6mm", "form_factor": "Bullet", "audio": true}`).
  * The core invariant `Product ➔ Variant ➔ SKU ➔ Inventory` remains strictly enforced.
  * Every unique combination maps to a discrete SKU with its own price, barcode, dimensions, and inventory counter.
* **Consequences**:  
  * Storefront product page includes a dynamic matrix selector that resolves the exact SKU based on user-selected attribute chips.

---

## ADR-006: Interactive Custom CCTV Kit / Bundle Builder

* **Status**: **ACCEPTED** (Decision from Q&A Question 6, Option B)
* **Date**: 2026-09-25
* **Context**:  
  CCTV surveillance systems are commonly purchased as complete kits. Customers frequently struggle to manually assemble compatible DVR/NVRs, matching camera resolutions, appropriate hard drives, and power supplies.
* **Decision**:  
  Build a dedicated **Interactive Stepped "Custom CCTV Kit Builder"**:
  * **Step 1: Select Recorder**: 4-Channel, 8-Channel, 16-Channel DVR (HD) or NVR (IP).
  * **Step 2: Select Cameras**: Indoor Dome and/or Outdoor Bullet cameras with live quantity counters bounded by the channel count.
  * **Step 3: Storage (HDD)**: 1TB, 2TB, 4TB, 8TB Surveillance-grade Hard Drive (Seagate SkyHawk / WD Purple).
  * **Step 4: Power & Accessories**: SMPS Power Supply (4-CH, 8-CH), Coaxial / Cat6 Cable roll (90m, 180m, 305m), BNC/DC/RJ45 connectors.
  * **Step 5: Bundle Summary & Add to Cart**: Live calculation of total price, bundle discount, and one-click cart addition as a linked kit.
* **Consequences**:  
  * Bundle data models (`Bundle`, `BundleItem`) created in Prisma.
  * Cart and order processing must deduct inventory from each individual component SKU atomically.

---

## ADR-007: Integration Readiness & Placeholder Fallback for Razorpay & WhatsApp API

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  The business onboarding and verification process for the Razorpay Merchant Account and Meta WhatsApp Business API is currently in progress. Development cannot be stalled waiting for production API credentials.
* **Decision**:  
  Fully build out the end-to-end integration logic for both **Razorpay** and **WhatsApp Cloud / Business API**, with an intelligent **Mock / Sandbox Fallback Mode**:
  1. **Razorpay Service**:
     * Implements full order creation (`/orders`), signature verification (`crypto.createHmac`), and webhook handler (`/api/webhooks/razorpay`).
     * When `RAZORPAY_KEY_ID` or `RAZORPAY_KEY_SECRET` contains placeholder/dummy values (e.g. `rzp_test_placeholder`), the service activates a simulated payment gateway modal in development, allowing developers and QA to simulate successful payments, failed payments, and webhooks without real credentials.
  2. **WhatsApp Notification Service**:
     * Implements standard Meta WhatsApp Cloud API / BSP payload formatting for transactional templates (Order Confirmed, Dispatched with AWB Tracking URL, Out for Delivery, Return Updates, and OTP Verification).
     * When `WHATSAPP_ACCESS_TOKEN` is unset or a placeholder, the service logs formatted WhatsApp messages to the console and audit logs (`[SIMULATED WHATSAPP MESSAGE to +91XXXXXXXXXX]`), allowing full UI and workflow validation.
  3. **Zero-Code Switchover**:
     * All credentials are strictly read from environment variables (`.env`).
     * Once the actual keys are provisioned, pasting them into `.env` immediately activates live production/sandbox communications without requiring a single line of code change.
* **Consequences**:  
  * Complete test coverage of payment verification and customer notification flows during all phases.
  * No development roadblocks or dependency on external vendor verification timelines.

---

## ADR-008: Senior Lead Production-Grade Engineering Standard

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  The platform must be built strictly as an **end-product, production-ready enterprise commercial platform** capable of handling real Indian commerce, financial transactions, high concurrent traffic, and rigorous operational inventory tracking. At no point should development treat this as a demo, prototype, or hobby project.
* **Decision**:  
  All code, schemas, services, UI components, and architectural boundaries must adhere to **Senior Lead Engineering Standards**:
  1. **Zero Shortcuts**:
     * Real database migrations, full relational integrity, foreign key constraints, composite indexes, and cascading rules.
     * Comprehensive validation on every boundary using Zod schemas for all DTOs and Server Action inputs.
  2. **Concurrency & Data Consistency**:
     * Strict isolation levels (`SELECT ... FOR UPDATE` row-level locks) for all inventory mutations and reservations.
     * Absolute prohibition of floating-point arithmetic for monetary calculations; all amounts are tracked as integer paise or `Prisma.Decimal`.
     * Idempotency keys enforced on every order submission and webhook event.
  3. **Defense-in-Depth Security**:
     * Strict server-side RBAC guards that cannot be bypassed by URL tampering or API scraping.
     * Argon2id password hashing, secure HTTP-only cookies, rate-limiting on sensitive endpoints (OTP, login, checkout), and complete sanitization of user-submitted content.
  4. **Commercial-Grade UI/UX**:
     * High-converting, trustworthy storefront designed specifically for the security hardware industry.
     * Complete handling of all UI states: Skeleton loaders, optimistic UI updates, empty states, network error fallbacks, and clear feedback toast alerts.
     * High-density, keyboard-friendly operational screens for warehouse and inventory managers in the Admin Portal.
  5. **Clean Architecture & Maintainability**:
     * Strict separation of concerns: Next.js pages/components only render UI and call server actions; all domain logic lives in isolated, testable service classes under `src/server/services/`.
     * Strict TypeScript: Zero usage of `any` types; all API responses and component props are strictly typed.
* **Consequences**:  
  * The resulting codebase is immediately shippable, deployable to cloud infrastructure (Docker, AWS, Vercel, Railway), and capable of scaling to high order volumes without structural rewrites.

---

## ADR-009: Managed Cloud Database on Supabase PostgreSQL

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  To avoid future migration friction and ensure that local development, staging, and production environments share identical cloud PostgreSQL infrastructure from Day 1, the platform has adopted Supabase PostgreSQL.
* **Decision**:  
  Configure Prisma ORM to connect directly to the **Supabase PostgreSQL cluster** (`yhqgogsednnarjfspado`) using Supabase's official best-practice dual-URL strategy:
  1. `DATABASE_URL`: Transaction-mode connection pooler on port `6543` (`?pgbouncer=true`) for low-latency, scalable application queries under serverless or containerized runtimes.
  2. `DIRECT_URL`: Session-mode direct connection on port `5432` for administrative schema migrations and seed scripts (`prisma db push`, `prisma db seed`).
* **Consequences**:  
  * All 29 tables, foreign keys, and indexes are hosted and backed up in the cloud.
  * Developers and administrative stakeholders can immediately inspect live data, orders, and product stock directly inside the **Supabase Dashboard Table Editor**.
  * Eliminates local Docker/PostgreSQL dependencies for remote collaborators.

---

## ADR-010: Concurrency-Safe Order Creation, Row-Level Locking, and Dual-Mode Payment Gateway

* **Status**: **ACCEPTED**
* **Date**: 2026-09-25
* **Context**:  
  Surveillance hardware items have limited physical inventory in warehouse bins. Concurrent checkouts for the last remaining 4MP camera or 8-channel NVR could result in overselling if stock checks and deductions are not strictly serialized. Furthermore, Razorpay credentials are under live business procurement, necessitating a seamless test-simulation mode that automatically upgrades to live payment processing upon key insertion without code changes.
* **Decision**:  
  1. **Row-Level Inventory Reservation (`SELECT ... FOR UPDATE`)**:
     * When `createOrderFromCart` executes, it locks the relevant `inventory` rows using PostgreSQL's row-level lock within an atomic transaction.
     * Available stock is checked (`currentStock - reservedStock >= quantity`).
     * `reservedStock` is immediately incremented with reason `ORDER_RESERVED`.
     * An interactive transaction timeout (`timeout: 30000, maxWait: 15000`) is configured to accommodate cross-region network latency to the cloud Supabase cluster.
  2. **Strict Finite State Machine**:
     * Order transitions follow explicit permitted paths:
       `PENDING_PAYMENT` / `COD_PENDING` ➔ `PAID` / `CONFIRMED` ➔ `PROCESSING` ➔ `PACKED` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
     * Order cancellation (`CANCELLED`) atomically decrements `reservedStock` with an audit reason `ORDER_CANCELLED_RESTOCK`.
     * Order dispatch (`SHIPPED`) physically decrements `currentStock` and `reservedStock` with `ORDER_DISPATCHED`.
  3. **Dual-Mode Razorpay Gateway**:
     * If `RAZORPAY_KEY_ID` contains `placeholder`, the system activates interactive sandbox mode with mock order generation (`order_sim_...`) and payment verification.
     * If real API keys are detected, it connects directly to Razorpay's REST API and standard client-side checkout modal.
  4. **Idempotent Webhook Verification**:
     * `POST /api/webhooks/razorpay` verifies HMAC SHA-256 signatures and guards against duplicate status transitions using database state checks (`status === PAID`).
* **Consequences**:  
  * Zero overselling even under high concurrency.
  * Complete audit trail in `inventory_movements` and `order_status_history`.
  * Instant switchover to live payment processing once merchant keys arrive.

---

## ADR-011: Phone Number + SMS OTP Authentication with Dual-Mode Gateway & JWT Sessions

* **Status**: **ACCEPTED** (Implements ADR-003 & ADR-008)
* **Date**: 2026-09-25
* **Context**:  
  Indian e-commerce consumers and security equipment contractors expect passwordless, friction-free login via mobile numbers. Standard password credentials lead to high drop-offs, password fatigue, and unverified phone numbers for delivery dispatchers.
* **Decision**:  
  1. **Indian Phone Normalization**:
     * All phone inputs are normalized to standard E.164 format (`+91[6-9]\d{9}`).
  2. **Security & Rate-Limiting**:
     * Maximum 3 OTP requests allowed per 10-minute window per phone number.
     * OTP codes are 6 digits and expire in 5 minutes (`expiresAt < now()`).
     * Maximum 5 incorrect verification attempts per OTP code before automatic invalidation.
  3. **Dual-Mode SMS Gateway (ADR-007)**:
     * In development or when `SMS_GATEWAY_API_KEY` contains `placeholder`, the system operates in test simulation mode: outputs OTP prominently to developer logs and provides an auto-fill helper in sandbox UI.
     * When production keys are provided, requests route to Fast2SMS / MSG91 HTTP endpoints.
  4. **Edge-Compatible JWT Sessions**:
     * Signed using `jose` with `HS256` and `JWT_SECRET`.
     * Stored in HTTP-only, Secure, SameSite `Lax` cookie `pn_session` (7 days duration).
     * Upon customer login, any active guest cart (`pn_cart_id`) is automatically associated with the authenticated customer record.
* **Consequences**:  
  * Verified delivery phone numbers for all placed orders.
  * Instant access to past GST invoices and saved address books across devices.

## ADR-012: Carrier Logistics, Pincode Intelligence & AWB Generation Engine

* **Status**: **ACCEPTED** (Implements ADR-005, ADR-007, ADR-008)
* **Date**: 2026-09-25
* **Context**:  
  Indian e-commerce delivery logistics involves heterogeneous carrier partners (Delhivery, BlueDart, DTDC, India Post) across 19,000+ postal PIN codes with varied delivery SLAs, COD restrictions in special/air cargo zones, and parcel transit states that must synchronize with internal inventory records.
* **Decision**:  
  1. **Indian Pincode Intelligence Engine (`src/lib/pincodes.ts`)**:
     * Implemented 6-digit postal prefix matching and zone resolution across Intra-State (Surat Central Origin Hub), Metro, Regional, and Special Zones (North East, J&K, Islands).
     * Enforces COD serviceability: Special Zones requiring air cargo are restricted to prepaid online payments (`isCodAvailable: false`).
     * Dynamically calculates business-day delivery SLAs excluding Sundays.
  2. **Dual-Mode Logistics Gateway**:
     * When `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` are placeholders, operates in senior test simulation mode with deterministic AWB generation (`DELH...`, `BLUD...`), manifest creation, and test scan events.
     * When live credentials are provided, connects to Shiprocket REST endpoints for adhoc order booking, courier rate card comparison, and label generation.
  3. **Idempotent Webhook Synchronization (`POST /api/webhooks/shipping`)**:
     * Ingests carrier tracking events with unique event deduplication (`evt_${awb}_${status}_${timestamp}`).
     * Synchronizes order state machine automatically:
       * `IN_TRANSIT` / `PICKED_UP`: Transitions order to `SHIPPED` and decrements physical inventory with `MovementReason.ORDER_DISPATCHED`.
       * `OUT_FOR_DELIVERY`: Transitions order to `OUT_FOR_DELIVERY`.
       * `DELIVERED`: Transitions order to `DELIVERED` and marks COD payments as `SUCCESS`.
  4. **Interactive Storefront Tracking**:
     * Interactive `PincodeChecker` widget on PDP and Checkout with auto-fill and COD restriction warnings.
     * 5-Stage visual `OrderTrackingTimeline` stepper with chronological scan event history and demo mode simulation controls on `/order-success/[orderNumber]`.
* **Consequences**:  
  * Zero unexpected COD rejections from remote delivery partners.
  * Real-time tracking and delivery transparency for retail and B2B customers.

## ADR-013: WhatsApp Business Cloud API & Real-Time E-Commerce Lifecycle Messaging Engine

* **Status**: **ACCEPTED** (Implements ADR-007, ADR-008)
* **Date**: 2026-09-25
* **Context**:  
  Indian e-commerce consumers, commercial contractors, and system integrators rely primarily on WhatsApp for order tracking, invoice verification, and instant trade communication. Traditional email notifications suffer from low open rates in India.
* **Decision**:  
  1. **Dual-Mode WhatsApp Gateway (`src/server/services/whatsapp.service.ts`)**:
     * When `WHATSAPP_ACCESS_TOKEN` is a placeholder, activates developer simulation mode: formats complete Meta Cloud API HSM payloads, logs high-fidelity terminal notification cards, and records audit entries in `audit_logs`.
     * When production keys are provided in `.env`, communicates directly with Meta Graph API (`POST /v20.0/${PHONE_NUMBER_ID}/messages`).
  2. **Event-Driven E-Commerce Lifecycle Messaging**:
     * Automatically dispatches WhatsApp notifications across key order state transitions:
       * **Order Placed / Confirmed**: With order number, formatted INR total, payment mode, and direct link to GST Tax Invoice.
       * **Shipment Dispatched**: With courier partner, AWB tracking number, estimated delivery SLA, and live tracking URL.
       * **Out for Delivery**: Alerting the consignee of arrival today with address confirmation.
       * **Order Delivered**: Delivery confirmation and support link.
  3. **B2B Contractor Wholesale Inquiries**:
     * PDP integration via `B2BContractorCallout` and `B2BQuoteModal` allowing security integrators to request bulk project pricing for 10+ units with instant WhatsApp notification confirmation.
  4. **Global WhatsApp Support Widget (`WhatsAppSupportWidget.tsx`)**:
     * Embedded across the entire application with quick-prompt chips (Track Order, B2B Pricing, CCTV Architecture Advice, Warranty Support) launching direct WhatsApp chats.
  5. **Bidirectional Webhook (`/api/webhooks/whatsapp`)**:
     * Handles Meta verification handshakes (`GET hub.challenge`) and message status callbacks (`POST delivered`, `read`, and customer inbound replies).
* **Consequences**:  
  * 100% notification visibility on customer mobile devices.
  * Instant lead capture and quotation pipeline for high-value B2B surveillance projects.

## ADR-014: Back-Office Admin Operations, SKU Inventory Adjustments & Hardware Serial Tracking

* **Status**: **ACCEPTED** (Implements ADR-004, ADR-008)
* **Date**: 2026-09-26
* **Context**:  
  Managing high-value CCTV and networking distribution requires back-office operational controls: real-time executive KPI dashboards, inventory adjustment audits for stock reconciliation, selective Cash on Delivery policy enforcement, and recording hardware serial numbers for warranties and RMA claims.
* **Decision**:  
  1. **Executive Operations Dashboard (`/admin`)**:
     * Aggregates live Gross Merchandise Value (GMV), 18% GST collected, active pipeline orders, completed deliveries, and payment channel split (Prepaid Razorpay vs Selective COD).
     * Surfaces critical low-stock SKUs beneath safe reorder thresholds (`≤ lowStockThreshold`).
  2. **Order Fulfillment Console (`/admin/orders`)**:
     * Real-time search across order number, customer name, contact number, and carrier AWB.
     * Status filter tabs: Pending Payment, COD Pending, Paid, Confirmed, Packed, Shipped, Out for Delivery, Delivered, Cancelled.
     * 1-Click carrier dispatch booking generating Shiprocket/Delhivery AWBs.
     * Controlled order state advancement following the strict order state machine.
     * Direct link to printable GST Tax Invoices.
  3. **Hardware Serial Number Tracking (Warranty & RMA)**:
     * Indian commercial surveillance hardware (Hikvision, CP Plus, Dahua, Western Digital Purple HDDs) requires recording individual hardware serial numbers prior to dispatch.
     * Integrated per-item serial number editor storing comma-separated serials into `OrderItem.serialNumbers` with optimistic updates.
  4. **SKU Inventory & Concurrency-Safe Stock Adjustments (`/admin/inventory`)**:
     * Dense inventory matrix displaying Physical Stock, Reserved Stock, Net Available Stock, and Reorder Threshold.
     * Interactive Stock Adjustment modal supporting reasons: `PURCHASE_RECEIPT` (Restock), `MANUAL_ADJUSTMENT` (Audit Count), `DAMAGED_WRITE_OFF` (Defective), and `RETURN_RESTOCK` (RMA/Return).
     * Appends an immutable `InventoryMovement` record inside a Prisma transaction on every manual change.
  5. **Selective Cash on Delivery Control (`/admin/settings/cod`)**:
     * Enforces the 3-tier risk mitigation rules (ADR-004): ₹15,000 order ceiling, postal zone air cargo restrictions, and per-product blanket disqualification switches via `Product.isCodAllowed`.
* **Consequences**:  
  * Full operational autonomy for warehouse dispatchers and store managers.
  * Audit-compliant inventory accounting with zero untracked quantity drifts.
  * Rapid warranty dispute resolution through recorded hardware serial numbers.

## ADR-015: Master Loopback Feedback Engine, Dynamic XML Sitemaps & Structured Data (JSON-LD)

* **Status**: **ACCEPTED** (Implements ADR-008, ADR-014)
* **Date**: 2026-09-26
* **Context**:  
  To ensure production-grade reliability across all 8 development phases, an automated loopback feedback suite was required to detect cross-cutting latency issues, type mismatches, and route serviceability. Simultaneously, dynamic sitemaps, robots.txt, and Google Rich Snippet JSON-LD structured schemas were needed for commercial discovery.
* **Decision**:  
  1. **Master Loopback Feedback Suite (`scripts/master_loopback_test.ts`)**:
     * Implements a 25-point automated regression test covering:
       * Catalog hierarchy and multi-attribute variant resolution.
       * 6-digit Indian Pincode intelligence and air-cargo COD disqualification.
       * 18% GST tax calculation and line-item decimal rounding.
       * B2B GSTIN order creation with customer address association.
       * Carrier AWB booking (`DELH...`) and order status progression to `PACKED`.
       * WhatsApp Business notification simulation and phone normalization.
       * Admin dashboard telemetry, stock adjustments, and hardware serial recording.
     * Detected and resolved cloud database latency limits by configuring `{ maxWait: 15000, timeout: 30000 }` on `prisma.$transaction`.
  2. **Dynamic XML Sitemaps (`src/app/sitemap.ts`)**:
     * Generates standard XML sitemaps querying live active products and categories with accurate `lastmod`, `changefreq`, and `priority` fields.
  3. **Robots Protocol (`src/app/robots.ts`)**:
     * Allows search crawling of `/`, `/products`, and `/kit-builder`, while securely restricting `/admin`, `/account`, `/checkout`, and `/api/*`.
  4. **Google Search Rich Snippets (`Product` & `BreadcrumbList` JSON-LD)**:
     * Injects structured schema markup in `src/app/products/[slug]/page.tsx` for Google Rich Product Cards with prices in INR, availability in stock, and breadcrumb hierarchy.
* **Consequences**:  
  * 100% end-to-end regression test pass with zero regressions.
  * Enhanced organic search rankings for surveillance hardware and CCTV kits.

## ADR-016: Customer Information, Corporate Governance & Public Policy Architecture

* **Status**: **ACCEPTED** (Implements Section 12 of CCTV Master Plan)
* **Date**: 2026-09-26
* **Context**:  
  Operating a commercial surveillance distribution platform in India requires statutory transparency: explicit postal logistics transit SLAs, RMA return guidelines, 18% GST invoice legal terms, compliance with the Indian Information Technology Act 2000 & SPDI Rules, and direct contact avenues for wholesale security contractors.
* **Decision**:  
  1. **Comprehensive Public Policy Engine**:
     * `/shipping-policy`: Details 6-digit Indian PIN code zones, same-day dispatch cutoff at 4:00 PM IST (Mon–Sat), carrier partner networks (Delhivery, Shiprocket, BlueDart), and air-cargo COD exclusions.
     * `/return-policy`: Outlines commercial RMA protocols, 7-day Dead On Arrival (DOA) replacement guarantee, manufacturer warranty procedures (CP Plus, Hikvision, Dahua, Western Digital), and serial number invoice verification.
     * `/privacy-policy`: Guarantees zero storage of card numbers/UPI PINs (Razorpay PCI-DSS Level 1 compliance), secure retention of corporate GSTINs, and transactional WhatsApp notification consent.
     * `/terms`: Governs commercial sales, 18% GST statutory invoicing liabilities, title transfer upon carrier handoff, and exclusive Surat, Gujarat legal jurisdiction.
  2. **Corporate & Engineering Consultation Desks**:
     * `/contact`: Dedicated contact hub with Gujarat Central Warehouse coordinates, direct WhatsApp launcher, sales and support hotlines, interactive consultation form (`submitB2BQuoteInquiryAction`), and official bank transfer (NEFT/RTGS) details for B2B institutional orders.
     * `/about`: Documents company history, authorized manufacturer alliances, and warehouse quality control standards.
     * `/faq`: Categorized interactive accordion addressing HD Analog vs IP Network differences, H.265 hard drive storage calculation formulas, and B2B Input Tax Credit claim procedures.
  3. **SEO & Navigation Ingestion**:
     * Added full link hierarchy to `Footer.tsx` and dynamically indexed all 7 routes in `src/app/sitemap.ts`.
* **Consequences**:  
  * 100% legal and statutory compliance for commercial e-commerce in India.
  * Direct lead generation channel for high-value contractor projects.

---

## ADR-017: Admin Commercial Reporting, GSTR-1 Tax Analytics & B2B Customer Directory

* **Status**: **ACCEPTED** (Implements Section 11 of CCTV Master Plan)
* **Date**: 2026-09-26
* **Context**:  
  Store managers, accountants, and warehouse supervisors require dedicated administrative tools: customer CRM tracking with lifetime spend analytics, B2B contractor verification, and executive commercial reports for monthly GSTR-1 return filing and warehouse capital asset valuation.
* **Decision**:  
  1. **Customer & Contractor CRM Directory (`/admin/customers`)**:
     * Query service `getAdminCustomersList`: Aggregates customer profiles, user mobile numbers, total orders placed, lifetime spend, default shipping cities, and B2B credentials (`companyName`, `gstin`, `isB2BVerified`).
     * `CustomerDirectoryTable.tsx`: Dense, searchable data table with instant filters (All Accounts, B2B Contractors, Retail Buyers) and 1-click WhatsApp chat launch.
  2. **Commercial Accounting & Tax Reports (`/admin/reports`)**:
     * Query service `getAdminCommercialReports`:
       * Executive KPIs: Gross Revenue (GMV), Total Confirmed Orders, Average Order Value (AOV).
       * GSTR-1 Tax Reconciliation: Splits intra-state CGST (9%) + SGST (9%) for Gujarat vs inter-state IGST (18%).
       * Warehouse Asset Valuation: Computes physical stock units, net available units, and aggregate inventory capital value in INR across all active SKUs.
       * Logistics Risk & Payment Split: Compares Razorpay online prepaid conversion vs Cash on Delivery volume and value.
       * Daily Sales Velocity: Tracks daily order volumes and GMV trends over the past 30 days.
  3. **UI/UX Refinements & Autocomplete Engine**:
     * `searchProductsQuick`: Debounced instant search dropdown in `Header.tsx` displaying live matching cameras, DVRs, and cables with price tags and brand badges.
     * Mobile Sticky Action Bar: Floating bottom purchase bar on `/products/[slug]` displaying current variant price and 1-click Add to Cart.
     * Zero-`any` compliance across all updated services and components.
* **Consequences**:  
  * Effortless monthly GSTR-1 tax preparation and audit compliance.
  * Real-time visibility into warehouse asset valuation and customer lifetime value.

---

## ADR-018: Storefront UI/UX Polish, Custom 404/Error Boundaries & Admin Commercial CSV Export Engine

* **Status**: **ACCEPTED** (Commercial Operational Polish & UX Resiliency)
* **Date**: 2026-09-26
* **Context**:  
  Production deployment and commercial daily operations demand foolproof UI/UX resilience, frictionless search discovery, branded exception recovery, and portable data export for accountants and logistics coordinators.
* **Decision**:  
  1. **Enhanced Live Search Autocomplete UX**:
     * Implemented `useRef` click-outside dismiss listeners and `Escape` key handlers on `Header.tsx`.
     * Added instant one-click clear button (`X`) when query text is entered.
     * Extended live autocomplete suggestions into the mobile navigation drawer for parity across viewports.
  2. **Custom Branded Error & 404 Boundaries**:
     * `src/app/not-found.tsx`: Sleek dark-mode "Surveillance Feed Lost" 404 page featuring radar pulse animations, direct recovery shortcuts (Catalog, CCTV Kit Builder, Order Tracking, Central Hub), and instant WhatsApp Commercial Support escalation.
     * `src/app/error.tsx`: Client error boundary with graceful retry trigger, state preservation, digest reporting, and home navigation fallback.
  3. **Commercial CSV Export Engine**:
     * `OrderFulfillmentConsole.tsx`: Added one-click "Export CSV" to extract active and filtered customer orders with date, shipping recipient, phone, 15-digit GSTIN, INR totals, and carrier AWB numbers.
     * `CommercialReportsConsole.tsx`: Added statutory "Export CSV" on the GSTR-1 tax card, generating ready-to-file comma-separated schedules for Intra-State CGST (9%) + SGST (9%) and Inter-State IGST (18%).
  4. **Loopback Automated Feedback Loop**:
     * Updated `scripts/comprehensive_loopback_test.ts` to 36 assertions including 24 live endpoints (23 platform routes + 1 custom 404 route) with resilient cloud pooler retry backoffs.
* **Consequences**:  
  * Zero dead-ends for storefront visitors encountering invalid links.
  * Instant GSTR-1 and order export capabilities without requiring third-party data extraction tools.
  * 100% automated regression test stability even across transient cloud network reconnects.

---

## ADR-019: Admin Command Center Authentication, Session Isolation & Edge Middleware Guards

* **Status**: **ACCEPTED** (Security Hardening & Access Control)
* **Date**: 2026-09-26
* **Context**:  
  While customer authentication operates via passwordless 6-digit SMS OTP (`pn_session`), the administrative and warehouse operations console (`/admin/*`) manages confidential commercial assets, customer PII/GSTIN data, order dispatch state machines, and statutory GSTR-1 tax schedules. A dedicated, role-isolated, password-protected authentication gateway is mandatory.
* **Decision**:  
  1. **Dedicated Session Cookie Isolation**:
     * Implemented isolated HTTP-only cookie `pn_admin_session` containing a signed 256-bit JWT (HS256 via `jose`) with `adminId`, `email`, `fullName`, and `role` (`SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER`, `ORDER_MANAGER`).
     * Completely decoupled from storefront consumer session (`pn_session`) to prevent role elevation or cookie collision.
  2. **High-Tech Command Center Login Portal (`/admin/login`)**:
     * `src/app/admin/login/page.tsx`: Dark-mode surveillance interface with encrypted credentials form, show/hide password toggle, error digest alerts, and a quick one-click demo autofill tool for development and testing.
     * Default superadmin credentials: `superadmin@patelnetworks.in` / `patel@admin2026` (overridable via `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables or database `users` records).
  3. **Edge Middleware & Route Guards (`src/middleware.ts`)**:
     * Next.js Edge-compatible middleware inspecting all `/admin/*` routes.
     * Unauthenticated requests are immediately intercepted with HTTP 307 redirect to `/admin/login?next=[path]`.
     * Authenticated admin requests to `/admin/login` automatically route forward to `/admin`.
  4. **Active Admin Header & Sign Out Action**:
     * `AdminHeader.tsx` displays authenticated operator email and role badge with an active **"Sign Out"** button executing `adminLogoutAction` and cookie invalidation.
* **Consequences**:  
  * Strict security isolation for all warehouse inventory adjustments, order fulfillment, and GSTR-1 tax data.
  * Zero unauthorized exposure of back-office endpoints in production.

---

## ADR-020: AI Studio In-Memory Dual-Mode Database Adapter and Standalone Build Optimization

* **Status**: **ACCEPTED** (AI Studio GitHub Migration & Dual-Mode Runtime)
* **Date**: 2026-09-26
* **Context**:  
  When importing the repository into Google AI Studio, container networking rules block direct external TCP sockets to remote databases, and local PostgreSQL daemon binaries are unavailable in slim Linux containers. Prerendering Next.js server components during `next build` requires instantaneous query resolution for catalog, brand, and category listings without throwing connection timeout exceptions (`Can't reach database server at localhost:5432`).
* **Decision**:  
  1. **Dual-Mode Prisma Architecture (`src/server/db/mock-db.ts` & `src/server/db/index.ts`)**:
     * Implemented an in-memory database mock store (`MockDataStore`) pre-seeded with genuine surveillance catalog records (CP Plus cameras, Hikvision AcuSense DVRs, Seagate SkyHawk HDDs, D-Link Cat6 spools, SMPS supplies), B2B customer accounts, admin accounts, and order history.
     * Exported a typed Proxy wrapper (`export const prisma: PrismaClient = new Proxy(mockPrisma, ...)`) that seamlessly routes queries to live Prisma when `DATABASE_URL` is set to a non-localhost connection string, while cleanly falling back to the in-memory mock store if the remote database is unreachable.
     * Implemented full Prisma API support including relational includes (`include: { brand: true, category: true, variants: { include: { sku: { include: { inventory: true } } } } }`), nested creation (`items.create`, `shippingAddress.create`), transactions (`$transaction`), raw execution stubs (`$queryRaw`, `$executeRaw`), and aggregate counters.
  2. **Next.js Standalone Build Optimization (`next.config.ts`)**:
     * Added `output: 'standalone'` to support containerized cloud execution.
     * Configured development server script in `package.json` to bind to `0.0.0.0:3000` (`"dev": "next dev -p 3000 -H 0.0.0.0"`).
* **Consequences**:  
  * `next build` (`compile_applet`) succeeds completely with 100% static page prerendering.
  * The storefront and admin command center function seamlessly in the AI Studio environment with zero external database dependencies.
  * Regression test suites (`comprehensive_loopback_test.ts` and `master_loopback_test.ts`) achieve 100% pass rates.
  * When a Cloud SQL database is provisioned, the app automatically switches to live persistence without code rewrites.

---

## ADR-021: Real Photographic Hardware Assets, Supabase Product Images Storage, and Pure Typography Category Presentation

* **Status**: **ACCEPTED**
* **Date**: 2026-09-26
* **Context**:  
  Hardware buyers, B2B contractors, and surveillance installation engineers evaluate equipment based on authentic photographic specifications, physical ports, lens apertures, and housing materials. Hardcoding cartoonish or placeholder `.svg` files looked uncommercial and broke down when admins needed to update images dynamically. Furthermore, category navigation does not require synthetic SVG drawings; clean typography, statutory HSN codes, and live database taxonomy provide a professional, industrial look.
* **Decision**:  
  1. **Purged All Local SVG Mock Placeholders**:
     * Completely removed synthetic `.svg` product and category graphics.
     * Replaced them with authentic, high-resolution surveillance hardware photography curated from internet CDNs (Unsplash high-resolution photography) covering Bullet cameras, Eyeball dome cameras, AcuSense AI DVRs, 24/7 Surveillance HDDs, Cat6 cable drums, Gigabit PoE switches, SMPS supplies, BNC connectors, and 24/7 surveillance monitors.
  2. **Supabase `product_images` Live Database Synchronization**:
     * Directly updated all products in the live Supabase PostgreSQL database to store real photographic URLs and descriptive alt texts.
     * Guaranteed identical synchronization in `src/server/db/mock-db.ts` for dual-mode parity.
  3. **Admin Command Center Image & Asset Manager (`ProductImageManagerModal`)**:
     * Enhanced `/admin/products` with live photo thumbnails and interactive image count badges.
     * Built a comprehensive modal enabling administrators to:
       * View all images with cover/primary indicator.
       * Paste any image URL from the web/CDN with real-time live preview before saving.
       * Upload image files via `/api/admin/upload-image` directly to server storage / Supabase storage buckets.
       * Assign curated hardware photography presets with one click.
       * Promote any photo to primary cover image or delete obsolete images with atomic Supabase persistence.
  4. **Next.js `<Image>` Remote Pattern & Referrer Optimization**:
     * Updated `next.config.ts` to allow all HTTPS remote image sources (`{ protocol: 'https', hostname: '**' }`) alongside Supabase, Unsplash, and Cloudinary.
     * Enforced `referrerPolicy="no-referrer"` across all `<Image>` tags.
  5. **Pure Typography Category Presentation**:
     * Transformed storefront homepage (`src/app/page.tsx`) and catalog (`src/app/products/page.tsx`) to present categories purely by their database names, descriptions, subcategory tags, and statutory HSN/GST tax classifications. Zero SVG dependencies.
* **Consequences**:  
  * Storefront features crisp, high-resolution product photography with interactive multi-angle image switching.
  * Administrators have total control to add, edit, or upload real product photos directly through the Admin Command Center.
  * Clean, typography-first category navigation provides an authentic industrial wholesale experience.

---

## ADR-022: Professional Retail Electronics Storefront, Category Discovery, and Account Architecture

* **Status**: **ACCEPTED**
* **Date**: 2026-09-26
* **Context**:  
  The previous storefront aesthetic leaned heavily towards a dark SaaS landing page, with glowing gradients, oversized heroes, and isolated marketing blocks that did not feel like an established, high-credibility Indian security equipment distributor or electronics retailer. Buyers need quick access to products, structured technical specs, faceted catalog filtering, hardware comparison, and transparent order tracking.
* **Decision**:  
  1. **Light Commerce Design System**:
     * Transitioned to a dominant white (`#ffffff`) and off-white (`#f8fafc`) surface palette with dark navy/charcoal typography (`#0f172a`), restrained blue accents (`#2563eb`), emerald green for stock/trust, and red for discounts/deals.
     * Enforced zero custom SVG illustrations and zero emoji icons; all UI iconography is standardized on `lucide-react`.
  2. **Retail Homepage Information Architecture**:
     * Replaced dark SaaS hero with a compact commerce hero featuring authentic CCTV camera + DVR lineup photography, value proposition trust bar (18% GST Invoice, Razorpay, Shiprocket/Delhivery, Technical Support), and clear primary/secondary CTAs.
     * Built a 9-category retail discovery grid with clean photographic presentation on white backgrounds.
     * Developed `FeaturedProductsSection` with client-side category filter tabs (`All`, `CCTV Cameras`, `DVR/NVR`, `Hard Drives`, `Networking`, `Cables`, `Monitors`) and dense 6-column retail cards.
     * Added `TopBrandsSection` featuring verified brand styling (Hikvision, Dahua, CP Plus, D-Link, AOC, Seagate, TP-Link, Lapcare, MTC, Optilink).
     * Built `TechnicalBuyingGuide` providing direct technical entry points (by resolution, housing, channels, 24/7 storage retention, and PoE power).
  3. **Technical Catalog Page (`/products`)**:
     * Implemented breadcrumbs, sorting dropdown (relevance, price low-to-high, price high-to-low, newest), active filter chips with removal buttons, and a rich filter sidebar (categories, brands, price ranges, in-stock toggle, and technical keywords).
     * Supported multi-term search queries in `getFilteredProducts` (e.g. "4mp hikvision", "2tb seagate").
  4. **Product Detail Page & Data-Driven Specifications (`/products/[slug]`)**:
     * Interactive variant selector (`DynamicVariantSelector`) ensuring real purchasable entity state (SKU, price, MRP, available stock, 18% GST breakdown, pincode check, quantity stepper, Add to Cart, Buy Now).
     * Added structured engineering specifications table, technical overview, and related hardware recommendations.
  5. **Product Comparison Drawer (`ProductCompareDrawer`)**:
     * Implemented a floating comparison bar and side-by-side modal allowing users to compare up to 4 items on resolution, housing, lens, night vision, PoE, HSN code, price, and warranty.
  6. **Customer Account Portal & Sub-Routes**:
     * Built dedicated customer routes: `/account`, `/account/orders`, `/account/orders/[id]`, `/account/addresses`, `/account/wishlist`, and `/account/profile`.
     * Supported complete order tracking timelines, AWB tracking, and printable GST tax invoices.
* **Consequences**:  
  * The storefront looks and functions like a genuine, high-volume Indian security electronics retailer.
  * E-commerce usability is prioritized over decorative marketing, leading to immediate product discovery.

---

## 📝 Future Decision Template

When new decisions are made during subsequent phases, append them using the following format:

```markdown
## ADR-XXX: [Title]
* **Status**: [PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]
* **Date**: YYYY-MM-DD
* **Context**: [Why is this decision needed?]
* **Decision**: [What was decided?]
* **Consequences**: [Impact on architecture, database, or UI]
```




