import React from 'react';
import { getAdminInventoryList } from '@/server/services/admin.service';
import { InventoryManagementConsole } from '@/components/admin/InventoryManagementConsole';
import { Boxes } from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function AdminInventoryPage() {
  const rawSkus = await getAdminInventoryList();

  const formatted = rawSkus.map((sku) => {
    const inv = sku.inventory;
    const currentStock = inv?.currentStock || 0;
    const reservedStock = inv?.reservedStock || 0;
    const availableStock = Math.max(0, currentStock - reservedStock);
    const threshold = inv?.lowStockThreshold || 5;

    return {
      id: sku.id,
      code: sku.code,
      productName: sku.variant?.product?.name || 'Surveillance Hardware',
      variantName: sku.variant?.name || 'Default Variant',
      brandName: sku.variant?.product?.brand?.name || 'Patel Networks',
      categoryName: sku.variant?.product?.category?.name || 'General',
      currentStock,
      reservedStock,
      availableStock,
      threshold,
      recentMovements: sku.movements.map((m) => ({
        id: m.id,
        quantity: m.quantity,
        reason: m.reason,
        notes: m.notes,
        createdAt: m.createdAt.toISOString(),
      })),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Boxes className="w-6 h-6 text-sky-400" />
          <span>SKU Inventory & Stock Levels</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor real-time physical warehouse stock, order reservations, low-stock threshold triggers, and record audit adjustments.
        </p>
      </div>

      <InventoryManagementConsole initialItems={formatted} />
    </div>
  );
}
