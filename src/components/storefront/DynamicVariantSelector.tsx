'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  FileText,
  ShoppingCart,
  Zap,
  Check,
  AlertCircle,
  Loader2,
  Heart,
  Layers,
} from 'lucide-react';
import { formatPrice, calculateGstBreakdown } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';
import { PincodeChecker } from '@/components/storefront/PincodeChecker';
import { Prisma } from '@prisma/client';

export interface DynamicVariantSelectorProps {
  product: {
    id: string;
    name: string;
    isCodAllowed: boolean;
    brand: { name: string };
    category: { name: string; hsnCode?: string | null };
    images?: Array<{ url: string; altText?: string | null }>;
    variants: Array<{
      id: string;
      name: string;
      attributes: Prisma.JsonValue;
      sku: {
        id: string;
        code: string;
        barcode?: string | null;
        mrp: number | string | { toString(): string };
        sellingPrice: number | string | { toString(): string };
        weightGrams: number;
        dimensionsCm?: Prisma.JsonValue;
        inventory?: {
          currentStock: number;
          reservedStock: number;
          lowStockThreshold: number;
        } | null;
      };
    }>;
  };
}

export function DynamicVariantSelector({ product }: DynamicVariantSelectorProps) {
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isCompared, setIsCompared] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedWishlist = JSON.parse(localStorage.getItem('patel_wishlist') || '[]');
      setIsWishlisted(storedWishlist.includes(product.id));

      const storedCompare = JSON.parse(localStorage.getItem('patel_compare_items') || '[]');
      setIsCompared(storedCompare.some((item: any) => item.id === product.id));
    } catch {
      // Ignore storage errors
    }
  }, [product.id]);

  const toggleWishlist = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('patel_wishlist') || '[]');
      let updated: string[];
      if (stored.includes(product.id)) {
        updated = stored.filter((id: string) => id !== product.id);
        setIsWishlisted(false);
      } else {
        updated = [...stored, product.id];
        setIsWishlisted(true);
      }
      localStorage.setItem('patel_wishlist', JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch {
      // Storage unavailable
    }
  };

  const toggleCompare = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('patel_compare_items') || '[]');
      const exists = stored.some((item: any) => item.id === product.id);
      let updated: any[];
      if (exists) {
        updated = stored.filter((item: any) => item.id !== product.id);
        setIsCompared(false);
      } else {
        if (stored.length >= 4) {
          alert('You can compare a maximum of 4 products simultaneously.');
          return;
        }
        updated = [
          ...stored,
          {
            id: product.id,
            name: product.name,
            brand: product.brand.name,
            category: product.category.name,
            imageUrl: product.images?.[0]?.url || 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80',
            price: Number(product.variants[0]?.sku.sellingPrice || 0),
            mrp: Number(product.variants[0]?.sku.mrp || 0),
            sku: product.variants[0]?.sku.code || '',
            warranty: '2-Year Warranty',
          },
        ];
        setIsCompared(true);
      }
      localStorage.setItem('patel_compare_items', JSON.stringify(updated));
      window.dispatchEvent(new Event('compare-updated'));
    } catch {
      // Storage unavailable
    }
  };

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  if (!selectedVariant) {
    return <div className="p-4 text-slate-500">No variants configured for this product.</div>;
  }

  const sku = selectedVariant.sku;
  const sellingPrice = Number(sku.sellingPrice);
  const mrp = Number(sku.mrp);
  const discountPct = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  const currentStock = sku.inventory?.currentStock ?? 0;
  const reservedStock = sku.inventory?.reservedStock ?? 0;
  const availableStock = Math.max(0, currentStock - reservedStock);

  const isOutOfStock = availableStock <= 0;
  const gstBreakdown = calculateGstBreakdown(sellingPrice);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      setErrorMsg(null);
      const res = await addToCartAction(sku.code, quantity);
      if (res.success) {
        setAddedToast(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        setTimeout(() => setAddedToast(false), 3500);
      } else {
        setErrorMsg(res.error || 'Failed to add item to cart.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error adding item to cart.';
      setErrorMsg(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsBuyingNow(true);
      setErrorMsg(null);
      const res = await addToCartAction(sku.code, quantity);
      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push('/checkout');
      } else {
        setErrorMsg(res.error || 'Failed to initialize checkout.');
        setIsBuyingNow(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error proceeding to checkout.';
      setErrorMsg(msg);
      setIsBuyingNow(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Price & GST Block */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatPrice(sellingPrice)}
          </span>
          {mrp > sellingPrice && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(mrp)}
            </span>
          )}
          {discountPct > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-bold border border-red-200">
              {discountPct}% OFF
            </span>
          )}
        </div>

        {/* GST Notice */}
        <div className="mt-2 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200">
          <span>
            Taxable Base: <strong>{formatPrice(gstBreakdown.taxableValue)}</strong> + 18% GST ({formatPrice(gstBreakdown.totalGst)})
          </span>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> GST Input Credit
          </span>
        </div>
      </div>

      {/* Dynamic Variant Selector Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Model Variant
          </label>
          <span className="text-xs text-slate-500 font-mono">
            SKU: <strong className="text-slate-800">{sku.code}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {product.variants.map((v) => {
            const isSelected = v.id === selectedVariantId;
            const vStock = Math.max(0, (v.sku.inventory?.currentStock ?? 0) - (v.sku.inventory?.reservedStock ?? 0));
            const vPrice = Number(v.sku.sellingPrice);

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariantId(v.id)}
                className={`flex flex-col p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 text-slate-900 ring-1 ring-blue-600'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-slate-900">
                    {v.name.split(' ')[0]}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <span className="text-xs font-semibold text-slate-800 mt-1">
                  {formatPrice(vPrice)}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {vStock > 0 ? `${vStock} in stock` : 'Out of stock'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock & COD Status Row */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {availableStock > 5 ? (
          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            In Stock ({availableStock} units ready to dispatch)
          </span>
        ) : availableStock > 0 ? (
          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Low Stock: {availableStock} units remaining
          </span>
        ) : (
          <span className="text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md font-semibold">
            Out of Stock
          </span>
        )}

        {product.isCodAllowed ? (
          <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
            Cash on Delivery Available
          </span>
        ) : (
          <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-medium">
            Prepaid Only
          </span>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center gap-2.5">
          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-300 rounded-lg bg-white p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors font-bold"
            >
              -
            </button>
            <span className="w-8 text-center text-xs font-bold text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
              disabled={quantity >= availableStock || isOutOfStock}
              className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors font-bold"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding || isBuyingNow}
            className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Adding to Cart...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 text-white" />
                Add to Cart
              </>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label="Wishlist"
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isWishlisted
                ? 'border-red-300 bg-red-50 text-red-600'
                : 'border-slate-300 bg-white text-slate-600 hover:text-red-600 hover:border-slate-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={toggleCompare}
            aria-label="Compare"
            title={isCompared ? 'Remove from Compare' : 'Add to Compare'}
            className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isCompared
                ? 'border-blue-300 bg-blue-50 text-blue-600'
                : 'border-slate-300 bg-white text-slate-600 hover:text-blue-600 hover:border-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Buy Now Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock || isAdding || isBuyingNow}
          className={`w-full py-2.5 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer ${
            isOutOfStock || isAdding || isBuyingNow ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          {isBuyingNow ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Preparing Checkout...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-400" />
              Buy Now with 1-Click
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Added {quantity}x {selectedVariant.name} to cart!
          </span>
          <Link href="/cart" className="underline font-bold text-blue-700 hover:text-blue-800">
            View Cart
          </Link>
        </div>
      )}

      {/* Indian Pincode Delivery & COD Estimator */}
      <PincodeChecker orderTotal={sellingPrice} className="my-1" />

      {/* Assurance Perks */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>3-Year Direct Warranty</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Same-Day AWB Booking</span>
        </div>
      </div>
    </div>
  );
}
