import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Wrench, PhoneCall } from 'lucide-react';

export function PromotionalBanners() {
  return (
    <section className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left Banner: Custom CCTV Kit Builder */}
        <div className="lg:col-span-8 relative bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
          {/* Subtle Ambient Glow */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Background Realistic Hardware Imagery */}
          <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-35 sm:opacity-45 pointer-events-none">
            <Image
              src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80"
              alt="CCTV Hardware Kit"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain object-bottom-right p-2"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative z-10 max-w-md space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
              Interactive System Configurator
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Build a Custom CCTV Solution
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Not sure what you need? Assemble the right DVR channels, bullet and dome cameras, and calculate exact recording storage with an automatic 5% bundle discount.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <Link
              href="/kit-builder"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs"
            >
              <Wrench className="w-4 h-4" /> Open CCTV Kit Builder <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right Banner: Need Help Choosing? */}
        <div className="lg:col-span-4 relative bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
          <div className="relative z-10 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Engineering Support
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Need Help Choosing?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Our certified surveillance specialists can assist in planning camera FOV, PoE wattage budgets, and cable runs for your exact site requirements.
            </p>
          </div>

          <div className="relative z-10 pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs w-full sm:w-auto justify-center"
            >
              <PhoneCall className="w-4 h-4" /> Contact Us <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
