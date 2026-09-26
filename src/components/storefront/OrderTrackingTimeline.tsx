'use client';

import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  PlayCircle,
  Loader2,
} from 'lucide-react';
import { simulateTrackingProgressAction } from '@/app/actions/shipping.actions';

export interface TrackingEvent {
  id: string;
  status: string;
  location?: string | null;
  timestamp: string | Date;
  activity: string;
}

export interface OrderTrackingTimelineProps {
  orderNumber: string;
  currentStatus: string;
  carrier?: string | null;
  awbNumber?: string | null;
  trackingUrl?: string | null;
  events?: TrackingEvent[];
  isTestMode?: boolean;
}

const STAGES = [
  { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified & order queued' },
  { key: 'PACKED', label: 'Packed & Manifested', desc: 'AWB generated, packed at Surat Hub' },
  { key: 'SHIPPED', label: 'In Transit', desc: 'Moving through logistics network' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'With local courier agent' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Delivered to consignee' },
];

export function OrderTrackingTimeline({
  orderNumber,
  currentStatus,
  carrier,
  awbNumber,
  trackingUrl,
  events = [],
  isTestMode = true,
}: OrderTrackingTimelineProps) {
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [localStatus, setLocalStatus] = useState(currentStatus);
  const [localEvents, setLocalEvents] = useState(events);

  // Determine active stage index (0 to 4)
  const getStageIndex = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING_PAYMENT':
      case 'COD_PENDING':
        return 0;
      case 'PAID':
      case 'CONFIRMED':
      case 'PROCESSING':
        return 0;
      case 'PACKED':
      case 'MANIFESTED':
        return 1;
      case 'SHIPPED':
      case 'IN_TRANSIT':
      case 'PICKED_UP':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStageIndex(localStatus);

  const copyAwb = () => {
    if (!awbNumber) return;
    navigator.clipboard.writeText(awbNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateStage = async (
    stage: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
  ) => {
    if (!awbNumber) return;
    try {
      setSimulating(true);
      const res = await simulateTrackingProgressAction(awbNumber, stage);
      if (res.success && res.data) {
        setLocalStatus(stage);
        if (res.data.event) {
          const newEv: TrackingEvent = {
            id: res.data.event.id,
            status: res.data.event.status,
            location: res.data.event.location,
            timestamp: new Date().toISOString(),
            activity:
              (res.data.event.payload as any)?.activity || res.data.event.status,
          };
          setLocalEvents((prev) => [newEv, ...prev]);
        }
        if (typeof window !== 'undefined') {
          // reload after short delay to sync server state
          setTimeout(() => window.location.reload(), 1500);
        }
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 block mb-1">
            Live Courier Tracking
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-500" />
            <span>{carrier || 'Delhivery Surface'}</span>
          </h3>
        </div>

        {awbNumber && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">AWB:</span>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                {awbNumber}
              </span>
              <button
                type="button"
                onClick={copyAwb}
                title="Copy AWB"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition-colors"
              >
                <span>Track</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* 5-Stage Stepper Progress Bar */}
      <div className="py-8">
        <div className="relative">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800 -z-0" />
          {/* Active Connecting Line */}
          <div
            className="absolute top-4 left-4 h-1 bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-500 -z-0"
            style={{
              width: `${(activeIndex / (STAGES.length - 1)) * 92}%`,
            }}
          />

          {/* Stepper Dots */}
          <div className="relative z-10 flex items-start justify-between">
            {STAGES.map((stage, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div key={stage.key} className="flex flex-col items-center text-center max-w-[80px] sm:max-w-[110px]">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isPast
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/50'
                        : isCurrent
                        ? 'bg-sky-600 text-white ring-4 ring-sky-100 dark:ring-sky-950/60 animate-pulse'
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>

                  <span
                    className={`text-[11px] sm:text-xs font-bold mt-2.5 block leading-tight ${
                      isCurrent
                        ? 'text-sky-600 dark:text-sky-400'
                        : isPast
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">
                    {stage.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chronological Scan History Toggle */}
      {localEvents.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Checkpoint History ({localEvents.length} updates)</span>
            </span>
            {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showHistory && (
            <div className="mt-4 space-y-3 pl-2 sm:pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2 animate-in fade-in duration-200">
              {localEvents.map((ev, i) => (
                <div key={ev.id || i} className="relative text-xs">
                  <div className="absolute -left-[17px] sm:-left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {ev.activity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ev.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {ev.location && (
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {ev.location}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Simulation Controls for Testing (ADR-012) */}
      {isTestMode && awbNumber && activeIndex < 4 && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-amber-600" /> Simulation Controls (Demo Mode)
            </span>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Staff / Evaluator Tool
            </span>
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 mb-3">
            Since carrier webhooks are awaiting real API dispatch, click below to trigger simulated carrier scans:
          </p>

          <div className="flex flex-wrap items-center gap-2">
            {activeIndex < 2 && (
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateStage('IN_TRANSIT')}
                className="py-1.5 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {simulating && <Loader2 className="w-3 h-3 animate-spin" />}
                Simulate: In Transit (Surat Hub)
              </button>
            )}

            {activeIndex < 3 && (
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateStage('OUT_FOR_DELIVERY')}
                className="py-1.5 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {simulating && <Loader2 className="w-3 h-3 animate-spin" />}
                Simulate: Out for Delivery
              </button>
            )}

            {activeIndex < 4 && (
              <button
                type="button"
                disabled={simulating}
                onClick={() => handleSimulateStage('DELIVERED')}
                className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {simulating && <Loader2 className="w-3 h-3 animate-spin" />}
                Simulate: Delivered (Consignee)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
