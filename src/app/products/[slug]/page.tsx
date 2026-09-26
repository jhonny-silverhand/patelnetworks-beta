import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { ProductGallery } from '@/components/storefront/ProductGallery';
import { DynamicVariantSelector } from '@/components/storefront/DynamicVariantSelector';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductCompareDrawer } from '@/components/storefront/ProductCompareDrawer';
import { WhatsAppSupportWidget } from '@/components/storefront/WhatsAppSupportWidget';
import { B2BContractorCallout } from '@/components/storefront/B2BContractorCallout';
import { getProductBySlug, getFilteredProducts } from '@/server/services/catalog.service';
import {
  ShieldCheck,
  Truck,
  FileText,
  Layers,
  ArrowRight,
  Cpu,
  CheckCircle2,
  Wrench,
  Download,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Patel Networks' };
  }

  return {
    title: `${product.name} | Patel Networks Surveillance`,
    description:
      product.shortDesc ||
      `Procure ${product.name} with verified 18% GST input tax credit and express Indian logistics.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category
  const allRelated = await getFilteredProducts({ categorySlug: product.category.slug });
  const relatedProducts = allRelated
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const mainImage =
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';

  const specs = (product.specifications as Record<string, string>) || {};

  const serializedProduct = {
    ...product,
    variants: product.variants.map((v) => ({
      ...v,
      sku: {
        ...v.sku,
        mrp: Number(v.sku.mrp),
        sellingPrice: Number(v.sku.sellingPrice),
      },
    })),
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: product.name,
        description: product.shortDesc || product.description,
        image: mainImage,
        brand: {
          '@type': 'Brand',
          name: product.brand.name,
        },
        offers: {
          '@type': 'AggregateOffer',
          priceCurrency: 'INR',
          lowPrice: Math.min(...product.variants.map((v) => Number(v.sku.sellingPrice))),
          highPrice: Math.max(...product.variants.map((v) => Number(v.sku.sellingPrice))),
          offerCount: product.variants.length,
          availability: 'https://schema.org/InStock',
        },
        category: product.category.name,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://patelnetworks.in',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Catalog',
            item: 'https://patelnetworks.in/products',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.category.name,
            item: `https://patelnetworks.in/products?category=${product.category.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
          },
        ],
      },
    ],
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs text-slate-500 mb-4 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-blue-600 transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </nav>

        {/* Product Layout: Gallery (Left) + Variant Selector (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-200">
          {/* Left: Photographic Image Gallery */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <ProductGallery productName={product.name} images={product.images} />

            {/* Factual Trust Indicators below Gallery */}
            <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 text-center text-xs">
              <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800">100% Genuine</span>
                <span className="text-[10px] text-slate-500">Authorized Supply</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-slate-800">18% GST Invoice</span>
                <span className="text-[10px] text-slate-500">Input Tax Credit</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-xl">
                <Truck className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-800">Same-Day Dispatch</span>
                <span className="text-[10px] text-slate-500">Insured Air Cargo</span>
              </div>
            </div>
          </div>

          {/* Right: Product Meta & Dynamic Variant Selector */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              {/* Brand & Model tags */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                  {product.brand.name}
                </span>
                {product.modelNumber && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Model: {product.modelNumber}
                  </span>
                )}
                {product.category.hsnCode && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    HSN: {product.category.hsnCode}
                  </span>
                )}
              </div>

              {/* Main Product Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {product.shortDesc && (
                <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                  {product.shortDesc}
                </p>
              )}
            </div>

            {/* Dynamic Variant Selector Component */}
            <DynamicVariantSelector product={serializedProduct} />

            {/* B2B Wholesale Trade Callout */}
            <B2BContractorCallout
              productName={product.name}
              skuCode={product.modelNumber || undefined}
            />
          </div>
        </div>

        {/* Technical Specifications & Description Tabs */}
        <div className="py-10 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Detailed Product Description & Applications */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" /> Technical Product Overview
              </h2>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line shadow-2xs">
                {product.description}

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Recommended Installation Deployments:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Commercial offices, retail storefronts, and warehouse perimeter monitoring.</li>
                    <li>Supports integration with standard coaxial or Cat6 PoE network infrastructure.</li>
                    <li>H.265 / Smart codec compression reduces DVR/NVR hard drive capacity requirements.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right: Structured Engineering Specifications Table */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" /> Engineering Specifications
              </h2>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="p-3 flex justify-between bg-slate-50/70">
                    <span className="font-medium text-slate-500">Brand</span>
                    <span className="font-bold text-slate-900">{product.brand.name}</span>
                  </div>
                  {product.modelNumber && (
                    <div className="p-3 flex justify-between">
                      <span className="font-medium text-slate-500">Model Number</span>
                      <span className="font-mono font-semibold text-slate-900">{product.modelNumber}</span>
                    </div>
                  )}
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="p-3 flex justify-between">
                      <span className="font-medium text-slate-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="font-semibold text-slate-900 text-right max-w-[60%]">
                        {val}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 flex justify-between bg-blue-50/50">
                    <span className="font-semibold text-blue-900">Statutory GST & HSN</span>
                    <span className="font-bold text-blue-900">
                      18% GST • HSN {product.category.hsnCode || '8525'}
                    </span>
                  </div>
                  <div className="p-3 flex justify-between bg-emerald-50/50">
                    <span className="font-semibold text-emerald-900">Manufacturer Warranty</span>
                    <span className="font-bold text-emerald-900">2-Year Official Service Warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Hardware Section */}
        {relatedProducts.length > 0 && (
          <div className="py-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Related Equipment & Accessories
              </h2>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                View More in {product.category.name} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Comparison Drawer */}
        <ProductCompareDrawer />
      </main>

      <Footer />
      <WhatsAppSupportWidget />
    </div>
  );
}
