import { prisma } from '@/server/db';
import {
  OrderStatus,
  MovementReason,
  Prisma,
} from '@prisma/client';

export interface DashboardMetrics {
  totalRevenue: number;
  totalGst: number;
  totalOrders: number;
  activeOrdersCount: number;
  deliveredOrdersCount: number;
  lowStockCount: number;
  ordersByStatus: Record<string, number>;
  paymentModeSplit: {
    onlineRevenue: number;
    onlineCount: number;
    codRevenue: number;
    codCount: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalAmount: number;
    paymentMethod: string;
    recipientName: string;
    phone: string;
    itemCount: number;
    createdAt: string;
  }>;
  lowStockItems: Array<{
    skuId: string;
    skuCode: string;
    productName: string;
    variantName: string;
    currentStock: number;
    reservedStock: number;
    availableStock: number;
    threshold: number;
  }>;
}

/**
 * Aggregates high-reliability business KPI metrics for the Admin Dashboard.
 */
export async function getAdminDashboardMetrics(): Promise<DashboardMetrics> {
  const orders = await prisma.order.findMany({
    include: {
      shippingAddress: true,
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  let totalRevenue = 0;
  let totalGst = 0;
  let activeOrdersCount = 0;
  let deliveredOrdersCount = 0;
  let onlineRevenue = 0;
  let onlineCount = 0;
  let codRevenue = 0;
  let codCount = 0;

  const ordersByStatus: Record<string, number> = {};

  for (const ord of orders) {
    const amt = Number(ord.totalAmount);
    const gst = Number(ord.gstAmount);

    ordersByStatus[ord.status] = (ordersByStatus[ord.status] || 0) + 1;

    if (ord.status !== OrderStatus.CANCELLED && ord.status !== OrderStatus.REFUNDED) {
      totalRevenue += amt;
      totalGst += gst;
    }

    if (ord.status === OrderStatus.DELIVERED) {
      deliveredOrdersCount++;
    } else if (ord.status !== OrderStatus.CANCELLED && ord.status !== OrderStatus.REFUNDED) {
      activeOrdersCount++;
    }

    if (ord.paymentMethod === 'RAZORPAY') {
      onlineRevenue += amt;
      onlineCount++;
    } else {
      codRevenue += amt;
      codCount++;
    }
  }

  // Fetch Low Stock SKU Alerts
  const inventoryRecords = await prisma.inventory.findMany({
    include: {
      sku: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  const lowStockItems: DashboardMetrics['lowStockItems'] = [];

  for (const inv of inventoryRecords) {
    const available = inv.currentStock - inv.reservedStock;
    if (available <= inv.lowStockThreshold) {
      lowStockItems.push({
        skuId: inv.skuId,
        skuCode: inv.sku.code,
        productName: inv.sku.variant?.product?.name || 'Surveillance Hardware',
        variantName: inv.sku.variant?.name || 'Default',
        currentStock: inv.currentStock,
        reservedStock: inv.reservedStock,
        availableStock: Math.max(0, available),
        threshold: inv.lowStockThreshold,
      });
    }
  }

  const recentOrders = orders.slice(0, 8).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    paymentMethod: o.paymentMethod,
    recipientName: o.shippingAddress?.recipientName || 'Valued Customer',
    phone: o.shippingAddress?.phone || '',
    itemCount: o.items.reduce((acc, it) => acc + it.quantity, 0),
    createdAt: o.createdAt.toISOString(),
  }));

  return {
    totalRevenue,
    totalGst,
    totalOrders: orders.length,
    activeOrdersCount,
    deliveredOrdersCount,
    lowStockCount: lowStockItems.length,
    ordersByStatus,
    paymentModeSplit: {
      onlineRevenue,
      onlineCount,
      codRevenue,
      codCount,
    },
    recentOrders,
    lowStockItems,
  };
}

/**
 * Retrieves orders for admin console with optional status or search query filtering.
 */
export async function getAdminOrders(params: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
}) {
  const where: Prisma.OrderWhereInput = {};

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    const q = params.search.trim();
    where.OR = [
      { orderNumber: { contains: q, mode: 'insensitive' } },
      { shippingAddress: { recipientName: { contains: q, mode: 'insensitive' } } },
      { shippingAddress: { phone: { contains: q } } },
      { shipments: { some: { awbNumber: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  return await prisma.order.findMany({
    where,
    include: {
      shippingAddress: true,
      billingAddress: true,
      items: true,
      payments: true,
      shipments: {
        include: { events: { orderBy: { timestamp: 'desc' } } },
      },
      statusHistory: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit || 50,
  });
}

/**
 * Retrieves all catalog products with variants and SKUs for admin editing.
 */
export async function getAdminProducts() {
  return await prisma.product.findMany({
    include: {
      brand: true,
      category: true,
      variants: {
        include: {
          sku: {
            include: { inventory: true },
          },
        },
      },
      images: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Retrieves full SKU inventory list with real-time stock levels and recent movements.
 */
export async function getAdminInventoryList() {
  return await prisma.sku.findMany({
    include: {
      variant: {
        include: {
          product: {
            include: { brand: true, category: true },
          },
        },
      },
      inventory: true,
      movements: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { code: 'asc' },
  });
}

/**
 * Concurrency-safe physical stock adjustment with immediate MovementReason audit trail.
 */
export async function adjustSkuStock(params: {
  skuId: string;
  quantityDelta: number;
  reason: MovementReason;
  notes?: string;
  userId?: string;
}) {
  const { skuId, quantityDelta, reason, notes, userId } = params;

  return await prisma.$transaction(async (tx) => {
    const inv = await tx.inventory.findUnique({
      where: { skuId },
    });

    if (!inv) {
      throw new Error(`Inventory record for SKU ${skuId} not found.`);
    }

    const newStock = inv.currentStock + quantityDelta;
    if (newStock < 0) {
      throw new Error(`Cannot adjust stock below 0. Current physical stock is ${inv.currentStock}.`);
    }

    const updated = await tx.inventory.update({
      where: { skuId },
      data: {
        currentStock: newStock,
      },
    });

    await tx.inventoryMovement.create({
      data: {
        skuId,
        quantity: quantityDelta,
        reason,
        notes: notes || `Admin Manual Adjustment (${quantityDelta > 0 ? '+' : ''}${quantityDelta})`,
        createdById: userId,
      },
    });

    return updated;
  }, {
    maxWait: 15000,
    timeout: 30000,
  });
}


/**
 * Toggles product Cash on Delivery eligibility (Selective COD - ADR-004).
 */
export async function toggleProductCodAllowed(productId: string, isCodAllowed: boolean) {
  return await prisma.product.update({
    where: { id: productId },
    data: { isCodAllowed },
  });
}

/**
 * Toggles product visibility / active state in public catalog.
 */
export async function toggleProductActive(productId: string, isActive: boolean) {
  return await prisma.product.update({
    where: { id: productId },
    data: { isActive },
  });
}

/**
 * Updates scanned hardware serial numbers for an OrderItem for warranty & RMA tracking.
 */
export async function updateOrderItemSerialNumbers(
  orderItemId: string,
  serialNumbers: string[]
) {
  return await prisma.orderItem.update({
    where: { id: orderItemId },
    data: { serialNumbers },
  });
}

export interface AdminCustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  companyName?: string | null;
  gstin?: string | null;
  isB2BVerified: boolean;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  createdAt: string;
}

/**
 * Retrieves customer & contractor directory with order spend analytics.
 */
export async function getAdminCustomersList(search?: string): Promise<AdminCustomerSummary[]> {
  const where: Prisma.CustomerWhereInput = {};

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { companyName: { contains: q, mode: 'insensitive' } },
      { gstin: { contains: q, mode: 'insensitive' } },
      { user: { phone: { contains: q } } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    include: {
      user: { select: { phone: true, email: true } },
      orders: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return customers.map((c) => {
    const validOrders = c.orders.filter(
      (o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.REFUNDED
    );
    const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const defAddr = c.addresses[0];

    return {
      id: c.id,
      fullName: c.fullName,
      phone: c.user.phone,
      email: c.user.email,
      companyName: c.companyName,
      gstin: c.gstin,
      isB2BVerified: c.isB2BVerified,
      totalOrders: c.orders.length,
      totalSpent,
      lastOrderDate: c.orders[0]?.createdAt.toISOString() || null,
      city: defAddr?.city || null,
      state: defAddr?.state || null,
      pincode: defAddr?.pincode || null,
      createdAt: c.createdAt.toISOString(),
    };
  });
}

export interface CommercialReportData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalGstCollected: number;
    avgOrderValue: number;
  };
  taxBreakdown: {
    cgstTotal: number;
    sgstTotal: number;
    igstTotal: number;
    totalGst: number;
  };
  inventoryValuation: {
    totalPhysicalUnits: number;
    totalAvailableUnits: number;
    totalAssetValue: number;
    totalSkusCount: number;
  };
  paymentSplit: {
    razorpayAmount: number;
    razorpayCount: number;
    codAmount: number;
    codCount: number;
  };
  dailySales: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

/**
 * Aggregates comprehensive commercial accounting, tax, and inventory valuation reports.
 */
export async function getAdminCommercialReports(): Promise<CommercialReportData> {
  const [orders, skus] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
      include: {
        shippingAddress: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.sku.findMany({
      include: { inventory: true },
    }),
  ]);

  let totalRevenue = 0;
  let totalGstCollected = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let razorpayAmount = 0;
  let razorpayCount = 0;
  let codAmount = 0;
  let codCount = 0;

  const dailySalesMap: Record<string, { revenue: number; orders: number }> = {};

  for (const ord of orders) {
    const amt = Number(ord.totalAmount);
    const gst = Number(ord.gstAmount);
    totalRevenue += amt;
    totalGstCollected += gst;

    // Check if intra-state (Gujarat state code 24 or state name Gujarat)
    const isIntraState =
      ord.shippingAddress?.state?.toLowerCase().includes('gujarat') ||
      ord.gstin?.startsWith('24');

    if (isIntraState) {
      const halfGst = Math.round((gst / 2) * 100) / 100;
      cgstTotal += halfGst;
      sgstTotal += halfGst;
    } else {
      igstTotal += gst;
    }

    if (ord.paymentMethod === 'RAZORPAY') {
      razorpayAmount += amt;
      razorpayCount++;
    } else {
      codAmount += amt;
      codCount++;
    }

    const dateKey = ord.createdAt.toISOString().slice(0, 10);
    if (!dailySalesMap[dateKey]) {
      dailySalesMap[dateKey] = { revenue: 0, orders: 0 };
    }
    dailySalesMap[dateKey].revenue += amt;
    dailySalesMap[dateKey].orders += 1;
  }

  // Inventory valuation
  let totalPhysicalUnits = 0;
  let totalAvailableUnits = 0;
  let totalAssetValue = 0;

  for (const s of skus) {
    if (s.inventory) {
      const physical = s.inventory.currentStock;
      const available = Math.max(0, physical - s.inventory.reservedStock);
      const price = Number(s.sellingPrice);

      totalPhysicalUnits += physical;
      totalAvailableUnits += available;
      totalAssetValue += physical * price;
    }
  }

  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  const dailySales = Object.entries(dailySalesMap).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));

  return {
    summary: {
      totalRevenue,
      totalOrders: orders.length,
      totalGstCollected,
      avgOrderValue,
    },
    taxBreakdown: {
      cgstTotal: Math.round(cgstTotal * 100) / 100,
      sgstTotal: Math.round(sgstTotal * 100) / 100,
      igstTotal: Math.round(igstTotal * 100) / 100,
      totalGst: totalGstCollected,
    },
    inventoryValuation: {
      totalPhysicalUnits,
      totalAvailableUnits,
      totalAssetValue: Math.round(totalAssetValue),
      totalSkusCount: skus.length,
    },
    paymentSplit: {
      razorpayAmount,
      razorpayCount,
      codAmount,
      codCount,
    },
    dailySales,
  };
}

/**
 * Adds a new real photographic product image URL to Supabase and mock DB.
 */
export async function addProductImage(params: {
  productId: string;
  url: string;
  altText?: string;
}) {
  const existingImages = await prisma.productImage.findMany({
    where: { productId: params.productId },
  });

  const nextSortOrder = existingImages.length;

  return await prisma.productImage.create({
    data: {
      productId: params.productId,
      url: params.url.trim(),
      altText: params.altText?.trim() || null,
      sortOrder: nextSortOrder,
    },
  });
}

/**
 * Deletes a product image record from Supabase and mock DB.
 */
export async function deleteProductImage(imageId: string) {
  return await prisma.productImage.delete({
    where: { id: imageId },
  });
}

/**
 * Sets a specific image as the primary cover image (sortOrder: 0).
 */
export async function setPrimaryProductImage(productId: string, imageId: string) {
  const allImages = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' },
  });

  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const isTarget = img.id === imageId;
    await prisma.productImage.update({
      where: { id: img.id },
      data: { sortOrder: isTarget ? 0 : i + 1 },
    });
  }

  return await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' },
  });
}

/**
 * Updates image URL or alt text.
 */
export async function updateProductImage(
  imageId: string,
  data: { url?: string; altText?: string }
) {
  const updateData: { url?: string; altText?: string | null } = {};
  if (data.url) updateData.url = data.url.trim();
  if (data.altText !== undefined) updateData.altText = data.altText.trim() || null;

  return await prisma.productImage.update({
    where: { id: imageId },
    data: updateData,
  });
}

