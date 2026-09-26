import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { getOrderByNumber } from '@/server/services/order.service';
import {
  createShipmentForOrder,
  getShipmentForOrder,
} from '@/server/services/shipping.service';
import { OrderTrackingTimeline } from '@/components/storefront/OrderTrackingTimeline';
import { PrintInvoiceButton } from './PrintInvoiceButton';
import {
  CheckCircle2,
  Clock,
  Truck,
  FileText,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  ArrowRight,
  Package,
} from 'lucide-react';

interface OrderSuccessPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const isPaid = order.status === 'PAID';
  const isCod = order.paymentMethod === 'CASH_ON_DELIVERY';
  const payment = order.payments[0];

  // Auto-manifest shipment for confirmed/paid order if not yet created (ADR-012)
  let shipment = await getShipmentForOrder(order.id);
  if (!shipment && (order.status === 'PAID' || order.status === 'CONFIRMED')) {
    try {
      shipment = await createShipmentForOrder(order.id, { autoAdvanceStatus: true });
    } catch (err: any) {
      console.warn('[SHIPPING] Auto-manifest error:', err.message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="print:hidden">
        <Header />
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Success Banner (Hidden during print) */}
        <div className="print:hidden mb-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-600/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                  {isPaid ? 'Payment Confirmed & Verified' : 'Order Placed (Cash on Delivery)'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                  Thank You for Your Order!
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  Order <strong>#{order.orderNumber}</strong> has been secured in our automated dispatch queue.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <PrintInvoiceButton />
              <Link
                href="/products"
                className="py-2.5 px-4 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white font-semibold text-xs border border-emerald-500/40 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Live Courier Fulfillment & AWB Tracking */}
        <div className="print:hidden mb-8">
          <OrderTrackingTimeline
            orderNumber={order.orderNumber}
            currentStatus={order.status}
            carrier={shipment?.carrier || 'Delhivery Surface'}
            awbNumber={shipment?.awbNumber}
            trackingUrl={shipment?.trackingUrl}
            events={
              shipment?.events.map((e) => ({
                id: e.id,
                status: e.status,
                location: e.location,
                timestamp: e.timestamp.toISOString(),
                activity: (e.payload as any)?.activity || e.status,
              })) || []
            }
          />
        </div>

        {/* GST TAX INVOICE DOCUMENT CONTAINER (Print-Friendly) */}
        <div
          id="tax-invoice-container"
          className="bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-300">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-extrabold text-sm">
                  PN
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  PATEL NETWORKS
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-sm leading-relaxed">
                Authorized Surveillance Hardware & Networking Distributor<br />
                Shop #4, Patel Commercial Complex, C.G. Road<br />
                Ahmedabad, Gujarat - 380009, India<br />
                GSTIN: <strong>24AABCP1234F1Z9</strong> • State Code: 24 (Gujarat)<br />
                Email: billing@patelnetworks.in • Phone: +91 98765 43210
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white text-[11px] font-extrabold tracking-widest uppercase rounded">
                ORIGINAL TAX INVOICE
              </span>
              <div className="mt-3 space-y-1 text-xs text-slate-700">
                <div>
                  Invoice No: <strong className="font-mono text-slate-950 font-bold">{order.orderNumber}</strong>
                </div>
                <div>
                  Invoice Date: <strong className="text-slate-950">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                </div>
                <div>
                  Payment Mode: <strong className="text-slate-950">{order.paymentMethod === 'RAZORPAY' ? 'Online Gateway (Razorpay)' : 'Cash on Delivery (COD)'}</strong>
                </div>
                <div>
                  Payment Status:{' '}
                  <strong className={isPaid ? 'text-emerald-700' : 'text-amber-700'}>
                    {order.status}
                  </strong>
                </div>
                {payment?.gatewayPaymentId && (
                  <div>
                    Txn ID: <span className="font-mono text-[11px]">{payment.gatewayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billed To / Shipped To Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-300 text-xs text-slate-700">
            {/* Customer / Consignee */}
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Billed To (Customer Details):
              </span>
              <p className="text-sm font-bold text-slate-950">
                {order.customer.fullName}
              </p>
              {order.isB2B && order.companyName && (
                <div className="my-1 p-2 rounded bg-purple-50 border border-purple-200 text-purple-900 font-semibold">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-purple-700" />
                    <span>Company: {order.companyName}</span>
                  </div>
                  <div>GSTIN: <strong className="font-mono">{order.gstin}</strong></div>
                  <div className="text-[10px] text-purple-700">Eligible for GSTR-2B Input Tax Credit (ITC)</div>
                </div>
              )}
              <p className="mt-1 text-slate-600">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                <br />
                Mobile: {order.shippingAddress.phone}
              </p>
            </div>

            {/* Consignee / Dispatch */}
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Shipping & Consignee Address:
              </span>
              <p className="text-sm font-bold text-slate-950">
                {order.shippingAddress.recipientName}
              </p>
              <p className="mt-1 text-slate-600">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                <br />
                Place of Supply: <strong>{order.shippingAddress.state}</strong>
                <br />
                Reverse Charge Applicable: <strong>NO</strong>
              </p>
            </div>
          </div>

          {/* Tax Invoice Line Items Table */}
          <div className="py-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-y border-slate-300">
                  <th className="py-2.5 px-2 text-center w-10">#</th>
                  <th className="py-2.5 px-3">Description of Goods</th>
                  <th className="py-2.5 px-2 text-center">HSN/SAC</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Taxable Rate</th>
                  <th className="py-2.5 px-3 text-right">GST (18%)</th>
                  <th className="py-2.5 px-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => {
                  const unitPrice = Number(item.unitPrice);
                  const qty = item.quantity;
                  const lineTotal = Number(item.totalPrice);
                  const gst = Number(item.taxAmount);
                  const taxableRate = unitPrice / 1.18;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.variantName} • SKU: <span className="font-mono">{item.skuCode}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-slate-600">8525</td>
                      <td className="py-3 px-2 text-center font-bold text-slate-900">{qty}</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatPrice(taxableRate)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatPrice(gst)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">
                        {formatPrice(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax Calculation & Totals Summary */}
          <div className="pt-4 border-t border-slate-300 flex flex-col sm:flex-row justify-between gap-6">
            <div className="text-xs text-slate-600 space-y-2 max-w-sm">
              <div>
                <span className="font-bold text-slate-900 block mb-1">Declaration & Terms:</span>
                <p className="text-[11px] leading-relaxed">
                  We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                  All surveillance hardware carries 3-year warranty against manufacturing defects.
                </p>
              </div>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                Computer Generated Tax Invoice. No physical signature required.
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-2 text-xs">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Taxable Amount (Base):</span>
                <span className="font-mono font-semibold text-slate-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>CGST (9.0%):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatPrice(Number(order.gstAmount) / 2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>SGST (9.0%):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatPrice(Number(order.gstAmount) / 2)}
                </span>
              </div>
              <div className="flex justify-between py-1 text-slate-600">
                <span>Shipping & Handling:</span>
                <span className="font-semibold text-emerald-700">FREE</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-extrabold text-slate-950">
                <span>Grand Total:</span>
                <span className="font-mono text-base">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Post-order Support Links (Hidden during print) */}
        <div className="print:hidden mt-8 text-center text-xs text-slate-500">
          <p>
            Need technical assistance or custom installation wiring guidance?{' '}
            <a href="tel:+919876543210" className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
              Call our CCTV engineers at +91 98765 43210
            </a>
          </p>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
