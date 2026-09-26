'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ExternalLink,
  Barcode,
  Save,
  Printer,
  ChevronDown,
  Building2,
  Banknote,
  Send,
  Download,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';
import { formatInr } from '@/lib/utils';
import {
  adminTransitionOrderStatusAction,
  adminCreateShipmentAction,
  saveSerialNumbersAction,
} from '@/app/actions/admin.actions';

interface OrderItemData {
  id: string;
  skuId: string;
  productName: string;
  variantName: string;
  skuCode: string;
  quantity: number;
  unitPrice: number;
  serialNumbers: string[];
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  gstAmount: number;
  paymentMethod: string;
  customerGstin?: string | null;
  customerPan?: string | null;
  companyName?: string | null;
  createdAt: string | Date;
  shippingAddress?: {
    recipientName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: OrderItemData[];
  shipments: Array<{
    id: string;
    carrier: string;
    awbNumber?: string | null;
    status: string;
    estimatedDelivery?: string | Date | null;
  }>;
}

interface Props {
  initialOrders: OrderData[];
}

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | 'ALL' }> = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'Pending Payment', value: OrderStatus.PENDING_PAYMENT },
  { label: 'COD Pending', value: OrderStatus.COD_PENDING },
  { label: 'Paid', value: OrderStatus.PAID },
  { label: 'Confirmed', value: OrderStatus.CONFIRMED },
  { label: 'Packed', value: OrderStatus.PACKED },
  { label: 'Shipped / In Transit', value: OrderStatus.SHIPPED },
  { label: 'Out for Delivery', value: OrderStatus.OUT_FOR_DELIVERY },
  { label: 'Delivered', value: OrderStatus.DELIVERED },
  { label: 'Cancelled', value: OrderStatus.CANCELLED },
];

export function OrderFulfillmentConsole({ initialOrders }: Props) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(
    orders[0]?.id || null
  );

  // Serial Number editing state: { orderItemId: 'SN1, SN2' }
  const [serialInputs, setSerialInputs] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Filter orders locally for fast response
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesOrderNo = order.orderNumber.toLowerCase().includes(q);
    const matchesRecipient =
      order.shippingAddress?.recipientName.toLowerCase().includes(q) || false;
    const matchesPhone = order.shippingAddress?.phone.includes(q) || false;
    const matchesAwb = order.shipments.some(
      (s) => s.awbNumber && s.awbNumber.toLowerCase().includes(q)
    );
    return matchesOrderNo || matchesRecipient || matchesPhone || matchesAwb;
  });

  const handleStatusChange = (orderId: string, nextStatus: OrderStatus) => {
    setActionFeedback(null);
    startTransition(async () => {
      const res = await adminTransitionOrderStatusAction(orderId, nextStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
        );
        setActionFeedback(`Order successfully advanced to ${nextStatus}`);
      } else {
        alert(res.error || 'Failed to update order status');
      }
    });
  };

  const handleCreateShipment = (orderId: string) => {
    setActionFeedback(null);
    startTransition(async () => {
      const res = await adminCreateShipmentAction(orderId);
      if (res.success && res.data) {
        const newShipment = res.data;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: OrderStatus.PACKED,
                  shipments: [newShipment as any, ...o.shipments],
                }
              : o
          )
        );
        setActionFeedback(`Shipment booked! AWB: ${res.data.awbNumber}`);
      } else {
        alert(res.error || 'Failed to create shipment');
      }
    });
  };


  const handleSaveSerials = (orderItemId: string) => {
    const rawVal = serialInputs[orderItemId];
    if (rawVal === undefined) return;
    const serialArray = rawVal
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await saveSerialNumbersAction(orderItemId, serialArray);
      if (res.success) {
        setOrders((prev) =>
          prev.map((ord) => ({
            ...ord,
            items: ord.items.map((it) =>
              it.id === orderItemId ? { ...it, serialNumbers: serialArray } : it
            ),
          }))
        );
        setActionFeedback('Hardware serial numbers saved successfully');
      } else {
        alert(res.error || 'Failed to save serial numbers');
      }
    });
  };

  const exportOrdersToCsv = () => {
    const headers = [
      'Order Number',
      'Date',
      'Recipient',
      'Phone',
      'City',
      'State',
      'Pincode',
      'GSTIN',
      'Total Amount (INR)',
      'GST Amount (INR)',
      'Status',
      'Payment Method',
      'AWB Number',
    ];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleDateString('en-IN'),
      `"${(o.shippingAddress?.recipientName || '').replace(/"/g, '""')}"`,
      o.shippingAddress?.phone || '',
      `"${(o.shippingAddress?.city || '').replace(/"/g, '""')}"`,
      `"${(o.shippingAddress?.state || '').replace(/"/g, '""')}"`,
      o.shippingAddress?.pincode || '',
      o.customerGstin || '',
      o.totalAmount,
      o.gstAmount,
      o.status,
      o.paymentMethod,
      o.shipments[0]?.awbNumber || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patel_networks_orders_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search & Export */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order #, Customer, Phone, or AWB..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={exportOrdersToCsv}
            title="Export filtered orders to CSV"
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold shrink-0 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* Global Action Feedback */}
        {actionFeedback && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 text-xs scrollbar-none">
        {STATUS_FILTERS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              statusFilter === tab.value
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <Package className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No orders matching your criteria.</p>
            <p className="text-xs text-slate-500">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const primaryShipment = order.shipments[0];

            const statusBadgeColor =
              order.status === OrderStatus.DELIVERED
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : order.status === OrderStatus.SHIPPED ||
                  order.status === OrderStatus.OUT_FOR_DELIVERY
                ? 'bg-sky-950 text-sky-400 border-sky-800'
                : order.status === OrderStatus.PACKED ||
                  order.status === OrderStatus.CONFIRMED
                ? 'bg-indigo-950 text-indigo-400 border-indigo-800'
                : order.status === OrderStatus.CANCELLED
                ? 'bg-rose-950 text-rose-400 border-rose-800'
                : 'bg-amber-950 text-amber-400 border-amber-800';

            return (
              <div
                key={order.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-all"
              >
                {/* Order Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none bg-slate-900/40"
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sky-400">
                      <Package className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadgeColor}`}
                        >
                          {order.status}
                        </span>
                        {order.companyName && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span>B2B Input Credit</span>
                          </span>
                        )}

                      </div>

                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold text-slate-300">
                          {order.shippingAddress?.recipientName}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{order.shippingAddress?.phone}</span>
                        <span>•</span>
                        <span>
                          {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                        </span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-base font-black text-white">
                        {formatInr(Number(order.totalAmount))}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {order.paymentMethod === 'RAZORPAY' ? 'Prepaid Online' : 'Cash on Delivery'}
                      </div>
                    </div>

                    <div className="p-1 rounded-lg bg-slate-800 text-slate-400">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details Pane */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-800/80 bg-slate-950/60 space-y-6">
                    {/* Top Row: Logistics & Action Pipeline */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Carrier & Shipment Box */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-sky-400" />
                            <span>Shipment & AWB</span>
                          </span>
                          {primaryShipment && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-400 border border-sky-800">
                              {primaryShipment.carrier}
                            </span>
                          )}
                        </div>

                        {primaryShipment ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">AWB Tracking #</span>
                              <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                                {primaryShipment.awbNumber}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Courier State:</span>
                              <span className="font-bold text-emerald-400">
                                {primaryShipment.status}
                              </span>
                            </div>
                            {primaryShipment.estimatedDelivery && (
                              <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <span>Est. Delivery:</span>
                                <span>
                                  {new Date(primaryShipment.estimatedDelivery).toLocaleDateString(
                                    'en-IN'
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs text-slate-400">
                              No carrier dispatch booked yet for this order.
                            </p>
                            <button
                              disabled={isPending || order.status === OrderStatus.CANCELLED}
                              onClick={() => handleCreateShipment(order.id)}
                              className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 font-bold text-xs text-white transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
                            >
                              <Truck className="w-4 h-4" />
                              <span>Generate AWB & Book Courier</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Status Transition Control */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>Advance Order State</span>
                        </span>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {(order.status === OrderStatus.PENDING_PAYMENT ||
                            order.status === OrderStatus.COD_PENDING) && (
                            <button
                              disabled={isPending}
                              onClick={() => handleStatusChange(order.id, OrderStatus.CONFIRMED)}
                              className="py-2 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-colors"
                            >
                              Confirm Order
                            </button>
                          )}


                          {(order.status === OrderStatus.CONFIRMED ||
                            order.status === OrderStatus.PAID) && (
                            <button
                              disabled={isPending}
                              onClick={() => handleStatusChange(order.id, OrderStatus.PACKED)}
                              className="py-2 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-colors"
                            >
                              Mark as Packed
                            </button>
                          )}

                          {order.status === OrderStatus.PACKED && (
                            <button
                              disabled={isPending}
                              onClick={() => handleStatusChange(order.id, OrderStatus.SHIPPED)}
                              className="py-2 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-white transition-colors"
                            >
                              Mark Dispatched
                            </button>
                          )}

                          {order.status === OrderStatus.SHIPPED && (
                            <button
                              disabled={isPending}
                              onClick={() =>
                                handleStatusChange(order.id, OrderStatus.OUT_FOR_DELIVERY)
                              }
                              className="py-2 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-white transition-colors"
                            >
                              Out for Delivery
                            </button>
                          )}

                          {order.status === OrderStatus.OUT_FOR_DELIVERY && (
                            <button
                              disabled={isPending}
                              onClick={() => handleStatusChange(order.id, OrderStatus.DELIVERED)}
                              className="py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {order.status !== OrderStatus.DELIVERED &&
                            order.status !== OrderStatus.CANCELLED && (
                              <button
                                disabled={isPending}
                                onClick={() => handleStatusChange(order.id, OrderStatus.CANCELLED)}
                                className="py-2 px-2.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800/60 font-semibold transition-colors"
                              >
                                Cancel Order
                              </button>
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <Link
                            href={`/order-success/${order.orderNumber}`}
                            target="_blank"
                            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between"
                          >
                            <span className="flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5 text-sky-400" />
                              <span>View / Print GST Invoice</span>
                            </span>
                            <ExternalLink className="w-3 h-3 text-slate-500" />
                          </Link>
                        </div>
                      </div>

                      {/* B2B & Customer Details */}
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-400" />
                          <span>Recipient & Billing Details</span>
                        </span>

                        <div className="space-y-1 text-slate-300 pt-1">
                          <div className="font-bold text-white">
                            {order.shippingAddress?.recipientName}
                          </div>
                          <div className="text-slate-400">
                            {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
                          </div>
                          <div className="text-slate-400">
                            {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                          </div>
                          <div className="font-mono text-slate-400">
                            Phone: {order.shippingAddress?.phone}
                          </div>

                          {order.customerGstin && (
                            <div className="pt-2 border-t border-slate-800">
                              <div className="text-purple-300 font-bold">
                                Firm: {order.companyName || 'B2B Enterprise'}
                              </div>
                              <div className="font-mono text-[11px] text-purple-400">
                                GSTIN: {order.customerGstin}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>

                    {/* Order Items & Serial Numbers Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Barcode className="w-4 h-4 text-sky-400" />
                          <span>Package Items & Hardware Serial Numbers (RMA/Warranty)</span>
                        </h4>
                      </div>

                      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                            <tr>
                              <th className="py-2.5 px-4">Item Details</th>
                              <th className="py-2.5 px-4">SKU</th>
                              <th className="py-2.5 px-4 text-center">Qty</th>
                              <th className="py-2.5 px-4 text-right">Unit Price</th>
                              <th className="py-2.5 px-4">Serial Numbers (Comma-separated)</th>
                              <th className="py-2.5 px-4 text-right">Save</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {order.items.map((item) => {
                              const currentVal =
                                serialInputs[item.id] !== undefined
                                  ? serialInputs[item.id]
                                  : item.serialNumbers.join(', ');

                              return (
                                <tr key={item.id} className="hover:bg-slate-800/30">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-white">
                                      {item.productName}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {item.variantName}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                                    {item.skuCode}
                                  </td>
                                  <td className="py-3 px-4 text-center font-bold text-white">
                                    {item.quantity}
                                  </td>
                                  <td className="py-3 px-4 text-right font-mono text-slate-300">
                                    {formatInr(Number(item.unitPrice))}
                                  </td>
                                  <td className="py-3 px-4">
                                    <input
                                      type="text"
                                      value={currentVal}
                                      onChange={(e) =>
                                        setSerialInputs((prev) => ({
                                          ...prev,
                                          [item.id]: e.target.value,
                                        }))
                                      }
                                      placeholder="e.g. SN-882941, SN-882942"
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500"
                                    />
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      disabled={isPending}
                                      onClick={() => handleSaveSerials(item.id)}
                                      className="p-1.5 rounded-lg bg-sky-600/80 hover:bg-sky-500 text-white transition-colors"
                                      title="Save Serial Numbers"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
