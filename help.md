# Patel Networks — Platform Operations & Help Guide (`help.md`)

> **Comprehensive operational reference for store administrators, fulfillment dispatchers, and developers.**

---

## 1. Quick Navigation & Common URLs

| Module | URL | Description |
| :--- | :--- | :--- |
| **Storefront** | `http://localhost:3000` | Customer-facing homepage, banners, trust badges |
| **Catalog** | `http://localhost:3000/products` | Surveillance catalog with faceted filters |
| **Kit Builder** | `http://localhost:3000/kit-builder` | 5-Step interactive CCTV package builder (5% combo discount) |
| **Cart** | `http://localhost:3000/cart` | Server-validated cart with quantity controls |
| **Checkout** | `http://localhost:3000/checkout` | GSTIN capture, Selective COD verification, Razorpay |
| **Customer Portal** | `http://localhost:3000/account` | Order history, address book, B2B profile |
| **Corporate Info** | `http://localhost:3000/about` | Authorized brands, distributor certifications, warehouse history |
| **Wholesale Desk** | `http://localhost:3000/contact` | B2B quotation desk, direct WhatsApp launcher, NEFT/RTGS bank details |
| **Surveillance FAQ** | `http://localhost:3000/faq` | Categorized answers for CCTV tech, storage formulas, and GST credits |
| **Shipping Policy** | `http://localhost:3000/shipping-policy` | Pan-India transit SLAs, same-day dispatch cutoff, air-cargo COD rules |
| **Return Policy** | `http://localhost:3000/return-policy` | 7-day DOA replacement guarantee, manufacturer brand warranties |
| **Privacy Policy** | `http://localhost:3000/privacy-policy` | IT Act 2000 compliance, zero payment credential storage |
| **Terms of Service** | `http://localhost:3000/terms` | Commercial sale terms, 18% GST invoice legality, Surat jurisdiction |
| **Admin Login Portal** | `http://localhost:3000/admin/login` | Secure 256-bit Command Center authentication gateway |
| **Admin Operations** | `http://localhost:3000/admin` | Executive telemetry, GMV, GST, payment split (requires login) |
| **Admin Orders** | `http://localhost:3000/admin/orders` | Fulfillment console, AWB booking, serial numbers, Orders CSV export |
| **Admin Products** | `http://localhost:3000/admin/products` | Catalog visibility, Selective COD toggles, and Real Photographic Image Asset Manager |
| **Admin Inventory** | `http://localhost:3000/admin/inventory` | Real-time physical stock and audit adjustment modal |
| **Admin Customers** | `http://localhost:3000/admin/customers` | CRM directory, B2B verification badges, WhatsApp launcher |
| **Admin Reports** | `http://localhost:3000/admin/reports` | Commercial accounting, GSTR-1 tax schedules, GSTR-1 CSV export |
| **Admin COD Policies** | `http://localhost:3000/admin/settings/cod` | ADR-004 policy dashboard and product toggles |
| **Sitemap XML** | `http://localhost:3000/sitemap.xml` | Dynamic SEO sitemap indexing all active pages |
| **Robots Policy** | `http://localhost:3000/robots.txt` | Standard search engine crawling directives |

---

## 2. Admin Command Center Authentication (ADR-019)

### Default Superadmin Credentials
* **Login URL**: `http://localhost:3000/admin/login`
* **Admin Email**: `superadmin@patelnetworks.in`
* **Secret Access Key**: `patel@admin2026`
* **One-Click Demo Button**: Click **"Autofill Credentials"** on `/admin/login` for instant testing.
* **Role Permissions**: `SUPER_ADMIN` with full access to orders, stock adjustments, CRM, GSTR-1 returns, and courier dispatch.
* **Session Management**: Session is stored in an isolated, secure HTTP-only cookie (`pn_admin_session`). Click **"Sign Out"** in the top right header to end your session.

---

## 3. Order Fulfillment Workflow

1. **New Order Intake**:
   * Customer places order via Razorpay prepaid or Cash on Delivery.
   * If Razorpay: Status is set to `CONFIRMED` upon payment capture webhook.
   * If COD: Status is set to `COD_PENDING`.
2. **Order Review & AWB Generation**:
   * Open `/admin/orders`.
   * Click the target order row to expand details.
   * Click **Generate AWB & Book Courier**. The system contacts Shiprocket/Delhivery (or deterministic sandbox) and generates an AWB tracking number.
   * Order status automatically advances to `PACKED`.
3. **Hardware Serial Number Scanning (RMA/Warranty)**:
   * In the expanded order view under **Package Items & Hardware Serial Numbers**, enter comma-separated serial numbers (e.g. `SN-449102, SN-449103`).
   * Click the **Save** icon.
4. **Physical Dispatch**:
   * Click **Mark Dispatched** to transition order to `SHIPPED`.
   * This immediately decrements physical stock in PostgreSQL with `MovementReason.ORDER_DISPATCHED`.
   * Customer receives automated WhatsApp alert with live tracking URL.
5. **Delivery Completion**:
   * Carrier webhook or admin advances order to `DELIVERED`.
   * If COD, payment record is automatically marked `SUCCESS`.
6. **Data Export for Logistics & Accounts**:
   * Click the **Export CSV** button in the top toolbar of `/admin/orders` to download the active order ledger into a `.csv` file.

---

## 3. SKU Inventory Adjustments

* Open `/admin/inventory`.
* Locate the target hardware item using the instant search box.
* Click **Adjust**.
* In the modal:
  * Enter quantity delta (e.g. `+20` for PO arrival, `-2` for damaged).
  * Select the audit reason:
    * `PURCHASE_RECEIPT`: Restock batch from distributor.
    * `MANUAL_ADJUSTMENT`: Physical stock audit count reconciliation.
    * `DAMAGED_WRITE_OFF`: Broken or transit-damaged item.
    * `RETURN_RESTOCK`: RMA or customer return restock.
  * Enter reference notes (e.g. "Invoice PO-2026-900 arrived via Delhivery").
  * Click **Save Stock Adjustment**. The change is committed atomically in a Prisma transaction and logged to `inventory_movements`.

---

## 4. Selective Cash on Delivery (COD) Rules (ADR-004)

* **Rule 1 — ₹15,000 Order Ceiling**: Orders exceeding ₹15,000 are strictly prepaid-only to prevent carrier cash loss on expensive 16-channel NVRs or bulk cables.
* **Rule 2 — Remote Air Cargo Circle Restriction**: PIN codes in North-East and remote island territories automatically disable COD in `/checkout`.
* **Rule 3 — Per-Product Disqualification**:
  * Open `/admin/settings/cod` or `/admin/products`.
  * Click the button in the **Cash On Delivery** column to toggle between `COD Allowed` and `Prepaid Only`.
  * If ANY item in a customer's cart is marked `Prepaid Only`, the entire checkout disables COD.

---

## 5. Commercial Reporting & Statutory GSTR-1 Returns

* Open `/admin/reports`.
* **Statutory GSTR-1 Reconciliation**:
  * Review the **GSTR-1 Tax Summary & Split** card for current period collections divided into Intra-State CGST (9%) + SGST (9%) and Inter-State IGST (18%).
  * Click **Export CSV** to generate a pre-formatted comma-separated schedule ready for upload to the GST portal or submission to enterprise auditors.
* **Warehouse Valuation**:
  * Check the **Warehouse Asset Valuation** metric to audit current capital invested across all warehouse stock.

---

## 6. Customer CRM Directory & Wholesale Contractors

* Open `/admin/customers`.
* Search for any client by full name, phone number, company name, or 15-character GSTIN.
* Use the **B2B Contractors** filter tab to review high-volume installers.
* Click the **WhatsApp** icon next to any customer to open a direct, pre-formatted conversation on WhatsApp Web / Desktop.

---

## 7. Product Image & Photographic Asset Management (ADR-021)

* Open `/admin/products`.
* View real photographic thumbnails directly in the **Hardware Item** column.
* Click the **Photos** badge or camera icon on any product to open the **Product Image & Asset Manager** modal:
  * **View All Active Photos**: High-resolution gallery preview with live cover photo indicator.
  * **Set Cover Photo**: Click "Set Cover" on any photo to assign it as the primary storefront catalog image.
  * **Paste Web / CDN Link**: Enter any direct HTTP/HTTPS URL from Unsplash, manufacturer CDN, Cloudinary, or AWS S3 with instant live preview before saving to Supabase.
  * **Upload File**: Select any JPG, PNG, or WebP photo from your computer or phone; it is saved to `/uploads/products/` or cloud storage and immediately recorded in Supabase `product_images`.
  * **Hardware Presets**: One-click quick assign verified high-definition photography for Bullet cameras, Dome cameras, IP cameras, DVRs, HDDs, Cat6 spools, PoE switches, SMPS units, BNC connectors, and Monitors.

---

## 8. Automated Verification & Testing Commands

Run the comprehensive regression and health check suites:

```bash
# 1. Typecheck (Strict Zero-Any Compilation)
npx tsc --noEmit

# 2. Comprehensive 36-Point Loopback Regression (All 24 Endpoints, CRM, Tax, 404)
npx tsx scripts/comprehensive_loopback_test.ts

# 3. Master Domain Loopback Suite
npx tsx scripts/master_loopback_test.ts
```
