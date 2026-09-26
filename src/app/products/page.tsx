import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductCompareDrawer } from '@/components/storefront/ProductCompareDrawer';
import { WhatsAppSupportWidget } from '@/components/storefront/WhatsAppSupportWidget';
import {
  getFilteredProducts,
  getAllCategoriesFlat,
  getPopularBrands,
} from '@/server/services/catalog.service';
import {
  Filter,
  X,
  SlidersHorizontal,
  Check,
  ChevronDown,
  ArrowUpDown,
  Search,
} from 'lucide-react';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  const categorySlug = params.category;
  const brandSlug = params.brand;
  const searchQuery = params.search;
  const inStockOnly = params.inStock === 'true';
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sortBy = (params.sort as any) || 'featured';

  const [products, categories, brands] = await Promise.all([
    getFilteredProducts({
      categorySlug,
      brandSlug,
      search: searchQuery,
      minPrice,
      maxPrice,
      inStockOnly,
      sortBy,
    }),
    getAllCategoriesFlat(),
    getPopularBrands(),
  ]);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);
  const selectedBrand = brands.find((b) => b.slug === brandSlug);

  const hasActiveFilters = !!(
    categorySlug ||
    brandSlug ||
    searchQuery ||
    inStockOnly ||
    minPrice !== undefined ||
    maxPrice !== undefined
  );

  // Helper to build query URL
  const buildUrl = (overrides: Record<string, string | undefined | null>) => {
    const q = new URLSearchParams();
    if (categorySlug) q.set('category', categorySlug);
    if (brandSlug) q.set('brand', brandSlug);
    if (searchQuery) q.set('search', searchQuery);
    if (inStockOnly) q.set('inStock', 'true');
    if (minPrice !== undefined) q.set('minPrice', minPrice.toString());
    if (maxPrice !== undefined) q.set('maxPrice', maxPrice.toString());
    if (sortBy && sortBy !== 'featured') q.set('sort', sortBy);

    Object.entries(overrides).forEach(([key, val]) => {
      if (val === undefined || val === null) {
        q.delete(key);
      } else {
        q.set(key, val);
      }
    });

    const str = q.toString();
    return str ? `/products?${str}` : '/products';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors font-medium">
            Catalog
          </Link>
          {selectedCategory && (
            <>
              <span>/</span>
              <span className="text-slate-900 font-semibold">{selectedCategory.name}</span>
            </>
          )}
          {selectedBrand && (
            <>
              <span>/</span>
              <span className="text-slate-900 font-semibold">{selectedBrand.name}</span>
            </>
          )}
        </nav>

        {/* Catalog Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b border-slate-200 gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory
                ? selectedCategory.name
                : selectedBrand
                ? `${selectedBrand.name} Hardware`
                : 'All Surveillance & Networking Hardware'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Showing <span className="font-bold text-slate-800">{products.length}</span> verified commercial products
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-medium">Sort by:</span>
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                defaultValue={sortBy}
                onChange={(e) => {
                  window.location.href = buildUrl({ sort: e.target.value });
                }}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-2"
              >
                <option value="featured">Relevance (Featured)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white border border-slate-200 rounded-xl">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
              Active Filters:
            </span>

            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Category: {selectedCategory.name}
                <Link href={buildUrl({ category: null })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Brand: {selectedBrand.name}
                <Link href={buildUrl({ brand: null })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                Search: &quot;{searchQuery}&quot;
                <Link href={buildUrl({ search: null })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}

            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                In-Stock Only
                <Link href={buildUrl({ inStock: null })} className="hover:text-emerald-900">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}

            {(minPrice !== undefined || maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300">
                Price: ₹{minPrice || 0} – ₹{maxPrice || 'Any'}
                <Link href={buildUrl({ minPrice: null, maxPrice: null })} className="hover:text-slate-900">
                  <X className="w-3 h-3" />
                </Link>
              </span>
            )}

            <Link
              href="/products"
              className="text-xs font-bold text-red-600 hover:text-red-700 ml-auto hover:underline"
            >
              Clear All Filters
            </Link>
          </div>
        )}

        {/* Main Grid + Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* FILTER SIDEBAR (Desktop) */}
          <aside className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Catalog
              </span>
              {hasActiveFilters && (
                <Link href="/products" className="text-[11px] font-semibold text-blue-600 hover:underline">
                  Reset
                </Link>
              )}
            </div>

            {/* In-Stock Toggle */}
            <div>
              <Link
                href={buildUrl({ inStock: inStockOnly ? null : 'true' })}
                className="flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    inStockOnly
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>In-Stock Ready to Dispatch</span>
              </Link>
            </div>

            {/* Categories Filter */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Categories
              </h4>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <Link
                  href={buildUrl({ category: null })}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    !categorySlug
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={buildUrl({ category: cat.slug })}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      categorySlug === cat.slug
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-1">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">({cat._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Brands
              </h4>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <Link
                  href={buildUrl({ brand: null })}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    !brandSlug
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Brands</span>
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b.id}
                    href={buildUrl({ brand: b.slug })}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      brandSlug === b.slug
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b.name}</span>
                    <span className="text-[10px] text-slate-400">({b._count.products})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Price Ranges */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                Price Range
              </h4>
              <div className="space-y-1 text-xs">
                <Link
                  href={buildUrl({ minPrice: null, maxPrice: '3000' })}
                  className={`block px-2 py-1.5 rounded-lg transition-colors ${
                    maxPrice === 3000 && !minPrice ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Under ₹3,000
                </Link>
                <Link
                  href={buildUrl({ minPrice: '3000', maxPrice: '6000' })}
                  className={`block px-2 py-1.5 rounded-lg transition-colors ${
                    minPrice === 3000 && maxPrice === 6000 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ₹3,000 to ₹6,000
                </Link>
                <Link
                  href={buildUrl({ minPrice: '6000', maxPrice: '10000' })}
                  className={`block px-2 py-1.5 rounded-lg transition-colors ${
                    minPrice === 6000 && maxPrice === 10000 ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ₹6,000 to ₹10,000
                </Link>
                <Link
                  href={buildUrl({ minPrice: '10000', maxPrice: null })}
                  className={`block px-2 py-1.5 rounded-lg transition-colors ${
                    minPrice === 10000 && !maxPrice ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Above ₹10,000
                </Link>
              </div>
            </div>

            {/* Quick Technical Keywords */}
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Resolution & Tech
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {['2MP', '4MP', '8MP', 'Bullet', 'Dome', 'DVR', 'PoE', 'Cat6'].map((term) => (
                  <Link
                    key={term}
                    href={buildUrl({ search: term })}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium border border-slate-200/80 transition-colors"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  No matching surveillance products
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your filters or search keywords like &quot;4MP&quot;, &quot;Hikvision&quot;, or &quot;SkyHawk&quot;.
                </p>
                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                >
                  View All Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Hardware Comparison Drawer */}
        <ProductCompareDrawer />
      </main>

      <Footer />
      <WhatsAppSupportWidget />
    </div>
  );
}
