'use client';

import React, { useMemo, useState } from 'react';
import { Check, Move, RotateCcw, Upload, Image as ImageIcon } from 'lucide-react';
import { PhotoboothTemplate } from '@/types/portfolio';
import { urlFor } from '@/sanity/lib/image';
import {
  BUILTIN_FRAME_SPECS,
  CustomFramePosition,
  FRAME_CATEGORIES,
  FrameCategory,
} from './PhotoBoothTypes';
import { getTemplateSlots } from './PhotoBoothHelpers';

interface FramePickerPanelProps {
  templates: PhotoboothTemplate[];
  selectedTemplate: PhotoboothTemplate;
  onSelectTemplate: (temp: PhotoboothTemplate) => void;
  customFrameConfig: PhotoboothTemplate;
  customFrameImage: string | null;
  onSaveCustomConfig: (config: PhotoboothTemplate) => void;
  onCustomFrameUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAdjustingFrame: boolean;
  setIsAdjustingFrame: React.Dispatch<React.SetStateAction<boolean>>;
  customFramePosition: CustomFramePosition;
  setCustomFramePosition: React.Dispatch<React.SetStateAction<CustomFramePosition>>;
  hasSanityTemplates: boolean;
  customDetectedSlotsCount: number;
  useAutoDetectedSlots: boolean;
  onToggleAutoDetectedSlots: () => void;
}

function FrameMiniThumbnail({
  template,
  customFrameImage,
}: {
  template: PhotoboothTemplate;
  customFrameImage: string | null;
}) {
  const isLocal = template._id.startsWith('local-');
  const isCustom = template._id === 'custom-user-frame';
  const spec = isLocal ? BUILTIN_FRAME_SPECS[template._id] : null;
  const slots = getTemplateSlots(template, null);

  const imageUrl = isCustom
    ? customFrameImage
    : !isLocal && template.frameImage
      ? urlFor(template.frameImage).width(200).url()
      : null;

  if (imageUrl) {
    return (
      <div className="w-full h-24 rounded-md bg-[#09090B] border border-zinc-800 flex items-center justify-center p-1.5 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain rounded-[2px]" />
      </div>
    );
  }

  if (isCustom) {
    return (
      <div className="w-full h-24 rounded-md bg-[#09090B] border border-dashed border-zinc-600 flex flex-col items-center justify-center gap-1 text-zinc-400">
        <ImageIcon className="w-5 h-5" aria-hidden="true" />
        <span className="text-[10px] font-mono uppercase">PNG Custom</span>
      </div>
    );
  }

  const isWide = template.layout === 'grid' || template.layout === 'single';
  const cardWidthClass = template.layout === 'grid' ? 'w-16 h-18' : template.layout === 'single' ? 'w-15 h-18' : 'w-10 h-20';

  return (
    <div className="w-full h-24 rounded-md bg-[#09090B] border border-zinc-800/80 flex items-center justify-center p-2 overflow-hidden">
      <div
        className={`relative rounded-[2px] border overflow-hidden shadow-md ${cardWidthClass}`}
        style={{
          backgroundColor: spec?.bgColor ?? '#FFFFFF',
          backgroundImage: spec?.bgGradient
            ? `linear-gradient(135deg, ${spec.bgGradient[0]}, ${spec.bgGradient[1]}, ${spec.bgGradient[2]})`
            : spec?.decoration === 'blueprint'
              ? 'linear-gradient(to right, rgba(186,230,253,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(186,230,253,0.16) 1px, transparent 1px)'
              : undefined,
          backgroundSize: spec?.decoration === 'blueprint' ? '6px 6px' : undefined,
          borderColor: spec?.outerBorderColor ?? '#D4D4D8',
        }}
      >
        {/* 35mm film mini sprockets */}
        {spec?.decoration === 'film-35mm' && (
          <div className="absolute inset-y-0.5 left-0.5 right-0.5 flex justify-between pointer-events-none">
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-col justify-between h-full">
                {[0, 1, 2, 3, 4, 5].map((dot) => (
                  <span key={dot} className="w-0.5 h-1 bg-zinc-700 rounded-[1px]" />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Camcorder mini REC dot */}
        {spec?.decoration === 'camcorder' && (
          <span className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        )}

        {/* Editorial press mini header bar */}
        {spec?.decoration === 'editorial-press' && (
          <div className="absolute top-1 inset-x-1 h-1 border-y border-zinc-800/70" />
        )}

        {/* Blush ribbon mini bow dot */}
        {spec?.decoration === 'blush-ribbon' && (
          <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-rose-500" />
        )}

        {/* Mini slot placeholders */}
        {slots.map((slot, idx) => (
          <span
            key={idx}
            className="absolute block"
            style={{
              left: `${slot.leftPercent}%`,
              top: `${slot.topPercent}%`,
              width: `${slot.widthPercent}%`,
              height: `${slot.heightPercent}%`,
              backgroundColor: spec?.slotBgColor ?? '#27272A',
              borderRadius: spec && spec.slotRadiusPercent > 1.5 ? '2px' : '1px',
              opacity: 0.85,
            }}
          />
        ))}

        {/* Receipt mini barcode */}
        {spec?.decoration === 'receipt' && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-zinc-800/80" />
        )}

        {/* Subtle footer line hint */}
        {spec && spec.decoration !== 'receipt' && (
          <span
            className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full opacity-55 ${isWide ? 'w-7' : 'w-4'}`}
            style={{ backgroundColor: spec.textColor }}
          />
        )}
      </div>
    </div>
  );
}

export default function FramePickerPanel({
  templates,
  selectedTemplate,
  onSelectTemplate,
  customFrameConfig,
  customFrameImage,
  onSaveCustomConfig,
  onCustomFrameUpload,
  isAdjustingFrame,
  setIsAdjustingFrame,
  customFramePosition,
  setCustomFramePosition,
  hasSanityTemplates,
  customDetectedSlotsCount,
  useAutoDetectedSlots,
  onToggleAutoDetectedSlots,
}: FramePickerPanelProps) {
  const [activeCategory, setActiveCategory] = useState<FrameCategory>('all');

  const categories = useMemo(() => {
    if (!hasSanityTemplates) return FRAME_CATEGORIES;
    return [
      ...FRAME_CATEGORIES.slice(0, -1),
      { id: 'cms' as FrameCategory, label: 'CMS Studio' },
      FRAME_CATEGORIES[FRAME_CATEGORIES.length - 1],
    ];
  }, [hasSanityTemplates]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === 'all') return templates;
    return templates.filter((t) => {
      if (t._id === 'custom-user-frame') return activeCategory === 'custom';
      if (!t._id.startsWith('local-')) return activeCategory === 'cms';
      const spec = BUILTIN_FRAME_SPECS[t._id];
      return spec?.category === activeCategory;
    });
  }, [templates, activeCategory]);

  const getShotLabel = (temp: PhotoboothTemplate) => {
    const layoutText =
      temp.layout === 'grid' ? 'Grid' : temp.layout === 'single' ? 'Single' : 'Strip';
    return `${temp.maxPhotos} Foto • ${layoutText}`;
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Pills */}
      <div
        role="tablist"
        aria-label="Kategori frame photo booth"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-mono"
      >
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isSelected
                  ? 'bg-white text-[#09090B]'
                  : 'bg-[#18181B] text-[#D4D4D8] border border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Frame Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-mono">
        {filteredTemplates.map((temp) => {
          const isSelected = selectedTemplate._id === temp._id;
          const spec = BUILTIN_FRAME_SPECS[temp._id];
          return (
            <button
              key={temp._id}
              type="button"
              onClick={() => onSelectTemplate(temp)}
              aria-pressed={isSelected}
              className={`group relative text-left p-2 rounded-xl border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isSelected
                  ? 'bg-[#18181B] border-white ring-1 ring-white/40'
                  : 'bg-[#111113] border-zinc-800 hover:border-zinc-600 hover:bg-[#18181B]/70'
              }`}
            >
              <FrameMiniThumbnail template={temp} customFrameImage={customFrameImage} />

              <div className="mt-2 px-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[#FAFAFA] truncate">
                    {temp.name}
                  </span>
                  {isSelected && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-white text-[#09090B] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-mono text-[#94949E] mt-0.5 truncate">
                  {getShotLabel(temp)}
                </p>
                {spec?.tagline && (
                  <p className="text-[10px] text-[#A1A1AA] mt-0.5 line-clamp-1">
                    {spec.tagline}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom PNG Frame Builder Panel */}
      {selectedTemplate._id === 'custom-user-frame' && (
        <div className="p-4 rounded-xl bg-[#09090B] border border-zinc-700 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[#FAFAFA]">Pengaturan Frame PNG Custom</h3>
              <p className="text-xs text-[#94949E]">
                Upload gambar PNG dengan area lubang foto transparan.
              </p>
            </div>
          </div>

          {/* PNG File Upload */}
          <div>
            <label
              htmlFor="pb-custom-png-upload"
              className="flex items-center justify-center gap-2 w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-white text-[#09090B] hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" aria-hidden="true" />
              {customFrameImage ? 'Ganti File PNG Transparan' : 'Upload Frame PNG Transparan'}
            </label>
            <input
              id="pb-custom-png-upload"
              type="file"
              accept="image/png"
              onChange={onCustomFrameUpload}
              className="sr-only"
            />
          </div>

          {/* Auto-Fit Detection Status Banner */}
          {customFrameImage && customDetectedSlotsCount > 0 && (
            <div className="p-3 rounded-lg bg-[#111113] border border-zinc-700 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs">
                <p className="font-semibold text-white">
                  {useAutoDetectedSlots
                    ? `Auto-Fit Aktif (${customDetectedSlotsCount} kotak transparan terdeteksi)`
                    : 'Mode Margin Manual Aktif'}
                </p>
                <p className="text-[#94949E] mt-0.5">
                  {useAutoDetectedSlots
                    ? 'Posisi & ukuran slot otomatis mengikuti lubang PNG Anda.'
                    : 'Anda mengatur posisi slot secara manual dengan slider di bawah.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleAutoDetectedSlots}
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#18181B] border border-zinc-600 hover:bg-zinc-800 text-xs font-medium text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {useAutoDetectedSlots ? 'Atur Manual' : 'Pakai Auto-Fit'}
              </button>
            </div>
          )}

          {/* Layout & Shot Count (shown when manual mode or no auto-detected holes) */}
          {(!useAutoDetectedSlots || customDetectedSlotsCount === 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="block text-xs font-medium text-[#A1A1AA] mb-1.5">Tipe Layout</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['strip', 'grid', 'single'] as const).map((layoutOpt) => {
                  const active = customFrameConfig.layout === layoutOpt;
                  return (
                    <button
                      key={layoutOpt}
                      type="button"
                      onClick={() =>
                        onSaveCustomConfig({
                          ...customFrameConfig,
                          layout: layoutOpt,
                          maxPhotos:
                            layoutOpt === 'single'
                              ? 1
                              : Math.max(2, customFrameConfig.maxPhotos),
                        })
                      }
                      className={`min-h-[38px] rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        active
                          ? 'bg-white text-[#09090B]'
                          : 'bg-[#18181B] text-[#D4D4D8] border border-zinc-700 hover:bg-zinc-800'
                      }`}
                    >
                      {layoutOpt}
                    </button>
                  );
                })}
              </div>
            </div>

            {customFrameConfig.layout !== 'single' && (
              <div>
                <span className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Jumlah Slot Foto
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {[2, 3, 4, 5, 6].map((count) => {
                    const active = customFrameConfig.maxPhotos === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() =>
                          onSaveCustomConfig({ ...customFrameConfig, maxPhotos: count })
                        }
                        className={`min-h-[38px] rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          active
                            ? 'bg-white text-[#09090B]'
                            : 'bg-[#18181B] text-[#D4D4D8] border border-zinc-700 hover:bg-zinc-800'
                        }`}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Interactive Position / Resize Toggle */}
          {customFrameImage && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdjustingFrame((prev) => !prev)}
                className={`flex-1 min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  isAdjustingFrame
                    ? 'bg-white text-[#09090B]'
                    : 'bg-[#18181B] text-[#FAFAFA] border border-zinc-700 hover:bg-zinc-800'
                }`}
              >
                <Move className="w-3.5 h-3.5" aria-hidden="true" />
                {isAdjustingFrame ? 'Selesai Geser Frame' : 'Geser & Ubah Ukuran PNG'}
              </button>
              <button
                type="button"
                onClick={() => setCustomFramePosition({ x: 0, y: 0, w: 100, h: 100 })}
                className="min-h-[42px] px-3 py-2 rounded-lg bg-[#18181B] text-[#D4D4D8] border border-zinc-700 hover:bg-zinc-800 hover:text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset
              </button>
              <span className="sr-only">
                Posisi frame saat ini: X {Math.round(customFramePosition.x)}%, Y{' '}
                {Math.round(customFramePosition.y)}%
              </span>
            </div>
          )}

          {/* Padding Sliders (shown when manual mode or no auto-detected holes) */}
          {(!useAutoDetectedSlots || customDetectedSlotsCount === 0) && (
            <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { key: 'topPadding' as const, label: 'Margin Atas', max: 35 },
              { key: 'bottomPadding' as const, label: 'Margin Bawah', max: 35 },
              { key: 'sidePadding' as const, label: 'Margin Samping', max: 25 },
              { key: 'rowSpacing' as const, label: 'Jarak Antar Baris', max: 15 },
            ].map(({ key, label, max }) => {
              const val = customFrameConfig[key] ?? 4;
              const inputId = `pb-slider-${key}`;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor={inputId} className="text-[#A1A1AA]">
                      {label}
                    </label>
                    <span className="font-mono text-[#FAFAFA]">{val}%</span>
                  </div>
                  <input
                    id={inputId}
                    type="range"
                    min={0}
                    max={max}
                    step={0.5}
                    value={val}
                    onChange={(e) =>
                      onSaveCustomConfig({
                        ...customFrameConfig,
                        [key]: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-white cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}
    </div>
  );
}
