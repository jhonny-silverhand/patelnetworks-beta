import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ShieldCheck, Lock, EyeOff, FileText, Database, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Patel Networks Security Data Protection',
  description: 'Compliance with Information Technology Act 2000, SPDI rules, 15-character GSTIN handling, and Razorpay PCI-DSS encryption protocols.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Privacy Policy</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
            <Lock className="w-3.5 h-3.5" />
            Indian IT Act 2000 & SPDI Compliant
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy & Data Security Policy
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Patel Networks (MegaTech) is committed to protecting the privacy, corporate tax data, and financial transactions of all retail consumers and commercial surveillance contractors.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Zero Payment Storage</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We never store your credit/debit card numbers, CVVs, or UPI PINs. All payments are encrypted via Razorpay&apos;s certified PCI-DSS Level 1 infrastructure.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">B2B Tax Data Protection</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Company GSTINs and legal billing names are stored securely in PostgreSQL with row-level access controls solely for GSTR-1 tax compliance.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">No Third-Party Selling</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your contact numbers and addresses are strictly shared with carrier partners (Delhivery/Shiprocket) for delivery dispatch and never sold to third-party telemarketers.
            </p>
          </div>
        </div>

        {/* Policy Content */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When using Patel Networks, we collect only the necessary data points to fulfill hardware procurement:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li><strong className="text-slate-900 dark:text-white">Primary Identity:</strong> Mobile phone number verified via 6-digit SMS OTP (ADR-003, ADR-011).</li>
              <li><strong className="text-slate-900 dark:text-white">Dispatch Information:</strong> Recipient name, complete shipping address, postal PIN code, and contact number.</li>
              <li><strong className="text-slate-900 dark:text-white">Commercial B2B Credentials:</strong> Company trade name and 15-character Indian GSTIN for 18% Input Tax Credit.</li>
              <li><strong className="text-slate-900 dark:text-white">Hardware Traceability:</strong> Individual hardware serial numbers linked to your order records for RMA warranty enforcement.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              2. Transactional Communications (WhatsApp & SMS)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              By checking out or placing an inquiry on our platform, you consent to receive critical transactional updates via the official <strong>Meta WhatsApp Cloud API</strong> and SMS gateways. These notifications are limited strictly to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li>OTP Verification codes for customer authentication.</li>
              <li>Order Confirmation notifications with total INR amounts and links to your 18% GST Tax Invoice.</li>
              <li>Real-time Courier AWB dispatch alerts and Out-for-Delivery notices.</li>
              <li>B2B contractor wholesale quote responses requested via our quote desks.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Cookies and Session Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We employ strict, HTTP-only, secure, SameSite cookies (<code className="font-mono text-slate-800 dark:text-slate-200">pn_session</code>, <code className="font-mono text-slate-800 dark:text-slate-200">pn_cart_id</code>) to maintain shopping carts across visits and secure customer logins without exposing tokens to client-side scripts.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
