'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/storefront/ProductCard';

export interface FeaturedProductsSectionProps {
  products: any[];
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Hardware' },
  { id: 'cctv-cameras', label: 'CCTV Cameras' },
  { id: 'dvr-nvr', label: 'DVR & NVR' },
  { id: 'hard-drives', label: 'Surveillance HDD' },
  { id: 'networking', label: 'PoE & Network' },
  { id: 'cables', label: 'Cables' },
  { id: 'monitors', label: 'Monitors' },
];

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const [activeTab, setActiveTab] = useState('all');
  const shouldReduceMotion = useReducedMotion();

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    const name = p.name.toLowerCase();
    const catSlug = p.category?.slug?.toLowerCase() || '';

    if (activeTab === 'cctv-cameras') {
      return (
        name.includes('camera') ||
        name.includes('bullet') ||
        name.includes('dome') ||
        catSlug.includes('hd-cam') ||
        catSlug.includes('ip-cam')
      );
    }
    if (activeTab === 'dvr-nvr') {
      return (
        name.includes('dvr') ||
        name.includes('nvr') ||
        name.includes('recorder') ||
        catSlug.includes('dvr-nvr')
      );
    }
    if (activeTab === 'hard-drives') {
      return (
        name.includes('hdd') ||
        name.includes('hard drive') ||
        name.includes('skyhawk') ||
        catSlug.includes('storage')
      );
    }
    if (activeTab === 'networking') {
      return (
        name.includes('switch') ||
        name.includes('router') ||
        name.includes('poe') ||
        catSlug.includes('accessories')
      );
    }
    if (activeTab === 'cables') {
      return (
        name.includes('cable') ||
        name.includes('cat6') ||
        name.includes('coaxial') ||
        catSlug.includes('cables')
      );
    }
    if (activeTab === 'monitors') {
      return name.includes('monitor') || name.includes('aoc') || name.includes('screen');
    }
    return true;
  });

  return (
    <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Featured Products
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified stock ready for immediate dispatch from central warehouse.
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors self-start sm:self-auto group"
        >
          <span>View All Products</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Filter Tabs with Smooth Indicator */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 bg-white border border-slate-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryPill"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-xs"
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Responsive Product Grid with Staggered Motion */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeTab}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">
            No products match this category filter currently in stock.
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="mt-3 px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Show All Products
          </button>
        </div>
      )}
    </section>
  );
}
