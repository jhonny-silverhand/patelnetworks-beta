'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export function PrintInvoiceButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="py-2.5 px-4 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
    >
      <Printer className="w-4 h-4" />
      <span>Print / Save Tax Invoice</span>
    </button>
  );
}
