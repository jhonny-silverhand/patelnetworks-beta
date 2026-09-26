import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Truck, Clock, ShieldAlert, CheckCircle2, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Shipping & Delivery Policy | Patel Networks Commercial Logistics',
  description: 'Pan-India shipping rates, express transit SLAs, 6-digit Pincode dispatch zones, and Cash on Delivery serviceability guidelines.',
};

export default function ShippingPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Shipping & Delivery Policy</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
            <Truck className="w-3.5 h-3.5" />
            Pan-India Express Surveillance Logistics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Shipping & Dispatch Policy
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Patel Networks partners with tier-1 logistics couriers (Delhivery, Shiprocket, BlueDart) to deliver fragile, commercial-grade security cameras, DVRs, NVRs, and cabling safely across 19,000+ Indian PIN codes.
          </p>
        </div>

        {/* Key Logistics Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Same-Day Dispatch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All prepaid orders and verified COD orders placed before <strong className="text-slate-800 dark:text-slate-200">4:00 PM IST (Mon–Sat)</strong> are packaged, serial-numbered, and handed over to courier hubs on the same day.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Free Express Shipping</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All commercial orders above <strong className="text-slate-800 dark:text-slate-200">₹999</strong> qualify for complimentary insured surface or air delivery with real-time AWB tracking.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Transit Insurance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every shipment is 100% insured against loss or transit damage. We recommend recording an unboxing video upon parcel handover for instant DOA claims.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-500" />
              1. Delivery Transit SLAs by Indian Postal Zones
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Transit timelines are calculated based on your 6-digit postal PIN code from our Central Warehouse Hub in Surat, Gujarat:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <th className="py-2.5 px-3 font-semibold">Logistics Zone</th>
                    <th className="py-2.5 px-3 font-semibold">Typical Coverage</th>
                    <th className="py-2.5 px-3 font-semibold">Estimated Transit</th>
                    <th className="py-2.5 px-3 font-semibold">Carrier Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">Intra-State (Gujarat)</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Surat, Ahmedabad, Vadodara, Rajkot</td>
                    <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">1 – 2 Business Days</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Direct Express Surface</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">Tier-1 Metro Cities</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata</td>
                    <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400 font-bold">2 – 3 Business Days</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Priority Air / Fast Surface</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">Regional Hubs</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Pune, Jaipur, Lucknow, Indore, Chandigarh, Kochi</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-bold">3 – 5 Business Days</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">National Surface Express</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-white">Special / Remote Zones</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">North-East states, Jammu & Kashmir, Ladakh, Andaman & Nicobar</td>
                    <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-bold">5 – 8 Business Days</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">Dedicated Air Cargo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              2. Cash on Delivery (COD) Rules & Safeguards
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              To mitigate Return-To-Origin (RTO) risks on high-value, heavy commercial equipment (16-channel NVRs, 305-meter drum cable spools), selective Cash on Delivery policies apply (ADR-004):
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li><strong className="text-slate-900 dark:text-white">Order Value Ceiling:</strong> COD is available for orders up to <strong>₹15,000</strong>. Orders exceeding ₹15,000 must be prepaid via Razorpay (UPI, Credit/Debit Card, Net Banking).</li>
              <li><strong className="text-slate-900 dark:text-white">Air Cargo Exclusions:</strong> Remote delivery zones (PIN prefixes 79, 19, 744) requiring dedicated air freight are restricted to prepaid online payment.</li>
              <li><strong className="text-slate-900 dark:text-white">COD Verification:</strong> For first-time COD customers, our dispatch operations team sends an automated WhatsApp confirmation before generating courier manifests.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Real-Time Tracking & WhatsApp Notifications
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              As soon as your shipment manifest is generated, an automated notification is sent via <strong>WhatsApp</strong> and <strong>SMS</strong> containing your Carrier Partner name (Delhivery/Shiprocket) and direct live AWB tracking link. You can also track your order anytime on our <Link href="/account" className="text-sky-600 dark:text-sky-400 underline font-semibold">Account Tracking Portal</Link>.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Have Questions About Your Delivery?</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Contact our logistics dispatch desk or track your active consignment directly.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/account"
              className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
            >
              Track Order
            </Link>
            <Link
              href="/contact"
              className="py-2.5 px-5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            >
              Contact Dispatch
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
