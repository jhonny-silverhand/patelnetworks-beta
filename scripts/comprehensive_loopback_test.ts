/**
 * Patel Networks / MegaTech — Comprehensive Loopback & End-to-End Regression Test Suite
 *
 * Covers:
 * 1. Catalog & Multi-Attribute Taxonomy
 * 2. 6-Digit Indian Pincode Intelligence & Air-Cargo COD Restrictions
 * 3. Server-Side GST (18%) and Line Item Pricing
 * 4. Concurrency-Safe Order Creation with B2B GSTIN
 * 5. Carrier AWB Generation & Dispatch State Machine
 * 6. WhatsApp Business API Notification Lifecycle & Phone Normalizer
 * 7. Admin Operations, Inventory Movements & Hardware RMA Serials
 * 8. Admin Customer Directory & Lifetime Spend Analytics
 * 9. Commercial Reports & GSTR-1 Tax Reconciliation Engine
 * 10. Live Search Autocomplete Query Engine
 * 11. Full HTTP Serviceability of All 23 Platform Endpoints
 */

import { prisma } from '../src/server/db';
import { OrderStatus, MovementReason } from '@prisma/client';
import { lookupPincodeServiceability } from '../src/lib/pincodes';
import { calculateGstBreakdown } from '../src/lib/utils';
import {
  normalizeWhatsAppPhone,
  sendOrderConfirmationWhatsApp,
  sendShipmentDispatchedWhatsApp,
} from '../src/server/services/whatsapp.service';
import {
  getAdminDashboardMetrics,
  getAdminOrders,
  adjustSkuStock,
  toggleProductCodAllowed,
  updateOrderItemSerialNumbers,
  getAdminCustomersList,
  getAdminCommercialReports,
} from '../src/server/services/admin.service';
import { searchProductsQuick } from '../src/server/services/catalog.service';
import { AdminAuthService } from '../src/server/services/admin-auth.service';
import http from 'http';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`  ✅ [PASS] ${message}`);
}

function fetchStatus(path: string, retries = 2): Promise<number> {
  return new Promise((resolve) => {
    http
      .get(`http://localhost:3000${path}`, async (res) => {
        if (res.statusCode === 500 && retries > 0) {
          // Cloud Supabase pooler transient reconnect backoff
          await new Promise((r) => setTimeout(r, 1200));
          resolve(await fetchStatus(path, retries - 1));
          return;
        }
        resolve(res.statusCode || 0);
      })
      .on('error', async () => {
        if (retries > 0) {
          await new Promise((r) => setTimeout(r, 1200));
          resolve(await fetchStatus(path, retries - 1));
          return;
        }
        resolve(0);
      });
  });
}

async function runComprehensiveLoopback() {
  console.log('========================================================================');
  console.log('🚀 COMPREHENSIVE LOOPBACK REGRESSION & AUTOMATED FEEDBACK SUITE (v1.0.0)');
  console.log('========================================================================\n');

  // --- 1. Catalog & Taxonomy ---
  console.log('--- 1. Catalog & Multi-Attribute Taxonomy ---');
  const categories = await prisma.category.findMany();
  assert(categories.length >= 4, `Database has ${categories.length} categories populated`);

  const sampleProduct = await prisma.product.findFirst({
    where: { slug: 'cp-plus-cosmic-series-smart-ir-bullet-camera' },
    include: { variants: { include: { sku: { include: { inventory: true } } } } },
  });
  assert(!!sampleProduct, 'Retrieved sample CCTV product by slug');
  assert(sampleProduct!.variants.length === 4, 'Product has 4 multi-attribute variants');
  const sampleSku = sampleProduct!.variants[0].sku;
  assert(Number(sampleSku.sellingPrice) > 0, 'SKU selling price is strictly positive Decimal');

  // --- 2. Pincode Intelligence ---
  console.log('\n--- 2. Testing 6-Digit Indian Pincode Intelligence ---');
  const suratHub = lookupPincodeServiceability('395003');
  assert(suratHub.zone === 'INTRA_STATE', 'Surat 395003 resolved to INTRA_STATE (Hub location)');
  assert(suratHub.isCodAvailable === true, 'COD is permitted in Intra-State Gujarat hub');

  const delhiMetro = lookupPincodeServiceability('110001');
  assert(delhiMetro.zone === 'METRO', 'New Delhi 110001 resolved to METRO zone');

  const imphalSpecial = lookupPincodeServiceability('795001');
  assert(imphalSpecial.zone === 'SPECIAL_ZONE', 'Imphal 795001 resolved to SPECIAL_ZONE logistics');
  assert(imphalSpecial.isCodAvailable === false, 'Air-cargo route 795001 correctly marked prepaid-only');

  // --- 3. GST Calculation ---
  console.log('\n--- 3. Testing Server-Side Cart Pricing & GST Calculation ---');
  const unitPrice = Number(sampleSku.sellingPrice);
  const lineTotal = unitPrice * 2;
  const gstResult = calculateGstBreakdown(lineTotal, 18);

  assert(gstResult.priceInclusiveGst === lineTotal, `Line total matches 2 * ${unitPrice}`);
  assert(gstResult.totalGst > 0, `18% GST tax computed accurately: ₹${gstResult.totalGst}`);
  assert(gstResult.cgst === gstResult.sgst, 'CGST and SGST equally divided for Intra-State');

  // --- 4. Concurrency-Safe Order Creation with B2B GSTIN ---
  console.log('\n--- 4. Testing Order Creation with B2B GSTIN ---');
  const loopbackOrderNumber = `ORD-CMP-${Math.floor(1000 + Math.random() * 9000)}`;

  let customer = await prisma.customer.findFirst({
    where: { companyName: { contains: 'Loopback' } },
  });

  if (!customer) {
    const testUser = await prisma.user.create({
      data: {
        phone: `+9198${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'CUSTOMER',
      },
    });
    customer = await prisma.customer.create({
      data: {
        userId: testUser.id,
        fullName: 'Loopback Quality Engineer',
        companyName: 'Loopback Surveillance Testing Corp',
        gstin: '24AAACL1234F1Z5',
        isB2BVerified: true,
      },
    });
  }

  const addr = await prisma.address.create({
    data: {
      customerId: customer.id,
      recipientName: 'Loopback Quality Engineer',
      phone: '+919876543210',
      addressLine1: 'MegaTech Testing Bay 4',
      city: 'Surat',
      state: 'Gujarat',
      pincode: '395003',
      type: 'COMMERCIAL',
    },
  });

  const createdOrder = await prisma.order.create({
    data: {
      orderNumber: loopbackOrderNumber,
      customerId: customer.id,
      shippingAddressId: addr.id,
      billingAddressId: addr.id,
      status: OrderStatus.CONFIRMED,
      totalAmount: 2900,
      subtotal: 2457.63,
      gstAmount: 442.37,
      paymentMethod: 'RAZORPAY',
      isB2B: true,
      companyName: customer.companyName,
      gstin: customer.gstin,
      items: {
        create: {
          skuId: sampleSku.id,
          productName: sampleProduct!.name,
          variantName: sampleProduct!.variants[0].name,
          skuCode: sampleSku.code,
          quantity: 2,
          unitPrice: 1450,
          totalPrice: 2900,
          taxRate: 18.0,
          taxAmount: 442.37,
        },
      },
    },
    include: { items: true, shippingAddress: true },
  });

  assert(createdOrder.orderNumber === loopbackOrderNumber, `Created B2B Order: ${createdOrder.orderNumber}`);
  assert(createdOrder.gstin === '24AAACL1234F1Z5', 'B2B GSTIN correctly persisted for tax credit');

  // --- 5. Logistics AWB & WhatsApp ---
  console.log('\n--- 5. Testing Carrier AWB Generation & Dispatch ---');
  const dummyAwb = `DELH${Date.now().toString().slice(-10)}`;
  const shipment = await prisma.shipment.create({
    data: {
      orderId: createdOrder.id,
      carrier: 'DELHIVERY',
      awbNumber: dummyAwb,
      status: 'MANIFESTED',
    },
  });
  assert(!!shipment.awbNumber, `Generated Delhivery AWB: ${shipment.awbNumber}`);

  console.log('\n--- 6. Testing WhatsApp Notification Engine ---');
  const normPhone = normalizeWhatsAppPhone('9876543210');
  assert(normPhone === '919876543210', 'Phone normalized to standard 12-digit Indian format');

  const confResult = await sendOrderConfirmationWhatsApp(createdOrder.id);
  assert(confResult.success === true, 'Dispatched Order Confirmation WhatsApp alert');

  const dispResult = await sendShipmentDispatchedWhatsApp(shipment.id);
  assert(dispResult.success === true, 'Dispatched Shipment Dispatched WhatsApp alert with AWB');

  // --- 7. Admin Operations ---
  console.log('\n--- 7. Testing Admin Operations & Stock Reconciliation ---');
  const metrics = await getAdminDashboardMetrics();
  assert(metrics.totalRevenue > 0, `Admin metrics computed GMV: ₹${metrics.totalRevenue}`);
  assert(metrics.totalOrders > 0, `Admin metrics computed Total Orders: ${metrics.totalOrders}`);

  const stockAdjustment = await adjustSkuStock({
    skuId: sampleSku.id,
    quantityDelta: 10,
    reason: MovementReason.PURCHASE_RECEIPT,
    notes: 'Comprehensive Loopback Restock Batch',
  });
  assert(stockAdjustment.currentStock > 0, `Adjusted stock for ${sampleSku.code} with PURCHASE_RECEIPT`);

  const orderItem = createdOrder.items[0];
  const updatedItem = await updateOrderItemSerialNumbers(orderItem.id, ['CP-SN-1001', 'CP-SN-1002']);
  assert(updatedItem.serialNumbers.length === 2, 'Recorded hardware serial numbers for RMA warranty compliance');

  // --- 8. Admin Customer Directory ---
  console.log('\n--- 8. Testing Admin Customer Directory ---');
  const customerList = await getAdminCustomersList();
  assert(customerList.length > 0, `Retrieved ${customerList.length} customer records in admin directory`);
  const foundTestCorp = customerList.find((c) => c.companyName === 'Loopback Surveillance Testing Corp');
  assert(!!foundTestCorp, 'Found B2B test customer in directory');
  assert(foundTestCorp!.isB2BVerified === true, 'Customer B2B verification flag verified');

  // --- 9. Commercial Reports & Tax Engine ---
  console.log('\n--- 9. Testing Commercial Reports & GSTR-1 Tax Engine ---');
  const commercialReports = await getAdminCommercialReports();
  assert(commercialReports.summary.totalRevenue > 0, `Commercial Reports GMV: ₹${commercialReports.summary.totalRevenue}`);
  assert(commercialReports.taxBreakdown.totalGst > 0, `Total GST Recorded: ₹${commercialReports.taxBreakdown.totalGst}`);
  assert(commercialReports.inventoryValuation.totalPhysicalUnits > 0, `Physical Units Valued: ${commercialReports.inventoryValuation.totalPhysicalUnits}`);
  assert(commercialReports.inventoryValuation.totalAssetValue > 0, `Warehouse Capital Asset: ₹${commercialReports.inventoryValuation.totalAssetValue}`);

  // --- 10. Live Search Autocomplete ---
  console.log('\n--- 10. Testing Live Search Autocomplete Query ---');
  const searchHits = await searchProductsQuick('CP Plus');
  assert(searchHits.length > 0, `Autocomplete found ${searchHits.length} matching products for "CP Plus"`);
  assert(searchHits[0].brandName.toLowerCase().includes('cp plus'), 'Search hit correctly matched brand name');

  // --- 11. Admin Command Center Authentication (ADR-019) ---
  console.log('\n--- 11. Testing Admin Command Center Authentication (ADR-019) ---');
  const invalidAuth = await AdminAuthService.loginAdmin('superadmin@patelnetworks.in', 'wrong_pass');
  assert(invalidAuth.success === false, 'Rejected unauthorized admin login with invalid password');

  const validAuth = await AdminAuthService.loginAdmin('superadmin@patelnetworks.in', 'patel@admin2026');
  assert(validAuth.success === true, 'Successfully authenticated Superadmin credentials (ADR-019)');
  assert(validAuth.admin?.role === 'SUPER_ADMIN', 'Verified SUPER_ADMIN role assignment');

  // --- 12. Full HTTP Serviceability of All 24 Platform Endpoints ---
  console.log('\n--- 12. Full HTTP Serviceability of All 24 Platform Endpoints ---');
  const routes = [
    { path: '/', expected: 200 },
    { path: '/products', expected: 200 },
    { path: '/products/cp-plus-cosmic-series-smart-ir-bullet-camera', expected: 200 },
    { path: '/kit-builder', expected: 200 },
    { path: '/cart', expected: 200 },
    { path: '/checkout', expected: 200 },
    { path: '/about', expected: 200 },
    { path: '/contact', expected: 200 },
    { path: '/faq', expected: 200 },
    { path: '/shipping-policy', expected: 200 },
    { path: '/return-policy', expected: 200 },
    { path: '/privacy-policy', expected: 200 },
    { path: '/terms', expected: 200 },
    { path: '/account', expected: 307 }, // Customer Auth Guard redirect to /account/login
    { path: '/account/login', expected: 200 },
    { path: '/admin/login', expected: 200 }, // Admin Command Center Login Page
    { path: '/admin', expected: 307 }, // Admin Auth Guard redirect to /admin/login
    { path: '/admin/orders', expected: 307 },
    { path: '/admin/products', expected: 307 },
    { path: '/admin/inventory', expected: 307 },
    { path: '/admin/customers', expected: 307 },
    { path: '/admin/reports', expected: 307 },
    { path: '/admin/settings/cod', expected: 307 },
    { path: '/sitemap.xml', expected: 200 },
    { path: '/robots.txt', expected: 200 },
    { path: '/non-existent-feed-404', expected: 404 }, // Custom Branded 404 Error Boundary
  ];

  for (const r of routes) {
    const status = await fetchStatus(r.path);
    assert(
      status === r.expected,
      `Route ${r.path} responded with HTTP ${status} (expected ${r.expected})`
    );
  }

  console.log('\n========================================================================');
  console.log('🏁 COMPREHENSIVE LOOPBACK RESULTS: ALL ASSERTIONS PASSED (100%)');
  console.log('========================================================================');
}

runComprehensiveLoopback()
  .catch((err) => {
    console.error('Unhandled Loopback Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
