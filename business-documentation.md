# Business Documentation & Operational Specifications

> **E-Commerce Platform for CCTV, Surveillance & Networking Hardware**  
> Brand: Patel Networks / MegaTech  
> Target Region: India  
> **Source of Truth for Decisions**: Refer to [decisions.md](file:///d:/work/megatech/patelnetworks/decisions.md)

---

## 1. Executive Summary & Business Objectives

The primary objective of this project is to build an authoritative, enterprise-grade e-commerce destination for electronic surveillance, security systems, and commercial networking hardware in India.

The platform bridges the gap between:
1. **Retail / Home Owners (B2C)** seeking genuine CCTV cameras, smart home security, cables, and installation accessories.
2. **Professional Installers, System Integrators & Electrical Contractors (B2B)** requiring bulk quantities, specific technical specifications, GST tax invoices for input credit, and predictable SKU-level stock availability.

---

## 2. Product Catalog & Brand Taxonomy

The catalog structure enforces a rigorous 5-level hierarchy:  
`Category ➔ Subcategory ➔ Brand ➔ Product ➔ Variant (SKU)`.

```
Catalog
├── 1. CCTV & Surveillance
│   ├── HD Analog Cameras
│   │   └── Brands: Hikvision, Dahua, CP Plus, MTC
│   ├── Network (IP) Cameras
│   │   └── Brands: Hikvision, Dahua, CP Plus, PoE Switches, Other Brands
│   └── Digital & Network Video Recorders (DVR / NVR)
│       └── Brands: Hikvision, Dahua, CP Plus
├── 2. Displays & Screens
│   └── Surveillance Monitors & Displays
│       └── Brands: Lapcare, AOC
├── 3. Cables & Wiring
│   ├── HD CCTV Coaxial Cables (3+1 / 4+1)
│   │   └── Brands: CP Plus, MTC
│   └── Structured Network Ethernet Cables (Cat6 / Cat6A)
│       └── Brands: D-Link, CP Plus, DGSoal
├── 4. Connectors & Hardware Accessories
│   └── BNC, DC Connectors, RJ45, Keystone Jacks
│       └── Brands: MTC, D-Link, DGSoal, Axpial
└── 5. Media Converters & Optical Networking
    └── Fiber Media Converters, SFP Modules, Patch Cords
        └── Brands: Optical Fiber, Optilink
```

---

## 3. Product Variant & SKU Data Model

### The Core Inventory Rule
> **`Product ➔ Variant ➔ SKU ➔ Inventory`**  
> Products do not hold inventory directly. All stock counters, prices, barcodes, and physical packaging correlate directly to a unique purchasable SKU.

### Flexible Multi-Attribute Dimensions ([ADR-005](file:///d:/work/megatech/patelnetworks/decisions.md#adr-005-multi-attribute-flexible-product-variants))
A single CCTV camera product model may branch across multiple physical attributes:
* **Resolution (MP)**: 2 Megapixel (1080p), 4 Megapixel (2K), 8 Megapixel (4K), 16 Megapixel
* **Lens Focal Length**: 2.8mm (Wide Field of View, 105°+), 3.6mm (Standard, ~85°), 6mm (Long Range Corridor)
* **Form Factor / Housing**: Dome (Indoor ceiling mount) vs. Bullet (Outdoor wall mount with IP67 weatherproofing)
* **Night Vision Technology**: Traditional Smart Infrared (Black & White in dark) vs. Full-Color / ColorVu (Warm white LED for 24/7 full color)
* **Audio**: Built-in Microphone vs. Audio-in terminal vs. No Audio

### Example SKU Architecture

| Parent Product | Variant Attributes | SKU Code | Selling Price | MRP | Available Stock | COD Allowed |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CP Plus 2MP/4MP/8MP IR Bullet Camera | 2MP • 3.6mm • Bullet • IR | `CPP-B01-2MP-36` | ₹1,450 | ₹2,800 | 45 | Yes |
| CP Plus 2MP/4MP/8MP IR Bullet Camera | 4MP • 3.6mm • Bullet • ColorVu | `CPP-B01-4MP-CV` | ₹2,350 | ₹4,200 | 20 | Yes |
| CP Plus 2MP/4MP/8MP IR Bullet Camera | 8MP • 2.8mm • Bullet • 4K UHD | `CPP-B01-8MP-28` | ₹4,890 | ₹8,500 | 8 | No (Prepaid Only) |

---

## 4. Interactive CCTV Combo / Package Builder ([ADR-006](file:///d:/work/megatech/patelnetworks/decisions.md#adr-006-interactive-custom-cctv-kit--bundle-builder))

To simplify purchasing complete surveillance setups, the system features a dedicated **Interactive CCTV Kit Builder**:

```
[Step 1: Choose Recorder]
  ➔ Select DVR (Analog HD) or NVR (IP PoE)
  ➔ Select Channel Capacity: 4-Channel, 8-Channel, 16-Channel

[Step 2: Choose Cameras & Lenses]
  ➔ Live counter ensures Total Cameras <= Recorder Channels
  ➔ Mix and match Indoor Domes + Outdoor Bullets (2MP / 4MP / 8MP)

[Step 3: Choose Surveillance Storage (Hard Drive)]
  ➔ Options: No HDD, 1TB, 2TB, 4TB, 8TB (Seagate SkyHawk / WD Purple)
  ➔ Displays estimated recording retention days (e.g. 4 cameras @ 2MP on 1TB ≈ 15 days)

[Step 4: Power Supply, Cables & Connectors]
  ➔ Auto-suggests matching 4-CH or 8-CH SMPS Power Supply
  ➔ Select Cable: 90m roll, 180m roll, or 305m drum
  ➔ Select BNC/DC connectors or RJ45 pack

[Step 5: Bundle Summary, Special Kit Discount & Add to Cart]
  ➔ Applies a package bundle discount (e.g., 5% off combo total)
  ➔ Adds all matching SKUs to the cart atomically
```

---

## 5. Taxation, GST & Pricing Model ([ADR-002](file:///d:/work/megatech/patelnetworks/decisions.md#adr-002-hybrid-b2c--b2b-billing-with-gstin-input-credit))

### GST (Goods and Services Tax) Compliance (India)
1. **HSN Code Categorization**:
   * CCTV Cameras & Recorders (DVR/NVR): **HSN 8525** (18% GST)
   * Cables & Wiring: **HSN 8544** (18% GST)
   * Connectors, Plugs & Sockets: **HSN 8536** (18% GST)
   * Computer Monitors & Screens: **HSN 8528** (18% or 28% depending on screen size)
2. **Price Display Strategy**:
   * Storefront prices are displayed clearly as: `₹ Selling Price (Inclusive of all taxes)`.
   * Line-item breakdown on Cart, Checkout, and Invoices:
     * Taxable Value (Base Price)
     * CGST + SGST (for Intra-state shipments within the operating state)
     * IGST (for Inter-state shipments across India)
3. **B2B Tax Invoicing (Input Tax Credit)**:
   * During checkout, enterprise/contractor customers can toggle: *"Use GSTIN for Business Input Tax Credit"*.
   * Captures: Legal Business Name and 15-character Indian GSTIN format.
   * Automated computer-generated PDF tax invoices are generated upon order confirmation.

---

## 6. Payment Methods & Selective COD ([ADR-004](file:///d:/work/megatech/patelnetworks/decisions.md#adr-004-selective-cash-on-delivery-cod-admin-controlled))

1. **Online Prepaid Payments**:
   * Powered by Razorpay (UPI, Google Pay, PhonePe, Credit/Debit Cards, NetBanking, and Cardless EMI).
2. **Selective Cash on Delivery (COD)**:
   * **Admin Controllable**: Each product/SKU has an `isCodAllowed` boolean.
   * High-risk, bulky, or high-value items (e.g. 16-channel NVRs, 305m drums, optical fusion splicers) are strictly prepaid.
   * If any item in the cart is ineligible for COD, the customer is required to pay online.
   * Pincode serviceability check verifies whether the carrier supports COD delivery in that postal zone.

---

## 7. Customer Authentication: Phone OTP ([ADR-003](file:///d:/work/megatech/patelnetworks/decisions.md#adr-003-phone-number--sms-otp-authentication))

* **Customer Authentication**: Phone Number + 6-digit SMS OTP via Indian SMS Gateway (MSG91 / Fast2SMS / Firebase).
* Eliminates forgotten passwords, increases checkout conversion, and guarantees verified phone numbers for delivery riders.
* **Admin Authentication**: Email + Strong Password + RBAC session cookies.

---

## 8. Order Lifecycle & Status State Machine

```
[Customer Checkout]
        │
   (Payment Method)
   ├── Online Prepaid ──> (Pending Payment) ──(Razorpay Webhook)──> (Paid)
   └── Selective COD  ──> (COD Pending) ──(Admin/Phone Verify)───> (Confirmed)
                                                                      │
                                                                      ▼
                                                                (Processing)
                                                                      │
                                                     (Packed & Serial Number Scan)
                                                                      │
                                                                      ▼
                                                                   (Packed)
                                                                      │
                                                          (Handed to Carrier)
                                                                      │
                                                                      ▼
                                                                  (Shipped)
                                                                      │
                                                                      ▼
                                                              (Out for Delivery)
                                                                      │
                                                                      ▼
                                                                 (Delivered)
```

---

## 9. Inventory Policies & Thresholds

| Stock Type | Definition |
| :--- | :--- |
| **Physical Stock (`current_stock`)** | Total physical units physically present in the warehouse. |
| **Reserved Stock (`reserved_stock`)** | Units locked in active checkout sessions or paid orders awaiting dispatch. |
| **Available Stock (`available_stock`)** | `current_stock - reserved_stock`. Only this number can be purchased on the storefront. |
| **Low-Stock Alert Threshold** | Configurable per SKU (e.g. 5 units). Flags alerts on the admin dashboard. |

### Stock Movement Audit Log
Every single addition, decrement, order reservation, cancel return, or warehouse write-off is logged into an immutable table `inventory_movements` with:
* Timestamp
* Operator / System User ID
* SKU ID
* Quantity Delta (+ / -)
* Movement Reason (`ORDER_RESERVED`, `ORDER_DISPATCHED`, `RETURN_RESTOCK`, `MANUAL_ADJUSTMENT`, `DAMAGED_WRITE_OFF`)

---

## 10. Role-Based Access Control (RBAC)

1. **`SUPER_ADMIN`**: Full platform authority, financial configurations, role assignments, system settings, and tax rules.
2. **`ADMIN`**: Catalog management, customer management, high-level reporting, coupon creation, and selective COD overrides.
3. **`INVENTORY_MANAGER`**: SKU creation, stock adjustments, barcode scanning, purchase order intake, and low-stock replenishment.
4. **`ORDER_MANAGER`**: Order picking, serial number scanning, packing, AWB label generation, courier dispatch, and return verification.
5. **`CONTENT_MANAGER`**: Banners, kit builder configurations, homepage layouts, product descriptions, blogs, FAQs, and SEO meta tags.

---

## 11. WhatsApp Business Notifications & Customer Alerts ([ADR-007](file:///d:/work/megatech/patelnetworks/decisions.md#adr-007-integration-readiness--placeholder-fallback-for-razorpay--whatsapp-api))

Because open rates on WhatsApp in India exceed 90%, transactional notifications are dispatched directly to the customer's registered WhatsApp phone number:

| Event Trigger | WhatsApp Template Content Summary | Variables |
| :--- | :--- | :--- |
| **Login / Checkout OTP** | *"Your Patel Networks verification code is {{1}}. Valid for 5 minutes. Do not share this code."* | OTP Code |
| **Order Placed & Paid** | *"Hi {{1}}, thank you for your order #{{2}} for {{3}} items amounting to ₹{{4}}. We are preparing your shipment."* | Customer Name, Order Number, Total Items, Amount |
| **COD Order Verification** | *"Hi {{1}}, we received your Cash on Delivery request for Order #{{2}}. Click here to confirm your delivery address: {{3}}"* | Customer Name, Order Number, Confirmation Link |
| **Shipped & AWB Dispatched** | *"Your surveillance hardware for Order #{{1}} has been shipped via {{2}}. Track live with AWB {{3}}: {{4}}"* | Order Number, Courier Name, AWB, Tracking URL |
| **Out for Delivery** | *"Good news {{1}}! Your Patel Networks order #{{2}} is out for delivery today with courier executive."* | Customer Name, Order Number |
| **Return / Refund Update** | *"Your return for Order #{{1}} has been inspected and approved. ₹{{2}} has been initiated to your source account."* | Order Number, Refund Amount |

---

## 12. Commercial Invoicing & Checkout Policies (Phase 3)

### 12.1 Hybrid B2C & B2B GST Compliance ([ADR-002](file:///d:/work/megatech/patelnetworks/decisions.md#adr-002-hybrid-b2c--b2b-billing-with-gstin-input-credit))
* **B2C Consumer Purchases**:
  * Default retail tax invoice generated with customer full name and delivery address.
  * Standard 18% GST collected and remitted to Indian tax authorities.
* **B2B Commercial & Contractor Purchases**:
  * Customers toggle *"I have a GSTIN for Input Tax Credit"* during checkout.
  * Requires valid Registered Business Name and 15-character Indian GSTIN (`24...` for Gujarat, `27...` for Maharashtra, etc.).
  * Enables electrical contractors, commercial IT firms, and security installers to claim back 18% Input Tax Credit on their GSTR-2B filing.

### 12.2 Cash on Delivery (COD) Risk Management ([ADR-004](file:///d:/work/megatech/patelnetworks/decisions.md#adr-004-selective-cash-on-delivery-cod-admin-controlled))
* **Bulky & High-Value Items**:
  * 305-meter solid copper cable drums (e.g., `DL-C6-305M`) and multi-channel recorders incur high reverse logistics shipping penalties if rejected on delivery.
  * These items are designated `isCodAllowed: false`.
  * If a cart contains even one prepaid-only item, COD is automatically disabled with an advisory banner explaining that prepaid dispatch is required.
* **Eligible Items**:
  * Standard surveillance cameras, hard drives, and connectors allow Cash on Delivery with verification.

### 12.3 Custom CCTV Kit Bundle Discount ([ADR-006](file:///d:/work/megatech/patelnetworks/decisions.md#adr-006-interactive-custom-cctv-kit--bundle-builder))
* The discount is itemized directly on the summary card and invoice to incentivize full-system purchases over individual piece-meal orders.

---

## 13. Customer Identity & Account Verification Policies (Phase 4)

### 13.1 Passwordless Mobile Authentication ([ADR-003](file:///d:/work/megatech/patelnetworks/decisions.md#adr-003-phone-number--sms-otp-authentication), [ADR-011](file:///d:/work/megatech/patelnetworks/decisions.md#adr-011-phone-number--sms-otp-authentication-with-dual-mode-gateway-and-jwt-sessions))
* **Primary Identifier**: Indian 10-digit mobile number (+91) serves as the primary unique customer key across all orders and delivery waybills.
* **Friction Elimination**: Password creation, reset loops, and email verification friction are eliminated in favor of a 6-digit SMS OTP, increasing checkout conversion by an estimated 25-35%.
* **Security Rate-Limiting**: To prevent SMS toll fraud and brute-forcing, OTP dispatches are throttled to a maximum of 3 requests per 10 minutes per mobile number.

### 13.2 B2B Contractor Profile & Address Book
* **Repeat Order Velocity**: Electrical contractors, CCTV dealers, and corporate purchasing managers can save their verified Company Legal Entity Name, 15-character GSTIN, and multiple job-site dispatch addresses directly in their account portal (`/account`).
* **Instant Checkout Prefill**: Logged-in customers experience an accelerated checkout flow where recipient contact details, default warehouse/site delivery addresses, and B2B GSTIN profiles are automatically pre-populated.

---

## 14. Back-Office Admin Operations & Hardware Serial Compliance (Phase 7)

### 14.1 Surat Central Fulfillment Hub Operations
* **Executive Metrics Dashboard (`/admin`)**:
  * Real-time visibility into Gross Merchandise Value (GMV), 18% Input GST breakdown, active pipeline fulfillments, and completed consignments.
  * Payment channel split monitoring (Prepaid Razorpay vs Selective COD) to maintain working capital health and mitigate courier cash-handling fees.
* **Fulfillment Pipeline Controls (`/admin/orders`)**:
  * Order triage by processing state: `PENDING_PAYMENT` ➔ `CONFIRMED` ➔ `PACKED` ➔ `SHIPPED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`.
  * Single-click courier waybill generation (AWB) via Shiprocket and Delhivery carrier APIs.
  * Direct access to standard 18% GST Tax Invoices for physical package insertion.

### 14.2 Hardware Serial Number Scanning for Warranty & RMA Compliance
* **Manufacturer RMA & Warranty Traceability**:
  * In the Indian surveillance market, brands (Hikvision, CP Plus, Dahua, Western Digital) mandate hardware serial numbers for 2-to-3 year manufacturer warranty claims.
  * The admin console provides dedicated per-item hardware serial number inputs, permanently associating specific physical units (`serialNumbers: ["SN-98214", "SN-98215"]`) with the customer order.
  * Eliminates warranty disputes, gray-market tampering, and illegitimate RMA claims.

### 14.3 Concurrency-Safe SKU Inventory Adjustments (`/admin/inventory`)
* **Strict Physical-to-Digital Reconciliation**:
  * Warehouse managers can record physical intake and write-offs with mandatory audit reason codes:
    * `PURCHASE_RECEIPT`: Restock batches received from manufacturer distributors.
    * `MANUAL_ADJUSTMENT`: Stock counting reconciliation.
    * `DAMAGED_WRITE_OFF`: Broken, dropped, or transit-damaged items.
    * `RETURN_RESTOCK`: Inspected customer or contractor returns.
  * Concurrency locks prevent negative stock, ensuring that online checkout reservations are always 100% physically deliverable.

---

## 15. Public Policies & Corporate Governance Infrastructure (Phase 9 — ADR-016)

### 15.1 Pan-India Shipping & Logistics Policy (`/shipping-policy`)
* **Postal Circle SLAs**: Standard 2–3 business day delivery for Gujarat intra-state and Tier-1 metros; 4–7 business days for non-metro and special terrain zones.
* **Same-Day Dispatch Cutoff**: Orders confirmed and paid prior to 4:00 PM IST (Mon–Sat) are handed over to Delhivery/Shiprocket same day.
* **Air-Cargo Restrictions**: Lithium battery packs and heavy cable drums transit exclusively via surface cargo; remote air routes are strictly prepaid.

### 15.2 Commercial Warranty & 7-Day DOA Return Policy (`/return-policy`)
* **7-Day Dead On Arrival (DOA) Guarantee**: Immediate replacement dispatch upon receipt and serial verification of defective surveillance units.
* **Manufacturer Brand Warranties**: 2-year warranty on CP Plus, Hikvision, and Dahua cameras/DVRs; 3-year warranty on Western Digital Purple surveillance hard drives.
* **Serial Number Validation**: Serial numbers printed on hardware chassis must match original 18% GST tax invoice.

### 15.3 Commercial Terms & Legal Jurisdiction (`/terms`)
* **Statutory Compliance**: All transactions billed under Indian Goods and Services Tax Act with mandatory 18% GST.
* **Title Transfer**: Ownership transfers to buyer upon carrier pickup at Surat Central Warehouse.
* **Jurisdiction**: Exclusive commercial jurisdiction in Surat, Gujarat courts.

### 15.4 Dedicated Wholesale Desk & Institutional Orders (`/contact`, `/about`)
* **High-Volume Quotes**: Interactive B2B inquiry form generating structured commercial quotation requests.
* **Direct RTGS / NEFT Transfers**: Official bank account coordinates displayed for institutional and enterprise purchases exceeding online card/UPI transaction limits.

---

## 16. Admin CRM & Commercial Reporting Suite (Phase 10 — ADR-017)

### 16.1 Customer & Contractor CRM Directory (`/admin/customers`)
* **Lifetime Value Tracking**: Real-time aggregation of orders placed and total INR spend per client.
* **B2B Contractor Verification**: Admin verification badge for genuine electrical contractors, unlocking wholesale terms.
* **1-Click WhatsApp Support**: Direct launch of pre-formatted WhatsApp chat with client's registered mobile number.

### 16.2 Executive Commercial Reports & GSTR-1 Tax Engine (`/admin/reports`)
* **GSTR-1 Tax Schedules**: Segregated Intra-State CGST (9%) + SGST (9%) for Gujarat vs Inter-State IGST (18%) for effortless monthly return filing.
* **Warehouse Asset Valuation**: Live capitalization valuation of on-hand inventory across all SKUs.
* **Payment Split Monitoring**: Tracks Razorpay prepaid conversion vs COD collection volume.

## 17. Commercial Data Portability & Storefront UX (Phase 11 — ADR-018)

### 17.1 Statutory CSV Export Engine
* **Order Ledger CSV**: Exports active or filtered orders with customer name, phone, GSTIN, INR total, 18% GST amount, order status, and carrier AWB.
* **GSTR-1 Tax Return CSV**: Exports ready-to-file statutory schedule for accounting and tax filing.

### 17.2 Branded Exception Resilience & Conversion Optimization
* **Surveillance Feed Lost (404 Page)**: Sleek dark-mode 404 page with camera radar graphic, quick recovery navigation, and emergency WhatsApp hotline.
* **Client Error Boundary (`error.tsx`)**: Graceful exception capture with session preservation and one-click retry.
* **Debounced Live Autocomplete & Mobile Sticky Bar**: Rapid product search with instant model suggestions, outside-click dismiss, and mobile sticky purchase bar on PDP.

---

## 18. Admin Command Center Authentication & Security Governance (Phase 12 — ADR-019)

### 18.1 Role-Based Access & Session Isolation
* **Separation of Concerns**: Operations console authentication is strictly decoupled from customer SMS OTP sessions (`pn_admin_session` vs `pn_session`).
* **Session Cryptography**: Signed 256-bit Edge JWT carrying operator credentials and role definitions (`SUPER_ADMIN`, `ADMIN`, `INVENTORY_MANAGER`, `ORDER_MANAGER`).
* **Edge Route Guards**: Next.js middleware automatically intercepts unauthenticated attempts to access any `/admin/*` operations route and redirects to `/admin/login`.

### 18.2 Operator Portal & Live Header Controls (`/admin/login`)
* **Surveillance Command Center Aesthetic**: High-contrast, encrypted interface with secret access key visibility toggle and quick test autofill.
* **Header Profile & Sign Out**: Displays authenticated operator email, role badge, and active session termination action.





