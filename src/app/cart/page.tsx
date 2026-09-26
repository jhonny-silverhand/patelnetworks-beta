'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { formatPrice } from '@/lib/utils';
import {
  getCartAction,
  updateCartItemAction,
  removeFromCartAction,
} from '@/app/actions/cart.actions';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertCircle,
  Truck,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    const data = await getCartAction();
    setCart(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    setUpdatingId(itemId);
    await updateCartItemAction(itemId, newQty);
    await fetchCart();
    setUpdatingId(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdatingId(itemId);
    await removeFromCartAction(itemId);
    await fetchCart();
    setUpdatingId(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <nav className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Shopping Cart</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Surveillance Hardware Cart
            </h1>
            <Link
              href="/products"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading your cart items...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500 mt-1">
              You haven&apos;t added any surveillance equipment or networking hardware yet.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/products"
                className="py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Browse Surveillance Catalog
              </Link>
              <Link
                href="/kit-builder"
                className="py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Build Custom CCTV Kit
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-18 h-18 rounded-lg bg-slate-50 border border-slate-200 shrink-0 overflow-hidden">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-contain p-2"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                        {item.brandName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>Variant: <strong className="text-slate-700">{item.variantName}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">SKU: {item.skuCode}</span>
                      </div>
                      <span className="block text-xs font-semibold text-slate-900 mt-1">
                        {formatPrice(item.unitPrice)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Line Total */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                        disabled={updatingId === item.id || item.quantity >= item.availableStock}
                        className="w-7 h-7 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatPrice(item.lineTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        disabled={updatingId === item.id}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5 lg:sticky lg:top-24">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Price Calculation
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">
                  Order Summary
                </h4>
              </div>

              <div className="space-y-2.5 text-xs divide-y divide-slate-100">
                <div className="pt-2 flex justify-between text-slate-600">
                  <span>Taxable Base Value:</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between text-slate-600">
                  <span>Goods & Services Tax (18% GST):</span>
                  <span className="font-semibold text-slate-900">
                    {formatPrice(cart.gstAmount)}
                  </span>
                </div>
                <div className="pt-2 flex justify-between text-slate-600">
                  <span>Shipping & Handling:</span>
                  <span className="font-semibold text-emerald-600">FREE Express</span>
                </div>
                <div className="pt-3 flex justify-between text-lg font-extrabold text-slate-900 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">{formatPrice(cart.totalAmount)}</span>
                </div>
              </div>

              {/* B2B Input Credit Notice */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-[11px] space-y-1">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> GST Input Tax Credit
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Claim back <strong>{formatPrice(cart.gstAmount)}</strong> in GST input credit by entering your company GSTIN during checkout.
                </p>
              </div>

              {/* COD Availability Warning */}
              {!cart.isCodAllowed && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] flex items-start gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                  <span>
                    One or more items in your cart require online prepaid payment. Cash on Delivery is disabled for this order.
                  </span>
                </div>
              )}

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
              >
                Proceed to Secure Checkout ({cart.itemCount} Items) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
