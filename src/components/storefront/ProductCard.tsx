'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingCart, Check, ArrowRight, Layers, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    modelNumber?: string | null;
    isCodAllowed: boolean;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
    images: { url: string; altText?: string | null }[];
    specifications?: any;
    variants: Array<{
      id: string;
      name: string;
      sku: {
        code: string;
        sellingPrice: number | string | { toString(): string };
        mrp: number | string | { toString(): string };
        inventory?: { currentStock: number; reservedStock: number } | null;
      };
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  // Compute minimum selling price and highest MRP among variants
  const prices = product.variants.map((v) => Number(v.sku.sellingPrice));
  const mrps = product.variants.map((v) => Number(v.sku.mrp));

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const correspondingMrp = mrps.length > 0 ? Math.max(...mrps) : 0;
  const discountPct =
    correspondingMrp > minPrice
      ? Math.round(((correspondingMrp - minPrice) / correspondingMrp) * 100)
      : 0;

  // Calculate total available stock across variants
  const totalAvailableStock = product.variants.reduce((acc, v) => {
    const inv = v.sku.inventory;
    if (!inv) return acc;
    return acc + Math.max(0, inv.currentStock - inv.reservedStock);
  }, 0);

  const defaultSku = product.variants[0]?.sku?.code;

  // Sync wishlist & compare state from localStorage
  useEffect(() => {
    const checkStorage = () => {
      try {
        const storedWishlist = localStorage.getItem('pn_wishlist');
        if (storedWishlist) {
          const list: string[] = JSON.parse(storedWishlist);
          setIsWishlisted(list.includes(product.id));
        }

        const storedCompare = localStorage.getItem('pn_compare_items');
        if (storedCompare) {
          const compList: any[] = JSON.parse(storedCompare);
          setIsCompared(compList.some((item) => item.id === product.id));
        }
      } catch {
        // Fallback
      }
    };

    checkStorage();
    window.addEventListener('wishlist-updated', checkStorage);
    window.addEventListener('compare-updated', checkStorage);
    return () => {
      window.removeEventListener('wishlist-updated', checkStorage);
      window.removeEventListener('compare-updated', checkStorage);
    };
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pn_wishlist');
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setIsWishlisted(false);
      } else {
        list.push(product.id);
        setIsWishlisted(true);
      }
      localStorage.setItem('pn_wishlist', JSON.stringify(list));
      window.dispatchEvent(new Event('wishlist-updated'));
    } catch {
      // Fallback
    }
  };

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const stored = localStorage.getItem('pn_compare_items');
      let compList: any[] = stored ? JSON.parse(stored) : [];
      if (compList.some((item) => item.id === product.id)) {
        compList = compList.filter((item) => item.id !== product.id);
        setIsCompared(false);
      } else {
        if (compList.length >= 4) {
          alert('You can compare up to 4 items at a time.');
          return;
        }
        compList.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          brandName: product.brand.name,
          modelNumber: product.modelNumber,
          imageUrl:
            product.images[0]?.url ||
            'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80',
          price: minPrice,
          mrp: correspondingMrp,
          skuCode: defaultSku,
          specs: {
            resolution: (product.specifications as any)?.resolution || product.variants[0]?.name,
            lens: (product.specifications as any)?.lens,
            nightVision: (product.specifications as any)?.irRange,
            poe: (product.specifications as any)?.power || (product.specifications as any)?.poeBudget,
            hsn: '8525',
            warranty: '2 Years Manufacturer On-Site',
          },
        });
        setIsCompared(true);
      }
      localStorage.setItem('pn_compare_items', JSON.stringify(compList));
      window.dispatchEvent(new Event('compare-updated'));
    } catch {
      // Fallback
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultSku || isAdding) return;

    setIsAdding(true);
    try {
      const res = await addToCartAction(defaultSku, 1);
      if (res.success) {
        setAddSuccess(true);
        window.dispatchEvent(new Event('cart-updated'));
        setTimeout(() => setAddSuccess(false), 2200);
      }
    } catch {
      // Fallback
    } finally {
      setIsAdding(false);
    }
  };

  // Derive specs badges from specifications or variant attributes
  const deriveSpecBadges = () => {
    const badges: string[] = [];
    const specs = product.specifications as Record<string, string> | undefined;

    // Check resolution
    if (product.name.includes('4MP') || specs?.resolution?.includes('4MP')) badges.push('4MP');
    else if (product.name.includes('2MP') || specs?.resolution?.includes('2MP')) badges.push('2MP');
    else if (product.name.includes('8MP') || specs?.resolution?.includes('8MP')) badges.push('8MP');
    else if (product.name.includes('2TB') || specs?.capacity?.includes('2TB')) badges.push('2TB');
    else if (product.name.includes('1TB') || specs?.capacity?.includes('1TB')) badges.push('1TB');
    else if (product.name.includes('8-Port') || specs?.ports?.toString().includes('8')) badges.push('8 Port');
    else if (product.name.includes('22"')) badges.push('22"');

    // Secondary tags
    if (product.name.toLowerCase().includes('bullet') || specs?.housing?.includes('Bullet')) badges.push('IP67');
    else if (product.name.toLowerCase().includes('dome')) badges.push('IR');
    else if (specs?.interface?.includes('SATA') || product.name.toLowerCase().includes('seagate')) badges.push('SATA');
    else if (specs?.length) badges.push('305m');
    else if (specs?.channels) badges.push('8-Ch');

    // Tertiary tag
    if (product.name.toLowerCase().includes('poe') || specs?.poeBudget) badges.push('PoE');
    else if (product.name.toLowerCase().includes('hdd') || product.name.toLowerCase().includes('drive')) badges.push('24x7');
    else if (product.name.toLowerCase().includes('switch')) badges.push('Gigabit');
    else if (product.name.toLowerCase().includes('monitor')) badges.push('LED');
    else if (badges.length < 3) badges.push('Genuine');

    return badges.slice(0, 3);
  };

  const specBadges = deriveSpecBadges();

  const mainImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative flex flex-col bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 overflow-hidden text-left"
    >
      {/* Top Action Bar (Wishlist & Discount) */}
      <div className="flex items-center justify-between p-2.5 pb-0 z-10">
        <div>
          {discountPct > 0 ? (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/60 px-1.5 py-0.5 rounded">
              {discountPct}% OFF
            </span>
          ) : (
            <span />
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Compare Button */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            type="button"
            onClick={toggleCompare}
            title={isCompared ? 'In Compare List' : 'Compare Specification'}
            className={`p-1.5 rounded-full transition-colors ${
              isCompared
                ? 'text-blue-600 bg-blue-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </motion.button>

          {/* Wishlist Heart Button with Spring Animation */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            type="button"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`p-1.5 rounded-full transition-colors ${
              isWishlisted
                ? 'text-red-500 bg-red-50'
                : 'text-slate-400 hover:text-red-500 hover:bg-slate-100'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform duration-200 ${
                isWishlisted ? 'fill-current scale-110' : ''
              }`}
            />
          </motion.button>
        </div>
      </div>

      {/* Product Image on Clean Background with gentle zoom */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block w-full h-44 sm:h-48 bg-white overflow-hidden px-4 py-2"
      >
        <Image
          src={mainImage}
          alt={product.images[0]?.altText || product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-2 group-hover:scale-104 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-3.5 pt-1">
        {/* Brand Name */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block truncate">
          {product.brand.name}
        </span>

        {/* Title */}
        <Link
          href={`/products/${product.slug}`}
          className="mt-1 text-xs sm:text-[13px] font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[2.4rem]"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Key Specification Tags */}
        <div className="flex items-center gap-1 mt-2 mb-2 flex-wrap">
          {specBadges.map((badge, i) => (
            <span
              key={i}
              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200/60"
            >
              {badge}
            </span>
          ))}
        </div>

        {/* Price Row */}
        <div className="mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-slate-900">
              {formatPrice(minPrice)}
            </span>
            {correspondingMrp > minPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(correspondingMrp)}
              </span>
            )}
          </div>

          {/* Stock Status Indicator */}
          <div className="mt-1 flex items-center justify-between text-xs">
            {totalAvailableStock > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-500">Out of Stock</span>
            )}

            {product.modelNumber && (
              <span className="text-[10px] text-slate-400 font-mono truncate max-w-[90px]">
                {product.modelNumber}
              </span>
            )}
          </div>

          {/* Blue Add to Cart Button with Interactive Micro-feedback */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding || totalAvailableStock <= 0}
            className={`mt-2.5 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors duration-200 ${
              addSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs'
            } disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed`}
          >
            <AnimatePresence mode="wait">
              {addSuccess ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Added to Cart!
                </motion.span>
              ) : isAdding ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
                </motion.span>
              ) : (
                <motion.span
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
