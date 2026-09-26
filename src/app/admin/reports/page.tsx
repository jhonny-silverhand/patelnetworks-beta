import React from 'react';
import { getAdminCommercialReports } from '@/server/services/admin.service';
import { CommercialReportsConsole } from '@/components/admin/CommercialReportsConsole';
import { BarChart3 } from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function AdminReportsPage() {
  const reportData = await getAdminCommercialReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-sky-400" />
          <span>Commercial Analytics & Accounting Reports</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review executive revenue velocity, GSTR-1 statutory tax reconciliation, warehouse capital asset valuations, and carrier delivery splits.
        </p>
      </div>

      <CommercialReportsConsole data={reportData} />
    </div>
  );
}
