import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Truck,
  FileCheck2,
  Headphones,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 mt-auto">
      {/* 4 Trust Value Propositions */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Genuine Brands</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Direct authorized supply for CP Plus, Hikvision, Dahua with serial-tracked manufacturer warranty.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Express Pan-India Logistics</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time AWB dispatch via Shiprocket & Delhivery with SMS & WhatsApp tracking updates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">GST Invoices & Input Credit</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter your company GSTIN at checkout to claim full 18% Input Tax Credit on all surveillance hardware.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Surveillance Technical Support</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Expert advice on DVR/NVR channel capacity, lens FOV calculations, and PoE network topologies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Patel Networks
              <span className="text-xs font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                MEGA-TECH
              </span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India&apos;s specialized procurement platform for commercial security, CCTV cameras, fiber optic
              converters, surveillance hard drives, and enterprise networking hardware.
            </p>
            <div className="pt-2 space-y-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Security Hub, Commercial Arcade, Gujarat, India</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+91 98765 43210 (Sales & Wholesale Inquiries)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>sales@patelnetworks.com</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Categories
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/products?category=hd-analog-cameras" className="hover:text-white transition-colors">
                  HD Analog Cameras
                </Link>
              </li>
              <li>
                <Link href="/products?category=network-ip-cameras" className="hover:text-white transition-colors">
                  Network (IP) Cameras
                </Link>
              </li>
              <li>
                <Link href="/products?category=recorders-dvr-nvr" className="hover:text-white transition-colors">
                  DVR & NVR Recorders
                </Link>
              </li>
              <li>
                <Link href="/products?category=cables-wiring" className="hover:text-white transition-colors">
                  CCTV & Cat6 Cables
                </Link>
              </li>
              <li>
                <Link href="/products?category=surveillance-storage" className="hover:text-white transition-colors">
                  Surveillance Hard Drives
                </Link>
              </li>
              <li>
                <Link href="/products?category=power-accessories" className="hover:text-white transition-colors">
                  SMPS Power Supplies
                </Link>
              </li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Top Brands
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/products?brand=cp-plus" className="hover:text-white transition-colors">
                  CP Plus Cosmic Series
                </Link>
              </li>
              <li>
                <Link href="/products?brand=hikvision" className="hover:text-white transition-colors">
                  Hikvision AcuSense AI
                </Link>
              </li>
              <li>
                <Link href="/products?brand=dahua" className="hover:text-white transition-colors">
                  Dahua Full-Color
                </Link>
              </li>
              <li>
                <Link href="/products?brand=d-link" className="hover:text-white transition-colors">
                  D-Link Structured Cables
                </Link>
              </li>
              <li>
                <Link href="/products?brand=optilink" className="hover:text-white transition-colors">
                  Optilink Fiber Converters
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links & Policies */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer & Tools
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/kit-builder" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  CCTV Kit Builder (Custom Packages)
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Patel Networks
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Wholesale Desk
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  CCTV & GST FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-white transition-colors">
                  Shipping & Dispatch Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-white transition-colors">
                  Warranty & Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Patel Networks. All rights reserved. Registered Indian Enterprise.</p>
          <div className="flex items-center gap-4">
            <span>Payment Security: Razorpay SSL 256-bit</span>
            <span>•</span>
            <span>Shipping: Shiprocket & Delhivery Express</span>
            <span>•</span>
            <Link href="/admin" className="hover:text-slate-300 transition-colors text-[11px]">
              Operations Portal
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
}
