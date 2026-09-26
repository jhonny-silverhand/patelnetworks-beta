'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  PhoneCall,
  Package,
  Building2,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

const DEALER_WHATSAPP_NUMBER = '919876543210'; // Patel Networks Central Desk

export function WhatsAppSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const quickPrompts = [
    {
      label: 'Track My Order',
      icon: Package,
      text: 'Hi Patel Networks, I would like to track my surveillance hardware order status.',
    },
    {
      label: 'B2B Contractor Pricing',
      icon: Building2,
      text: 'Hello, I am a security system installer and would like to inquire about commercial project dealer pricing.',
    },
    {
      label: 'CCTV Architecture Advice',
      icon: ShieldCheck,
      text: 'Hi, I need technical guidance on selecting the right IP Cameras and NVR storage for a new site installation.',
    },
    {
      label: 'Warranty & Support Desk',
      icon: PhoneCall,
      text: 'Hi Patel Networks support, I have a question regarding product warranty and technical configuration.',
    },
  ];

  const handleLaunchWhatsApp = (textToSend?: string) => {
    const finalMsg = (textToSend || customMessage).trim() || 'Hello Patel Networks, I have an inquiry.';
    const encoded = encodeURIComponent(finalMsg);
    const url = `https://wa.me/${DEALER_WHATSAPP_NUMBER}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMessage('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* Expanded Quick-Chat Dialogue Card */}
      {isOpen && (
        <div className="mb-4 w-[340px] sm:w-[380px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-sm">
                💬
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-300 border-2 border-emerald-700 rounded-full" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight leading-tight">
                  Patel Networks Helpdesk
                </h4>
                <span className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                  Typically replies in ~5 mins
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
            {/* Greeting Speech Bubble */}
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-2xs">
              <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Namaste! How can we assist you today?
              </p>
              Tap a quick topic below or type your inquiry to connect directly with our CCTV engineers on WhatsApp.
            </div>

            {/* Quick Action Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Frequent Topics
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {quickPrompts.map((prompt) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={prompt.label}
                      type="button"
                      onClick={() => handleLaunchWhatsApp(prompt.text)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-800 text-xs font-medium text-slate-800 dark:text-slate-200 transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{prompt.label}</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="pt-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your question or project requirements..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleLaunchWhatsApp()}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Open WhatsApp Chat</span>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-[10px] text-center text-slate-400">
            Official Patel Networks Business API Desk • +91 98765 43210
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Contact via WhatsApp"
        className="group relative flex items-center gap-2.5 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl hover:shadow-2xl hover:shadow-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full" />
        </div>

        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          {isOpen ? 'Close Chat' : 'Chat on WhatsApp'}
        </span>
      </button>
    </div>
  );
}
