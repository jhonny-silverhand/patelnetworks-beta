'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  colorClass?: string;
}

const BRANDS_LIST: BrandItem[] = [
  { id: 'hikvision', name: 'HIKVISION', slug: 'hikvision', subtitle: 'A Safer World', colorClass: 'text-red-600 font-black' },
  { id: 'dahua', name: 'alhua', slug: 'dahua', subtitle: 'Technology', colorClass: 'text-red-500 font-extrabold' },
  { id: 'cp-plus', name: 'CP PLUS', slug: 'cp-plus', subtitle: 'Securing You', colorClass: 'text-red-600 font-bold' },
  { id: 'd-link', name: 'D-Link', slug: 'd-link', subtitle: 'Networks', colorClass: 'text-blue-600 font-extrabold' },
  { id: 'aoc', name: 'ЛОС', slug: 'aoc', subtitle: 'Displays', colorClass: 'text-blue-800 font-black' },
  { id: 'seagate', name: 'SEAGATE', slug: 'seagate', subtitle: 'Surveillance HDD', colorClass: 'text-emerald-700 font-bold' },
  { id: 'tp-link', name: 'tp-link', slug: 'tp-link', subtitle: 'Reliably Smart', colorClass: 'text-teal-600 font-semibold' },
  { id: 'lapcare', name: 'Lapcare', slug: 'lapcare', subtitle: 'Power SMPS', colorClass: 'text-orange-500 font-bold' },
  { id: 'mtc', name: 'MTC', slug: 'mtc', subtitle: 'HD Hardware', colorClass: 'text-blue-900 font-black' },
  { id: 'optilink', name: 'Optilink', slug: 'optilink', subtitle: 'Optical Fiber', colorClass: 'text-indigo-600 font-bold' },
];

export function TopBrandsSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Top Brands
        </h2>
        <Link
          href="/products#brands"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors group"
        >
          <span>View All Brands</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Brands Grid with Subtle Motion */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {BRANDS_LIST.map((b, idx) => (
          <motion.div
            key={b.id}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{
              duration: 0.35,
              delay: idx * 0.03,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={shouldReduceMotion ? {} : { y: -3, scale: 1.02 }}
          >
            <Link
              href={`/products?brand=${b.slug}`}
              className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-xs transition-all h-20 text-center group"
            >
              <span className={`text-base sm:text-lg tracking-tight ${b.colorClass} group-hover:scale-105 transition-transform duration-200`}>
                {b.name}
              </span>
              {b.subtitle && (
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  {b.subtitle}
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
