import React from 'react';
import Link from 'next/link';
import { getAdminDashboardMetrics } from '@/server/services/admin.service';
import { formatInr } from '@/lib/utils';
import {
  TrendingUp,
  Package,
  Truck,
  AlertTriangle,
  Boxes,
  Layers,
  Banknote,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { OrderStatus } from '@prisma/client';

export const revalidate = 0; // Dynamic server component

export default async function AdminDashboardPage() {
  const metrics = await getAdminDashboardMetrics();

  const totalVolume =
    metrics.paymentModeSplit.onlineCount + metrics.paymentModeSplit.codCount;
  const onlinePct =
    totalVolume > 0
      ? Math.round((metrics.paymentModeSplit.onlineCount / totalVolume) * 100)
      : 100;
  const codPct = 100 - onlinePct;

  return (
    <div className="space-y-8">
      {/* Top Welcome & Node Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Operations Command Center</span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-800/80">
              Live Real-Time
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Surat Central Hub telemetry, B2B/B2C fulfillment queue, and inventory alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white transition-all shadow-lg shadow-sky-600/20 flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Process Orders</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 transition-all border border-slate-700/60 flex items-center gap-2"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Stock Audit</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Gross Merchandise Value</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {formatInr(metrics.totalRevenue)}
          </div>
          <div className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">18% GST:</span>
            <span>{formatInr(metrics.totalGst)}</span>
          </div>
        </div>

        {/* Active Pipeline Orders */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Pipeline Orders</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.activeOrdersCount}
          </div>
          <div className="text-[11px] font-medium text-indigo-300 mt-1 flex items-center gap-1">
            <span>{metrics.totalOrders} lifetime total orders</span>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Delivered & Closed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.deliveredOrdersCount}
          </div>
          <div className="text-[11px] font-medium text-emerald-400 mt-1 flex items-center gap-1">
            <span>Shiprocket & Delhivery fulfilled</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Low Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">
            {metrics.lowStockCount}
          </div>
          <div className="text-[11px] font-medium text-amber-400 mt-1 flex items-center gap-1">
            <span>Action needed in SKU inventory</span>
          </div>
        </div>
      </div>

      {/* Payment Channels Split */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Banknote className="w-4 h-4 text-sky-400" />
              <span>Payment Channel Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Selective COD control (ADR-004) vs Instant Online Settlement (Razorpay).
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              Prepaid / Razorpay: {onlinePct}% ({formatInr(metrics.paymentModeSplit.onlineRevenue)})
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Cash on Delivery: {codPct}% ({formatInr(metrics.paymentModeSplit.codRevenue)})
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            style={{ width: `${onlinePct}%` }}
            className="h-full bg-gradient-to-r from-sky-600 to-blue-500 transition-all"
            title={`Online: ${onlinePct}%`}
          />
          <div
            style={{ width: `${codPct}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            title={`COD: ${codPct}%`}
          />
        </div>
      </div>

      {/* Main Split: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Orders (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-400" />
              <span>Recent Orders In Pipeline</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden">
            {metrics.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No orders created yet in the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {metrics.recentOrders.map((ord) => {
                      const statusColor =
                        ord.status === OrderStatus.DELIVERED
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          : ord.status === OrderStatus.SHIPPED || ord.status === OrderStatus.OUT_FOR_DELIVERY
                          ? 'bg-sky-950 text-sky-400 border-sky-800/60'
                          : ord.status === OrderStatus.CONFIRMED || ord.status === OrderStatus.PACKED
                          ? 'bg-indigo-950 text-indigo-400 border-indigo-800/60'
                          : 'bg-amber-950 text-amber-400 border-amber-800/60';

                      return (
                        <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{ord.recipientName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{ord.phone}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor}`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            {ord.paymentMethod === 'RAZORPAY' ? 'Prepaid (Online)' : 'Cash on Delivery'}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-white">
                            {formatInr(ord.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href="/admin/orders"
                              className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Low Stock Alerts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Critical Low Stock</span>
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>Manage SKUs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-4 space-y-3">
            {metrics.lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span>All SKUs are healthy above threshold!</span>
              </div>
            ) : (
              metrics.lowStockItems.slice(0, 5).map((item) => (
                <div
                  key={item.skuId}
                  className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {item.productName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {item.skuCode} • {item.variantName}
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800/50 shrink-0">
                      ≤ {item.threshold} Min
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-700/40">
                    <span className="text-slate-400">Available:</span>
                    <span className="font-bold text-amber-400">
                      {item.availableStock} Units{' '}
                      <span className="text-[10px] font-normal text-slate-500">
                        ({item.reservedStock} reserved)
                      </span>
                    </span>
                  </div>
                </div>
              ))
            )}

            <Link
              href="/admin/inventory"
              className="block w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-center font-bold text-xs text-slate-300 transition-colors border border-slate-700/60"
            >
              Open Inventory Console
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
