import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ShieldCheck, Award, Truck, CheckCircle2, Users, Building, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Patel Networks (MegaTech) | Authorized CCTV Distribution',
  description: 'Gujarat premier commercial security distributor for CP Plus, Hikvision, Dahua, and enterprise networking hardware.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">About Patel Networks</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
            <Award className="w-3.5 h-3.5" />
            Authorized Surveillance & Networking Distributor
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Building India&apos;s Most Trusted Surveillance Supply Chain
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Headquartered in Surat, Gujarat, Patel Networks (MegaTech) supplies commercial security cameras, AI-enabled NVRs, structured Cat6 cabling, and enterprise fiber equipment to security installers, electrical contractors, and corporate institutions.
          </p>
        </div>

        {/* Brand Partners */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs mb-12">
          <h2 className="text-base font-bold text-slate-900 dark:text-white text-center mb-6">
            Direct Authorized Brand Alliances
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
              CP PLUS
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
              HIKVISION
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
              DAHUA TECH
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
              WD PURPLE
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
              D-LINK
            </div>
          </div>
        </div>

        {/* Narrative & Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strict Serial Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every surveillance camera, hard drive, and recorder leaving our warehouse has its unique factory serial number scanned and printed on your official 18% GST Tax Invoice, safeguarding genuine manufacturer warranty claims.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Express Same-Day Dispatch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Equipped with a high-density warehouse in Surat, we dispatch orders before 4:00 PM IST on the same day via Delhivery Air and Surface logistics, ensuring 1-2 day delivery across Gujarat and 2-3 days across Indian metros.
            </p>
          </div>
        </div>

        {/* CTA to Kit Builder */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Try Our Interactive CCTV Kit Builder</h3>
            <p className="text-xs text-sky-100 mt-1 max-w-md">
              Configure compatible cameras, DVR/NVR recorders, hard drives, and power supplies in 5 simple steps with an automatic 5% bundle discount.
            </p>
          </div>
          <Link
            href="/kit-builder"
            className="shrink-0 py-3 px-6 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            Launch Kit Builder <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
