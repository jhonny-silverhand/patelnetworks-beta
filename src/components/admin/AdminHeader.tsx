'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  LogOut,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { AdminSessionPayload } from '@/server/services/admin-auth.service';
import { adminLogoutAction } from '@/app/actions/admin-auth.actions';

interface Props {
  session?: AdminSessionPayload | null;
}

export function AdminHeader({ session }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await adminLogoutAction();
    });
  };

  const email = session?.email || 'superadmin@patelnetworks.in';
  const fullName = session?.fullName || 'Operations Lead';
  const role = session?.role || 'SUPER_ADMIN';

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Location & Node Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-300">Surat Central Fulfillment Hub</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse ml-1" />
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live Node</span>
        </div>
      </div>

      {/* Right: Quick Actions, Profile & Logout */}
      <div className="flex items-center gap-4">
        {/* Quick link to Storefront */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/50"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* GST State Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-800/50 text-[11px] text-sky-300 font-mono">
          <span>GSTIN: 24AAACP1234F1Z8</span>
        </div>

        {/* Admin User Avatar & Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-sky-500/20">
            {fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-white leading-none flex items-center gap-1.5">
              <span>{fullName}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {role}
              </span>
            </div>
            <div className="text-[10px] font-medium text-slate-400 leading-none mt-1">{email}</div>
          </div>
        </div>

        {/* Secure Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isPending}
          title="Sign Out of Command Center"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 hover:border-rose-800/60 border border-slate-700/50 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
