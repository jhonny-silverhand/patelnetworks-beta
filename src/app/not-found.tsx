import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Search, Wrench, Package, MessageSquare } from 'lucide-react';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';

export const metadata = {
  title: '404 - Feed Not Found | Patel Networks',
  description: 'The requested surveillance feed or page could not be located on Patel Networks servers.',
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Visual Radar / Feed Disconnect Graphic */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-transparent to-red-500/10 animate-pulse" />
            <ShieldAlert className="w-12 h-12 text-sky-400 relative z-10 animate-bounce" />
            <span className="absolute bottom-2 text-[9px] font-mono font-bold tracking-widest text-red-400 uppercase">
              FEED LOST • 404
            </span>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/50 border border-red-800/60 text-red-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              CAMERA SIGNAL TIMEOUT [ERROR 404]
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Page or Surveillance Feed Not Found
            </h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              The hardware model, category, or order document you are looking for has been moved, decommissioned, or does not exist.
            </p>
          </div>

          {/* Direct Action Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-lg shadow-sky-600/20"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Central Hub
            </Link>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs transition-all"
            >
              <Search className="w-4 h-4 text-sky-400" /> Browse Catalog
            </Link>

            <Link
              href="/kit-builder"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs transition-all"
            >
              <Wrench className="w-4 h-4 text-amber-400" /> Custom CCTV Kit Builder
            </Link>

            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-xs transition-all"
            >
              <Package className="w-4 h-4 text-emerald-400" /> Track Orders
            </Link>
          </div>

          {/* Quick WhatsApp Support */}
          <div className="pt-4 border-t border-slate-900">
            <p className="text-xs text-slate-500 mb-2">Need immediate assistance with a model or dispatch?</p>
            <a
              href="https://wa.me/919876543210?text=Hello%20Patel%20Networks,%20I%20hit%20a%20404%20error%20on%20the%20website%20and%20need%20help."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat with Commercial Support on WhatsApp →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
