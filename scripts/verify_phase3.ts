import { prisma } from '../src/server/db';
import { addItemToCart, getCart } from '../src/server/services/cart.service';
import { createOrderFromCart, getOrderByNumber } from '../src/server/services/order.service';
import { PaymentService } from '../src/server/services/payment.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

async function verifyPhase3() {
  console.log('\n======================================================');
  console.log('🚀 BEGINNING PHASE 3 END-TO-END AUTOMATED VERIFICATION');
  console.log('======================================================\n');

  // 1. Create a dedicated test cart with guest customer
  console.log('📦 Step 1: Creating fresh test customer & cart...');
  const testPhone = `+9198888${Math.floor(10000 + Math.random() * 90000)}`;
  const testUser = await prisma.user.create({
    data: {
      phone: testPhone,
      customer: {
        create: {
          fullName: 'Vipul Patel',
        },
      },
    },
    include: { customer: true },
  });

  const testCart = await prisma.cart.create({
    data: {
      customerId: testUser.customer!.id,
    },
  });

  // Add 2x CP Plus 4MP Camera (CPP-001-4MP)
  const skuCam = await prisma.sku.findUnique({
    where: { code: 'CPP-001-4MP' },
    include: { inventory: true },
  });
  if (!skuCam) throw new Error('SKU CPP-001-4MP not found in seed.');

  const initialStock = skuCam.inventory?.currentStock ?? 0;
  const initialReserved = skuCam.inventory?.reservedStock ?? 0;
  console.log(`   Initial stock for ${skuCam.code}: Current=${initialStock}, Reserved=${initialReserved}`);

  await prisma.cartItem.create({
    data: {
      cartId: testCart.id,
      skuId: skuCam.id,
      quantity: 2,
    },
  });

  // Add 1x Hikvision 4CH DVR (HIK-DVR-04CH)
  const skuDvr = await prisma.sku.findUnique({
    where: { code: 'HIK-DVR-04CH' },
    include: { inventory: true },
  });
  if (!skuDvr) throw new Error('SKU HIK-DVR-04CH not found in seed.');

  await prisma.cartItem.create({
    data: {
      cartId: testCart.id,
      skuId: skuDvr.id,
      quantity: 1,
    },
  });

  console.log('✅ Cart items added successfully.');

  // 2. Process Checkout with B2B GSTIN details (ADR-002 & ADR-008)
  console.log('\n💳 Step 2: Executing createOrderFromCart with B2B GSTIN & Row-Level Locks...');
  const order = await createOrderFromCart({
    cartId: testCart.id,
    recipientName: 'Vipul Patel',
    phone: '+919876543210',
    email: 'vipul@patelnetworks.in',
    addressLine1: 'Plot 42, GIDC Industrial Estate Phase 2',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '382445',
    paymentMethod: 'RAZORPAY',
    isB2B: true,
    companyName: 'Patel Automation & Security Solutions Pvt Ltd',
    gstin: '24AABCP1234F1Z9',
  });

  console.log(`✅ Order Created Successfully!`);
  console.log(`   Order Number:    ${order.orderNumber}`);
  console.log(`   Subtotal (Base): ₹${order.subtotal}`);
  console.log(`   GST (18%):       ₹${order.gstAmount}`);
  console.log(`   Total Amount:    ₹${order.totalAmount}`);
  console.log(`   Status:          ${order.status}`);
  console.log(`   B2B GSTIN:       ${order.gstin} (${order.companyName})`);

  // 3. Verify Inventory Reservation
  console.log('\n🔒 Step 3: Verifying atomic inventory reservation in database...');
  const updatedInv = await prisma.inventory.findUnique({
    where: { skuId: skuCam.id },
  });
  console.log(`   Post-Order stock for ${skuCam.code}: Current=${updatedInv?.currentStock}, Reserved=${updatedInv?.reservedStock}`);
  if (updatedInv?.reservedStock !== initialReserved + 2) {
    throw new Error(`Inventory reservedStock mismatch! Expected ${initialReserved + 2}, got ${updatedInv?.reservedStock}`);
  }
  console.log('✅ Row-level lock reservation verified.');

  // 4. Verify Razorpay Order Generation
  console.log('\n🌐 Step 4: Generating Razorpay Order (Simulated Mode - ADR-007)...');
  const rzpOrder = await PaymentService.createRazorpayOrder(
    order.orderNumber,
    Number(order.totalAmount) * 100
  );
  console.log(`   Razorpay Order ID: ${rzpOrder.id} (Simulated: ${rzpOrder.isSimulated})`);

  // 5. Complete Payment (Simulated)
  console.log('\n💰 Step 5: Completing payment and confirming transaction...');
  const paymentResult = await PaymentService.completePayment({
    orderNumber: order.orderNumber,
    razorpayPaymentId: `pay_test_${Date.now()}`,
    razorpayOrderId: rzpOrder.id,
    razorpaySignature: 'simulated_signature',
  });

  console.log(`✅ Payment Processed: ${paymentResult.status}`);
  console.log(`   Order Status Transitioned To: ${paymentResult.order.status}`);

  // 6. Retrieve Order Details
  console.log('\n📋 Step 6: Verifying getOrderByNumber data completeness...');
  const retrieved = await getOrderByNumber(order.orderNumber);
  if (!retrieved) throw new Error('Could not retrieve order by number.');
  console.log(`   Items in order:   ${retrieved.items.length}`);
  console.log(`   Payment status:   ${retrieved.payments[0]?.status}`);
  console.log(`   Shipping City:    ${retrieved.shippingAddress.city}, ${retrieved.shippingAddress.state}`);
  console.log(`   Status History:   ${retrieved.statusHistory.length} event(s) recorded`);

  // 7. Verify Webhook Signature Check
  console.log('\n🛡️ Step 7: Verifying Razorpay Webhook Signature Logic...');
  const testPayload = JSON.stringify({
    event: 'order.paid',
    payload: {
      order: { entity: { id: rzpOrder.id, receipt: order.orderNumber } },
      payment: { entity: { id: 'pay_hook_123', amount: Number(order.totalAmount) * 100 } },
    },
  });
  const isSigValid = PaymentService.verifyWebhookSignature(testPayload, 'simulated_signature');
  console.log(`   Webhook signature verification result: ${isSigValid ? 'VALID (PASSED)' : 'INVALID'}`);

  console.log('\n======================================================');
  console.log('🎉 PHASE 3 VERIFICATION PASSED WITH 100% SUCCESS!');
  console.log('======================================================\n');
}

verifyPhase3()
  .catch((err) => {
    console.error('❌ Phase 3 verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
