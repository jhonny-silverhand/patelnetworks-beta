import React from 'react';
import { getAdminProducts } from '@/server/services/admin.service';
import { ProductCatalogTable } from '@/components/admin/ProductCatalogTable';
import {
  Banknote,
  ShieldAlert,
  ShieldCheck,
  Plane,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function AdminCodSettingsPage() {
  const products = await getAdminProducts();

  const formatted = products.map((p) => {
    const firstSkuPrice = p.variants[0]?.sku ? Number(p.variants[0].sku.sellingPrice) : 0;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      hsnCode: p.category.hsnCode || '8525',
      basePrice: firstSkuPrice,
      isActive: p.isActive,
      isCodAllowed: p.isCodAllowed,
      brand: { name: p.brand.name, slug: p.brand.slug },
      category: { name: p.category.name, slug: p.category.slug },
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku
          ? {
              id: v.sku.id,
              code: v.sku.code,
              inventory: v.sku.inventory
                ? {
                    currentStock: v.sku.inventory.currentStock,
                    reservedStock: v.sku.inventory.reservedStock,
                  }
                : null,
            }
          : null,
      })),
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Banknote className="w-6 h-6 text-amber-400" />
          <span>Selective Cash on Delivery Policies (ADR-004)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure risk-mitigation rules, order value ceilings, postal zone boundaries, and per-item COD eligibility toggles.
        </p>
      </div>

      {/* Policy Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rule 1: ₹15,000 Order Ceiling */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <ShieldAlert className="w-4 h-4" />
            <span>₹15,000 Order Ceiling</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Orders exceeding ₹15,000 are automatically restricted to Prepaid (Razorpay). High-value enterprise CCTV kits and bulk reels of Cat6 cables require advance payment to prevent Return-To-Origin (RTO) carrier losses.
          </p>
          <div className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-[11px] font-mono text-amber-400 font-bold">
            Hard Capped in checkout.actions.ts
          </div>
        </div>

        {/* Rule 2: Air Cargo Pincode Restrictions */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
            <Plane className="w-4 h-4" />
            <span>Postal Circle Air Routes</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Remote postal circles (PIN prefix 79X, North-East, Island territories) shipped via air cargo do not accept COD. The checkout automatically validates against our 6-digit Pincode Engine before showing payment options.
          </p>
          <div className="px-2.5 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-[11px] font-mono text-sky-400 font-bold">
            Enforced in src/lib/pincodes.ts
          </div>
        </div>

        {/* Rule 3: Per-Product Blanket Disqualification */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Cart Disqualification</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            If any single item in the buyer&apos;s cart is marked with <span className="font-mono text-white">isCodAllowed: false</span> below, the entire cart switches to Prepaid-only mode.
          </p>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-[11px] font-mono text-emerald-400 font-bold">
            Configurable Below
          </div>
        </div>
      </div>

      {/* Per-Product COD Switcher */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span>Per-Product Cash on Delivery Eligibility</span>
          <span className="text-xs font-normal text-slate-400">
            (Click the button in the Cash On Delivery column to toggle)
          </span>
        </h2>

        <ProductCatalogTable initialProducts={formatted} />
      </div>
    </div>
  );
}
