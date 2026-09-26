import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Scale, FileText, AlertCircle, ShieldCheck, Building2, Gavel } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service & Sale | Patel Networks Commercial Platform',
  description: 'Legal terms of sale, 18% GST invoice generation, B2B Input Tax Credit liabilities, pricing policies, and jurisdiction guidelines.',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Terms of Service</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
            <Scale className="w-3.5 h-3.5" />
            Commercial E-Commerce Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Terms of Service & Sale
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            These terms govern all purchases of security, surveillance, and networking hardware made on Patel Networks (MegaTech) by retail consumers, electrical contractors, and institutional buyers.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              1. 18% GST Tax Invoicing & Input Tax Credit (ITC)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              All commercial hardware (Cameras, Recorders, Cabling, Optical Converters, Hard Drives) sold on Patel Networks is subject to the Indian Goods and Services Tax (GST) Act:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li>All displayed prices reflect both the base price and the applicable 18% GST breakdown.</li>
              <li>Customers requesting B2B invoices must enter a valid 15-character Indian GSTIN and legal trade name at checkout.</li>
              <li>Patel Networks files all B2B invoices into GSTR-1 by the statutory deadline, allowing verified registered businesses to claim 100% Input Tax Credit (ITC).</li>
              <li>The purchaser is solely responsible for ensuring the accuracy of their GSTIN before placing an order. Once an invoice is generated and dispatched, retrospective amendments cannot be made.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              2. Order Verification & Concurrency Safeguards
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Due to real-time physical warehouse inventory management (ADR-010):
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li>Order placement does not constitute unconditional binding acceptance until our warehouse reserves stock and verifies payment status or COD serviceability.</li>
              <li>In the rare event of concurrent inventory depletion or pricing inaccuracies, Patel Networks reserves the right to cancel the order and provide an immediate 100% refund.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gavel className="w-5 h-5 text-indigo-500" />
              3. Limitation of Liability for Surveillance Data
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Patel Networks acts solely as an authorized commercial distributor of hardware. We are not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li>Loss of recorded video footage, data corruption on hard disk drives, or improper CCTV camera placement.</li>
              <li>Improper installation, incorrect wiring polarities, or third-party electrical surge damage.</li>
              <li>Any indirect, incidental, or consequential damages resulting from equipment downtime.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              4. Governing Law & Jurisdiction
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              These terms of sale are governed by the laws of the Republic of India. Any legal disputes arising out of transactions on this platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Surat, Gujarat, India</strong>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
