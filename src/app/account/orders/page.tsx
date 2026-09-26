import React from 'react';
import { redirect } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { AuthService } from '@/server/services/auth.service';
import { getOrdersByCustomerId } from '@/server/services/order.service';
import { AccountPortalClient } from '@/components/storefront/AccountPortalClient';

export const metadata = {
  title: 'My Orders & Dispatches | Patel Networks',
  description: 'View order status, tracking, and GST tax invoices.',
};

export default async function AccountOrdersPage() {
  const user = await AuthService.getCurrentUser();

  if (!user || !user.customer) {
    redirect('/account/login?redirect=/account/orders');
  }

  const rawOrders = await getOrdersByCustomerId(user.customer.id);

  const serializedOrders = rawOrders.map((ord) => ({
    id: ord.id,
    orderNumber: ord.orderNumber,
    status: ord.status,
    paymentMethod: ord.paymentMethod,
    subtotal: Number(ord.subtotal),
    gstAmount: Number(ord.gstAmount),
    totalAmount: Number(ord.totalAmount),
    isB2B: ord.isB2B,
    companyName: ord.companyName,
    gstin: ord.gstin,
    createdAt: ord.createdAt.toISOString(),
    shippingAddress: {
      recipientName: ord.shippingAddress.recipientName,
      city: ord.shippingAddress.city,
      state: ord.shippingAddress.state,
      pincode: ord.shippingAddress.pincode,
    },
    items: ord.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      variantName: item.variantName,
      skuCode: item.skuCode,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
  }));

  const serializedUser = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    customer: {
      id: user.customer.id,
      fullName: user.customer.fullName,
      companyName: user.customer.companyName,
      gstin: user.customer.gstin,
      isB2BVerified: user.customer.isB2BVerified,
      addresses: user.customer.addresses.map((a) => ({
        id: a.id,
        recipientName: a.recipientName,
        phone: a.phone,
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2,
        landmark: a.landmark,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.isDefault,
        type: a.type,
      })),
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <AccountPortalClient
          user={serializedUser}
          orders={serializedOrders}
          initialTab="ORDERS"
        />
      </main>
      <Footer />
    </div>
  );
}
