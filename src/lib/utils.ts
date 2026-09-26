import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | { toString(): string }): string {
  const num = typeof amount === 'number' ? amount : parseFloat(amount.toString());
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

export const formatInr = formatPrice;


export function calculateGstBreakdown(priceInclusiveGst: number, gstRatePct = 18) {
  const taxableValue = priceInclusiveGst / (1 + gstRatePct / 100);
  const totalGst = priceInclusiveGst - taxableValue;
  const cgst = totalGst / 2;
  const sgst = totalGst / 2;
  const igst = totalGst;

  return {
    priceInclusiveGst,
    taxableValue: Math.round(taxableValue * 100) / 100,
    totalGst: Math.round(totalGst * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    gstRatePct,
  };
}
