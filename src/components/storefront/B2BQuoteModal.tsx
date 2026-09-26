'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Phone,
  User,
  Package,
  FileCheck,
  CheckCircle2,
  Loader2,
  Send,
  ExternalLink,
} from 'lucide-react';
import { submitB2BQuoteInquiryAction } from '@/app/actions/whatsapp.actions';

interface B2BQuoteModalProps {
  productName: string;
  skuCode?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function B2BQuoteModal({
  productName,
  skuCode,
  isOpen,
  onClose,
}: B2BQuoteModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || quantity < 1) {
      setErrorMsg('Please fill in your name, contact mobile number, and quantity.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      const res = await submitB2BQuoteInquiryAction({
        customerName: customerName.trim(),
        phone: phone.trim(),
        productName: skuCode ? `${productName} (${skuCode})` : productName,
        quantity: Number(quantity),
        companyName: companyName.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.data) {
        setSubmittedData(res.data);
      } else {
        setErrorMsg(res.error || 'Failed to submit quotation inquiry.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting quote request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaunchWhatsApp = () => {
    const text = `Hi Patel Networks Dealer Desk, I just submitted an inquiry for ${quantity}x ${productName} (Ref: ${submittedData?.messageId}). Please provide wholesale project pricing.`;
    window.open(
      `https://wa.me/919876543210?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200 block mb-1">
              B2B Commercial Dealer Desk
            </span>
            <h3 className="text-lg font-extrabold tracking-tight">
              Request Project Bulk Quotation
            </h3>
            <p className="text-xs text-sky-100 mt-0.5">
              Unlock Tier-2 wholesale dealer pricing with formal GST tax invoicing.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedData ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Quotation Request Dispatched!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  We have queued your inquiry for <strong>{quantity} units</strong> of {productName}. A WhatsApp confirmation has been dispatched to your mobile.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs font-mono text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Inquiry Reference</span>
                <span>{submittedData.messageId}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleLaunchWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp Directly</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 text-rose-800 dark:text-rose-200 font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Product Badge */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                <Package className="w-4 h-4 text-sky-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    {productName}
                  </span>
                  {skuCode && <span className="text-[10px] font-mono text-slate-400">{skuCode}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Contractor Name */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Number *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs font-bold text-slate-500 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full pl-11 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Security Agency / Company Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Patel Security Systems"
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white"
                    />
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Required Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Project / Site Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Site Details / Tender Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 16-channel industrial factory deployment in Surat with outdoor night vision requirements"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold shadow-md shadow-sky-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Dispatching Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Quote Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
