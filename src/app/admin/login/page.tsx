'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Server,
} from 'lucide-react';
import { adminLoginAction } from '@/app/actions/admin-auth.actions';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('superadmin@patelnetworks.in');
  const [password, setPassword] = useState('patel@admin2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.set('email', email);
    formData.set('password', password);
    formData.set('next', nextUrl);

    startTransition(async () => {
      try {
        const res = await adminLoginAction(formData);
        if (res.success && res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else {
          setErrorMsg(res.error || 'Authentication rejected. Please check your credentials.');
        }
      } catch (err) {
        setErrorMsg('An unexpected error occurred during authentication. Please retry.');
      }
    });
  };

  const handleFillDemo = () => {
    setEmail('superadmin@patelnetworks.in');
    setPassword('patel@admin2026');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* High-tech surveillance grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-sky-400/30 mb-4">
            <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-sky-400 mb-2">
            <Server className="w-3 h-3" />
            <span>Patel Networks Internal Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Command Center Login
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            Restricted access for authorized surveillance logistics, warehouse inventory, and tax compliance personnel.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@patelnetworks.in"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm text-white placeholder-slate-600 transition-colors outline-hidden"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Secret Access Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl text-sm text-white placeholder-slate-600 transition-colors outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate & Enter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                <span>Default Superadmin Demo:</span>
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2 cursor-pointer transition-colors"
              >
                Autofill Credentials
              </button>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60 font-mono text-[10px] text-slate-400 space-y-0.5">
              <div><span className="text-slate-500">Email:</span> superadmin@patelnetworks.in</div>
              <div><span className="text-slate-500">Pass:</span> patel@admin2026</div>
            </div>
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="mt-8 text-center space-y-2">
          <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit HSM Encrypted Session (Edge JWT)</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Unauthorized intrusion attempts are logged and monitored with IP verification.
          </p>
        </div>
      </div>
    </div>
  );
}
