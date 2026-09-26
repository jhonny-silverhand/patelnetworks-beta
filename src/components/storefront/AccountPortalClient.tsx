'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import {
  logoutAction,
  updateProfileAction,
  saveAddressAction,
  deleteAddressAction,
} from '@/app/actions/auth.actions';
import {
  User,
  Package,
  MapPin,
  Building2,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  Truck,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Shield,
  Loader2,
  AlertCircle,
  Phone,
  Heart,
  ShoppingCart,
  ArrowRight,
} from 'lucide-react';

interface AccountPortalClientProps {
  initialTab?: 'ORDERS' | 'ADDRESSES' | 'B2B' | 'WISHLIST';
  user: {
    id: string;
    phone: string;
    role: string;
    customer: {
      id: string;
      fullName: string;
      companyName?: string | null;
      gstin?: string | null;
      isB2BVerified: boolean;
      addresses: Array<{
        id: string;
        recipientName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string | null;
        landmark?: string | null;
        city: string;
        state: string;
        pincode: string;
        isDefault: boolean;
        type: string;
      }>;
    };
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
    isB2B: boolean;
    companyName?: string | null;
    gstin?: string | null;
    createdAt: string;
    shippingAddress: {
      recipientName: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      skuCode: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
}

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

export function AccountPortalClient({ user, orders, initialTab }: AccountPortalClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ADDRESSES' | 'B2B' | 'WISHLIST'>(
    initialTab || 'ORDERS'
  );
  const [wishlistCount, setWishlistCount] = useState(0);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('pn_wishlist');
      if (stored) {
        const list = JSON.parse(stored);
        setWishlistCount(Array.isArray(list) ? list.length : 0);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.customer.fullName);
  const [profileCompany, setProfileCompany] = useState(user.customer.companyName || '');
  const [profileGstin, setProfileGstin] = useState(user.customer.gstin || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Gujarat');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push('/');
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      await updateProfileAction({
        fullName: profileName,
        companyName: profileCompany,
        gstin: profileGstin,
      });
      setIsEditingProfile(false);
      triggerToast('Profile information updated successfully.');
      router.refresh();
    } catch {
      triggerToast('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddrRecipient(user.customer.fullName);
    setAddrPhone(user.phone.replace('+91', ''));
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('Gujarat');
    setAddrPincode('');
    setAddrIsDefault(user.customer.addresses.length === 0);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrLine1.trim() || !addrCity.trim() || !/^\d{6}$/.test(addrPincode)) {
      alert('Please fill out all required address fields with a valid 6-digit PIN code.');
      return;
    }

    try {
      setSavingAddress(true);
      await saveAddressAction({
        id: editingAddressId || undefined,
        recipientName: addrRecipient.trim(),
        phone: addrPhone.startsWith('+91') ? addrPhone : `+91${addrPhone}`,
        addressLine1: addrLine1.trim(),
        addressLine2: addrLine2.trim() || undefined,
        city: addrCity.trim(),
        state: addrState,
        pincode: addrPincode.trim(),
        isDefault: addrIsDefault,
      });
      setIsAddressModalOpen(false);
      triggerToast('Address saved successfully.');
      router.refresh();
    } catch {
      triggerToast('Error saving address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      await deleteAddressAction(id);
      triggerToast('Address removed.');
      router.refresh();
    } catch {
      triggerToast('Failed to delete address.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-3 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-xl font-extrabold shadow-lg shadow-sky-500/20">
              {user.customer.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {user.customer.fullName}
                </h1>
                {user.customer.gstin && (
                  <Badge variant="tech" className="text-[10px]">
                    B2B Verified
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {user.phone} • Customer Account
              </p>
              {user.customer.companyName && (
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {user.customer.companyName}
                  {user.customer.gstin && ` (GSTIN: ${user.customer.gstin})`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-rose-200 dark:border-rose-800"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Inline Profile Edit Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                B2B Company Name (Optional)
              </label>
              <input
                type="text"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                placeholder="Patel CCTV Integrators"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                15-Character GSTIN (Optional)
              </label>
              <input
                type="text"
                maxLength={15}
                value={profileGstin}
                onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                placeholder="24AABCP1234F1Z9"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono uppercase text-slate-900 dark:text-white"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Save Profile Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('ORDERS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'ORDERS'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders & Shipments ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ADDRESSES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'ADDRESSES'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Delivery Addresses ({user.customer.addresses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('B2B')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'B2B'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>B2B Tax Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('WISHLIST')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeTab === 'WISHLIST'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart className="w-4 h-4 text-red-500" />
          <span>Saved Wishlist ({wishlistCount})</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center max-w-md mx-auto shadow-xs">
              <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your past surveillance hardware orders and GST Tax Invoices will appear here.
              </p>
              <Link
                href="/products"
                className="inline-block mt-5 py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-xs"
              >
                Browse Surveillance Catalog
              </Link>
            </div>
          ) : (
            orders.map((ord) => {
              const isPaid = ord.status === 'PAID';
              return (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          #{ord.orderNumber}
                        </span>
                        <Badge
                          variant={
                            isPaid
                              ? 'success'
                              : ord.status === 'CANCELLED'
                              ? 'danger'
                              : 'warning'
                          }
                          className="text-[10px]"
                        >
                          {ord.status}
                        </Badge>
                        {ord.isB2B && (
                          <Badge variant="tech" className="text-[10px]">
                            B2B Tax Invoice
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • Payment: {ord.paymentMethod === 'RAZORPAY' ? 'Online Gateway' : 'Cash on Delivery'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white mr-1">
                        {formatPrice(ord.totalAmount)}
                      </span>
                      <Link
                        href={`/order-success/${ord.orderNumber}`}
                        className="py-2 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </Link>
                      <Link
                        href={`/order-success/${ord.orderNumber}`}
                        className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                        <span>Invoice</span>
                      </Link>
                    </div>
                  </div>

                  {/* Line Items List */}
                  <div className="space-y-2 text-xs">
                    {ord.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-1.5 text-slate-700 dark:text-slate-300"
                      >
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-[11px] text-slate-400 ml-2">
                            ({item.variantName} • {item.skuCode})
                          </span>
                        </div>
                        <span className="font-mono">{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Destination Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-sky-500" />
                      Dispatching to: {ord.shippingAddress.recipientName}, {ord.shippingAddress.city}, {ord.shippingAddress.state} ({ord.shippingAddress.pincode})
                    </span>
                    <span className="text-emerald-600 font-semibold">Free Express Shipping</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: ADDRESSES */}
      {activeTab === 'ADDRESSES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Saved Dispatch Addresses
            </h3>
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {addr.recipientName}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="success" className="text-[10px]">
                        Default Dispatch
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                    {addr.landmark && `, Landmark: ${addr.landmark}`}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                    <br />
                    Phone: {addr.phone}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: B2B TAX PROFILE */}
      {activeTab === 'B2B' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
          <div>
            <Badge variant="tech" className="mb-2 text-[10px]">
              GSTR-2B Input Tax Credit
            </Badge>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              B2B Business & GSTIN Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Save your company GSTIN once to automatically populate legal B2B Tax Invoices for input tax credit on all future checkouts.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Registered Legal Business / Company Name
              </label>
              <input
                type="text"
                value={profileCompany}
                onChange={(e) => setProfileCompany(e.target.value)}
                placeholder="e.g. Patel Security Systems Pvt Ltd"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                15-Character Indian GSTIN
              </label>
              <input
                type="text"
                maxLength={15}
                value={profileGstin}
                onChange={(e) => setProfileGstin(e.target.value.toUpperCase())}
                placeholder="24AABCP1234F1Z9"
                className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono uppercase text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
              <span className="font-bold block mb-1">18% GST Input Credit Advantage:</span>
              <p className="text-[11px] leading-relaxed">
                When purchasing commercial surveillance cameras, NVRs, and Cat6 cabling, your purchases generate a formal Tax Invoice filed under GSTR-1, enabling full credit offset on your business GST returns.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Save B2B GSTIN Details
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: WISHLIST */}
      {activeTab === 'WISHLIST' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500 fill-current" /> My Saved Wishlist Items
            </h3>
            <Link
              href="/products"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 text-center max-w-lg mx-auto shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {wishlistCount > 0 ? `${wishlistCount} Saved Products in Wishlist` : 'Your Wishlist is Empty'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Save CCTV cameras, DVRs, and cabling hardware to your wishlist while browsing to monitor stock levels and price changes.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <ShoppingCart className="w-4 h-4" /> Explore CCTV Catalog
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Delivery Address
            </h3>

            <form onSubmit={handleSaveAddress} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address / Building *
                </label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Landmark / Area (Optional)
                </label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State *
                  </label>
                  <select
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defaultCheck"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="defaultCheck" className="text-xs text-slate-600 dark:text-slate-400">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="py-2.5 px-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  {savingAddress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
