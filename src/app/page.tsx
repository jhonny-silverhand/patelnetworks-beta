import React from 'react';
import { Header } from '@/components/storefront/Header';
import { CommerceHero } from '@/components/storefront/CommerceHero';
import { CategoryDiscovery } from '@/components/storefront/CategoryDiscovery';
import { FeaturedProductsSection } from '@/components/storefront/FeaturedProductsSection';
import { PromotionalBanners } from '@/components/storefront/PromotionalBanners';
import { TopBrandsSection } from '@/components/storefront/TopBrandsSection';
import { TechnicalBuyingGuide } from '@/components/storefront/TechnicalBuyingGuide';
import { ProductCompareDrawer } from '@/components/storefront/ProductCompareDrawer';
import { Footer } from '@/components/storefront/Footer';
import { WhatsAppSupportWidget } from '@/components/storefront/WhatsAppSupportWidget';
import { getFeaturedProducts } from '@/server/services/catalog.service';

export const revalidate = 60; // ISR cache every 60 seconds

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      {/* 1. Light Commerce Header */}
      <Header />

      <main className="flex-1">
        {/* 2. Compact Commerce Hero with Hardware Visual & Value Proposition Bar */}
        <CommerceHero />

        {/* 3. Shop by Category (9-Card Retail Grid with Real Product Photography) */}
        <CategoryDiscovery />

        {/* 4. Featured Products with Interactive Category Tabs */}
        <FeaturedProductsSection products={featuredProducts} />

        {/* 5. Custom CCTV Kit Builder & Technical Support Banners */}
        <PromotionalBanners />

        {/* 6. Top Brands Grid */}
        <TopBrandsSection />

        {/* 7. Technical Buying Guide by Specifications */}
        <TechnicalBuyingGuide />

        {/* 8. Floating Comparison Drawer for Hardware Specs */}
        <ProductCompareDrawer />
      </main>

      {/* 9. Commerce Footer */}
      <Footer />

      {/* 10. Floating WhatsApp Support Launcher */}
      <WhatsAppSupportWidget />
    </div>
  );
}
