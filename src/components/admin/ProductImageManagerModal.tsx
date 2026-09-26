'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  Trash2,
  Star,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  addProductImageAction,
  deleteProductImageAction,
  setPrimaryProductImageAction,
} from '@/app/actions/admin.actions';

export interface ProductImageItem {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

interface Props {
  productId: string;
  productName: string;
  productSlug: string;
  initialImages: ProductImageItem[];
  isOpen: boolean;
  onClose: () => void;
  onImagesUpdated: (newImages: ProductImageItem[]) => void;
}

// Curated high-res verified photographic image presets for quick assignment
const CURATED_HARDWARE_PHOTOS = [
  {
    label: 'Outdoor Bullet Camera',
    url: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
    alt: 'Outdoor Weatherproof IR Bullet Camera',
  },
  {
    label: 'Ceiling Dome Camera',
    url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    alt: 'Vandal-Resistant Ceiling Dome Camera',
  },
  {
    label: 'PoE IP Network Camera',
    url: 'https://images.unsplash.com/photo-1528312635006-8ea0bc49ec63?auto=format&fit=crop&w=1200&q=80',
    alt: 'AI AcuSense Network IP Camera',
  },
  {
    label: 'DVR / NVR Recorder',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    alt: 'Digital Video Recorder Console',
  },
  {
    label: 'Surveillance Hard Drive',
    url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1200&q=80',
    alt: '3.5-inch 24/7 Surveillance Internal HDD',
  },
  {
    label: 'Cat6 Structured Cable',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    alt: 'Cat6 Pure Copper Networking Cable Roll',
  },
  {
    label: 'Gigabit PoE Switch',
    url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    alt: '8-Port Gigabit PoE+ Networking Switch',
  },
  {
    label: 'SMPS Power Supply',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    alt: '12V 10A Centralized Multi-Channel SMPS',
  },
  {
    label: 'BNC Connectors Pack',
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    alt: 'Pure Copper Video BNC Male Connectors',
  },
  {
    label: 'Surveillance Monitor',
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    alt: '24/7 Commercial CCTV Surveillance Monitor',
  },
];

export function ProductImageManagerModal({
  productId,
  productName,
  productSlug,
  initialImages,
  isOpen,
  onClose,
  onImagesUpdated,
}: Props) {
  const [images, setImages] = useState<ProductImageItem[]>(initialImages);
  const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'presets'>('url');
  const [inputUrl, setInputUrl] = useState('');
  const [inputAlt, setInputAlt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleAddUrl = (urlToAdd?: string, altToAdd?: string) => {
    const targetUrl = urlToAdd || inputUrl;
    const targetAlt = altToAdd || inputAlt || productName;

    if (!targetUrl.trim().startsWith('http')) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid HTTP/HTTPS image URL' });
      return;
    }

    setStatusMsg(null);
    startTransition(async () => {
      const res = await addProductImageAction(productId, targetUrl, targetAlt);
      if (res.success && res.data) {
        const newImg: ProductImageItem = {
          id: res.data.id,
          url: res.data.url,
          altText: res.data.altText,
          sortOrder: res.data.sortOrder,
        };
        const updated = [...images, newImg];
        setImages(updated);
        onImagesUpdated(updated);
        setInputUrl('');
        setInputAlt('');
        setStatusMsg({ type: 'success', text: 'Real photographic image saved to Supabase!' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to add image link' });
      }
    });
  };

  const handleDelete = (imageId: string) => {
    setStatusMsg(null);
    startTransition(async () => {
      const res = await deleteProductImageAction(imageId);
      if (res.success) {
        const updated = images.filter((img) => img.id !== imageId);
        setImages(updated);
        onImagesUpdated(updated);
        setStatusMsg({ type: 'success', text: 'Image removed from database' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to delete image' });
      }
    });
  };

  const handleSetPrimary = (imageId: string) => {
    setStatusMsg(null);
    startTransition(async () => {
      const res = await setPrimaryProductImageAction(productId, imageId);
      if (res.success && res.data) {
        const updated = res.data.map((d: any) => ({
          id: d.id,
          url: d.url,
          altText: d.altText,
          sortOrder: d.sortOrder,
        }));
        setImages(updated);
        onImagesUpdated(updated);
        setStatusMsg({ type: 'success', text: 'Primary cover image updated!' });
      } else {
        setStatusMsg({ type: 'error', text: res.error || 'Failed to set primary image' });
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setStatusMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('productId', productId);

      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      // Automatically store uploaded URL to Supabase ProductImage
      const saveRes = await addProductImageAction(productId, data.url, inputAlt || productName);
      if (saveRes.success && saveRes.data) {
        const newImg: ProductImageItem = {
          id: saveRes.data.id,
          url: saveRes.data.url,
          altText: saveRes.data.altText,
          sortOrder: saveRes.data.sortOrder,
        };
        const updated = [...images, newImg];
        setImages(updated);
        onImagesUpdated(updated);
        setSelectedFile(null);
        setUploadPreview(null);
        setInputAlt('');
        setStatusMsg({ type: 'success', text: 'Photo uploaded and stored to Supabase successfully!' });
      } else {
        throw new Error(saveRes.error || 'Failed to save uploaded image record to database');
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Image upload error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Product Image & Asset Manager</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 font-mono">
                  {images.length} Photos
                </span>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">{productName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-300 border-b border-emerald-800/50'
                : 'bg-rose-950/80 text-rose-300 border-b border-rose-800/50'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Current Stored Images */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Photos in Supabase Database
              </h3>
              <span className="text-[11px] text-slate-500">
                First photo with star is displayed on storefront cards
              </span>
            </div>

            {images.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 text-slate-400 space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No photographic images stored in database yet.</p>
                <p className="text-[11px] text-slate-500">
                  Paste an image link below or choose from curated hardware presets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => {
                  const isPrimary = idx === 0 || img.sortOrder === 0;
                  return (
                    <div
                      key={img.id}
                      className={`group relative flex flex-col rounded-2xl border overflow-hidden bg-slate-950/60 transition-all ${
                        isPrimary
                          ? 'border-sky-500/80 ring-2 ring-sky-500/30'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Image Preview */}
                      <div className="relative aspect-4/3 w-full bg-slate-950 flex items-center justify-center p-3">
                        <Image
                          src={img.url}
                          alt={img.altText || productName}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-contain p-2"
                          referrerPolicy="no-referrer"
                        />

                        {isPrimary && (
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                            <Star className="w-3 h-3 fill-current" /> Cover Photo
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex flex-col gap-2">
                        <div className="text-[11px] text-slate-400 truncate font-mono">
                          {img.altText || img.url}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                          {!isPrimary && (
                            <button
                              disabled={isPending}
                              onClick={() => handleSetPrimary(img.id)}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 flex items-center gap-1 transition-colors"
                            >
                              <Star className="w-3 h-3" /> Set Cover
                            </button>
                          )}

                          <a
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-2 py-1 text-slate-400 hover:text-white flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>

                          <button
                            disabled={isPending}
                            onClick={() => handleDelete(img.id)}
                            className="ml-auto text-[11px] p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 hover:text-rose-300 transition-colors"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Add New Real Photographic Image */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('url')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'url'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" /> Link from Web / CDN
              </button>

              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'upload'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File (Storage)
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'presets'
                    ? 'bg-sky-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Curated Hardware Presets
              </button>
            </div>

            {/* TAB 1: Link from Internet */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-300">
                      Image URL (Unsplash, Manufacturer CDN, Cloudinary, AWS S3, etc.)
                    </label>
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-slate-300">Alt Description</label>
                    <input
                      type="text"
                      value={inputAlt}
                      onChange={(e) => setInputAlt(e.target.value)}
                      placeholder="e.g. Front lens close-up"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Instant Live Preview */}
                {inputUrl.startsWith('http') && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="relative w-16 h-16 rounded-lg bg-slate-950 border border-slate-700 overflow-hidden shrink-0">
                      <Image
                        src={inputUrl}
                        alt="Preview"
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-white">Live URL Preview</p>
                      <p className="text-slate-400 text-[11px] truncate">{inputUrl}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    disabled={isPending || !inputUrl.trim()}
                    onClick={() => handleAddUrl()}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {isPending ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Save Photo to Database</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Upload File to Storage */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-sky-500/50 transition-colors bg-slate-900/50">
                  {uploadPreview ? (
                    <div className="space-y-3">
                      <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden bg-slate-950 border border-slate-700">
                        <Image
                          src={uploadPreview}
                          alt="Upload preview"
                          fill
                          className="object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{selectedFile?.name}</p>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setUploadPreview(null);
                        }}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Choose Different File
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 mx-auto text-sky-400" />
                      <p className="text-xs font-semibold text-white">
                        Click to select high-res photo from device
                      </p>
                      <p className="text-[11px] text-slate-500">Supports JPG, PNG, WebP up to 10MB</p>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    disabled={isUploading || !selectedFile}
                    onClick={handleUploadFile}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    {isUploading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploading ? 'Uploading to Storage...' : 'Upload & Store in Supabase'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: Curated Hardware Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Select any high-resolution photographic image below to immediately assign it to this product:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-h-60 overflow-y-auto pr-1">
                  {CURATED_HARDWARE_PHOTOS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddUrl(preset.url, preset.alt)}
                      className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900 p-2 hover:border-sky-500 hover:bg-slate-850 transition-all flex flex-col items-center text-center"
                    >
                      <div className="relative w-full aspect-square rounded-lg bg-slate-950 overflow-hidden mb-2">
                        <Image
                          src={preset.url}
                          alt={preset.alt}
                          fill
                          sizes="120px"
                          className="object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-200 group-hover:text-sky-300 line-clamp-1">
                        {preset.label}
                      </span>
                      <span className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Plus className="w-2.5 h-2.5" /> Assign
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <span className="text-[11px] text-slate-500">
            Changes persist directly to live Supabase <code className="text-slate-400">product_images</code> table.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
