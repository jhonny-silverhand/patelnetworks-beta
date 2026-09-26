'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  Building2,
  Phone,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { formatInr } from '@/lib/utils';
import { AdminCustomerSummary } from '@/server/services/admin.service';

interface Props {
  initialCustomers: AdminCustomerSummary[];
}

export function CustomerDirectoryTable({ initialCustomers }: Props) {
  const [customers, setCustomers] = useState<AdminCustomerSummary[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'B2B' | 'RETAIL'>('ALL');

  const filteredCustomers = customers.filter((c) => {
    if (selectedFilter === 'B2B' && (!c.gstin && !c.companyName)) return false;
    if (selectedFilter === 'RETAIL' && (c.gstin || c.companyName)) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.companyName && c.companyName.toLowerCase().includes(q)) ||
      (c.gstin && c.gstin.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
    );
  });

  const b2bCount = customers.filter((c) => c.gstin || c.companyName).length;
  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{customers.length}</div>
          <span className="text-[11px] text-slate-500">Retail consumers & registered contractors</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>B2B Commercial Accounts</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 mt-2">{b2bCount}</div>
          <span className="text-[11px] text-slate-500">With 15-char GSTIN for 18% Input Credit</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Customer Lifetime Value (LTV)</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{formatInr(totalSpend)}</div>
          <span className="text-[11px] text-slate-500">Aggregate procurement GMV</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, phone, company, or GSTIN..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 text-white placeholder:text-slate-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              selectedFilter === 'ALL'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Accounts ({customers.length})
          </button>
          <button
            onClick={() => setSelectedFilter('B2B')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              selectedFilter === 'B2B'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            B2B Contractors ({b2bCount})
          </button>
          <button
            onClick={() => setSelectedFilter('RETAIL')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              selectedFilter === 'RETAIL'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Retail Buyers ({customers.length - b2bCount})
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Customer / Contractor</th>
                <th className="py-3 px-4 font-semibold">B2B Company & GSTIN</th>
                <th className="py-3 px-4 font-semibold text-center">Orders</th>
                <th className="py-3 px-4 font-semibold text-right">Lifetime Spend</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Joined / Activity</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No matching customer accounts found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const cleanPhone = cust.phone.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                    cust.fullName
                  )},%20regarding%20your%20Patel%20Networks%20order`;

                  return (
                    <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{cust.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{cust.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {cust.companyName || cust.gstin ? (
                          <div>
                            <span className="font-semibold text-purple-300 block text-xs flex items-center gap-1.5">
                              <Building2 className="w-3 h-3 text-purple-400" />
                              {cust.companyName || 'Registered Enterprise'}
                            </span>
                            {cust.gstin && (
                              <span className="text-[10px] font-mono text-slate-400 bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-800/60 mt-0.5 inline-block">
                                GSTIN: {cust.gstin}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Retail Account</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-white">
                        {cust.totalOrders}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatInr(cust.totalSpent)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {cust.city ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-sky-400 shrink-0" />
                            {cust.city}, {cust.state} ({cust.pincode})
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>
                          Joined {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                        {cust.lastOrderDate && (
                          <div className="text-slate-500 text-[10px]">
                            Last: {new Date(cust.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 font-semibold text-[11px] transition-colors"
                          title="Open WhatsApp Chat"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
