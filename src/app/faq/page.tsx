'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { HelpCircle, ChevronDown, ChevronUp, Wrench, Shield, FileText, Truck, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  category: string;
  answer: string | React.ReactNode;
}

const FAQS: FaqItem[] = [
  {
    category: 'Product & Technical',
    question: 'What is the difference between HD Analog (DVR) and Network IP (NVR) systems?',
    answer:
      'HD Analog systems (CP Plus Cosmic, Hikvision Turbo HD) transmit video over coaxial 3+1 cabling to a DVR. They are cost-effective, straightforward to install, and ideal for standard residential or small retail shops. Network IP systems transmit digital video packets over Cat6 ethernet cabling to an NVR, supporting ultra-high 4K resolutions, PoE (Power over Ethernet) single-cable power, and advanced AI analytics (human/vehicle detection, perimeter tripwires).',
  },
  {
    category: 'Product & Technical',
    question: 'How do I calculate how much hard drive storage (TB) I need?',
    answer:
      'Under modern H.265 video compression, a 2MP camera recording continuously at 1080p consumes approximately 20–25GB per day. A 4-camera 2MP system recording for 30 days requires ~2.5TB to 3TB. With motion-detection recording enabled, storage requirements drop by 40–50%. We exclusively supply surveillance-grade hard drives (Western Digital Purple and Seagate SkyHawk) engineered for 24/7 continuous write cycles.',
  },
  {
    category: 'Product & Technical',
    question: 'Can I combine dome and bullet cameras in the same kit?',
    answer:
      'Yes! Dome cameras are typically installed indoors (living rooms, retail counters, office corridors) for discreet appearance and wide fields of view. Bullet cameras are weather-rated (IP67) with extended IR/ColorVu night vision spotlights, making them ideal for outdoor boundaries, parking lots, and building facades. You can customize any combination using our Interactive CCTV Kit Builder.',
  },
  {
    category: 'B2B & GST Invoicing',
    question: 'How do I claim 18% GST Input Tax Credit (ITC) for my business?',
    answer:
      'During checkout, simply check the "Are you purchasing for a registered business?" toggle and input your legal Company Name and 15-character Indian GSTIN. Our system dynamically computes the CGST/SGST (for Gujarat intra-state) or IGST (for inter-state) and generates an official Tax Invoice uploaded to GSTR-1, enabling full credit offset on your business GST returns.',
  },
  {
    category: 'Shipping & Payment',
    question: 'What are the rules and limits for Cash on Delivery (COD)?',
    answer:
      'Cash on Delivery is available for orders up to ₹15,000 in serviceable postal zones. For high-value heavy surveillance equipment (16-channel NVRs, 305m cable rolls) or remote air-cargo postal circles (North-East states, J&K), orders must be prepaid via Razorpay (UPI, Cards, Net Banking) to prevent transit refusal and high courier return costs.',
  },
  {
    category: 'Shipping & Payment',
    question: 'How fast will my order arrive and how do I track it?',
    answer:
      'Orders placed before 4:00 PM IST (Mon–Sat) are dispatched on the same day. Deliveries within Gujarat take 1–2 business days; metro cities take 2–3 business days; regional locations take 3–5 business days. Once dispatched, you receive instant WhatsApp and SMS alerts containing your live Delhivery or Shiprocket AWB tracking link.',
  },
  {
    category: 'Warranty & RMA',
    question: 'How does warranty work for CP Plus, Hikvision, and Dahua cameras?',
    answer:
      'All cameras and recorders carry standard 1-to-3-year authorized manufacturer warranties. In addition, Patel Networks scans and embeds every unique hardware serial number onto your GST Tax Invoice. You can claim warranty service directly at any authorized service center across India or contact our RMA desk for assistance.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Product & Technical', 'B2B & GST Invoicing', 'Shipping & Payment', 'Warranty & RMA'];

  const filteredFaqs = selectedCategory === 'ALL'
    ? FAQS
    : FAQS.filter((f) => f.category === selectedCategory);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Frequently Asked Questions</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Knowledge Base & Buying Guides
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Everything you need to know about CCTV camera resolutions, DVR/NVR matching, hard drive calculations, 18% GST Input Tax Credit, and shipping policies.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'ALL' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 px-5 sm:px-6 flex items-center justify-between text-left gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <span className="shrink-0 text-slate-400">
                    {isOpen ? <ChevronUp className="w-4 h-4 text-sky-500" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs text-center space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Have a Specific Project Requirement?
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our surveillance solutions engineers can review your floor plan, camera count, and storage needs.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/contact"
              className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
            >
              Contact Engineering Desk
            </Link>
            <Link
              href="/kit-builder"
              className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" /> CCTV Kit Builder
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
