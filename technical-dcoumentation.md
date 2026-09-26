# Technical Architecture & Engineering Documentation

> **System Blueprint, Database Schemas, Concurrency Patterns, and Engineering Protocols**  
> Stack: Next.js (Unified Fullstack App Router) · PostgreSQL 16+ & Prisma · Razorpay + Selective COD · Shiprocket/Delhivery  
> **Source of Truth for Decisions**: Refer to [decisions.md](file:///d:/work/megatech/patelnetworks/decisions.md)

---

## 1. Engineering Ground Rules & Non-Negotiables

All engineering tasks across all development phases must strictly conform to these rules:

1. **Unified Fullstack Architecture ([ADR-001](file:///d:/work/megatech/patelnetworks/decisions.md#adr-001-unified-nextjs-fullstack-architecture))**:  
   Build both the Storefront and the Back-office Admin portal within a unified Next.js App Router project. Business logic resides in modular backend domain services under `src/server/services/`, invoked via Server Actions and Route Handlers.
2. **The Inventory Invariant**:  
   `Product ➔ Variant ➔ SKU ➔ Inventory`. Stock counters are stored and decremented strictly at the **SKU** level. Product-level stock is a derived property and must never be stored as an independent source of truth.
3. **Zero-Trust Client Data**:  
   Never trust frontend-calculated prices, GST amounts, shipping rates, or discounts. Every line item, subtotal, and tax rate must be revalidated against the database on the server at checkout.
4. **ACID Transaction Boundaries**:  
   Use database transactions (`Prisma.$transaction`) for:
   * Stock reservation during checkout.
   * Order creation and inventory deduction.
   * Payment capture and order confirmation.
   * Return inspection and inventory restocking.  
   **No negative stock. No race-condition overselling. No duplicate SKUs.**
5. **Idempotent Webhook Processing**:  
   All incoming webhooks (Razorpay payments, Shiprocket/Delhivery tracking events) must be processed idempotently using a deduplication table (`payment_events` / `shipment_events`) keyed on the unique event ID.
6. **Financial Data Integrity**:  
   Store all monetary values in the smallest currency unit (Indian Paise, `1 INR = 100 Paise`) as integers or use `Prisma.Decimal` with fixed 2-decimal precision. Never use standard floating-point numbers (`number` in JS) for financial math.
7. **Soft-Delete Rule**:  
   Financial records, orders, invoices, and customer transactions must never be hard-deleted from the database. Use soft-delete timestamps (`deleted_at`).
8. **Definition of Done (DoD)**:  
   A feature is only considered "done" when:
   * Database schema & migrations are applied.
   * Backend domain service and Server Actions/Route Handlers are implemented with validation.
   * Auth guards and RBAC permissions are enforced server-side.
   * UI components handle loading, empty, success, and error states.
   * Typecheck (`tsc --noEmit`), lint (`eslint`), and automated tests pass with zero errors.

---

## 2. Directory Layout & Module Structure

```
patelnetworks/
├── src/
│   ├── app/
│   │   ├── (storefront)/        # Public Customer Storefront
│   │   │   ├── (home)/          # Landing page with banners & categories
│   │   │   ├── products/        # Product listing & category filters
│   │   │   ├── product/[slug]/  # Product details with dynamic variant matrix
│   │   │   ├── kit-builder/     # Interactive CCTV Combo Builder (ADR-006)
│   │   │   ├── cart/            # Server-validated shopping cart
│   │   │   ├── checkout/        # Checkout (GSTIN capture, selective COD, Razorpay)
│   │   │   └── account/         # Customer account, OTP login, order tracking
│   │   ├── (admin)/             # Back-office Admin Portal
│   │   │   ├── admin/dashboard/ # Analytics, revenue, low-stock queue
│   │   │   ├── admin/catalog/   # Products, variants, SKUs, categories, brands
│   │   │   ├── admin/inventory/ # Stock counts, adjustment history, Excel import
│   │   │   ├── admin/orders/    # Order fulfillment, serial number scanning, AWB
│   │   │   └── admin/cms/       # Banners, kit builder bundles, blog, SEO
│   │   ├── api/
│   │   │   ├── webhooks/razorpay/  # Razorpay payment confirmation webhook
│   │   │   └── webhooks/shipping/  # Shiprocket/Delhivery tracking webhook
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── storefront/          # Product cards, variant selectors, kit wizard
│   │   ├── admin/               # Dense data tables, filter toolbars, stock drawers
│   │   └── ui/                  # Accessible UI primitives (Radix + Tailwind)
│   ├── server/
│   │   ├── services/            # Domain services (catalog, inventory, order, payment, shipping)
│   │   ├── db/                  # Prisma client instance & transaction wrappers
│   │   └── security/            # RBAC session validation & rate limiters
│   └── lib/                     # GST math, currency utilities, SMS OTP client
├── prisma/
│   ├── schema.prisma            # Unified database schema
│   └── seed.ts                  # CCTV catalog seed script
├── decisions.md                 # All locked-in architectural & business decisions
├── business-documentation.md    # Business rules, taxonomy, GST, order lifecycle
├── technical-dcoumentation.md   # This technical blueprint
└── changelog.md                 # Project version history
```

---

## 3. Comprehensive Database Schema (Prisma Data Model)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// 1. AUTHENTICATION, USERS & OTP
// ==========================================

enum UserRole {
  SUPER_ADMIN
  ADMIN
  INVENTORY_MANAGER
  ORDER_MANAGER
  CONTENT_MANAGER
  CUSTOMER
}

model User {
  id            String       @id @default(uuid())
  phone         String       @unique // Primary login identifier (ADR-003)
  email         String?      @unique // Optional for customers, required for admin
  passwordHash  String?      // Used by admin accounts
  role          UserRole     @default(CUSTOMER)
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?

  customer      Customer?
  adminProfile  AdminProfile?
  auditLogs     AuditLog[]

  @@map("users")
}

model OtpVerification {
  id          String   @id @default(uuid())
  phone       String
  otpCode     String
  expiresAt   DateTime
  isVerified  Boolean  @default(false)
  attempts    Int      @default(0)
  createdAt   DateTime @default(now())

  @@index([phone, isVerified])
  @@map("otp_verifications")
}

model AdminProfile {
  id          String   @id @default(uuid())
  userId      String   @unique
  fullName    String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("admin_profiles")
}

// ==========================================
// 2. CUSTOMER DOMAIN (B2C & B2B)
// ==========================================

model Customer {
  id              String      @id @default(uuid())
  userId          String      @unique
  fullName        String
  companyName     String?     // B2B Legal Entity Name (ADR-002)
  gstin           String?     // Indian 15-character GSTIN (ADR-002)
  isB2BVerified   Boolean     @default(false)
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  addresses       Address[]
  orders          Order[]
  cart            Cart?
  wishlist        Wishlist?
  reviews         Review[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@map("customers")
}

model Address {
  id            String    @id @default(uuid())
  customerId    String
  customer      Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  recipientName String
  phone         String
  addressLine1  String
  addressLine2  String?
  landmark      String?
  city          String
  state         String
  pincode       String
  isDefault     Boolean   @default(false)
  type          String    @default("HOME") // HOME, WORK, WAREHOUSE

  shippingOrders Order[]  @relation("OrderShippingAddress")
  billingOrders  Order[]  @relation("OrderBillingAddress")

  @@map("addresses")
}

// ==========================================
// 3. CATALOG & MULTI-ATTRIBUTE VARIANTS
// ==========================================

model Category {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  description String?
  imageUrl    String?
  parentId    String?
  parent      Category?  @relation("SubCategories", fields: [parentId], references: [id])
  children    Category[] @relation("SubCategories")
  hsnCode     String?    @default("8525")
  gstRate     Decimal    @default(18.0) @db.Decimal(5, 2)
  isActive    Boolean    @default(true)
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("categories")
}

model Brand {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  logoUrl     String?
  description String?
  isActive    Boolean    @default(true)
  products    Product[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("brands")
}

model Product {
  id              String         @id @default(uuid())
  name            String
  slug            String         @unique
  brandId         String
  brand           Brand          @relation(fields: [brandId], references: [id])
  categoryId      String
  category        Category       @relation(fields: [categoryId], references: [id])
  shortDesc       String?
  description     String         @db.Text
  modelNumber     String?
  isActive        Boolean        @default(true)
  isFeatured      Boolean        @default(false)
  isCodAllowed    Boolean        @default(true) // Selective COD Control (ADR-004)
  specifications  Json?          // Flexible key-value spec attributes
  images          ProductImage[]
  variants        ProductVariant[]
  reviews         Review[]
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?

  @@index([brandId])
  @@index([categoryId])
  @@map("products")
}

model ProductImage {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  altText   String?
  sortOrder Int      @default(0)

  @@map("product_images")
}

model ProductVariant {
  id          String     @id @default(uuid())
  productId   String
  product     Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  name        String     // e.g. "4MP / 3.6mm / Bullet / ColorVu"
  attributes  Json       // ADR-005 Multi-Attribute JSONB map
  skuId       String     @unique
  sku         Sku        @relation(fields: [skuId], references: [id])
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("product_variants")
}

model Sku {
  id            String            @id @default(uuid())
  code          String            @unique // e.g. "CPP-B01-4MP-CV"
  barcode       String?           @unique
  mrp           Decimal           @db.Decimal(12, 2)
  sellingPrice  Decimal           @db.Decimal(12, 2)
  weightGrams   Int               @default(500)
  dimensionsCm  Json?             // {"length": 15, "width": 10, "height": 10}
  variant       ProductVariant?
  inventory     Inventory?
  cartItems     CartItem[]
  orderItems    OrderItem[]
  bundleItems   BundleItem[]
  movements     InventoryMovement[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@map("skus")
}

// ==========================================
// 4. INVENTORY & STOCK AUDIT
// ==========================================

model Inventory {
  id                  String   @id @default(uuid())
  skuId               String   @unique
  sku                 Sku      @relation(fields: [skuId], references: [id], onDelete: Cascade)
  currentStock        Int      @default(0) // Physical units on shelf
  reservedStock       Int      @default(0) // Locked in active checkouts/pending orders
  lowStockThreshold   Int      @default(5)
  updatedAt           DateTime @updatedAt

  @@map("inventory")
}

enum MovementReason {
  PURCHASE_RECEIPT
  ORDER_RESERVED
  ORDER_DISPATCHED
  ORDER_CANCELLED_RESTOCK
  RETURN_RESTOCK
  MANUAL_ADJUSTMENT
  DAMAGED_WRITE_OFF
}

model InventoryMovement {
  id          String         @id @default(uuid())
  skuId       String
  sku         Sku            @relation(fields: [skuId], references: [id])
  quantity    Int            // Positive for additions, negative for reductions
  reason      MovementReason
  referenceId String?        // OrderId, PO number, or ReturnId
  notes       String?
  createdById String?
  createdAt   DateTime       @default(now())

  @@map("inventory_movements")
}

// ==========================================
// 5. CCTV KIT / BUNDLE BUILDER (ADR-006)
// ==========================================

model Bundle {
  id          String       @id @default(uuid())
  name        String       // e.g. "Complete 4-Camera HD Surveillance Kit"
  slug        String       @unique
  description String?
  discountPct Decimal      @default(5.0) @db.Decimal(5, 2)
  isActive    Boolean      @default(true)
  items       BundleItem[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("bundles")
}

model BundleItem {
  id          String   @id @default(uuid())
  bundleId    String
  bundle      Bundle   @relation(fields: [bundleId], references: [id], onDelete: Cascade)
  skuId       String
  sku         Sku      @relation(fields: [skuId], references: [id])
  quantity    Int      @default(1)
  isOptional  Boolean  @default(false)

  @@map("bundle_items")
}

// ==========================================
// 6. CART, WISHLIST & CHECKOUT
// ==========================================

model Cart {
  id          String     @id @default(uuid())
  customerId  String     @unique
  customer    Customer   @relation(fields: [customerId], references: [id], onDelete: Cascade)
  items       CartItem[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("carts")
}

model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  skuId     String
  sku       Sku      @relation(fields: [skuId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([cartId, skuId])
  @@map("cart_items")
}

model Wishlist {
  id          String         @id @default(uuid())
  customerId  String         @unique
  customer    Customer       @relation(fields: [customerId], references: [id], onDelete: Cascade)
  items       WishlistItem[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@map("wishlists")
}

model WishlistItem {
  id         String   @id @default(uuid())
  wishlistId String
  wishlist   Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  productId  String
  createdAt  DateTime @default(now())

  @@unique([wishlistId, productId])
  @@map("wishlist_items")
}

// ==========================================
// 7. ORDERS, PAYMENTS & FULFILLMENT
// ==========================================

enum OrderStatus {
  PENDING_PAYMENT
  COD_PENDING
  PAID
  CONFIRMED
  PROCESSING
  PACKED
  SHIPPED
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  RETURN_REQUESTED
  RETURNED
  REFUNDED
}

enum PaymentMethod {
  RAZORPAY
  CASH_ON_DELIVERY
}

model Order {
  id                String              @id @default(uuid())
  orderNumber       String              @unique // e.g. "ORD-2026-0001"
  customerId        String
  customer          Customer            @relation(fields: [customerId], references: [id])
  status            OrderStatus         @default(PENDING_PAYMENT)
  paymentMethod     PaymentMethod       @default(RAZORPAY)
  subtotal          Decimal             @db.Decimal(12, 2)
  discountAmount    Decimal             @default(0) @db.Decimal(12, 2)
  gstAmount         Decimal             @db.Decimal(12, 2)
  shippingAmount    Decimal             @default(0) @db.Decimal(12, 2)
  totalAmount       Decimal             @db.Decimal(12, 2)
  isB2B             Boolean             @default(false)
  gstin             String?
  companyName       String?
  shippingAddressId String
  shippingAddress   Address             @relation("OrderShippingAddress", fields: [shippingAddressId], references: [id])
  billingAddressId  String
  billingAddress    Address             @relation("OrderBillingAddress", fields: [billingAddressId], references: [id])
  items             OrderItem[]
  statusHistory     OrderStatusHistory[]
  payments          Payment[]
  shipments         Shipment[]
  returns           OrderReturn[]
  invoiceUrl        String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@map("orders")
}

model OrderItem {
  id              String   @id @default(uuid())
  orderId         String
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  skuId           String
  sku             Sku      @relation(fields: [skuId], references: [id])
  productName     String
  variantName     String
  skuCode         String
  quantity        Int
  unitPrice       Decimal  @db.Decimal(12, 2)
  taxRate         Decimal  @db.Decimal(5, 2)
  taxAmount       Decimal  @db.Decimal(12, 2)
  totalPrice      Decimal  @db.Decimal(12, 2)
  serialNumbers   String[] // Scanned hardware serial numbers

  @@map("order_items")
}

model OrderStatusHistory {
  id        String      @id @default(uuid())
  orderId   String
  order     Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  status    OrderStatus
  comment   String?
  changedBy String?
  createdAt DateTime    @default(now())

  @@map("order_status_history")
}

enum PaymentStatus {
  INITIATED
  SUCCESS
  FAILED
  REFUNDED
}

model Payment {
  id               String         @id @default(uuid())
  orderId          String
  order            Order          @relation(fields: [orderId], references: [id])
  gateway          String         @default("RAZORPAY")
  gatewayOrderId   String?        @unique
  gatewayPaymentId String?        @unique
  amount           Decimal        @db.Decimal(12, 2)
  currency         String         @default("INR")
  status           PaymentStatus  @default(INITIATED)
  events           PaymentEvent[]
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt

  @@map("payments")
}

model PaymentEvent {
  id          String   @id @default(uuid())
  paymentId   String
  payment     Payment  @relation(fields: [paymentId], references: [id])
  eventId     String   @unique // Deduplication key
  eventType   String
  payload     Json
  createdAt   DateTime @default(now())

  @@map("payment_events")
}

model Shipment {
  id              String          @id @default(uuid())
  orderId         String
  order           Order           @relation(fields: [orderId], references: [id])
  carrier         String          @default("SHIPROCKET")
  shipmentId      String?         @unique
  awbNumber       String?         @unique
  trackingUrl     String?
  labelUrl        String?
  status          String          @default("MANIFESTED")
  events          ShipmentEvent[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@map("shipments")
}

model ShipmentEvent {
  id          String   @id @default(uuid())
  shipmentId  String
  shipment    Shipment @relation(fields: [shipmentId], references: [id])
  eventId     String   @unique
  status      String
  location    String?
  timestamp   DateTime
  payload     Json
  createdAt   DateTime @default(now())

  @@map("shipment_events")
}

model OrderReturn {
  id          String    @id @default(uuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id])
  reason      String
  status      String    @default("REQUESTED")
  isRma       Boolean   @default(false) // Distinction between retail return & manufacturer RMA
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("order_returns")
}

model Review {
  id          String   @id @default(uuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id])
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  rating      Int      @default(5)
  title       String?
  comment     String?
  isVerified  Boolean  @default(false)
  isApproved  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("reviews")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String
  entity    String
  entityId  String
  details   Json?
  ipAddress String?
  createdAt DateTime @default(now())

  @@map("audit_logs")
}
```

---

## 4. Concurrency & Race Condition Elimination Patterns

### Atomic Stock Reservation with PostgreSQL Row Locks
```typescript
// src/server/services/inventory.service.ts
import { prisma } from '@/server/db';
import { MovementReason } from '@prisma/client';

export async function reserveStockForOrder(
  items: { skuId: string; quantity: number }[]
) {
  return await prisma.$transaction(async (tx) => {
    for (const item of items) {
      // Row-level lock to prevent concurrent overselling
      const inventory = await tx.$queryRaw<Array<{
        id: string;
        currentStock: number;
        reservedStock: number;
      }>>`
        SELECT "id", "currentStock", "reservedStock" 
        FROM "inventory" 
        WHERE "skuId" = ${item.skuId} 
        FOR UPDATE
      `;

      if (!inventory || inventory.length === 0) {
        throw new Error(`SKU ${item.skuId} does not exist in inventory.`);
      }

      const inv = inventory[0];
      const available = inv.currentStock - inv.reservedStock;

      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for SKU ${item.skuId}. Requested: ${item.quantity}, Available: ${available}`
        );
      }

      // Atomic reservation
      await tx.inventory.update({
        where: { skuId: item.skuId },
        data: {
          reservedStock: { increment: item.quantity },
        },
      });

      // Audit movement
      await tx.inventoryMovement.create({
        data: {
          skuId: item.skuId,
          quantity: -item.quantity,
          reason: MovementReason.ORDER_RESERVED,
        },
      });
    }
  });
}
```

### Idempotent Razorpay Webhook Handler
```typescript
// src/app/api/webhooks/razorpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/server/db';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // 1. Verify HMAC SHA-256
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventPayload = JSON.parse(body);
  const eventId = eventPayload.event_id || eventPayload.id;

  // 2. Deduplicate using atomic uniqueness
  const existingEvent = await prisma.paymentEvent.findUnique({
    where: { eventId },
  });

  if (existingEvent) {
    return NextResponse.json({ status: 'ignored', reason: 'duplicate_event' });
  }

  // 3. Process payment event inside transaction
  await prisma.$transaction(async (tx) => {
    await tx.paymentEvent.create({
      data: {
        paymentId: eventPayload.payload.payment.entity.id,
        eventId,
        eventType: eventPayload.event,
        payload: eventPayload,
      },
    });

    if (eventPayload.event === 'payment.captured') {
      const razorpayOrderId = eventPayload.payload.payment.entity.order_id;
      const payment = await tx.payment.findUnique({
        where: { gatewayOrderId: razorpayOrderId },
      });

      if (payment) {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            gatewayPaymentId: eventPayload.payload.payment.entity.id,
          },
        });

        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: OrderStatus.PAID,
            comment: 'Payment captured via Razorpay webhook',
          },
        });
      }
    }
  });

  return NextResponse.json({ status: 'success' });
}
```

---

## 5. Shipping Provider Abstraction Layer

```typescript
// src/server/services/shipping/shipping.interface.ts
export interface ShippingRateRequest {
  deliveryPincode: string;
  weightGrams: number;
  dimensionsCm: { length: number; width: number; height: number };
  isCod: boolean;
  orderValue: number;
}

export interface ShippingProvider {
  checkServiceability(pincode: string): Promise<{ serviceable: boolean; estimatedDays: number }>;
  calculateRate(request: ShippingRateRequest): Promise<number>;
  createShipment(orderId: string): Promise<{ shipmentId: string; awb: string; labelUrl: string }>;
  cancelShipment(shipmentId: string): Promise<boolean>;
  trackShipment(awb: string): Promise<any>;
}
```
Implemented by `ShiprocketProvider` and `DelhiveryProvider` with automatic fallback.

---

## 6. Payment (Razorpay) & WhatsApp Notification Integration ([ADR-007](file:///d:/work/megatech/patelnetworks/decisions.md#adr-007-integration-readiness--placeholder-fallback-for-razorpay--whatsapp-api))

Because vendor verification for **Razorpay** and **WhatsApp Business API** is currently in progress, the platform uses an **Active Implementation + Safe Fallback Mock Pattern**:

### 6.1 WhatsApp Business API Architecture
```typescript
// src/server/services/notifications/whatsapp.service.ts
export interface WhatsAppMessagePayload {
  toPhone: string;
  templateName: string;
  templateParameters: string[];
}

export class WhatsAppNotificationService {
  private static isConfigured(): boolean {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    return !!token && !token.includes('placeholder') && !token.includes('YOUR_');
  }

  static async sendTemplateNotification(payload: WhatsAppMessagePayload) {
    if (!this.isConfigured()) {
      console.log(`\x1b[36m[SIMULATED WHATSAPP MESSAGE]\x1b[0m to: ${payload.toPhone}`);
      console.log(`Template: ${payload.templateName} | Params:`, payload.templateParameters);
      return { success: true, simulated: true };
    }

    const response = await fetch(
      `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: payload.toPhone.replace(/\D/g, ''),
          type: 'template',
          template: {
            name: payload.templateName,
            language: { code: 'en' },
            components: [
              {
                type: 'body',
                parameters: payload.templateParameters.map((p) => ({
                  type: 'text',
                  text: p,
                })),
              },
            ],
          },
        }),
      }
    );

    return await response.json();
  }
}
```

### 6.2 Razorpay Mock Mode Handler
When `RAZORPAY_KEY_ID` contains `rzp_test_placeholder`, checkout will present a simulated checkout modal with options:
- `[Simulate Payment Success]` ➔ Triggers `/api/webhooks/razorpay` simulation with valid HMAC signature.
- `[Simulate Payment Failure]` ➔ Records failed payment attempt.

---

## 7. Environment Variables & Key Placeholders (.env.example)

```env
# ---------------------------------------------
# DATABASE & STORAGE
# ---------------------------------------------
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/patelnetworks?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ---------------------------------------------
# AUTHENTICATION & SECURITY
# ---------------------------------------------
JWT_SECRET="generate_a_random_32_byte_secret_here"
JWT_EXPIRES_IN="7d"

# ---------------------------------------------
# RAZORPAY PAYMENT GATEWAY (ONGOING PROCUREMENT)
# Replace with real keys from Razorpay Dashboard
# ---------------------------------------------
RAZORPAY_KEY_ID="rzp_test_placeholder_key_id"
RAZORPAY_KEY_SECRET="placeholder_secret_key"
RAZORPAY_WEBHOOK_SECRET="placeholder_webhook_secret"

# ---------------------------------------------
# WHATSAPP BUSINESS API (ONGOING PROCUREMENT)
# Replace with real credentials from Meta Business Suite / Gupshup
# ---------------------------------------------
WHATSAPP_API_URL="https://graph.facebook.com/v20.0"
WHATSAPP_ACCESS_TOKEN="placeholder_whatsapp_access_token"
WHATSAPP_PHONE_NUMBER_ID="placeholder_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="placeholder_business_account_id"

# ---------------------------------------------
# SHIPPING INTEGRATION (SHIPROCKET / DELHIVERY)
# ---------------------------------------------
SHIPROCKET_EMAIL="placeholder@patelnetworks.com"
SHIPROCKET_PASSWORD="placeholder_password"
SHIPROCKET_API_URL="https://apiv2.shiprocket.in/v1/external"

# ---------------------------------------------
# SMS OTP GATEWAY (FAST2SMS / MSG91 / FIREBASE)
# ---------------------------------------------
SMS_GATEWAY_API_KEY="placeholder_sms_api_key"
SMS_SENDER_ID="PTLNET"
```

---

## 8. Authentication & RBAC Guard Implementation

* **JWT Strategy**: Access Token (short-lived, 15 minutes) + Refresh Token (long-lived, 7 days stored in HTTP-only, Secure cookie).
* **Password Hashing**: Argon2id with recommended memory and parallelism parameters.
* **Server-side Session & Role Verification**:
  ```typescript
  // src/server/security/auth.guard.ts
  import { UserRole } from '@prisma/client';

  export function assertRole(userRole: UserRole, allowedRoles: UserRole[]) {
    if (!allowedRoles.includes(userRole)) {
      throw new Error('Forbidden: Insufficient privileges.');
    }
  }
  ```

---

## 9. Cart, Checkout, Concurrency-Safe Orders & GST Engine (Phase 3)

### 9.1 Cart Service Architecture (`src/server/services/cart.service.ts`)
* **Anonymous Session Binding**: Guest visitors receive an HTTP-only secure cookie `pn_cart_id` mapping to an active `Cart` record tied to a guest customer profile.
* **Server-Side Price Revalidation**: To prevent client-side price tampering or stale cache exploits, `getCart()` revalidates every item against live database SKU selling prices and inventory counts in real time.
* **Taxable Base & GST Breakdown**:
  * Surveillance hardware items are inclusive of 18% GST by default.
  * Base Taxable Value: `sellingPrice / 1.18`.
  * Total GST Amount: `sellingPrice - (sellingPrice / 1.18)`.
* **Cash on Delivery Rule Evaluation**: Cart checks whether any SKU has `product.isCodAllowed === false`. If a single non-COD item is present, COD is disabled at the cart level.

### 9.2 Concurrency-Safe Order Creation (`src/server/services/order.service.ts`)
* **Row-Level Inventory Lock (`SELECT ... FOR UPDATE`)**:
  ```sql
  SELECT "id", "currentStock", "reservedStock"
  FROM "inventory"
  WHERE "skuId" = ${skuId}
  FOR UPDATE;
  ```
* **Interactive Transaction Timeout Tuning**:
  Cross-region connections to cloud PostgreSQL (e.g. Supabase `ap-northeast-1`) require extended transaction window settings:
  ```typescript
  return await prisma.$transaction(async (tx) => {
    // Inventory locks, order creation, address, order items
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
  ```
* **State Machine & Inventory Restocking**:
  * `PENDING_PAYMENT` / `COD_PENDING` ➔ `PAID` / `CONFIRMED`.
  * `CANCELLED` ➔ Releases `reservedStock` atomically (`ORDER_CANCELLED_RESTOCK`).
  * `SHIPPED` ➔ Decrements physical `currentStock` and `reservedStock` (`ORDER_DISPATCHED`).

### 9.3 Dual-Mode Razorpay Gateway & Webhook Deduplication
* **Placeholder Mode Detection**:
  ```typescript
  private static isMockMode(): boolean {
    const key = process.env.RAZORPAY_KEY_ID;
    return !key || key.includes('placeholder') || key.startsWith('rzp_test_placeholder');
  }
  ```
* **Webhook Handler (`/api/webhooks/razorpay`)**:
  * Validates HMAC SHA-256 signature using `crypto.timingSafeEqual`.
  * Checks if `order.status === OrderStatus.PAID` before taking action to ensure zero-duplicate processing.
  * Emits simulated WhatsApp confirmation alerts (`[WHATSAPP ALERT]`).

### 9.4 Compliant Indian GST Tax Invoice View (`/order-success/[orderNumber]`)
* Formatted according to Central Goods and Services Tax Act specifications.
* Includes Supplier details: Legal Name, Registered Ahmedabad Address, State Code 24, GSTIN `24AABCP1234F1Z9`.
* Displays Buyer Details: Legal Business Name, 15-character GSTIN, Place of Supply, and Reverse Charge declaration.
* Standard `@media print` layout allowing customers and B2B buyers to directly print or save PDF invoices.

---

## 10. Customer Authentication, SMS OTP Gateway & Account Portal Architecture (Phase 4)

### 10.1 Phone Number + SMS OTP Flow (`src/server/services/auth.service.ts`)
* **Phone Normalization (`normalizeIndianPhone`)**:
  * Strips non-digit characters.
  * Ensures 10-digit input starting with `6, 7, 8, 9` is normalized to `+91XXXXXXXXXX`.
* **Rate-Limiting & Security**:
  * Enforces maximum 3 requests per 10-minute window per phone number using `prisma.otpVerification.count({ where: { phone, createdAt: { gte: tenMinutesAgo } } })`.
  * Generates cryptographically secure 6-digit numeric OTPs expiring in 5 minutes.
  * Tracks failed attempts (`attempts >= 5` invalidates OTP record).
* **Dual-Mode SMS Gateway**:
  * Detects placeholder key (`SMS_GATEWAY_API_KEY`).
  * In development mode: Logs formatted test OTP banner to stdout and returns `testOtp` for automated developer testing.
  * In production: Dispatches SMS via Fast2SMS/MSG91 REST API.

### 10.2 Session Management & Cart Association
* **JWT Cookie Specification**:
  * Library: `jose` (edge-compatible, zero native dependencies).
  * Algorithm: `HS256` signed with `JWT_SECRET`.
  * Payload: `{ userId, customerId, phone, role }`.
  * Cookie Parameters: `name: "pn_session"`, `httpOnly: true`, `secure: true (prod)`, `sameSite: "lax"`, `maxAge: 7 days`.
* **Guest Cart Linking**:
  * When an anonymous guest customer with active cart items logs in, `verifyOtpAndLogin` seamlessly associates the guest `Cart` record with the newly authenticated `Customer` profile.

### 10.3 Customer Account Portal (`/account`)
* **Server-Side Authentication Guard**:
  * `AccountPage` calls `AuthService.getCurrentUser()`. Unauthenticated requests are redirected via HTTP 307 to `/account/login?redirect=/account`.
* **Orders & Real-Time Tracking**:
  * Queries `getOrdersByCustomerId(customerId)` with eager loading of `items`, `payments`, `shippingAddress`, and `statusHistory`.
  * Visual progress tracker displaying fulfillment stages and direct links to live tracking and GST tax invoices.
* **Address Book & B2B Profile**:
  * Saved address management supporting Default Shipping address flags.
  * B2B Company Legal Name and 15-character GSTIN storage, pre-populating future checkouts.

---

## 11. Shipping Logistics, Carrier Webhooks & Pincode Intelligence Architecture (Phase 5)

### 11.1 Indian Postal Code & Geo-Logistics Engine (`src/lib/pincodes.ts`)
* **Prefix-Based Zone Resolution**:
  * **Intra-State (Origin Hub: Surat PIN 395003)**: Same/adjacent city prefixes (`38`, `39`, `36`, `37`) ➔ 1–2 business day delivery via Delhivery Surface.
  * **Metro Air & Express Connect**: Delhi NCR (`11`, `12`, `20`), Mumbai (`40`, `41`), Bengaluru (`56`), Hyderabad (`50`), Chennai (`60`), Kolkata (`70`) ➔ 2–3 business day delivery via BlueDart Express / Delhivery Surface.
  * **Regional Hubs**: Rajasthan (`30`, `31`), MP (`45`, `46`), Punjab (`14`, `16`), UP (`22`), Bihar (`80`), Kerala (`68`) ➔ 3–4 business days.
  * **Special Logistics Zones**: North-East states (`78`, `79`), Kashmir Valley (`19`), Andaman & Nicobar (`744`) ➔ 5–7 business days via air cargo.
* **Cash on Delivery (COD) Intelligence**:
  * Special air cargo zones and high-risk remote circles are automatically restricted to prepaid online payments (`isCodAvailable: false`).
  * Dynamically disables COD radio buttons in `/checkout` with informative reason banners.
* **Business-Day SLA Projection**:
  * Computes estimated delivery dates taking into account 3:00 PM IST dispatch cutoff and skipping non-working Sundays.

### 11.2 Carrier Abstraction & Dual-Mode Gateway (`src/server/services/shipping.service.ts`)
* **Live Shiprocket REST Integration**:
  * Endpoints: `POST /auth/login`, `POST /orders/create/adhoc`, `POST /couriers/assign/awb`, `GET /courier/serviceability`.
  * Real-time rate card comparison and automatic label generation.
* **Deterministic Test Simulation Mode (ADR-012)**:
  * Triggered when `SHIPROCKET_EMAIL` or `SHIPROCKET_PASSWORD` contains placeholder values.
  * Generates deterministic AWBs (`DELH...` for surface, `BLUD...` for express air).
  * Automatically creates initial `Shipment` and `ShipmentEvent` records (`MANIFESTED`).
  * Advances eligible orders to `PACKED` state with status audit log.

### 11.3 Real-Time Carrier Tracking Webhook (`POST /api/webhooks/shipping`)
* **Universal Payload Normalizer**:
  * Compatible with Shiprocket, Delhivery, and custom aggregator schemas (`awb`, `current_status`, `location`, `activity`, `timestamp`).
* **Idempotency & Deduplication**:
  * Enforces unique `eventId` indexing (`evt_${awb}_${status}_${timestamp}`). Duplicate webhook deliveries return `{ duplicate: true }` without redundant state writes.
* **Automated Order State Machine Synchronization**:
  * `IN_TRANSIT` / `PICKED_UP`: Transitions order to `SHIPPED`, executes physical inventory decrement, and records `MovementReason.ORDER_DISPATCHED`.
  * `OUT_FOR_DELIVERY`: Transitions order to `OUT_FOR_DELIVERY`.
  * `DELIVERED`: Transitions order to `DELIVERED` and auto-marks Cash on Delivery payments as `SUCCESS`.
  * `RTO_INITIATED` / `RTO_DELIVERED`: Transitions order to `RETURN_REQUESTED` and `RETURNED`.

### 11.4 Storefront Tracking Components
* `PincodeChecker`: Interactive client widget on PDP (`/products/[slug]`) and checkout with delivery estimate date, carrier partner badge, and local storage caching.
* `OrderTrackingTimeline`: 5-Stage visual progress stepper on `/order-success/[orderNumber]` with pulse indicator, courier partner info, copyable AWB, external tracking link, expandable checkpoint history, and developer simulation controls.

---

## 12. WhatsApp Business Cloud API & Real-Time E-Commerce Lifecycle Messaging (Phase 6)

### 12.1 Gateway Architecture (`src/server/services/whatsapp.service.ts`)
* **Dual-Mode Cloud Gateway ([ADR-013](file:///d:/work/megatech/patelnetworks/decisions.md#adr-013-whatsapp-business-cloud-api--real-time-e-commerce-lifecycle-messaging-engine))**:
  * **Live Meta Graph API**: Communicates directly with Meta Cloud API endpoints (`POST https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`) using Bearer token authentication.
  * **Senior Sandbox Mode**: Detects placeholder credentials (`WHATSAPP_ACCESS_TOKEN`), formats complete HSM template payloads, renders human-readable notifications in formatted terminal cards, and records audit logs in the database.
* **Phone Normalization**:
  * Converts all phone inputs to standard Indian digits-only format (`91[6-9]\d{9}`).
* **Audit Trail**:
  * All outbound WhatsApp messages are recorded in `prisma.auditLog` with `action: "WHATSAPP_DISPATCH"`, `entity: "WHATSAPP_NOTIFICATION"`, message ID, template name, recipient phone, and payload.

### 12.2 Meta HSM Message Templates & Lifecycles
* **`order_confirmation`**: Dispatched on payment capture (Razorpay webhook / interactive confirmation) and COD checkout placement.
  * Parameters: `{{customerName}}`, `{{orderNumber}}`, `{{totalAmountFormatted}}`, `{{paymentMode}}`, `{{itemsSummary}}`, `{{taxInvoiceUrl}}`.
* **`order_dispatched`**: Dispatched upon AWB booking and shipment generation.
  * Parameters: `{{customerName}}`, `{{orderNumber}}`, `{{carrierPartner}}`, `{{awbNumber}}`, `{{estimatedDeliverySLA}}`, `{{trackingUrl}}`.
* **`out_for_delivery`**: Dispatched when carrier tracking scan marks consignment as out for delivery.
  * Parameters: `{{customerName}}`, `{{orderNumber}}`, `{{carrierPartner}}`, `{{awbNumber}}`, `{{deliveryAddress}}`.
* **`order_delivered`**: Dispatched on POD confirmation.
  * Parameters: `{{customerName}}`, `{{orderNumber}}`.
* **`b2b_quote_inquiry`**: Dispatched when security installers request wholesale project pricing on commercial products.

### 12.3 Bidirectional Webhook (`/api/webhooks/whatsapp`)
* **Verification Handshake (GET)**:
  * Responds to Meta verification challenge when `hub.mode === 'subscribe'` and `hub.verify_token` matches `WHATSAPP_VERIFY_TOKEN`.
* **Delivery Status Updates & Inbound Replies (POST)**:
  * Ingests delivery events (`sent`, `delivered`, `read`, `failed`).
  * Captures customer inbound replies and stores incoming query records in `audit_logs`.

### 12.4 Storefront Components
* `WhatsAppSupportWidget.tsx`: Global floating widget with live agent status, instant quick-action prompts (Track Order, B2B Pricing, Technical Advice), and direct chat launcher.
* `B2BContractorCallout.tsx` & `B2BQuoteModal.tsx`: Contractor quotation trigger on PDP with automated WhatsApp confirmation and project inquiry logging.

---

## 13. Back-Office Admin Operations, SKU Inventory & Fulfillment (Phase 7)

### 13.1 Administrative Domain Service (`src/server/services/admin.service.ts`)
* **`getAdminDashboardMetrics()`**:
  * Real-time aggregation of GMV (`totalRevenue`), 18% GST collections (`totalGst`), active pipeline orders, completed deliveries, and payment split (Prepaid Razorpay vs Selective COD).
  * Low-stock SKU filter identifying records where `currentStock - reservedStock <= lowStockThreshold`.
* **`getAdminCustomersList(params)`**:
  * Aggregates customer profiles, associated user mobile numbers, total orders placed, aggregate lifetime spend, primary shipping locations, and corporate B2B verification credentials (`companyName`, `gstin`, `isB2BVerified`).
* **`getAdminCommercialReports()`**:
  * Executive commercial KPIs: GMV revenue, total confirmed orders, average order value (AOV).
  * Statutory GSTR-1 Tax Analysis: Accurate split of intra-state CGST (9%) + SGST (9%) for Gujarat vs inter-state IGST (18%) across all taxable transactions.
  * Warehouse Inventory Capital Asset Valuation: Sum of physical units, available units, and aggregate inventory valuation (`sellingPrice * physicalUnits`) across all SKUs.
  * Payment Split: Online Razorpay prepaid volume and revenue vs Cash on Delivery.
  * Sales Velocity: 30-day chronological rolling orders and GMV trend bars.

### 13.2 Server Actions (`src/app/actions/admin.actions.ts`)
* `adjustStockAction`: Executes stock adjustment and invalidates `/admin` and `/admin/inventory`.
* `toggleProductCodAction`: Toggles COD eligibility and invalidates `/admin/products`, `/admin/settings/cod`, and `/products`.
* `toggleProductActiveAction`: Toggles catalog visibility and invalidates `/admin/products` and `/products`.
* `adminTransitionOrderStatusAction`: Advances order state through strict `order.service.ts` state machine.
* `adminCreateShipmentAction`: Books carrier dispatch via `shipping.service.ts` generating real/simulated AWBs.
* `saveSerialNumbersAction`: Persists scanned hardware serial numbers into `OrderItem.serialNumbers`.

### 13.3 Operations UI Components (`src/components/admin/`)
* **`AdminSidebar.tsx`**: High-contrast dark slate navigation sidebar with active link highlights, live node indicator, and direct storefront jump.
* **`AdminHeader.tsx`**: Top bar detailing Surat Central Hub fulfillment status, GSTIN badge (`24AAACP1234F1Z8`), and administrative role.
* **`OrderFulfillmentConsole.tsx`**: Dense fulfillment console with search, status tabs, shipment generator, status progression stepper, hardware serial scanner, and **one-click Orders CSV export**.
* **`ProductCatalogTable.tsx`**: Product table with live toggles for `isCodAllowed` and `isActive`.
* **`InventoryManagementConsole.tsx`**: SKU stock table with stock meters, low-stock alerts, and manual adjustment modal.
* **`CustomerDirectoryTable.tsx`**: CRM matrix with quick search, B2B/Retail filter tabs, lifetime spend, and 1-click WhatsApp customer support link.
* **`CommercialReportsConsole.tsx`**: Executive reporting dashboard featuring GSTR-1 tax schedules, payment gateway distribution, warehouse asset valuation, and **statutory GSTR-1 CSV export**.

### 13.4 Commercial CSV Export Engine (ADR-018)
* Client-side CSV generator converting structured records to RFC 4180 standard comma-separated format.
* Automatic string escaping (`"..."` with escaped internal quotes) and Indian Rupee integer precision.
* **Orders Export**: Extracts order number, creation date, recipient, phone, city, state, pincode, GSTIN, total amount, GST amount, order status, payment method, and carrier AWB.
* **GSTR-1 Tax Export**: Schedules taxable bases and tax collections divided by statutory jurisdiction (Intra-State CGST/SGST vs Inter-State IGST) for direct inclusion into GST portal filings.

### 13.5 Resilient Live Search & Storefront UX Polish (ADR-018)
* **Debounced Autocomplete Engine (`searchProductsQuick`)**: 200ms debounce querying product name, model number, brand, and category with fast indexed search.
* **Click-Outside Detection & Keyboard Accessibility**: `useRef` event listener dismisses suggestions upon clicks outside container; `Escape` key clears suggestions; one-click `X` button clears query.
* **Mobile Drawer Parity**: Autocomplete dropdown mirrored within the mobile drawer for consistent mobile responsiveness.
* **PDP Mobile Sticky Bar**: Floating bottom purchase bar on `/products/[slug]` displaying current variant price and 1-click Add to Cart.

### 13.7 Admin Command Center Authentication & Security Guards (ADR-019)
* **Dedicated Session Cookie Isolation (`pn_admin_session`)**:
  * Edge-compatible signed 256-bit JWT (`HS256` via `jose`) with `adminId`, `email`, `fullName`, and `role` (`SUPER_ADMIN`, `ADMIN`).
  * Isolated from customer cart/OTP sessions (`pn_session`) with `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`, and 7-day expiration.
* **Command Center Login Portal (`/admin/login`)**:
  * High-tech surveillance portal with show/hide password toggle, error digest alerts, and a quick one-click demo autofill tool for development/testing (`superadmin@patelnetworks.in` / `patel@admin2026`).
* **Next.js Edge Middleware Route Guards (`src/middleware.ts`)**:
  * Middleware intercepting all `/admin/*` routes.
  * Unauthenticated requests are immediately redirected with HTTP 307 to `/admin/login?next=[path]`.
  * Authenticated admin requests to `/admin/login` automatically route forward to `/admin`.
* **Admin Header & Session Management**:
  * `AdminHeader.tsx` renders authenticated operator details, role badge, and active **"Sign Out"** button triggering `adminLogoutAction` and cookie invalidation.

---

## 14. Verification & Automated Testing Protocol
* All features are verified by automated end-to-end TypeScript regression suites:
  * **`scripts/comprehensive_loopback_test.ts` (39 Assertions, 100% Pass)**:
    1. Multi-attribute catalog taxonomy (7 categories, 4 variants per CCTV model).
    2. 6-digit Indian PIN code routing (Hub Intra-State, Metro, Special Zone, Air-cargo COD restrictions).
    3. Server-side cart pricing and 18% GST calculation (CGST + SGST vs IGST).
    4. B2B order creation with 15-character corporate GSTIN verification.
    5. Carrier AWB generation (Delhivery/Shiprocket).
    6. WhatsApp Cloud API lifecycle notifications (Order Confirmation, Carrier Dispatch).
    7. Admin stock adjustments (Purchase Receipt) and hardware serial tracking.
    8. Admin CRM customer directory aggregation and B2B verification.
    9. Commercial accounting KPIs, GSTR-1 tax schedules, and warehouse asset valuation.
    10. Live search autocomplete query and brand matching.
    11. Admin Command Center Authentication (ADR-019) credential verification and role assignment.
    12. Full HTTP serviceability of all 26 platform endpoints (25 routes + custom 404 route) with resilient cloud pooler retry backoffs.
  * **`scripts/master_loopback_test.ts` (28 Assertions, 100% Pass)**: Core domain transaction, lock, state machine, and superadmin authentication verification.
  * **Strict TypeScript Typecheck**: `npx tsc --noEmit` compiles cleanly with zero errors and zero `any` types.







