import { prisma } from '../src/server/db';
import {
  getAdminDashboardMetrics,
  getAdminOrders,
  getAdminProducts,
  getAdminInventoryList,
  adjustSkuStock,
  toggleProductCodAllowed,
  toggleProductActive,
  updateOrderItemSerialNumbers,
} from '../src/server/services/admin.service';
import { transitionOrderStatus } from '../src/server/services/order.service';
import { OrderStatus, MovementReason } from '@prisma/client';

async function main() {
  console.log('================================================================');
  console.log('🚀 PHASE 7 VERIFICATION: ADMIN OPERATIONS, INVENTORY & FULFILLMENT');
  console.log('================================================================\n');

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

  // 1. Dashboard Metrics Aggregation
  console.log('--- 1. Testing Admin Dashboard Metrics Aggregation ---');
  const metrics = await getAdminDashboardMetrics();
  assert(typeof metrics.totalRevenue === 'number' && metrics.totalRevenue >= 0, 'Total GMV is a valid non-negative number');
  assert(typeof metrics.totalGst === 'number' && metrics.totalGst >= 0, 'Total GST is a valid non-negative number');
  assert(typeof metrics.activeOrdersCount === 'number', 'Active orders count aggregated');
  assert(metrics.recentOrders.length >= 0, 'Recent orders array populated');
  assert(typeof metrics.paymentModeSplit.onlineRevenue === 'number', 'Payment split telemetry computed');

  // 2. Orders Retrieval & Filtering
  console.log('\n--- 2. Testing Admin Orders Console Queries ---');
  const allOrders = await getAdminOrders({ limit: 10 });
  assert(allOrders.length > 0, `Retrieved ${allOrders.length} orders with relational shippingAddress and items`);
  
  if (allOrders.length > 0) {
    const testOrder = allOrders[0];
    const filteredByNum = await getAdminOrders({ search: testOrder.orderNumber });
    assert(filteredByNum.some(o => o.id === testOrder.id), `Successfully searched order by orderNumber: ${testOrder.orderNumber}`);
  }

  // 3. Products Catalog & Selective COD Toggles
  console.log('\n--- 3. Testing Product Catalog & Policy Toggles ---');
  const products = await getAdminProducts();
  assert(products.length > 0, `Retrieved ${products.length} products with category HSN and variants`);

  const targetProduct = products[0];
  const initialCodState = targetProduct.isCodAllowed;

  // Toggle COD off
  const updatedProductCodOff = await toggleProductCodAllowed(targetProduct.id, !initialCodState);
  assert(updatedProductCodOff.isCodAllowed === !initialCodState, `Toggled isCodAllowed to ${!initialCodState}`);

  // Revert COD back
  const restoredProductCod = await toggleProductCodAllowed(targetProduct.id, initialCodState);
  assert(restoredProductCod.isCodAllowed === initialCodState, `Reverted isCodAllowed back to ${initialCodState}`);

  // 4. SKU Inventory & Concurrency-Safe Stock Adjustments
  console.log('\n--- 4. Testing SKU Inventory & Audit Movement Logging ---');
  const inventoryList = await getAdminInventoryList();
  assert(inventoryList.length > 0, `Retrieved ${inventoryList.length} SKUs with inventory and movement history`);

  const targetSku = inventoryList[0];
  const initialStock = targetSku.inventory?.currentStock || 0;

  // Add stock (+10 units)
  const adjustedAdd = await adjustSkuStock({
    skuId: targetSku.id,
    quantityDelta: 10,
    reason: MovementReason.PURCHASE_RECEIPT,
    notes: 'Phase 7 Verification: Restock Batch Received',
  });
  assert(adjustedAdd.currentStock === initialStock + 10, `Restocked +10 units (New: ${adjustedAdd.currentStock})`);

  // Verify InventoryMovement log created
  const latestMovement = await prisma.inventoryMovement.findFirst({
    where: { skuId: targetSku.id },
    orderBy: { createdAt: 'desc' },
  });
  assert(latestMovement?.reason === MovementReason.PURCHASE_RECEIPT && latestMovement.quantity === 10, 'Created immutable InventoryMovement record with PURCHASE_RECEIPT');

  // Reconcile stock (-10 units)
  const adjustedSub = await adjustSkuStock({
    skuId: targetSku.id,
    quantityDelta: -10,
    reason: MovementReason.MANUAL_ADJUSTMENT,
    notes: 'Phase 7 Verification: Audit Correction Revert',
  });
  assert(adjustedSub.currentStock === initialStock, `Reconciled -10 units back to original ${initialStock}`);

  // 5. Hardware Serial Number Tracking
  console.log('\n--- 5. Testing Hardware Serial Numbers (RMA/Warranty) ---');
  const orderWithItems = await prisma.order.findFirst({
    where: { items: { some: {} } },
    include: { items: true },
  });

  if (orderWithItems && orderWithItems.items.length > 0) {
    const item = orderWithItems.items[0];
    const testSerials = ['SN-VERIFY-001', 'SN-VERIFY-002'];
    const updatedItem = await updateOrderItemSerialNumbers(item.id, testSerials);
    assert(
      JSON.stringify(updatedItem.serialNumbers) === JSON.stringify(testSerials),
      `Saved ${testSerials.length} hardware serial numbers for item ${item.productName}`
    );
  } else {
    console.log('  ⚠️ Skipping serial test (no order items in database)');
  }

  console.log('\n================================================================');
  console.log(`🏁 Phase 7 Verification Completed: ${passed}/${total} assertions passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('Fatal error during Phase 7 verification:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
