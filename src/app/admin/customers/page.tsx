import React from 'react';
import { getAdminCustomersList } from '@/server/services/admin.service';
import { CustomerDirectoryTable } from '@/components/admin/CustomerDirectoryTable';
import { Users } from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomersList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Users className="w-6 h-6 text-sky-400" />
          <span>Customer & B2B Contractor Directory</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review registered consumer accounts, verified B2B GSTIN contractors, lifetime procurement values, and initiate direct WhatsApp support.
        </p>
      </div>

      <CustomerDirectoryTable initialCustomers={customers} />
    </div>
  );
}
