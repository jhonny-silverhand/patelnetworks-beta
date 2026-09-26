'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ArrowRight, Check, Minus, ShoppingCart, Layers } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';

export interface CompareProductItem {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  modelNumber?: string | null;
  imageUrl: string;
  price: number;
  mrp: number;
  specs: {
    resolution?: string;
    lens?: string;
    nightVision?: string;
    poe?: string;
    hsn?: string;
    warranty?: string;
  };
  skuCode?: string;
}

export function ProductCompareDrawer() {
  const [compareItems, setCompareItems] = useState<CompareProductItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [addingSku, setAddingSku] = useState<string | null>(null);

  useEffect(() => {
    const loadCompareItems = () => {
      try {
        const stored = localStorage.getItem('pn_compare_items');
        if (stored) {
          setCompareItems(JSON.parse(stored));
        }
      } catch {
        // Fallback
      }
    };

    loadCompareItems();
    window.addEventListener('compare-updated', loadCompareItems);
    return () => window.removeEventListener('compare-updated', loadCompareItems);
  }, []);

  const removeItem = (id: string) => {
    const updated = compareItems.filter((item) => item.id !== id);
    setCompareItems(updated);
    localStorage.setItem('pn_compare_items', JSON.stringify(updated));
    window.dispatchEvent(new Event('compare-updated'));
  };

  const clearAll = () => {
    setCompareItems([]);
    localStorage.removeItem('pn_compare_items');
    window.dispatchEvent(new Event('compare-updated'));
    setIsOpen(false);
  };

  const handleAddToCart = async (item: CompareProductItem) => {
    if (!item.skuCode) return;
    setAddingSku(item.skuCode);
    try {
      await addToCartAction(item.skuCode, 1);
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      // Ignore
    } finally {
      setAddingSku(null);
    }
  };

  if (compareItems.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Compare Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-4 max-w-2xl w-[92vw] sm:w-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Compare Hardware ({compareItems.length}/4)
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Side-by-side technical specs comparison
            </span>
          </div>
        </div>

        {/* Thumbnail Preview Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {compareItems.map((item) => (
            <div
              key={item.id}
              className="relative w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 shrink-0"
              title={item.name}
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="40px"
                className="object-contain p-0.5"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            onClick={() => setIsOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            Compare Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-slate-600 p-1"
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Compare Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" /> Technical Product Comparison
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side engineering specifications, statutory HSN codes, and pricing.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spec Table */}
            <div className="p-4 sm:p-6 overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">
                      Product
                    </th>
                    {compareItems.map((item) => (
                      <th key={item.id} className="py-3 px-4 w-60 align-top">
                        <div className="flex flex-col items-center text-center">
                          <div className="relative w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2 mb-2">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-contain p-1"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                            {item.brandName}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
                            {item.name}
                          </span>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {formatPrice(item.price)}
                            </span>
                            {item.mrp > item.price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatPrice(item.mrp)}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-1.5 w-full">
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={addingSku === item.skuCode}
                              className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              {addingSku === item.skuCode ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      Model / SKU
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-slate-800 dark:text-slate-200 font-mono">
                        {item.modelNumber || item.skuCode || 'Standard'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      Resolution / Capacity
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {item.specs.resolution || 'Standard Commercial'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      Lens / FOV / Interface
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {item.specs.lens || 'Fixed / Standard'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      Night Vision / Power
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {item.specs.nightVision || 'Smart IR / 12V DC'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      PoE / Networking
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {item.specs.poe || 'RJ45 / Coaxial'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      Statutory HSN Code
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-slate-800 dark:text-slate-200 font-mono">
                        HSN {item.specs.hsn || '8525'} (18% GST)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                      Warranty
                    </td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                        {item.specs.warranty || '2 Years Manufacturer On-Site'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={clearAll}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Clear All Comparison Items
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-300 transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
