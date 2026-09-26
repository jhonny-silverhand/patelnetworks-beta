import React from 'react';
import { getAdminOrders } from '@/server/services/admin.service';
import { OrderFulfillmentConsole } from '@/components/admin/OrderFulfillmentConsole';
import { Package } from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function AdminOrdersPage() {
  const rawOrders = await getAdminOrders({ limit: 50 });

  // Map to clean plain-data format for Client Component
  const formattedOrders = rawOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    gstAmount: Number(o.gstAmount),
    paymentMethod: o.paymentMethod,
    customerGstin: o.gstin,
    customerPan: null,
    companyName: o.companyName,
    createdAt: o.createdAt.toISOString(),
    shippingAddress: o.shippingAddress
      ? {
          recipientName: o.shippingAddress.recipientName,
          phone: o.shippingAddress.phone,
          addressLine1: o.shippingAddress.addressLine1,
          addressLine2: o.shippingAddress.addressLine2,
          city: o.shippingAddress.city,
          state: o.shippingAddress.state,
          pincode: o.shippingAddress.pincode,
        }
      : null,
    items: o.items.map((it) => ({
      id: it.id,
      skuId: it.skuId,
      productName: it.productName,
      variantName: it.variantName,
      skuCode: it.skuCode,
      quantity: it.quantity,
      unitPrice: Number(it.unitPrice),
      serialNumbers: it.serialNumbers || [],
    })),
    shipments: o.shipments.map((s) => ({
      id: s.id,
      carrier: s.carrier,
      awbNumber: s.awbNumber || null,
      status: s.status,
      estimatedDelivery: null,
    })),
  }));


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Package className="w-6 h-6 text-sky-400" />
          <span>Order Fulfillment & Dispatch Console</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Generate logistics carrier AWBs, input CCTV hardware serial numbers for warranties, and advance fulfillment pipeline states.
        </p>
      </div>

      <OrderFulfillmentConsole initialOrders={formattedOrders} />
    </div>
  );
}
