'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield,
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  PhoneCall,
  ChevronDown,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { getCartAction } from '@/app/actions/cart.actions';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import { quickSearchAction } from '@/app/actions/catalog.actions';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderUser {
  id: string;
  phone: string;
  customer?: {
    id: string;
    fullName?: string | null;
  } | null;
}

interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  modelNumber: string | null;
  brandName: string;
  categoryName: string;
  imageUrl?: string | null;
  sellingPrice: number;
}

const CATEGORY_NAV_LINKS = [
  { label: 'CCTV Cameras', href: '/products?category=cctv-surveillance' },
  { label: 'DVR & NVR', href: '/products?category=cctv-surveillance' },
  { label: 'Surveillance HDD', href: '/products?category=surveillance-storage' },
  { label: 'Networking', href: '/products?category=power-accessories' },
  { label: 'Cables', href: '/products?category=cables-wiring' },
  { label: 'Connectors', href: '/products?category=power-accessories' },
  { label: 'Monitors', href: '/products?category=accessories' },
  { label: 'Optical Fiber', href: '/products?category=power-accessories' },
  { label: 'Accessories', href: '/products?category=power-accessories' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<HeaderUser | null>(null);

  // Live search autocomplete states
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  const fetchCartCount = async () => {
    try {
      const cart = await getCartAction();
      setCartCount(cart?.itemCount ?? 0);
    } catch {
      // Graceful fallback
    }
  };

  const fetchUser = async () => {
    try {
      const res = await getCurrentUserAction();
      if (res.success && res.user) {
        setCurrentUser(res.user as HeaderUser);
      }
    } catch {
      // Graceful fallback
    }
  };

  const updateWishlistCount = () => {
    try {
      const stored = localStorage.getItem('pn_wishlist');
      if (stored) {
        const list = JSON.parse(stored);
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      } else {
        setWishlistCount(0);
      }
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchUser();
    updateWishlistCount();

    const onCartUpdate = () => fetchCartCount();
    const onWishlistUpdate = () => updateWishlistCount();

    window.addEventListener('cart-updated', onCartUpdate);
    window.addEventListener('wishlist-updated', onWishlistUpdate);

    return () => {
      window.removeEventListener('cart-updated', onCartUpdate);
      window.removeEventListener('wishlist-updated', onWishlistUpdate);
    };
  }, []);

  // Debounced live search autocomplete
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await quickSearchAction(searchQuery.trim());
        if (res.success && res.data) {
          setSuggestions(res.data);
          setShowDropdown(res.data.length > 0);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      } catch {
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setCategoriesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-xs">
      {/* 1. TOP UTILITY BAR */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Need Help?</span>
            <a
              href="tel:+919876543210"
              className="text-white hover:text-blue-400 font-medium transition-colors"
            >
              +91 98765 43210
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="mailto:sales@patelnetworks.com"
              className="text-slate-300 hover:text-white transition-colors hidden sm:inline"
            >
              sales@patelnetworks.com
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/checkout" className="hover:text-white transition-colors">
              GST Invoice
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              Support
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/account" className="hover:text-white transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER ROW */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-4 sm:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  Patel Networks
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-extrabold text-blue-600 leading-none">
                  Security & Surveillance
                </span>
              </div>
            </Link>

            {/* Centered Wide Search Bar */}
            <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl relative">
              <form onSubmit={handleSearch} className="w-full flex items-center">
                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowDropdown(true);
                    }}
                    placeholder="Search CCTV cameras, DVR, NVR, cables, brands..."
                    className="w-full pl-4 pr-12 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
                  />
                  <button
                    type="submit"
                    aria-label="Submit Search"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-xs"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-96 overflow-y-auto"
                  >
                    {suggestions.map((item) => (
                      <Link
                        key={item.id}
                        href={`/products/${item.slug}`}
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="relative w-11 h-11 bg-slate-50 rounded-lg border border-slate-200 shrink-0 p-1">
                          <Image
                            src={
                              item.imageUrl ||
                              'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={item.name}
                            fill
                            sizes="44px"
                            className="object-contain p-0.5"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                            {item.brandName}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-800">
                            {formatPrice(item.sellingPrice)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right User Actions (Account, Wishlist, Cart) */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* Account Link */}
              <Link
                href={currentUser ? '/account' : '/account/login'}
                className="hidden sm:flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors text-xs font-semibold"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 font-normal">Welcome</span>
                  <span className="text-xs font-bold truncate max-w-[100px]">
                    {currentUser?.customer?.fullName || 'Login / Register'}
                  </span>
                </div>
              </Link>

              {/* Wishlist Link */}
              <Link
                href="/account/wishlist"
                aria-label="Wishlist"
                className="relative flex items-center gap-1.5 text-slate-700 hover:text-blue-600 transition-colors text-xs font-semibold"
              >
                <div className="relative">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700 hover:text-red-500 transition-colors" />
                  {wishlistCount > 0 && (
                    <motion.span
                      key={wishlistCount}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-semibold">Wishlist</span>
              </Link>

              {/* Shopping Cart Link */}
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative flex items-center gap-2 p-1 text-slate-700 hover:text-blue-600 transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-slate-800" />
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                </div>
                <span className="hidden lg:inline text-xs font-bold text-slate-900">Cart</span>
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div ref={mobileSearchRef} className="pb-3 md:hidden">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, models..."
                className="w-full pl-3.5 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-8 bg-blue-600 text-white rounded flex items-center justify-center"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY SUB-NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs">
            {/* Left: "All Categories" Dropdown */}
            <div ref={categoryMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-blue-600 py-1.5 transition-colors"
              >
                <Menu className="w-4 h-4" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* All Categories Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 divide-y divide-slate-100">
                  <div className="py-1">
                    {CATEGORY_NAV_LINKS.map((link, idx) => (
                      <Link
                        key={idx}
                        href={link.href}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <span>{link.label}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                      </Link>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/kit-builder"
                      onClick={() => setCategoriesDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <span>Custom CCTV Kit Builder</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Center: Category Links */}
            <nav className="flex items-center gap-5 lg:gap-6 font-semibold text-slate-700">
              {CATEGORY_NAV_LINKS.map((link, idx) => (
                <Link
                  key={idx}
                  href={link.href}
                  className="hover:text-blue-600 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Brands & Deals */}
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/products#brands"
                className="font-bold text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <span>Brands</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <Link
                href="/products?search=deal"
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors shadow-2xs"
              >
                <Tag className="w-3 h-3" /> Deals
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <div className="font-bold text-xs text-slate-400 uppercase tracking-wider">
            Product Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_NAV_LINKS.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-50 text-xs font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/kit-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              CCTV Kit Builder
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
