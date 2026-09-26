import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { AuthService } from '@/server/services/auth.service';
import { prisma } from '@/server/db';
import { OrderTrackingTimeline } from '@/components/storefront/OrderTrackingTimeline';
import {
  Package,
  Truck,
  FileText,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await AuthService.getCurrentUser();
  if (!user || !user.customer) {
    redirect('/account/login');
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
      customerId: user.customer.id,
    },
    include: {
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

  if (!order) {
    notFound();
  }

  const shipment = order.shipments[0];
  const payment = order.payments[0];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Back Link */}
        <div className="print:hidden mb-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
          </Link>
        </div>

        {/* Order Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Order Reference
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">
                #{order.orderNumber}
              </h1>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span>{order.items.length} items</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 uppercase tracking-wider">
                {order.status.replace(/_/g, ' ')}
              </span>
              <Link
                href={`/order-success/${order.orderNumber}`}
                className="print:hidden px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
              </Link>
            </div>
          </div>

          {/* Shipment Tracking Timeline */}
          <div className="pt-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" /> Dispatch & Delivery Status
            </h3>

            {shipment ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Carrier:</span>{' '}
                  <strong className="text-slate-800">{shipment.carrier}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Tracking AWB:</span>{' '}
                  <strong className="font-mono text-blue-600">{shipment.awbNumber || 'Generating...'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>{' '}
                  <span className="font-bold text-emerald-600">{shipment.status}</span>
                </div>
              </div>
            ) : null}

            <OrderTrackingTimeline
              orderNumber={order.orderNumber}
              currentStatus={order.status}
              carrier={shipment?.carrier}
              awbNumber={shipment?.awbNumber}
              trackingUrl={shipment?.trackingUrl}
            />
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" /> Ordered Surveillance Hardware
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Variant: <strong>{item.variantName}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">SKU: {item.skuCode}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs sm:text-right">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Price</span>
                    <span className="font-semibold text-slate-700">{formatPrice(Number(item.unitPrice))}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Qty</span>
                    <span className="font-bold text-slate-900">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total (18% GST Incl.)</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatPrice(Number(item.totalPrice))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="mt-6 pt-4 border-t border-slate-100 max-w-xs ml-auto space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Taxable Subtotal:</span>
              <span className="font-semibold">{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>18% GST Collection:</span>
              <span className="font-semibold">{formatPrice(Number(order.gstAmount))}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Express Shipping:</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
              <span>Total Amount:</span>
              <span className="text-blue-600">{formatPrice(Number(order.totalAmount))}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address & Invoicing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs text-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" /> Delivery Address
            </h3>
            <p className="font-bold text-slate-900 text-sm">{order.shippingAddress.recipientName}</p>
            <p className="text-slate-600">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && <p className="text-slate-600">{order.shippingAddress.addressLine2}</p>}
            <p className="text-slate-600 font-semibold">
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
            <p className="text-slate-500 pt-1">Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs text-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Payment & Tax Invoicing
            </h3>
            <p className="text-slate-600">
              Method: <strong className="text-slate-900">{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Razorpay Secure NetBanking'}</strong>
            </p>
            <p className="text-slate-600">
              Status: <span className="font-bold text-emerald-600">{order.status === 'PAID' ? 'Verified & Captured' : order.status}</span>
            </p>
            {order.isB2B && order.gstin ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900 block">B2B GST Tax Invoiced</span>
                <span className="font-mono text-blue-800 text-[11px]">GSTIN: {order.gstin}</span>
                {order.companyName && <span className="block text-slate-600 text-[11px]">{order.companyName}</span>}
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
