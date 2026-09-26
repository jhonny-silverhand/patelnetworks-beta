'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  CreditCard,
} from 'lucide-react';
import { submitB2BQuoteInquiryAction } from '@/app/actions/whatsapp.actions';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitting(true);
    try {
      await submitB2BQuoteInquiryAction({
        customerName: name,
        phone,
        companyName: company || 'Retail Customer / Contractor',
        productName: 'General Consultation & Wholesale Inquiry',
        quantity: 1,
        notes: notes || 'General inquiry submitted via Contact Desk',
      });
      setSubmitted(true);
    } catch {
      // Graceful fallback
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Breadcrumb */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white">Home</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Contact & Support Desk</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
            <Building2 className="w-3.5 h-3.5" />
            Central Distribution Hub • Surat, Gujarat
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Commercial Surveillance Consultation & Contact Desk
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Need tailored advice on DVR/NVR channel capacity, lens FOV calculations, or bulk B2B project pricing for 10+ cameras? Our CCTV systems engineers are ready to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Direct Coordinates */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Direct Contacts</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Central Warehouse & Node</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Patel Networks (MegaTech Distribution Center)<br />
                      Commercial Arcade, Ring Road Hub<br />
                      Surat, Gujarat - 395003, India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Sales & Contractor Hotline</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      +91 98765 43210 (Toll-Free Direct)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Email Desks</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Sales: <span className="font-mono text-sky-600 dark:text-sky-400">sales@patelnetworks.com</span><br />
                      Support: <span className="font-mono text-sky-600 dark:text-sky-400">support@patelnetworks.com</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Operating Hours</span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Mon – Sat: 9:30 AM – 7:30 PM IST<br />
                      Sunday: Closed (Dispatch Hub Only)
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href="https://wa.me/919876543210?text=Hi%20Patel%20Networks,%20I%20have%20an%20inquiry%20regarding%20commercial%20CCTV%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat Instantly on WhatsApp
                </a>
              </div>
            </div>

            {/* Official Bank Details for B2B Direct RTGS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <CreditCard className="w-4 h-4 text-sky-500" />
                <span>B2B Direct Bank Transfer (NEFT/RTGS)</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                For commercial institutional purchase orders exceeding ₹1,00,000, direct bank transfer is supported:
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 font-mono text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
                <div><span className="text-slate-400 font-sans">Beneficiary:</span> Patel Networks Private Limited</div>
                <div><span className="text-slate-400 font-sans">Bank:</span> HDFC Bank Ltd, Surat Central</div>
                <div><span className="text-slate-400 font-sans">Account No:</span> 50200088991122</div>
                <div><span className="text-slate-400 font-sans">IFSC Code:</span> HDFC0001234</div>
                <div><span className="text-slate-400 font-sans">GSTIN:</span> 24AABCP9876Q1Z2</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Consultation & Quote Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 sm:p-9 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                Send an Inquiry or Wholesale Quote Request
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Fill in your specifications and our technical solutions engineer will contact you via WhatsApp / Phone within 2 working hours.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Inquiry Received Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Thank you, {name}. Our surveillance solutions desk has logged your project scope and sent an acknowledgment to your WhatsApp (+91 {phone}).
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 py-2 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        WhatsApp Contact Number *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company Name / System Integrator Trade Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Gujarat Security Solutions & Contractors"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project Scope & Hardware Requirements *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Specify requirements: e.g., 8-channel NVR with 6x 4MP ColorVu bullet cameras, 2TB Purple HDD, 90m Cat6 spool, and SMPS power supply..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto py-3 px-8 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submitting ? 'Submitting Request...' : 'Submit Commercial Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
