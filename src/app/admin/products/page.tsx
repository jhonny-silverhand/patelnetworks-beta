import React from 'react';
import { getAdminProducts } from '@/server/services/admin.service';
import { ProductCatalogTable } from '@/components/admin/ProductCatalogTable';
import { Layers } from 'lucide-react';

export const revalidate = 0; // Dynamic server component

export default async function AdminProductsPage() {
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
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder,
      })),
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Layers className="w-6 h-6 text-sky-400" />
          <span>Product Catalog & Policies</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage hardware HSN codes, catalog visibility, and Cash on Delivery eligibility toggles (ADR-004 Selective COD).
        </p>
      </div>

      <ProductCatalogTable initialProducts={formatted} />
    </div>
  );
}
