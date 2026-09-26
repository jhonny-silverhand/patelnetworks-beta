'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  subTitle: string;
  slug: string;
  imageUrl: string;
}

export const COMMERCE_CATEGORIES: CategoryItem[] = [
  {
    id: 'cctv-cameras',
    name: 'CCTV Cameras',
    subTitle: 'HD & IP Cameras',
    slug: 'cctv-surveillance',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'dvr-nvr',
    name: 'DVR / NVR',
    subTitle: 'Recorders',
    slug: 'cctv-surveillance',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'surveillance-hdd',
    name: 'Surveillance HDD',
    subTitle: 'Internal Hard Drives',
    slug: 'surveillance-storage',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'network-poe',
    name: 'Network & PoE',
    subTitle: 'Switches, Routers',
    slug: 'power-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'cables',
    name: 'Cables',
    subTitle: 'HD & Network Cables',
    slug: 'cables-wiring',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'connectors',
    name: 'Connectors',
    subTitle: 'BNC, RJ45 & more',
    slug: 'power-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'monitors',
    name: 'Monitors',
    subTitle: 'LED & LCD Screens',
    slug: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'optical-fiber',
    name: 'Optical Fiber',
    subTitle: 'Fiber & Accessories',
    slug: 'power-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    subTitle: 'Power, Mounts, Boxes',
    slug: 'power-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
  },
];

export function CategoryDiscovery() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Shop by Category
        </h2>
        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
        >
          <span>View All Categories</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid (9-Tile Retail Layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-3 sm:gap-4">
        {COMMERCE_CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.35,
              delay: idx * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={shouldReduceMotion ? {} : { y: -3 }}
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center bg-white border border-slate-200 rounded-xl p-3 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all text-center h-full"
            >
              {/* Product Image on Clean White Background */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-2.5 flex items-center justify-center overflow-hidden">
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 33vw, 120px"
                  className="object-contain p-1 group-hover:scale-108 transition-transform duration-300 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Category Name */}
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">
                {cat.name}
              </h3>

              {/* Subtitle */}
              <span className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                {cat.subTitle}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
