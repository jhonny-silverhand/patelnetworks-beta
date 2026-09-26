'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { checkPincodeAction } from '@/app/actions/shipping.actions';
import { PincodeServiceability } from '@/lib/pincodes';

interface PincodeCheckerProps {
  orderTotal?: number;
  className?: string;
  onPincodeValidated?: (info: PincodeServiceability) => void;
}

export function PincodeChecker({
  orderTotal = 0,
  className = '',
  onPincodeValidated,
}: PincodeCheckerProps) {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [serviceInfo, setServiceInfo] = useState<PincodeServiceability | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore saved pincode from previous session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pn_customer_pincode');
      if (saved && /^[1-9][0-9]{5}$/.test(saved)) {
        setPincode(saved);
        handleCheck(saved);
      }
    }
  }, []);

  const handleCheck = async (pinToCheck?: string) => {
    const targetPin = (pinToCheck || pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(targetPin)) {
      setErrorMsg('Enter a valid 6-digit Indian PIN code');
      setServiceInfo(null);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await checkPincodeAction(targetPin, orderTotal);

      if (res.success && res.data) {
        setServiceInfo(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('pn_customer_pincode', targetPin);
          window.dispatchEvent(
            new CustomEvent('pincode-selected', { detail: res.data })
          );
        }
        if (onPincodeValidated) {
          onPincodeValidated(res.data);
        }
      } else {
        setErrorMsg(res.error || 'Pincode not serviceable.');
        setServiceInfo(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error validating delivery location.');
      setServiceInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      handleCheck(val);
    } else {
      setServiceInfo(null);
      setErrorMsg(null);
    }
  };

  return (
    <div
      className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between mb-2.5">
        <label
          htmlFor="pincode-input"
          className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-sky-500" /> Check Delivery & COD Availability
        </label>
        {serviceInfo && (
          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
            {serviceInfo.city}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id="pincode-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="Enter 6-digit Indian PIN (e.g. 395003)"
            value={pincode}
            onChange={handleInputChange}
            className="w-full text-xs font-mono font-medium py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
          />
          {loading && (
            <div className="absolute right-3 top-2.5 text-sky-500">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleCheck()}
          disabled={loading || pincode.length !== 6}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          Check
        </button>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="mt-2.5 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Validated Results Banner */}
      {serviceInfo && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Est. Delivery:</span>
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {serviceInfo.estimatedDeliveryDate} ({serviceInfo.estimatedDaysMin}-{serviceInfo.estimatedDaysMax} days)
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Banknote className="w-3.5 h-3.5 text-blue-500" />
              <span>Cash on Delivery:</span>
            </span>
            <span
              className={`font-bold ${
                serviceInfo.isCodAvailable
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {serviceInfo.isCodAvailable ? 'Available' : 'Prepaid Only (Special Zone)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Carrier Partner:</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {serviceInfo.carrierPartner}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-1">
            {serviceInfo.notes}
          </p>
        </div>
      )}
    </div>
  );
}
