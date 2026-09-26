'use client';

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  FileCheck2,
  Boxes,
  CreditCard,
  Banknote,
  DollarSign,
  Calendar,
  Layers,
  Percent,
  Download,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';
import { CommercialReportData } from '@/server/services/admin.service';

interface Props {
  data: CommercialReportData;
}

export function CommercialReportsConsole({ data }: Props) {
  const { summary, taxBreakdown, inventoryValuation, paymentSplit, dailySales } = data;

  const totalPayments = paymentSplit.razorpayCount + paymentSplit.codCount;
  const prepaidRatio = totalPayments > 0 ? Math.round((paymentSplit.razorpayCount / totalPayments) * 100) : 0;

  const maxDailyRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

  const exportGstr1Csv = () => {
    const intraTaxable =
      taxBreakdown.cgstTotal > 0
        ? Math.round((taxBreakdown.cgstTotal + taxBreakdown.sgstTotal) / 0.18)
        : 0;
    const interTaxable =
      taxBreakdown.igstTotal > 0 ? Math.round(taxBreakdown.igstTotal / 0.18) : 0;
    const totalTaxable = intraTaxable + interTaxable;

    const headers = [
      'Tax Schedule',
      'Tax Component',
      'Statutory Rate',
      'Taxable Base (INR)',
      'Tax Amount (INR)',
      'Jurisdiction Applicability',
    ];
    const rows = [
      [
        'Intra-State (Gujarat)',
        'CGST (Central Goods & Services Tax)',
        '9%',
        intraTaxable,
        taxBreakdown.cgstTotal,
        'Within Gujarat State',
      ],
      [
        'Intra-State (Gujarat)',
        'SGST (State Goods & Services Tax)',
        '9%',
        intraTaxable,
        taxBreakdown.sgstTotal,
        'Within Gujarat State',
      ],
      [
        'Inter-State (Pan-India)',
        'IGST (Integrated Goods & Services Tax)',
        '18%',
        interTaxable,
        taxBreakdown.igstTotal,
        'Outside Gujarat State',
      ],
      [
        'Consolidated Total',
        'All GST Components Combined',
        '18%',
        totalTaxable,
        taxBreakdown.totalGst,
        'Statutory GSTR-1 Return Filing',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `patel_networks_gstr1_tax_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Revenue (GMV)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {formatInr(summary.totalRevenue)}
          </div>
          <span className="text-[11px] text-slate-500">{summary.totalOrders} total confirmed orders</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>18% GST Collected</span>
            <FileCheck2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 mt-2">
            {formatInr(summary.totalGstCollected)}
          </div>
          <span className="text-[11px] text-slate-500">Statutory tax for GSTR-1 return filing</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Order Value (AOV)</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400 mt-2">
            {formatInr(summary.avgOrderValue)}
          </div>
          <span className="text-[11px] text-slate-500">Commercial surveillance ticket size</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Warehouse Asset Valuation</span>
            <Boxes className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {formatInr(inventoryValuation.totalAssetValue)}
          </div>
          <span className="text-[11px] text-slate-500">{inventoryValuation.totalPhysicalUnits} physical units in stock</span>
        </div>
      </div>

      {/* Grid: GSTR-1 Tax Analysis & Payment Gateway Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: GSTR-1 Tax Schedule Breakdown */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-400" />
                GSTR-1 Tax Summary & Split
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory Goods & Services Tax breakdown for Gujarat Hub
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportGstr1Csv}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Download statutory GSTR-1 CSV report"
              >
                <Download className="w-3 h-3 text-sky-400" />
                <span>Export CSV</span>
              </button>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-1 rounded border border-sky-800">
                18% GST
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-300">Intra-State CGST (Central Tax 9%)</span>
              <span className="font-mono font-bold text-white">
                {formatInr(taxBreakdown.cgstTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-300">Intra-State SGST (State Tax 9%)</span>
              <span className="font-mono font-bold text-white">
                {formatInr(taxBreakdown.sgstTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-300">Inter-State IGST (Integrated Tax 18%)</span>
              <span className="font-mono font-bold text-white">
                {formatInr(taxBreakdown.igstTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 text-sm font-bold">
              <span className="text-white">Total GST Collected</span>
              <span className="font-mono text-emerald-400">
                {formatInr(taxBreakdown.totalGst)}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            💡 All B2B commercial invoices are tagged with 15-character GSTINs and recorded for monthly GSTR-1 return filing under Indian tax law.
          </div>
        </div>

        {/* Card 2: Payment Gateway & Selective COD Split */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400" />
                Payment Method & RTO Risk Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Razorpay Online Prepaid vs Selective Cash on Delivery
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
              {prepaidRatio}% Prepaid
            </span>
          </div>

          <div className="space-y-4">
            {/* Prepaid Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                  Online Prepaid (Razorpay)
                </span>
                <span className="text-emerald-400 font-mono">
                  {formatInr(paymentSplit.razorpayAmount)} ({paymentSplit.razorpayCount} orders)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${prepaidRatio}%` }}
                />
              </div>
            </div>

            {/* COD Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-amber-400" />
                  Cash on Delivery (Selective COD)
                </span>
                <span className="text-amber-400 font-mono">
                  {formatInr(paymentSplit.codAmount)} ({paymentSplit.codCount} orders)
                </span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${100 - prepaidRatio}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">Prepaid Conversion</div>
                <div className="text-lg font-bold text-emerald-400 mt-0.5">{prepaidRatio}%</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400">COD Ratio</div>
                <div className="text-lg font-bold text-amber-400 mt-0.5">{100 - prepaidRatio}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warehouse Inventory Valuation Matrix */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-amber-400" />
              Surveillance Warehouse Capital Assets
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live inventory evaluation across all camera, DVR/NVR, cable, and hard drive SKUs
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Total Active SKUs</span>
            <span className="text-sm font-bold text-white font-mono">{inventoryValuation.totalSkusCount} SKUs</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Physical Units</span>
            <span className="text-xl font-black text-white mt-1 block">
              {inventoryValuation.totalPhysicalUnits}
            </span>
            <span className="text-[10px] text-slate-500">Physically inside Surat warehouse</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Available for Sale</span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {inventoryValuation.totalAvailableUnits}
            </span>
            <span className="text-[10px] text-slate-500">Unreserved net available</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Total Warehouse Asset Value</span>
            <span className="text-xl font-black text-amber-400 mt-1 block font-mono">
              {formatInr(inventoryValuation.totalAssetValue)}
            </span>
            <span className="text-[10px] text-slate-500">Calculated at current selling prices</span>
          </div>
        </div>
      </div>

      {/* Daily Sales Trend Timeline */}
      {dailySales.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-400" />
                Daily Sales & Order Velocity (Last 30 Days)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily GMV distribution across the commercial fulfillment pipeline
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {dailySales.map((day) => {
              const widthPct = Math.round((day.revenue / maxDailyRevenue) * 100);
              return (
                <div key={day.date} className="flex items-center gap-4 text-xs">
                  <span className="w-24 text-slate-400 font-mono text-[11px] shrink-0">
                    {day.date}
                  </span>
                  <div className="flex-1 bg-slate-950 rounded-full h-4 overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-sky-600 to-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.max(widthPct, 4)}%` }}
                    />
                  </div>
                  <span className="w-24 text-right font-mono font-bold text-white shrink-0">
                    {formatInr(day.revenue)}
                  </span>
                  <span className="w-16 text-right text-slate-400 text-[11px] shrink-0">
                    {day.orders} {day.orders === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
