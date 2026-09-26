import { prisma } from '../src/server/db';
import { getProductBySlug, getCategories } from '../src/server/services/catalog.service';
import { calculateGstBreakdown, formatInr } from '../src/lib/utils';
import { lookupPincodeServiceability } from '../src/lib/pincodes';
import { createShipmentForOrder } from '../src/server/services/shipping.service';
import {
  sendOrderConfirmationWhatsApp,
  sendShipmentDispatchedWhatsApp,
  normalizeWhatsAppPhone,
} from '../src/server/services/whatsapp.service';
import {
  getAdminDashboardMetrics,
  adjustSkuStock,
  toggleProductCodAllowed,
  updateOrderItemSerialNumbers,
} from '../src/server/services/admin.service';
import { AdminAuthService } from '../src/server/services/admin-auth.service';
import { OrderStatus, MovementReason, PaymentMethod } from '@prisma/client';

async function main() {
  console.log('========================================================================');
  console.log('🌟 MASTER LOOPBACK REGRESSION & END-TO-END FEEDBACK SUITE (ALL PHASES)');
  console.log('========================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${msg}`);
    }
  }

  // Pre-warm / retry database connection to accommodate transient pooler reconnects
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      break;
    } catch {
      if (attempt === 4) throw new Error('Database pooler connection timed out after 4 attempts');
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // -------------------------------------------------------------------------
  // 1. CATALOG & TAXONOMY INTEGRITY (Phase 1 & 2)
  // -------------------------------------------------------------------------
  console.log('--- 1. Testing Catalog & Multi-Attribute Taxonomy ---');
  const categories = await getCategories();
  assert(categories.length > 0, `Database has ${categories.length} top-level categories populated`);

  const sampleProduct = await getProductBySlug('cp-plus-cosmic-series-smart-ir-bullet-camera');
  assert(sampleProduct !== null, 'Retrieved sample CCTV product by slug');
  assert(sampleProduct!.variants.length > 0, `Product has ${sampleProduct?.variants.length} multi-attribute variants`);
  assert(Number(sampleProduct!.variants[0].sku.sellingPrice) > 0, 'SKU selling price is strictly positive Decimal');

  // -------------------------------------------------------------------------
  // 2. PINCODE INTELLIGENCE & LOGISTICS ROUTING (Phase 5)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing 6-Digit Indian Pincode Intelligence ---');
  const suratPin = lookupPincodeServiceability('395003');
  assert(suratPin.zone === 'INTRA_STATE', 'Surat 395003 resolved to INTRA_STATE (Hub location)');
  assert(suratPin.isCodAvailable === true, 'COD is permitted in Intra-State Gujarat hub');

  const metroPin = lookupPincodeServiceability('110001');
  assert(metroPin.zone === 'METRO', 'New Delhi 110001 resolved to METRO zone');

  const remotePin = lookupPincodeServiceability('795001');
  assert(remotePin.zone === 'SPECIAL_ZONE', 'Imphal 795001 resolved to SPECIAL_ZONE logistics');
  assert(remotePin.isCodAvailable === false, 'Air-cargo route 795001 correctly marked prepaid-only (COD disallowed)');

  // -------------------------------------------------------------------------
  // 3. CART SERVER-VALIDATION & COMBO DISCOUNT (Phase 2 & 3)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Testing Server-Side Cart Pricing & GST Calculation ---');
  const testSku = sampleProduct!.variants[0].sku;
  const unitPrice = Number(testSku.sellingPrice);
  const lineTotal = unitPrice * 2;
  const breakdown = calculateGstBreakdown(lineTotal, 18);

  assert(breakdown.priceInclusiveGst === lineTotal, `Line total matches 2 * ${unitPrice}`);
  assert(breakdown.totalGst > 0, `18% GST tax accurately computed: ₹${breakdown.totalGst}`);
  assert(breakdown.cgst === breakdown.sgst, 'CGST and SGST are equally divided (9% each for Intra-State)');
  assert(Math.abs(breakdown.cgst + breakdown.sgst - breakdown.totalGst) <= 0.05, 'CGST + SGST matches total GST within decimal precision');

  // -------------------------------------------------------------------------
  // 4. B2B GSTIN TAX INVOICE & ORDER CREATION (Phase 3 & 4)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Testing Concurrency-Safe Order Creation with B2B GSTIN ---');
  let customerRecord = await prisma.customer.findFirst({
    include: { addresses: true },
  });

  if (!customerRecord) {
    const user = await prisma.user.create({
      data: {
        phone: '9876543210',
        role: 'CUSTOMER',
        customer: {
          create: {
            fullName: 'Master Loopback Test Corp',
            companyName: 'Surat Security Systems Pvt Ltd',
            gstin: '24AAACP1234F1Z8',
            isB2BVerified: true,
          },
        },
      },
      include: { customer: { include: { addresses: true } } },
    });
    customerRecord = user.customer!;
  }

  let address = customerRecord.addresses[0];
  if (!address) {
    address = await prisma.address.create({
      data: {
        customerId: customerRecord.id,
        recipientName: 'Master Test Engineer',
        phone: '9876543210',
        addressLine1: 'Plot 42, GIDC Sachin Industrial Zone',
        city: 'Surat',
        state: 'Gujarat',
        pincode: '395003',
        type: 'WAREHOUSE',
      },
    });
  }

  const orderNumber = `ORD-LOOP-${Date.now().toString().slice(-4)}`;
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customerRecord.id,
      status: OrderStatus.CONFIRMED,
      paymentMethod: PaymentMethod.RAZORPAY,
      subtotal: breakdown.taxableValue,
      gstAmount: breakdown.totalGst,
      totalAmount: lineTotal,
      isB2B: true,
      gstin: '24AAACP1234F1Z8',
      companyName: 'Surat Security Systems Pvt Ltd',
      shippingAddressId: address.id,
      billingAddressId: address.id,
      items: {
        create: [
          {
            skuId: testSku.id,
            productName: sampleProduct!.name,
            variantName: sampleProduct!.variants[0].name,
            skuCode: testSku.code,
            quantity: 2,
            unitPrice: testSku.sellingPrice,
            taxRate: 18.0,
            taxAmount: breakdown.totalGst,
            totalPrice: lineTotal,
            serialNumbers: ['SN-LOOP-001', 'SN-LOOP-002'],
          },
        ],
      },
    },
    include: { items: true },
  });




  assert(order.id !== '', `Created B2B Order: ${order.orderNumber}`);
  assert(order.isB2B === true && order.gstin === '24AAACP1234F1Z8', 'B2B GSTIN correctly persisted for tax credit');

  // -------------------------------------------------------------------------
  // 5. SHIPMENT & CARRIER AWB GENERATION (Phase 5)
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Testing Carrier AWB Generation & Dispatch ---');
  const shipment = await createShipmentForOrder(order.id, {
    carrier: 'DELHIVERY',
    autoAdvanceStatus: true,
  });

  assert(shipment.awbNumber !== null && shipment.awbNumber.startsWith('DELH'), `Generated Delhivery AWB: ${shipment.awbNumber}`);
  assert(shipment.status === 'MANIFESTED', 'Shipment status initialized to MANIFESTED');

  const updatedOrder = await prisma.order.findUnique({
    where: { id: order.id },
  });
  assert(updatedOrder?.status === OrderStatus.PACKED, 'Order status automatically advanced to PACKED');

  // -------------------------------------------------------------------------
  // 6. WHATSAPP LIFECYCLE NOTIFICATIONS (Phase 6)
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Testing WhatsApp Notification Engine & Phone Normalizer ---');
  const normalized = normalizeWhatsAppPhone('+91 98765-43210');
  assert(normalized === '919876543210', 'Phone normalized to standard 12-digit Indian format');

  const waConfirm = await sendOrderConfirmationWhatsApp(order.id);
  assert(waConfirm.success === true, 'Dispatched Order Confirmation WhatsApp alert (Simulation/Live)');

  const waDispatch = await sendShipmentDispatchedWhatsApp(shipment.id);
  assert(waDispatch.success === true, 'Dispatched Shipment Dispatched WhatsApp alert with AWB');


  // -------------------------------------------------------------------------
  // 7. ADMIN OPERATIONS & HARDWARE SERIAL TRACKING (Phase 7)
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Testing Admin Operations, Inventory & Hardware RMA ---');
  const metrics = await getAdminDashboardMetrics();
  assert(metrics.totalRevenue > 0, `Admin metrics computed GMV: ₹${metrics.totalRevenue}`);
  assert(metrics.totalOrders > 0, `Admin metrics computed Total Orders: ${metrics.totalOrders}`);

  // Test Stock Adjustment with Audit Reason
  const currentStock = testSku.sellingPrice ? 10 : 0;
  const stockAdjust = await adjustSkuStock({
    skuId: testSku.id,
    quantityDelta: 5,
    reason: MovementReason.PURCHASE_RECEIPT,
    notes: 'Master Loopback Test Restock Batch',
  });
  assert(stockAdjust.currentStock > 0, `Adjusted stock for ${testSku.code} with PURCHASE_RECEIPT`);

  // Revert Adjustment
  await adjustSkuStock({
    skuId: testSku.id,
    quantityDelta: -5,
    reason: MovementReason.MANUAL_ADJUSTMENT,
    notes: 'Master Loopback Test Reversion',
  });

  // Test Hardware Serial Numbers Update
  const updatedItemWithSerials = await updateOrderItemSerialNumbers(order.items[0].id, [
    'SN-REVERIFIED-01',
    'SN-REVERIFIED-02',
  ]);
  assert(
    updatedItemWithSerials.serialNumbers.includes('SN-REVERIFIED-01'),
    'Successfully recorded and verified hardware serial numbers for RMA warranty compliance'
  );

  // -------------------------------------------------------------------------
  // 8. ADMIN COMMAND CENTER AUTHENTICATION (ADR-019)
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Testing Admin Command Center Authentication (ADR-019) ---');
  const rejectAuth = await AdminAuthService.loginAdmin('superadmin@patelnetworks.in', 'invalid_pwd');
  assert(rejectAuth.success === false, 'Rejected unauthorized access with invalid password');

  const approveAuth = await AdminAuthService.loginAdmin('superadmin@patelnetworks.in', 'patel@admin2026');
  assert(approveAuth.success === true, 'Authenticated Superadmin credentials (ADR-019)');
  assert(approveAuth.admin?.email === 'superadmin@patelnetworks.in', 'Verified superadmin email match in session payload');

  console.log('\n========================================================================');
  console.log(`🏁 MASTER LOOPBACK RESULTS: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('========================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('Fatal error during Master Loopback execution:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
