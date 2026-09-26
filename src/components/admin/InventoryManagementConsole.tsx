'use client';

import React, { useState, useTransition } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  History,
  ShieldCheck,
  X,
} from 'lucide-react';
import { MovementReason } from '@prisma/client';
import { adjustStockAction } from '@/app/actions/admin.actions';

interface InventoryItem {
  id: string; // skuId
  code: string;
  productName: string;
  variantName: string;
  brandName: string;
  categoryName: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  threshold: number;
  recentMovements: Array<{
    id: string;
    quantity: number;
    reason: MovementReason;
    notes?: string | null;
    createdAt: string;
  }>;
}

interface Props {
  initialItems: InventoryItem[];
}

export function InventoryManagementConsole({ initialItems }: Props) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSku, setSelectedSku] = useState<InventoryItem | null>(null);

  // Modal Form State
  const [delta, setDelta] = useState<number>(10);
  const [reason, setReason] = useState<MovementReason>(MovementReason.PURCHASE_RECEIPT);
  const [notes, setNotes] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.code.toLowerCase().includes(q) ||
      it.productName.toLowerCase().includes(q) ||
      it.variantName.toLowerCase().includes(q) ||
      it.brandName.toLowerCase().includes(q)
    );
  });

  const handleOpenAdjust = (sku: InventoryItem) => {
    setSelectedSku(sku);
    setDelta(10);
    setReason(MovementReason.PURCHASE_RECEIPT);
    setNotes('');
  };

  const handleCloseAdjust = () => {
    setSelectedSku(null);
  };

  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku || delta === 0) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await adjustStockAction({
        skuId: selectedSku.id,
        quantityDelta: delta,
        reason,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        const newStock = res.data.currentStock;
        setItems((prev) =>
          prev.map((it) =>
            it.id === selectedSku.id
              ? {
                  ...it,
                  currentStock: newStock,
                  availableStock: Math.max(0, newStock - it.reservedStock),
                  recentMovements: [
                    {
                      id: 'new_' + Date.now(),
                      quantity: delta,
                      reason,
                      notes: notes.trim() || 'Manual adjustment',
                      createdAt: new Date().toISOString(),
                    },
                    ...it.recentMovements.slice(0, 4),
                  ],
                }
              : it
          )
        );
        setFeedback(
          `Successfully adjusted ${selectedSku.code} by ${delta > 0 ? '+' : ''}${delta} units`
        );
        setSelectedSku(null);
      } else {
        alert(res.error || 'Failed to adjust stock');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Global Feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU Code, Product, Variant, Brand..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        {feedback && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* Dense SKU Inventory Matrix */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Hardware Item & Specs</th>
                <th className="py-3 px-4 text-center">Physical Stock</th>
                <th className="py-3 px-4 text-center">Reserved</th>
                <th className="py-3 px-4 text-center">Net Available</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => {
                const isLow = item.availableStock <= item.threshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      {item.code}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white line-clamp-1">
                        {item.productName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-semibold text-slate-300">{item.variantName}</span>
                        <span>•</span>
                        <span className="text-slate-400">{item.brandName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {item.currentStock}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {item.reservedStock}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`font-black text-sm ${
                          isLow ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.availableStock}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      ≤ {item.threshold}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center gap-1 w-fit mx-auto">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center gap-1 w-fit mx-auto">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimal</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white font-bold text-xs transition-colors border border-slate-700/60 inline-flex items-center gap-1.5"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedSku && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-sky-400" />
                  <span>Adjust SKU Physical Stock</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Updates inventory in cloud database and appends an immutable audit movement.
                </p>
              </div>
              <button
                onClick={handleCloseAdjust}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target SKU card */}
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-mono text-xs font-bold text-sky-400">{selectedSku.code}</div>
              <div className="font-bold text-sm text-white">{selectedSku.productName}</div>
              <div className="text-xs text-slate-400">
                Variant: {selectedSku.variantName} • Current Stock:{' '}
                <span className="font-bold text-white">{selectedSku.currentStock} units</span>
              </div>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4 text-xs">
              {/* Delta Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">
                  Quantity Delta (+ to restock, - to decrease)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDelta((prev) => prev - 5)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={delta}
                    onChange={(e) => setDelta(parseInt(e.target.value, 10) || 0)}
                    className="flex-1 text-center py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setDelta((prev) => prev + 5)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-500">
                  New projected stock:{' '}
                  <span className="font-bold text-white">
                    {Math.max(0, selectedSku.currentStock + delta)} units
                  </span>
                </div>
              </div>

              {/* Reason Dropdown */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Movement Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as MovementReason)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={MovementReason.PURCHASE_RECEIPT}>
                    PURCHASE_RECEIPT (Vendor PO Arrival / Restock)
                  </option>
                  <option value={MovementReason.MANUAL_ADJUSTMENT}>
                    MANUAL_ADJUSTMENT (Audit Reconciliation / Physical Count)
                  </option>
                  <option value={MovementReason.DAMAGED_WRITE_OFF}>
                    DAMAGED_WRITE_OFF (Defective / Damaged Hardware)
                  </option>
                  <option value={MovementReason.RETURN_RESTOCK}>
                    RETURN_RESTOCK (Customer / RMA Return Restock)
                  </option>
                </select>

              </div>

              {/* Notes Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-300 block">Audit Notes / PO Reference</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Received 20 units via Delhivery Cargo from Hikvision Ahmedabad distributor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseAdjust}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || delta === 0}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-sky-600/20"
                >
                  {isPending ? 'Updating...' : 'Save Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
