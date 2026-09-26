'use client';

import React, { useState } from 'react';
import { FileCheck, PhoneCall, MessageSquare, Send } from 'lucide-react';
import { B2BQuoteModal } from './B2BQuoteModal';

interface B2BContractorCalloutProps {
  productName: string;
  skuCode?: string;
}

export function B2BContractorCallout({
  productName,
  skuCode,
}: B2BContractorCalloutProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 border border-sky-100 dark:border-slate-800 flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
          <FileCheck className="w-5 h-5" />
        </div>
        <div className="text-xs flex-1">
          <h4 className="font-bold text-slate-900 dark:text-white">
            Commercial Contractor or System Integrator?
          </h4>
          <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            Deploying 10+ units? Request special project dealer pricing and automated WhatsApp quotation.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Get WhatsApp Quote</span>
            </button>

            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
            >
              <PhoneCall className="w-3 h-3" /> Dealer Desk: +91 98765 43210
            </a>
          </div>
        </div>
      </div>

      <B2BQuoteModal
        productName={productName}
        skuCode={skuCode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
