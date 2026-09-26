'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { sendOtpAction, verifyOtpAction, getCurrentUserAction } from '@/app/actions/auth.actions';
import {
  Shield,
  Smartphone,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Building2,
  RefreshCw,
  Edit2,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testOtp, setTestOtp] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // If already logged in, redirect
  useEffect(() => {
    async function checkAuth() {
      const res = await getCurrentUserAction();
      if (res.success && res.user) {
        router.push(redirectUrl);
      }
    }
    checkAuth();
  }, [redirectUrl, router]);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10 || !/^[6-9]/.test(clean)) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtpAction(clean);
      if (res.success) {
        setStep('OTP');
        setSuccessMsg(`6-digit verification code sent to +91 ${clean}`);
        if (res.testOtp) {
          setTestOtp(res.testOtp);
        }
        setResendCooldown(30); // 30s cooldown
      } else {
        setErrorMsg(res.error || 'Failed to dispatch verification code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with SMS service.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otpCode.trim();
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMsg('Please enter the 6-digit code received on your mobile.');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtpAction(phone, cleanOtp);
      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push(redirectUrl);
      } else {
        setErrorMsg(res.error || 'Invalid verification code entered.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error verifying code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-8 sm:my-14">
      {/* Brand Icon Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mx-auto mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Customer Portal Login
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Instant passwordless access via Phone Number + 6-digit SMS OTP
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Error Feedback */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Test OTP Helper Banner (in dev / placeholder mode) */}
        {testOtp && step === 'OTP' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
            <div>
              <span className="font-bold block">Developer Sandbox Mode:</span>
              <span>Test OTP: <strong className="font-mono text-sm tracking-widest">{testOtp}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setOtpCode(testOtp)}
              className="px-2.5 py-1 bg-amber-200 dark:bg-amber-800 rounded-lg text-[11px] font-bold hover:bg-amber-300"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {step === 'PHONE' ? (
          /* STEP 1: ENTER PHONE NUMBER */
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Indian Mobile Number
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-xs font-bold text-slate-500 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono tracking-wider text-slate-900 dark:text-white"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute right-3.5" />
              </div>
              <span className="block text-[11px] text-slate-400 mt-1">
                We will dispatch a secure 6-digit OTP code to this mobile number.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || phone.length !== 10}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Dispatching OTP...
                </>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: ENTER OTP */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-2">
              <span>
                Verifying: <strong className="font-mono text-slate-900 dark:text-white">+91 {phone}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setStep('PHONE');
                  setOtpCode('');
                  setErrorMsg(null);
                }}
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" /> Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Enter 6-Digit OTP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center text-lg tracking-[0.5em] font-mono font-extrabold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Verifying Session...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  Verify & Enter Account
                </>
              )}
            </button>

            {/* Resend Cooldown */}
            <div className="text-center pt-2">
              {resendCooldown > 0 ? (
                <span className="text-xs text-slate-400">
                  Resend code in <strong className="text-slate-600 dark:text-slate-300">{resendCooldown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1.5 mx-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Verification Code
                </button>
              )}
            </div>
          </form>
        )}

        {/* B2B Contractor Notice */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400">
          <Building2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
          <span>
            <strong>B2B System Integrators & Installers:</strong> Use your registered phone number to automatically load your company GSTIN and access your tax invoice archive.
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <Suspense
          fallback={
            <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto mb-4" />
              <p className="text-xs font-semibold text-slate-500">Loading authentication...</p>
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
