'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/storefront/Header';
import { Footer } from '@/components/storefront/Footer';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { addToCartAction } from '@/app/actions/cart.actions';
import {
  Wrench,
  Shield,
  Check,
  Video,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface KitOptions {
  dvr: { id: string; name: string; channels: number; price: number; sku: string };
  bulletCount: number;
  bulletRes: string;
  bulletPrice: number;
  domeCount: number;
  domeRes: string;
  domePrice: number;
  hdd: { id: string; name: string; size: string; price: number; days: string };
  cable: { id: string; name: string; length: string; price: number };
  powerSupply: { id: string; name: string; price: number };
}

export default function KitBuilderPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Recorder Options
  const dvrOptions = [
    {
      id: 'dvr-4ch',
      name: 'Hikvision 4-Channel AcuSense 1080p AI DVR',
      channels: 4,
      price: 3200,
      sku: 'HIK-DVR-04CH',
      desc: 'Supports up to 4 cameras with AcuSense human/vehicle detection.',
    },
    {
      id: 'dvr-8ch',
      name: 'Hikvision 8-Channel AcuSense 1080p AI DVR',
      channels: 8,
      price: 5400,
      sku: 'HIK-DVR-08CH',
      desc: 'Supports up to 8 cameras for medium residential or commercial sites.',
    },
  ];

  // Hard Drive Options
  const hddOptions = [
    { id: 'hdd-none', name: 'Without Hard Drive (Supply my own)', size: '0TB', price: 0, days: 'No storage' },
    { id: 'hdd-1tb', name: 'Seagate SkyHawk 1TB Surveillance HDD', size: '1TB', price: 3600, days: '~15-20 days retention' },
    { id: 'hdd-2tb', name: 'Seagate SkyHawk 2TB Surveillance HDD', size: '2TB', price: 5100, days: '~30-40 days retention' },
    { id: 'hdd-4tb', name: 'Seagate SkyHawk 4TB Surveillance HDD', size: '4TB', price: 8200, days: '~60-80 days retention' },
  ];

  // Cable Options
  const cableOptions = [
    { id: 'cab-90', name: 'CP Plus 3+1 Pure Copper HD Cable (90 Meters)', length: '90m', price: 1450 },
    { id: 'cab-180', name: 'CP Plus 3+1 Pure Copper HD Cable (180 Meters)', length: '180m', price: 2850 },
    { id: 'cab-305', name: 'D-Link Cat6 UTP 305m Solid Drum (Heavy Duty)', length: '305m', price: 7800 },
  ];

  // State
  const [selectedDvr, setSelectedDvr] = useState(dvrOptions[0]);
  const [bulletCount, setBulletCount] = useState<number>(2);
  const [bulletRes, setBulletRes] = useState<'2MP' | '4MP' | '8MP'>('2MP');
  const [domeCount, setDomeCount] = useState<number>(2);
  const [domeRes, setDomeRes] = useState<'2MP' | '4MP' | '8MP'>('2MP');
  const [selectedHdd, setSelectedHdd] = useState(hddOptions[1]);
  const [selectedCable, setSelectedCable] = useState(cableOptions[0]);

  const cameraPrices = {
    '2MP': 1450,
    '4MP': 2350,
    '8MP': 4890,
  };

  const totalCameras = bulletCount + domeCount;
  const maxChannels = selectedDvr.channels;

  // Auto-matching SMPS Power Supply
  const powerSupply =
    maxChannels === 4
      ? { name: 'CP Plus 4-Channel 12V 5A CCTV SMPS', price: 650 }
      : { name: 'CP Plus 8-Channel 12V 10A CCTV SMPS', price: 1150 };

  // Price calculations
  const dvrTotal = selectedDvr.price;
  const bulletTotal = bulletCount * cameraPrices[bulletRes];
  const domeTotal = domeCount * cameraPrices[domeRes];
  const hddTotal = selectedHdd.price;
  const cableTotal = selectedCable.price;
  const powerTotal = powerSupply.price;
  const accessoriesTotal = 450; // BNC + DC pack

  const rawSubtotal = dvrTotal + bulletTotal + domeTotal + hddTotal + cableTotal + powerTotal + accessoriesTotal;
  const comboDiscount = Math.round(rawSubtotal * 0.05); // 5% Package Discount (ADR-006)
  const finalKitPrice = rawSubtotal - comboDiscount;

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      // 1. Add DVR
      if (selectedDvr.sku) {
        await addToCartAction(selectedDvr.sku, 1);
      }

      // 2. Add Bullet Cameras
      if (bulletCount > 0) {
        await addToCartAction(`CPP-001-${bulletRes}`, bulletCount);
      }

      // 3. Add Dome Cameras
      if (domeCount > 0) {
        await addToCartAction(`CPP-001-${domeRes}`, domeCount);
      }

      // 4. Add HDD if selected
      if (selectedHdd.size === '1TB') {
        await addToCartAction('ST-SKY-1TB', 1);
      } else if (selectedHdd.size === '2TB') {
        await addToCartAction('ST-SKY-2TB', 1);
      } else if (selectedHdd.size === '4TB') {
        await addToCartAction('ST-SKY-4TB', 1);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
      }
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 4000);
    } catch (err) {
      console.error('Failed to add kit items:', err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title & Introduction */}
        <div className="max-w-3xl mb-8">
          <Badge variant="tech" className="mb-2 uppercase text-[10px]">
            Custom CCTV Kit Configurator • ADR-006
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Build Your Custom CCTV Surveillance Package
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Select compatible surveillance hardware step-by-step. Get guaranteed hardware compatibility, verified 18% GST invoicing, and an automatic <strong>5% Package Bundle Discount</strong> applied at checkout.
          </p>
        </div>

        {/* Step Indicator Bar */}
        <div className="flex items-center justify-between mb-8 max-w-4xl bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs shadow-xs">
          {[
            { num: 1, label: 'Recorder' },
            { num: 2, label: 'Cameras' },
            { num: 3, label: 'Storage' },
            { num: 4, label: 'Accessories' },
            { num: 5, label: 'Summary' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                currentStep === s.num
                  ? 'bg-sky-600 text-white shadow-xs'
                  : currentStep > s.num
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === s.num
                    ? 'bg-white text-sky-600'
                    : currentStep > s.num
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {currentStep > s.num ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Wizard Layout: Steps Content (Left) + Live Kit Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ============================================================ */}
          {/* STEP CONTROLS (Left 2 cols) */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-8">
            {/* STEP 1: RECORDER */}
            {currentStep === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Step 1 of 5
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Select Your Video Recorder (DVR)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose based on the maximum number of surveillance cameras you plan to connect.
                  </p>
                </div>

                <div className="space-y-3">
                  {dvrOptions.map((opt) => {
                    const isSelected = selectedDvr.id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setSelectedDvr(opt);
                          if (bulletCount + domeCount > opt.channels) {
                            setBulletCount(Math.floor(opt.channels / 2));
                            setDomeCount(Math.ceil(opt.channels / 2));
                          }
                        }}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {opt.name}
                            </span>
                            <Badge variant="tech">{opt.channels} Channels</Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                          <span className="text-xs font-mono text-slate-400">SKU: {opt.sku}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {formatPrice(opt.price)}
                          </span>
                          <span className="block text-[10px] text-slate-400">(Incl. GST)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2"
                  >
                    Next: Choose Cameras <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: CAMERAS */}
            {currentStep === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Step 2 of 5
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Select Your Surveillance Cameras
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Your {selectedDvr.channels}-Channel DVR can support up to {selectedDvr.channels} cameras. (Currently configured:{' '}
                    <strong className={totalCameras > maxChannels ? 'text-rose-500' : 'text-sky-600'}>
                      {totalCameras} of {maxChannels}
                    </strong>
                    )
                  </p>
                </div>

                {totalCameras > maxChannels && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Total cameras exceed {maxChannels} channels. Please reduce count or upgrade your DVR.
                  </div>
                )}

                {/* Outdoor Bullet Cameras */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-sky-500" /> Outdoor Weatherproof Bullet Cameras
                      </h4>
                      <p className="text-xs text-slate-400">IP67 rated for gates, perimeter, and outdoor mounting.</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 p-1 w-fit">
                      <button
                        type="button"
                        onClick={() => setBulletCount(Math.max(0, bulletCount - 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {bulletCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBulletCount(bulletCount + 1)}
                        disabled={totalCameras >= maxChannels}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Resolution chips */}
                  {bulletCount > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-slate-500 font-medium">Resolution:</span>
                      {(['2MP', '4MP', '8MP'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setBulletRes(r)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            bulletRes === r
                              ? 'bg-sky-600 text-white border-sky-600'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {r} ({formatPrice(cameraPrices[r])}/ea)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Indoor Dome Cameras */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Video className="w-4 h-4 text-emerald-500" /> Indoor Ceiling Dome Cameras
                      </h4>
                      <p className="text-xs text-slate-400">Aesthetic dome housing for offices, living rooms, and shops.</p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 p-1 w-fit">
                      <button
                        type="button"
                        onClick={() => setDomeCount(Math.max(0, domeCount - 1))}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {domeCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDomeCount(domeCount + 1)}
                        disabled={totalCameras >= maxChannels}
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Resolution chips */}
                  {domeCount > 0 && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-slate-500 font-medium">Resolution:</span>
                      {(['2MP', '4MP', '8MP'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setDomeRes(r)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            domeRes === r
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {r} ({formatPrice(cameraPrices[r])}/ea)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={totalCameras === 0 || totalCameras > maxChannels}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    Next: Select Storage <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: STORAGE */}
            {currentStep === 3 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Step 3 of 5
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Select Surveillance Hard Drive (24/7 Recording)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Desktop hard drives fail under 24/7 CCTV writes. We only supply genuine Seagate SkyHawk drives.
                  </p>
                </div>

                <div className="space-y-3">
                  {hddOptions.map((opt) => {
                    const isSelected = selectedHdd.id === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedHdd(opt)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-amber-500" />
                            {opt.name}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {opt.days}
                          </span>
                        </div>
                        <span className="text-base font-bold text-slate-900 dark:text-white">
                          {opt.price === 0 ? 'Free' : `+${formatPrice(opt.price)}`}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2"
                  >
                    Next: Cables & Power <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: ACCESSORIES */}
            {currentStep === 4 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Step 4 of 5
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Cabling, Power & Installation Connectors
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We automatically pair the matching SMPS power supply and include high-grade copper BNC/DC connectors.
                  </p>
                </div>

                {/* Cable Roll Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Choose Cable Length
                  </label>
                  <div className="space-y-2">
                    {cableOptions.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCable(c)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                          selectedCable.id === c.id
                            ? 'border-sky-600 bg-sky-50/40 dark:bg-sky-950/30'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">{c.name}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatPrice(c.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto included components */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Automatically Included in This Kit:
                  </span>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>• {powerSupply.name}</span>
                    <span className="font-semibold">{formatPrice(powerSupply.price)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>• Heavy Duty BNC Connectors & DC Pins Pack</span>
                    <span className="font-semibold">{formatPrice(accessoriesTotal)}</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(5)}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-2"
                  >
                    Review Final Kit <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: FINAL REVIEW */}
            {currentStep === 5 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Step 5 of 5 • Kit Ready
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    Your Complete Surveillance Package is Ready!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    All components are certified compatible with your {selectedDvr.name}.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">1x {selectedDvr.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(dvrTotal)}</span>
                  </div>
                  {bulletCount > 0 && (
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        {bulletCount}x CP Plus {bulletRes} Smart IR Bullet Camera
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatPrice(bulletTotal)}</span>
                    </div>
                  )}
                  {domeCount > 0 && (
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        {domeCount}x CP Plus {domeRes} Ceiling Dome Camera
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatPrice(domeTotal)}</span>
                    </div>
                  )}
                  {selectedHdd.price > 0 && (
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">1x {selectedHdd.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatPrice(hddTotal)}</span>
                    </div>
                  )}
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">1x {selectedCable.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(cableTotal)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">1x {powerSupply.name}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(powerTotal)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Connectors Pack (BNC/DC)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(accessoriesTotal)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 dark:text-emerald-200 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> 5% CCTV Combo Package Discount Applied!
                  </span>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                    -{formatPrice(comboDiscount)}
                  </span>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    Back to Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add Complete Kit to Cart ({formatPrice(finalKitPrice)})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* LIVE SUMMARY SIDEBAR (Right 1 col) */}
          {/* ============================================================ */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live Kit Summary
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Surveillance Kit Configuration
              </h4>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Recorder:</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right max-w-[60%]">
                  {selectedDvr.channels}-CH DVR
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Cameras:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {bulletCount} Bullet + {domeCount} Dome
                </span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Storage:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedHdd.size}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Cable:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedCable.length}</span>
              </div>
            </div>

            {/* Total Pricing Box */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Components Subtotal:</span>
                <span className="line-through">{formatPrice(rawSubtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Combo Savings (5%):</span>
                <span>-{formatPrice(comboDiscount)}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>Total Kit Price:</span>
                <span className="text-sky-600 dark:text-sky-400">{formatPrice(finalKitPrice)}</span>
              </div>
              <span className="block text-[10px] text-slate-400 text-right">
                (Inclusive of 18% GST • ITC Invoice)
              </span>
            </div>

            {/* Quick Action */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400 dark:text-sky-600" />
                  Adding Hardware Bundle...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add Kit to Cart
                </>
              )}
            </button>

            {addedToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Custom Kit added to your Cart!</span>
                </div>
                <Link href="/cart" className="underline font-bold text-sky-600 dark:text-sky-400">
                  View Cart
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
