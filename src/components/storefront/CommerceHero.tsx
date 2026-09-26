'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  FileText,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react';

interface HeroSlide {
  title: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  brandTag: string;
  badgeTag: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    title: 'Professional CCTV & Security Solutions',
    subtitle:
      'Cameras, NVR/DVR, Networking, Cables and more from trusted brands. Ideal for homes, offices, retail and industrial setups.',
    primaryCtaText: 'Shop All Products',
    primaryCtaLink: '/products',
    secondaryCtaText: 'Explore Categories',
    secondaryCtaLink: '/products#categories',
    brandTag: 'HIKVISION • a Safer World',
    badgeTag: 'Commercial Surveillance Systems',
    imageUrl:
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Enterprise AcuSense AI Video Recorders',
    subtitle:
      'Deep learning motion classification for human and vehicle targets. H.265 Pro+ compression saves up to 75% storage bandwidth.',
    primaryCtaText: 'Browse AI Recorders',
    primaryCtaLink: '/products?search=DVR',
    secondaryCtaText: 'Custom Kit Builder',
    secondaryCtaLink: '/kit-builder',
    brandTag: 'CP PLUS & DAHUA • Authorized',
    badgeTag: 'AI Edge Processing & Analytics',
    imageUrl:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '24/7 Surveillance Storage & High-Speed PoE',
    subtitle:
      'Engineered for continuous multi-camera write workloads. Seagate SkyHawk internal HDDs and Gigabit PoE metal switches with instant dispatch.',
    primaryCtaText: 'Explore Storage & Switches',
    primaryCtaLink: '/products?search=SkyHawk',
    secondaryCtaText: 'Wholesale B2B Quotes',
    secondaryCtaLink: '/contact',
    brandTag: 'SEAGATE & D-LINK • Ready Stock',
    badgeTag: 'Zero Dropped Frames • 180TB/Yr',
    imageUrl:
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80',
  },
];

export function CommerceHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === HERO_SLIDES.length - 1 ? 0 : prev + 1));
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="bg-slate-50 border-b border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-gradient-to-r from-white via-slate-50 to-slate-100/90 border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction > 0 ? 30 : -30 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: direction > 0 ? -30 : 30 }
              }
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-8"
            >
              {/* Left Column: Text & Staggered CTAs */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                {/* Surveillance Telemetry Live Tag */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span>{slide.badgeTag}</span>
                  <span className="text-blue-300">•</span>
                  <span className="text-slate-500 text-[11px] font-normal">Active System</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4, ease: 'easeOut' }}
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.4, ease: 'easeOut' }}
                  className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl font-normal"
                >
                  {slide.subtitle}
                </motion.p>

                {/* Staggered Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
                  className="flex flex-wrap items-center gap-3 pt-2"
                >
                  <Link
                    href={slide.primaryCtaLink}
                    className="group relative overflow-hidden px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href={slide.secondaryCtaLink}
                    className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs sm:text-sm shadow-2xs flex items-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {slide.secondaryCtaText}
                  </Link>
                </motion.div>
              </div>

              {/* Right Column: Hardware Visual with Smooth Motion */}
              <div className="lg:col-span-5 relative w-full h-56 sm:h-72 lg:h-80 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full h-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-inner flex items-center justify-center overflow-hidden group"
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-contain p-2 group-hover:scale-104 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />

                  {/* Brand Tag Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    {slide.brandTag}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-300 text-slate-700 hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-300 text-slate-700 hover:bg-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 pb-4">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentSlide ? 1 : -1);
                  setCurrentSlide(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 4 Value Propositions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-1"
        >
          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">GST Invoice</h4>
              <p className="text-[11px] text-slate-500">on all orders • 18% ITC</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">Secure Payments</h4>
              <p className="text-[11px] text-slate-500">Razorpay & NetBanking</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">Shipping Support</h4>
              <p className="text-[11px] text-slate-500">Shiprocket / Delhivery Air</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all hover:-translate-y-0.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-[13px] font-bold text-slate-900">Technical Assistance</h4>
              <p className="text-[11px] text-slate-500">Pre & Post Sales Support</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
