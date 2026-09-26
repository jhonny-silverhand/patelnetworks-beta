'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import {
  Eye,
  Camera,
  HardDrive,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface TechCriteria {
  title: string;
  description: string;
  icon: React.ElementType;
  options: { label: string; query: string }[];
}

const CRITERIA: TechCriteria[] = [
  {
    title: 'By Resolution & Clarity',
    description: 'Select sensor fidelity based on distance and identification requirements.',
    icon: Eye,
    options: [
      { label: '2MP (1080p FHD) • Standard entry', query: 'search=2MP' },
      { label: '4MP (2K Quad-HD) • Recommended commercial', query: 'search=4MP' },
      { label: '8MP (4K UHD) • Ultra wide perimeter', query: 'search=8MP' },
    ],
  },
  {
    title: 'By Camera Housing & Lens',
    description: 'Match physical housing to outdoor weather exposure and ceiling height.',
    icon: Camera,
    options: [
      { label: 'Bullet • IP67 weatherproof perimeter', query: 'search=Bullet' },
      { label: 'Ceiling Dome • Vandal-proof indoor/reception', query: 'search=Dome' },
      { label: '2.8mm Wide (103° FOV) • Hallways & retail', query: 'search=2.8mm' },
      { label: '3.6mm Standard (84° FOV) • Gate & cash counters', query: 'search=3.6mm' },
    ],
  },
  {
    title: 'By Video Channels & AI Analytics',
    description: 'Select recorder size and intelligent motion detection algorithms.',
    icon: Cpu,
    options: [
      { label: '4-Channel DVR/NVR • Small office & homes', query: 'search=4-Channel' },
      { label: '8-Channel DVR/NVR • Medium shops & warehouses', query: 'search=8-Channel' },
      { label: 'AcuSense AI • Human & vehicle filtering', query: 'search=AcuSense' },
    ],
  },
  {
    title: 'By 24/7 Storage & Power Topology',
    description: 'Calculate continuous video recording retention and power transmission.',
    icon: HardDrive,
    options: [
      { label: '1TB SkyHawk • ~15-20 Days 4-ch recording', query: 'search=1TB' },
      { label: '2TB SkyHawk • ~30 Days continuous surveillance', query: 'search=2TB' },
      { label: '8-Port Gigabit PoE • Single-cable power & video', query: 'search=PoE' },
      { label: 'Cat6 305m Reel • 100% Solid copper runs', query: 'search=Cat6' },
    ],
  },
];

export function TechnicalBuyingGuide() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
            Engineering Procurement Matrix
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Shop by Technical Specifications
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Filter our catalog directly by sensor resolution, optical lens FOV, recorder channel capacity, and PoE power budgets.
          </p>
        </div>

        <Link
          href="/products"
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors self-start sm:self-auto group"
        >
          <span>Open Advanced Filters</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 4-Column Technical Discovery Cards with Staggered Entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CRITERIA.map((crit, idx) => {
          const Icon = crit.icon;
          return (
            <motion.div
              key={idx}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.4,
                delay: idx * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {crit.title}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                  {crit.description}
                </p>

                <div className="space-y-1.5">
                  {crit.options.map((opt, oIdx) => (
                    <Link
                      key={oIdx}
                      href={`/products?${opt.query}`}
                      className="group flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs transition-colors border border-slate-100 hover:border-blue-200"
                    >
                      <span className="font-medium truncate pr-2">{opt.label}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 shrink-0 transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
