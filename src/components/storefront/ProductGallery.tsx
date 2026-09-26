'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ImageItem {
  id: string;
  url: string;
  altText?: string | null;
}

interface Props {
  productName: string;
  images: ImageItem[];
}

export function ProductGallery({ productName, images }: Props) {
  const fallbackUrl =
    'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80';
  const effectiveImages = images.length > 0 ? images : [{ id: 'fallback', url: fallbackUrl, altText: productName }];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = effectiveImages[selectedIndex] || effectiveImages[0];

  return (
    <div className="space-y-4">
      {/* Main Large Showcase Image */}
      <div className="relative aspect-4/3 w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-xs flex items-center justify-center overflow-hidden group">
        <Image
          src={activeImage.url}
          alt={activeImage.altText || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Multiple Photographic Thumbnail Selector */}
      {effectiveImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {effectiveImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border p-2 cursor-pointer transition-all shrink-0 overflow-hidden ${
                selectedIndex === i
                  ? 'border-sky-500 ring-2 ring-sky-500/25 shadow-md scale-105'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img.url}
                alt={`Photo angle ${i + 1}`}
                fill
                className="object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
