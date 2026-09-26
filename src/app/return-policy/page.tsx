import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { RotateCcw, ShieldCheck, FileText, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Warranty & Returns (RMA) Policy | Patel Networks Commercial Hardware',
  description: '7-Day DOA replacement guarantee, manufacturer warranty claims for Hikvision, CP Plus, Dahua, and hardware serial verification guidelines.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Warranty & Returns Policy</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
            <RotateCcw className="w-3.5 h-3.5" />
            Commercial RMA & Warranty Assurance
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Warranty & Returns (RMA) Policy
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Patel Networks supplies 100% genuine commercial surveillance hardware backed by authorized manufacturer warranties. Our Return Merchandise Authorization (RMA) process is streamlined for retail buyers, electrical contractors, and system integrators.
          </p>
        </div>

        {/* 3 Main Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">7-Day DOA Replacement</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If any camera, DVR/NVR, or switch arrives Dead On Arrival (DOA) or damaged in transit, we provide a free reverse pickup and immediate brand-new replacement.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1–3 Year Brand Warranty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All Hikvision, CP Plus, Dahua, and Western Digital Purple HDDs carry official manufacturer warranty honored at any authorized service center across India.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Serial-Tracked Invoices</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Every item dispatched includes individual hardware serial numbers recorded on your official 18% GST Tax Invoice, simplifying warranty claims.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8 text-sm text-slate-700 dark:text-slate-300">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. 7-Day Dead On Arrival (DOA) Claims Procedure
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              In the rare event of receiving defective or damaged surveillance equipment:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li>Notify our RMA desk within <strong>7 days of delivery</strong> via WhatsApp or email to <code className="text-indigo-600 dark:text-indigo-400 font-mono">support@patelnetworks.com</code>.</li>
              <li>Provide your <strong>Order Number</strong> (e.g. <code className="font-mono text-slate-800 dark:text-slate-200">ORD-1234</code>) and a brief video or photo showing the hardware defect or physical damage.</li>
              <li>Our technical desk will verify the serial number against the dispatch records and arrange a complimentary reverse courier pickup via Delhivery.</li>
              <li>Upon inspection at our Surat warehouse, a brand-new replacement unit will be dispatched within 24 hours.</li>
            </ol>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              2. Non-Returnable & Void Conditions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              The following circumstances invalidate return eligibility and manufacturer warranty:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li><strong className="text-slate-900 dark:text-white">Cut or Installed Cable Spools:</strong> Coaxial cable or Cat6 networking spools that have been cut, unspooled, or crimped cannot be accepted for return.</li>
              <li><strong className="text-slate-900 dark:text-white">Electrical Surge or Lightning Damage:</strong> Camera boards or SMPS power supplies showing burned PCB tracks due to lightning strikes or improper high-voltage power adapters.</li>
              <li><strong className="text-slate-900 dark:text-white">Tampered Warranty Stickers:</strong> Products with missing, scratched, or altered factory barcode/serial stickers.</li>
              <li><strong className="text-slate-900 dark:text-white">Physical Drops & Water Ingress on Indoor Models:</strong> Indoor dome cameras installed in unshaded outdoor rainfall conditions.</li>
            </ul>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Refund Processing Timelines
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When a refund is approved by our RMA desk:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
              <li><strong className="text-slate-900 dark:text-white">Prepaid Razorpay Orders:</strong> Credited back to the original source account (UPI, Debit/Credit Card, Net Banking) within <strong>3–5 business days</strong>.</li>
              <li><strong className="text-slate-900 dark:text-white">COD Orders:</strong> Processed via direct NEFT/IMPS bank transfer upon customer providing account details and cancelled cheque.</li>
              <li><strong className="text-slate-900 dark:text-white">B2B GST Credit Note:</strong> For registered commercial entities, an official GST Credit Note is issued and uploaded to GSTR-1, ensuring compliant accounting.</li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
          <HelpCircle className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Need Technical Support or RMA Help?</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Our engineers can help diagnose camera configuration issues before requesting physical returns.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/contact"
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
            >
              Contact RMA Desk
            </Link>
            <Link
              href="/account"
              className="py-2.5 px-5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
            >
              My Orders & Invoices
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
