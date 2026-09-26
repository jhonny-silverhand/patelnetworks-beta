import { prisma } from '@/server/db';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  MovementReason,
  Prisma,
} from '@prisma/client';

export interface CreateOrderInput {
  cartId: string;
  recipientName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'RAZORPAY' | 'CASH_ON_DELIVERY';
  isB2B?: boolean;
  companyName?: string;
  gstin?: string;
}

/**
 * Valid transitions map for the strict Order State Machine
 */
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: [OrderStatus.PAID, OrderStatus.CANCELLED],
  COD_PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  PAID: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.CANCELLED, OrderStatus.REFUNDED],
  CONFIRMED: [OrderStatus.PROCESSING, OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  PROCESSING: [OrderStatus.PACKED, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  PACKED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.OUT_FOR_DELIVERY],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
  DELIVERED: [OrderStatus.RETURN_REQUESTED],
  RETURN_REQUESTED: [OrderStatus.RETURNED, OrderStatus.DELIVERED],
  RETURNED: [OrderStatus.REFUNDED],
  CANCELLED: [],
  REFUNDED: [],
};

/**
 * Atomically creates an Order from the customer's cart with row-level stock locks.
 */
export async function createOrderFromCart(input: CreateOrderInput) {
  // 1. Fetch current cart items
  const cart = await prisma.cart.findUnique({
    where: { id: input.cartId },
    include: {
      items: {
        include: {
          sku: {
            include: {
              variant: {
                include: { product: true },
              },
              inventory: true,
            },
          },
        },
      },
      customer: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Your cart is empty.');
  }

  // Check COD eligibility across all items
  if (input.paymentMethod === 'CASH_ON_DELIVERY') {
    const hasDisallowedCod = cart.items.some(
      (item) => !item.sku.variant?.product?.isCodAllowed
    );
    if (hasDisallowedCod) {
      throw new Error(
        'One or more high-value or bulky items in your cart require online prepaid payment. Cash on Delivery is disabled.'
      );
    }
  }

  // 2. Execute ACID transaction with row-level locks
  return await prisma.$transaction(async (tx) => {
    let subtotal = 0;
    let totalGst = 0;

    // Validate and lock inventory for each item
    for (const item of cart.items) {
      const invRows = await tx.$queryRaw<
        Array<{ id: string; currentStock: number; reservedStock: number }>
      >`
        SELECT "id", "currentStock", "reservedStock"
        FROM "inventory"
        WHERE "skuId" = ${item.skuId}
        FOR UPDATE
      `;

      if (!invRows || invRows.length === 0) {
        throw new Error(`Inventory record for SKU ${item.sku.code} not found.`);
      }

      const inv = invRows[0];
      const available = inv.currentStock - inv.reservedStock;

      if (available < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.sku.variant?.product.name || item.sku.code}. Available: ${available}, Requested: ${item.quantity}`
        );
      }

      // Reserve stock atomically
      await tx.inventory.update({
        where: { skuId: item.skuId },
        data: { reservedStock: { increment: item.quantity } },
      });

      // Record movement
      await tx.inventoryMovement.create({
        data: {
          skuId: item.skuId,
          quantity: -item.quantity,
          reason: MovementReason.ORDER_RESERVED,
          notes: `Reserved for checkout order`,
        },
      });

      const lineTotal = Number(item.sku.sellingPrice) * item.quantity;
      const taxable = lineTotal / 1.18;
      const gst = lineTotal - taxable;
      subtotal += taxable;
      totalGst += gst;
    }

    const totalAmount = Math.round(subtotal + totalGst);

    // Create shipping and billing addresses
    const shippingAddress = await tx.address.create({
      data: {
        customerId: cart.customerId,
        recipientName: input.recipientName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        pincode: input.pincode,
        type: 'SHIPPING',
      },
    });

    const billingAddress = shippingAddress; // Same address for billing

    // Generate Order Number: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    const initialStatus =
      input.paymentMethod === 'CASH_ON_DELIVERY'
        ? OrderStatus.COD_PENDING
        : OrderStatus.PENDING_PAYMENT;

    // Create Order
    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: cart.customerId,
        status: initialStatus,
        paymentMethod:
          input.paymentMethod === 'CASH_ON_DELIVERY'
            ? PaymentMethod.CASH_ON_DELIVERY
            : PaymentMethod.RAZORPAY,
        subtotal: new Prisma.Decimal(Math.round(subtotal * 100) / 100),
        gstAmount: new Prisma.Decimal(Math.round(totalGst * 100) / 100),
        shippingAmount: new Prisma.Decimal(0), // Free shipping
        totalAmount: new Prisma.Decimal(totalAmount),
        isB2B: input.isB2B ?? false,
        companyName: input.isB2B ? input.companyName : null,
        gstin: input.isB2B ? input.gstin?.toUpperCase() : null,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        items: {
          create: cart.items.map((item) => {
            const lineTotal = Number(item.sku.sellingPrice) * item.quantity;
            const taxable = lineTotal / 1.18;
            const gst = lineTotal - taxable;
            return {
              skuId: item.skuId,
              productName: item.sku.variant?.product.name || 'CCTV Product',
              variantName: item.sku.variant?.name || 'Standard',
              skuCode: item.sku.code,
              quantity: item.quantity,
              unitPrice: item.sku.sellingPrice,
              taxRate: new Prisma.Decimal(18.0),
              taxAmount: new Prisma.Decimal(Math.round(gst * 100) / 100),
              totalPrice: new Prisma.Decimal(lineTotal),
            };
          }),
        },
        statusHistory: {
          create: {
            status: initialStatus,
            comment:
              input.paymentMethod === 'CASH_ON_DELIVERY'
                ? 'Order placed with Cash on Delivery (pending confirmation)'
                : 'Order created awaiting Razorpay online payment',
            changedBy: 'System',
          },
        },
      },
    });

    // Create Payment record for online orders
    if (input.paymentMethod === 'RAZORPAY') {
      await tx.payment.create({
        data: {
          orderId: order.id,
          gateway: 'RAZORPAY',
          amount: new Prisma.Decimal(totalAmount),
          currency: 'INR',
          status: PaymentStatus.INITIATED,
          gatewayOrderId: `order_sim_${Date.now()}`,
        },
      });
    }

    // Clear cart items
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}

/**
 * Transitions order status strictly enforcing valid state machine transitions.
 */
export async function transitionOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  comment?: string,
  changedBy = 'System'
) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new Error(`Order ${orderId} not found.`);

    const currentStatus = order.status;
    const allowed = VALID_TRANSITIONS[currentStatus];

    if (!allowed || !allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}.`
      );
    }

    // Handle inventory movements based on status transitions
    if (newStatus === OrderStatus.CANCELLED) {
      // Release reserved stock back to available stock
      for (const item of order.items) {
        await tx.inventory.update({
          where: { skuId: item.skuId },
          data: { reservedStock: { decrement: item.quantity } },
        });

        await tx.inventoryMovement.create({
          data: {
            skuId: item.skuId,
            quantity: item.quantity,
            reason: MovementReason.ORDER_CANCELLED_RESTOCK,
            notes: `Stock release from Cancelled Order ${order.orderNumber}`,
          },
        });
      }
    } else if (newStatus === OrderStatus.SHIPPED) {
      // Decrement physical currentStock and decrement reservedStock
      for (const item of order.items) {
        await tx.inventory.update({
          where: { skuId: item.skuId },
          data: {
            currentStock: { decrement: item.quantity },
            reservedStock: { decrement: item.quantity },
          },
        });

        await tx.inventoryMovement.create({
          data: {
            skuId: item.skuId,
            quantity: -item.quantity,
            reason: MovementReason.ORDER_DISPATCHED,
            notes: `Dispatched in Order ${order.orderNumber}`,
          },
        });
      }
    }

    // Update order status and log history
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        comment: comment || `Status transitioned to ${newStatus}`,
        changedBy,
      },
    });

    return updatedOrder;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}

/**
 * Retrieves full order details by human-readable Order Number.
 */
export async function getOrderByNumber(orderNumber: string) {
  return await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      shippingAddress: true,
      billingAddress: true,
      items: true,
      payments: true,
      shipments: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * Retrieves all orders for a specific customer sorted by newest first.
 */
export async function getOrdersByCustomerId(customerId: string) {
  return await prisma.order.findMany({
    where: { customerId },
    include: {
      items: true,
      payments: true,
      shippingAddress: true,
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
