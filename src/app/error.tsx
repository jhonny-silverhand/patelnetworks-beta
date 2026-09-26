'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions
    console.error('Unhandled platform error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/40">
            System Alert • Application Exception
          </span>
          <h1 className="text-xl font-black text-white">Temporary System Interruption</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            An unexpected error occurred while communicating with the surveillance servers. Your session and cart data remain safe.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-600 bg-slate-950 px-2 py-1 rounded inline-block">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-slate-700"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>

        <div className="pt-4 border-t border-slate-800/80">
          <a
            href="https://wa.me/919876543210?text=Hello%20Patel%20Networks,%20I%20encountered%20an%20error%20on%20the%20platform."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Emergency Support via WhatsApp →
          </a>
        </div>
      </div>
    </div>
  );
}
