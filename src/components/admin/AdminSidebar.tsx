'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Layers,
  Banknote,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  Users,
  BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Overview & KPIs',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/orders',
    label: 'Order Fulfillment',
    icon: Package,
  },
  {
    href: '/admin/products',
    label: 'Products Catalog',
    icon: Layers,
  },
  {
    href: '/admin/inventory',
    label: 'SKU Inventory & Stock',
    icon: Boxes,
  },
  {
    href: '/admin/customers',
    label: 'Customer & B2B Directory',
    icon: Users,
  },
  {
    href: '/admin/reports',
    label: 'Analytics & Tax Reports',
    icon: BarChart3,
  },
  {
    href: '/admin/settings/cod',
    label: 'Selective COD Policies',
    icon: Banknote,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            PN
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">
              PATEL NETWORKS
            </span>
            <span className="text-[10px] font-semibold text-sky-400 tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Operations Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 text-xs font-semibold">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 block">
          Core Operations
        </span>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 block">
            Storefront & Public Web
          </span>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span className="flex items-center gap-3">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Customer Storefront</span>
            </span>
            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-800/60">
              Live
            </span>
          </Link>
        </div>
      </nav>

      {/* Bottom Status / Database Badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud PostgreSQL</span>
            </span>
            <span className="text-emerald-400 font-bold">Connected</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate">
            Region: Tokyo (ap-northeast-1)
          </div>
        </div>
      </div>
    </aside>
  );
}
