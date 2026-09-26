'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { getCartAction } from '@/app/actions/cart.actions';
import { getCurrentUserAction } from '@/app/actions/auth.actions';
import {
  processCheckoutAction,
  confirmPaymentAction,
} from '@/app/actions/checkout.actions';
import { checkPincodeAction } from '@/app/actions/shipping.actions';
import { PincodeServiceability } from '@/lib/pincodes';
import {
  ShieldCheck,
  Truck,
  FileText,
  AlertCircle,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  ExternalLink,
  XCircle,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
];

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any>(null);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');
  const [pincodeInfo, setPincodeInfo] = useState<PincodeServiceability | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'CASH_ON_DELIVERY'>('RAZORPAY');

  // B2B GSTIN States
  const [isB2B, setIsB2B] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  // Simulated Payment Modal State (ADR-007)
  const [simulatedModal, setSimulatedModal] = useState<{
    open: boolean;
    orderNumber: string;
    totalAmount: number;
    razorpayOrderId?: string;
  } | null>(null);
  const [simulatingProcessing, setSimulatingProcessing] = useState<boolean>(false);

  // Real-time Pincode Validation and COD eligibility check (ADR-012)
  useEffect(() => {
    async function validatePin() {
      if (/^[1-9][0-9]{5}$/.test(pincode)) {
        const res = await checkPincodeAction(pincode, cart?.total || 0);
        if (res.success && res.data) {
          setPincodeInfo(res.data);
          if (!res.data.isCodAvailable && paymentMethod === 'CASH_ON_DELIVERY') {
            setPaymentMethod('RAZORPAY');
          }
        } else {
          setPincodeInfo(null);
        }
      } else {
        setPincodeInfo(null);
      }
    }
    validatePin();
  }, [pincode, cart?.total]);

  useEffect(() => {
    async function load() {
      try {
        setLoadingCart(true);
        const data = await getCartAction();
        setCart(data);
        if (data && !data.isCodAllowed) {
          setPaymentMethod('RAZORPAY');
        }

        // Check if user is logged in and prefill profile
        const userRes = await getCurrentUserAction();
        if (userRes?.success && userRes.user) {
          const u = userRes.user;
          if (u.customer?.fullName && u.customer.fullName !== 'Valued Customer') {
            setRecipientName(u.customer.fullName);
          }
          if (u.phone) {
            setPhone(u.phone.replace('+91', ''));
          }
          const addrs = u.customer?.addresses || [];
          if (addrs.length > 0) {
            const defAddr = addrs.find((a: any) => a.isDefault) || addrs[0];
            if (defAddr) {
              setAddressLine1(defAddr.addressLine1);
              if (defAddr.addressLine2) setAddressLine2(defAddr.addressLine2);
              setCity(defAddr.city);
              setState(defAddr.state);
              setPincode(defAddr.pincode);
            }
          }
          if (u.customer?.companyName || u.customer?.gstin) {
            setIsB2B(true);
            if (u.customer.companyName) setCompanyName(u.customer.companyName);
            if (u.customer.gstin) setGstin(u.customer.gstin);
          }
        }
      } catch (err: any) {
        setErrorMessage('Failed to load cart for checkout.');
      } finally {
        setLoadingCart(false);
      }
    }
    load();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    // Client-side validations
    if (!recipientName.trim()) {
      setErrorMessage('Please enter recipient full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }
    if (!addressLine1.trim() || addressLine1.trim().length < 5) {
      setErrorMessage('Please provide a complete street address.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('Please enter city name.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    if (isB2B) {
      if (!companyName.trim()) {
        setErrorMessage('Please enter legal registered business name for B2B invoice.');
        return;
      }
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinRegex.test(gstin.trim().toUpperCase())) {
        setErrorMessage('Invalid 15-character GSTIN format (e.g. 24AAAAA0000A1Z5).');
        return;
      }
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const payload = {
        cartId: cart.id,
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || undefined,
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        paymentMethod,
        isB2B,
        companyName: isB2B ? companyName.trim() : undefined,
        gstin: isB2B ? gstin.trim().toUpperCase() : undefined,
      };

      const result = await processCheckoutAction(payload);

      if (!result.success) {
        setErrorMessage(result.error || 'Checkout failed. Please check form inputs.');
        setSubmitting(false);
        return;
      }

      // If Cash On Delivery, redirect directly to order confirmation
      if (paymentMethod === 'CASH_ON_DELIVERY') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push(`/order-success/${result.orderNumber}`);
        return;
      }

      // If Razorpay Online Payment
      if (result.razorpayOrder?.isSimulated) {
        // Open Simulated Payment Dialog (ADR-007)
        setSimulatedModal({
          open: true,
          orderNumber: result.orderNumber!,
          totalAmount: result.totalAmount!,
          razorpayOrderId: result.razorpayOrder.id,
        });
        setSubmitting(false);
      } else if (result.razorpayOrder) {
        // Live Razorpay Script Launch
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: result.razorpayOrder.amount,
          currency: 'INR',
          name: 'Patel Networks & MegaTech',
          description: `Order #${result.orderNumber}`,
          order_id: result.razorpayOrder.id,
          handler: async function (response: any) {
            await confirmPaymentAction({
              orderNumber: result.orderNumber!,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('cart-updated'));
            }
            router.push(`/order-success/${result.orderNumber}`);
          },
          prefill: {
            name: recipientName,
            email: email,
            contact: phone,
          },
          theme: {
            color: '#0284c7',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during checkout.');
      setSubmitting(false);
    }
  };

  // Handle Simulated Payment Completion (ADR-007)
  const handleSimulatedPaymentSuccess = async () => {
    if (!simulatedModal) return;
    try {
      setSimulatingProcessing(true);
      const res = await confirmPaymentAction({
        orderNumber: simulatedModal.orderNumber,
        razorpayPaymentId: `pay_sim_${Date.now()}`,
        razorpayOrderId: simulatedModal.razorpayOrderId,
        razorpaySignature: 'simulated_signature',
      });

      if (res.success) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('cart-updated'));
        }
        router.push(`/order-success/${simulatedModal.orderNumber}`);
      } else {
        setErrorMessage(res.error || 'Payment confirmation failed.');
        setSimulatingProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment simulation error.');
      setSimulatingProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <nav className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-slate-900 dark:hover:text-white">
              Cart
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-medium">Checkout</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <Lock className="w-6 h-6 text-emerald-500" />
                Secure Checkout & Dispatch
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                256-Bit SSL Encrypted • Verified GST Invoicing • Rapid Indian Courier Transit
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Direct Manufacturer Warranty Included</span>
            </div>
          </div>
        </div>

        {loadingCart ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-sky-500 mx-auto mb-4" />
            <p className="text-xs font-semibold text-slate-500">Preparing your order details...</p>
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cart is Empty</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your cart has no items to checkout. Please add products before placing an order.
            </p>
            <Link
              href="/products"
              className="inline-block mt-6 py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Columns: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-3 animate-in fade-in">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Checkout Attention Required:</span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* 1. Contact & Shipping Address Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Recipient & Shipping Address
                    </h3>
                    <p className="text-xs text-slate-500">Where should we deliver your surveillance hardware?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recipient Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Recipient Full Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Mobile Number (For Courier OTP & Tracking) *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-slate-500 select-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-slate-900 dark:text-white tracking-wider"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address (Optional, for GST Tax Invoice PDF)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@business.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Street Address / Flat / Floor / Building *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        placeholder="e.g. Shop #4, Patel Complex, Station Road"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                      />
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Landmark / Area (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Near Sardar Chowk"
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ahmedabad"
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* State Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      State / UT *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      PIN Code (6 Digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="380001"
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Delivery SLA & Carrier Banner if PIN is valid */}
                  {pincodeInfo && (
                    <div className="sm:col-span-2 p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Est. Delivery by <strong className="text-sky-700 dark:text-sky-300">{pincodeInfo.estimatedDeliveryDate}</strong> ({pincodeInfo.estimatedDaysMin}-{pincodeInfo.estimatedDaysMax} days via {pincodeInfo.carrierPartner})
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-white/70 dark:bg-slate-800 px-2.5 py-1 rounded-lg w-fit">
                        {pincodeInfo.city} ({pincodeInfo.isCodAvailable ? 'COD Available' : 'Prepaid Only'})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. B2B GST Billing Card (Option B) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        B2B GST Invoicing
                        <Badge variant="tech" className="text-[10px]">
                          Input Tax Credit (18%)
                        </Badge>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Claim 18% GST Input Credit on surveillance & networking purchases
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isB2B}
                      onChange={(e) => setIsB2B(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {isB2B ? (
                  <div className="space-y-4 pt-2 animate-in fade-in">
                    <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>
                        Enter your registered GST details below. A formal GST Tax Invoice with HSN breakdown will be generated and filed under GSTR-1 for your direct Input Tax Credit.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Registered Business / Company Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required={isB2B}
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Patel Security Systems Pvt Ltd"
                            className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-900 dark:text-white"
                          />
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          15-Character Indian GSTIN *
                        </label>
                        <input
                          type="text"
                          required={isB2B}
                          maxLength={15}
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="24AAAAA0000A1Z5"
                          className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono uppercase tracking-wider text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Buying for individual or home surveillance? Keep this disabled to generate a standard retail consumer tax invoice.
                  </p>
                )}
              </div>

              {/* 3. Payment Method Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Payment Method Selection
                    </h3>
                    <p className="text-xs text-slate-500">Choose your preferred payment mode</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Razorpay Online */}
                  <label
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'RAZORPAY'
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === 'RAZORPAY'}
                      onChange={() => setPaymentMethod('RAZORPAY')}
                      className="mt-1 text-sky-600 focus:ring-sky-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-sky-600" />
                          Razorpay Online Gateway (Recommended)
                        </span>
                        <Badge variant="success" className="text-[10px]">
                          Instant Dispatch
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        UPI (GPay, PhonePe, Paytm), NetBanking (50+ Banks), Credit / Debit Cards, EMI & Corporate Cards.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Cash on Delivery (COD) */}
                  {(() => {
                    const isCodAvailableForOrder = Boolean(
                      cart.isCodAllowed && (!pincodeInfo || pincodeInfo.isCodAvailable)
                    );

                    return (
                      <label
                        className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                          !isCodAvailableForOrder
                            ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                            : paymentMethod === 'CASH_ON_DELIVERY'
                            ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-2 ring-sky-500/20 cursor-pointer'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="CASH_ON_DELIVERY"
                          disabled={!isCodAvailableForOrder}
                          checked={paymentMethod === 'CASH_ON_DELIVERY'}
                          onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                          className="mt-1 text-sky-600 focus:ring-sky-500 disabled:opacity-40"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <Banknote className="w-4 h-4 text-emerald-600" />
                              Cash on Delivery (COD)
                            </span>
                            {!isCodAvailableForOrder && (
                              <Badge variant="danger" className="text-[10px]">
                                Unavailable
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {!cart.isCodAllowed
                              ? 'One or more items in your cart (e.g. bulky Cat6 drum or high-value NVR) require prepaid online payment.'
                              : pincodeInfo && !pincodeInfo.isCodAvailable
                              ? `Cash on Delivery is restricted for PIN ${pincode} (${pincodeInfo.city} - Special Logistics/Air Cargo Zone). Please pay via Razorpay Online.`
                              : 'Pay via cash or UPI directly to delivery agent upon parcel arrival.'}
                          </p>
                        </div>
                      </label>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Right 1 Column: Sticky Order Summary & Submit Button */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6 lg:sticky lg:top-24">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Review & Finalize
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Order Summary ({cart.itemCount} Items)
                </h4>
              </div>

              {/* Items Preview */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="pt-2.5 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-100 dark:border-slate-800">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        {item.quantity}x • {item.variantName}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white shrink-0">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxable Base Value:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Goods & Services Tax (18% GST):</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatPrice(cart.gstAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Shipping & Transit Insurance:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">FREE</span>
                </div>
                <div className="pt-3 flex justify-between text-lg font-extrabold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800">
                  <span>Total Amount:</span>
                  <span className="text-sky-600 dark:text-sky-400">{formatPrice(cart.totalAmount)}</span>
                </div>
                <span className="block text-[10px] text-slate-400 text-right">
                  (All Taxes & 18% GST Included)
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Securing Order & Inventory...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {paymentMethod === 'RAZORPAY'
                      ? `Pay ${formatPrice(cart.totalAmount)} Online`
                      : `Place Order via COD (${formatPrice(cart.totalAmount)})`}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Trust Features */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>3-Year Direct Manufacturer Replacement Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>Express Transit via Bluedart / Delhivery / DTDC</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Compliant B2B Tax Invoice with HSN & GSTIN</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Simulated Razorpay Payment Dialog (ADR-007) */}
      {simulatedModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-2 text-white">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Razorpay Test Gateway</h3>
              <p className="text-xs text-sky-100 mt-0.5">
                Simulated Payment Portal (ADR-007)
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order Reference:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {simulatedModal.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Payable:</span>
                  <span className="text-base font-extrabold text-sky-600 dark:text-sky-400">
                    {formatPrice(simulatedModal.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Razorpay Sandbox (Placeholder Mode)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                Live Razorpay procurement is in progress. You can simulate an instant successful payment or cancellation to verify order lifecycle transitions.
              </p>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={simulatingProcessing}
                  onClick={handleSimulatedPaymentSuccess}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {simulatingProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Capturing Payment & Generating Invoice...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Simulate Successful Payment (Instant Confirm)
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={simulatingProcessing}
                  onClick={() => setSimulatedModal(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel / Close Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
