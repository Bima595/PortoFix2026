'use client';

import React from 'react';
import { Camera, RotateCcw, Upload, Image as ImageIcon, X } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import LiveVideo from './LiveVideo';
import { StickerAsset } from './StickerAssets';
import {
  formatBoothDate,
  getFrameSpec,
  getLayoutDimensions,
  getTemplatePaddings,
  getTemplateSlots,
} from './PhotoBoothHelpers';
import { PhotoboothTemplate } from '@/types/portfolio';
import {
  BoothState,
  CustomFramePosition,
  DEFAULT_PHOTO_TRANSFORM,
  PhotoFilter,
  PhotoTransform,
  PlacedSticker,
  SlotCoordinate,
} from './PhotoBoothTypes';

interface PhotoBoothFrameProps {
  selectedTemplate: PhotoboothTemplate;
  templateAspectRatio: number | null;
  customFrameImage: string | null;
  customDetectedSlots?: SlotCoordinate[] | null;
  capturedPhotos: string[];
  photoTransforms?: Record<number, PhotoTransform>;
  setPhotoTransforms?: React.Dispatch<React.SetStateAction<Record<number, PhotoTransform>>>;
  selectedSlotIndex?: number | null;
  setSelectedSlotIndex?: React.Dispatch<React.SetStateAction<number | null>>;
  currentCaptureIndex: number;
  state: BoothState;
  stream: MediaStream | null;
  isMirrored: boolean;
  activeFilter: PhotoFilter;
  placedStickers: PlacedSticker[];
  setPlacedStickers: React.Dispatch<React.SetStateAction<PlacedSticker[]>>;
  selectedStickerId: string | null;
  setSelectedStickerId: React.Dispatch<React.SetStateAction<string | null>>;
  handleRetakeSingleSlot?: (idx: number) => void;
  handleUploadSingleSlot?: (idx: number) => void;
  onDropFileOnSlot?: (idx: number, file: File) => void;
  mode?: 'setup' | 'capture' | 'preview';
  containerRef: React.RefObject<HTMLDivElement | null>;
  allStickers: StickerAsset[];
  customFramePosition?: CustomFramePosition;
  setCustomFramePosition?: React.Dispatch<React.SetStateAction<CustomFramePosition>>;
  isAdjustingFrame?: boolean;
  customCaption: string;
  showDate: boolean;
}

const BARCODE_PATTERN = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2];

const fontClassForStyle = (style: 'sans' | 'serif' | 'mono') => {
  if (style === 'serif') return 'font-serif';
  if (style === 'mono') return 'font-mono';
  return 'font-sans';
};

export default function PhotoBoothFrame({
  selectedTemplate,
  templateAspectRatio,
  customFrameImage,
  customDetectedSlots = null,
  capturedPhotos,
  photoTransforms = {},
  setPhotoTransforms,
  selectedSlotIndex = null,
  setSelectedSlotIndex,
  currentCaptureIndex,
  state,
  stream,
  isMirrored,
  activeFilter,
  placedStickers,
  setPlacedStickers,
  selectedStickerId,
  setSelectedStickerId,
  handleRetakeSingleSlot,
  handleUploadSingleSlot,
  onDropFileOnSlot,
  mode = 'setup',
  containerRef,
  allStickers,
  customFramePosition = { x: 0, y: 0, w: 100, h: 100 },
  setCustomFramePosition,
  isAdjustingFrame = false,
  customCaption,
  showDate,
}: PhotoBoothFrameProps) {
  const isLocal = selectedTemplate._id.startsWith('local-');
  const spec = getFrameSpec(selectedTemplate._id);
  const dims = getLayoutDimensions(selectedTemplate, templateAspectRatio);
  const paddings = getTemplatePaddings(selectedTemplate);
  const slots = getTemplateSlots(selectedTemplate, templateAspectRatio, customDetectedSlots);

  const frameUrl =
    selectedTemplate._id === 'custom-user-frame'
      ? customFrameImage
      : !isLocal && selectedTemplate.frameImage
        ? urlFor(selectedTemplate.frameImage).url()
        : null;

  const aspect =
    frameUrl && templateAspectRatio
      ? templateAspectRatio
      : dims.totalWidth / dims.totalHeight;

  const isWideFrame = aspect > 0.72;
  const sizeClass =
    mode === 'preview'
      ? isWideFrame
        ? 'w-full max-w-[380px] sm:max-w-[430px]'
        : 'w-full max-w-[270px] sm:max-w-[310px]'
      : mode === 'capture'
        ? isWideFrame
          ? 'w-full max-w-[250px] lg:max-w-[280px]'
          : 'w-full max-w-[180px] lg:max-w-[205px]'
        : isWideFrame
          ? 'w-full max-w-[340px] sm:max-w-[380px]'
          : 'w-full max-w-[235px] sm:max-w-[265px]';

  const displayCaption = customCaption.trim() || spec.defaultCaption;
  const dateText = formatBoothDate();

  const handleDeleteSticker = (id: string) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
    setSelectedStickerId(null);
  };

  const handleStickerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stickerId = e.dataTransfer.getData('text/plain');
    if (!stickerId) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const xPercent = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      stickerId,
      x: xPercent,
      y: yPercent,
      size: 20,
      rotation: 0,
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleStickerDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedStickerId(id);

    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const point = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
      if (!point) return;
      const xPercent = Math.max(2, Math.min(98, ((point.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.max(2, Math.min(98, ((point.clientY - rect.top) / rect.height) * 100));

      setPlacedStickers((prev) =>
        prev.map((st) => (st.id === id ? { ...st, x: xPercent, y: yPercent } : st))
      );
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);
  };

  const handleFrameDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!setCustomFramePosition) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startPoint = 'touches' in e ? e.touches[0] : e;
    if (!startPoint) return;

    const startX = startPoint.clientX;
    const startY = startPoint.clientY;
    const initialX = customFramePosition.x;
    const initialY = customFramePosition.y;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const point = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
      if (!point) return;
      const dxPercent = ((point.clientX - startX) / rect.width) * 100;
      const dyPercent = ((point.clientY - startY) / rect.height) * 100;

      const newX = Math.max(-100, Math.min(100, initialX + dxPercent));
      const newY = Math.max(-100, Math.min(100, initialY + dyPercent));

      setCustomFramePosition((prev) => ({ ...prev, x: newX, y: newY }));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);
  };

  const handleFrameResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!setCustomFramePosition) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const startPoint = 'touches' in e ? e.touches[0] : e;
    if (!startPoint) return;

    const startX = startPoint.clientX;
    const startY = startPoint.clientY;
    const initialW = customFramePosition.w;
    const initialH = customFramePosition.h;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const point = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
      if (!point) return;
      const dwPercent = ((point.clientX - startX) / rect.width) * 100;
      const dhPercent = ((point.clientY - startY) / rect.height) * 100;

      const newW = Math.max(15, Math.min(250, initialW + dwPercent));
      const newH = Math.max(15, Math.min(250, initialH + dhPercent));

      setCustomFramePosition((prev) => ({ ...prev, w: newW, h: newH }));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);
  };

  const frameBgStyle: React.CSSProperties = frameUrl
    ? { backgroundColor: '#09090B', borderColor: '#27272A' }
    : {
        backgroundColor: spec.bgColor,
        backgroundImage: spec.bgGradient
          ? `linear-gradient(135deg, ${spec.bgGradient[0]} 0%, ${spec.bgGradient[1]} 50%, ${spec.bgGradient[2]} 100%)`
          : spec.decoration === 'blueprint'
            ? 'linear-gradient(to right, rgba(186,230,253,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(186,230,253,0.12) 1px, transparent 1px)'
            : undefined,
        backgroundSize: spec.decoration === 'blueprint' ? '4.5cqw 4.5cqw' : undefined,
        borderColor: spec.outerBorderColor,
        color: spec.textColor,
      };

  const handlePhotoDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    photoIdx: number,
    slotEl: HTMLDivElement | null
  ) => {
    if (!setPhotoTransforms || isAdjustingFrame) return;
    e.stopPropagation();
    setSelectedStickerId(null);
    setSelectedSlotIndex?.(photoIdx);

    const rect = slotEl?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const startPoint = 'touches' in e ? e.touches[0] : e;
    if (!startPoint) return;

    const startX = startPoint.clientX;
    const startY = startPoint.clientY;
    const initial = photoTransforms[photoIdx] ?? DEFAULT_PHOTO_TRANSFORM;

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const point = 'touches' in moveEvent ? moveEvent.touches[0] : moveEvent;
      if (!point) return;

      const dxPercent = ((point.clientX - startX) / rect.width) * 100;
      const dyPercent = ((point.clientY - startY) / rect.height) * 100;

      const nextX = Math.max(-80, Math.min(80, Math.round((initial.x + dxPercent) * 10) / 10));
      const nextY = Math.max(-80, Math.min(80, Math.round((initial.y + dyPercent) * 10) / 10));

      setPhotoTransforms((prev) => ({
        ...prev,
        [photoIdx]: {
          ...(prev[photoIdx] ?? DEFAULT_PHOTO_TRANSFORM),
          x: nextX,
          y: nextY,
        },
      }));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleUp);
  };

  const handlePhotoWheel = (e: React.WheelEvent<HTMLDivElement>, photoIdx: number) => {
    if (!setPhotoTransforms || selectedSlotIndex !== photoIdx || isAdjustingFrame) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setPhotoTransforms((prev) => {
      const curr = prev[photoIdx] ?? DEFAULT_PHOTO_TRANSFORM;
      const nextZoom = Math.max(1, Math.min(3, Math.round((curr.zoom + delta) * 100) / 100));
      return {
        ...prev,
        [photoIdx]: { ...curr, zoom: nextZoom },
      };
    });
  };

  const handleSlotFileDrop = (e: React.DragEvent<HTMLDivElement>, photoIdx: number) => {
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/') && onDropFileOnSlot) {
      e.preventDefault();
      e.stopPropagation();
      onDropFileOnSlot(photoIdx, file);
    }
  };

  const canModifySlots = state === 'review' || state === 'preview' || state === 'idle';

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleStickerDrop}
      onClick={() => {
        setSelectedStickerId(null);
        setSelectedSlotIndex?.(null);
      }}
      className={`relative shadow-[0_24px_64px_rgba(0,0,0,0.65)] rounded-sm overflow-hidden select-none border transition-colors duration-200 ${sizeClass}`}
      style={{
        ...frameBgStyle,
        aspectRatio: String(aspect),
        containerType: 'inline-size',
      }}
    >
      {/* Custom empty PNG notice */}
      {selectedTemplate._id === 'custom-user-frame' && !customFrameImage && (
        <div className="absolute inset-0 bg-[#09090B]/90 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-zinc-600 z-30 pointer-events-none">
          <ImageIcon className="w-7 h-7 text-zinc-400 mb-2" aria-hidden="true" />
          <p className="text-zinc-200 text-xs font-medium">Belum Ada Frame PNG</p>
          <p className="text-zinc-400 text-[11px] mt-1">Upload PNG transparan di panel pengaturan</p>
        </div>
      )}

      {/* Subtle inner decorative border for blush, linen, gallery mat, chrome */}
      {!frameUrl &&
        (spec.decoration === 'blush-ribbon' ||
          spec.decoration === 'linen-serif' ||
          spec.decoration === 'gallery-mat' ||
          spec.decoration === 'chrome-y2k') && (
          <div
            className="absolute inset-[2.5%] pointer-events-none z-10 border"
            style={{
              borderColor:
                spec.decoration === 'chrome-y2k'
                  ? 'rgba(24,24,27,0.35)'
                  : spec.decoration === 'blush-ribbon'
                    ? '#F4B4C6'
                    : spec.outerBorderColor,
            }}
          />
        )}

      {/* Contact sheet & Blueprint sheet corner crop marks */}
      {!frameUrl && (spec.decoration === 'contact-sheet' || spec.decoration === 'blueprint') && (
        <div className="absolute inset-[2.2%] pointer-events-none z-10">
          {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map(
            (pos, i) => (
              <span
                key={i}
                className={`absolute w-[2.8cqw] h-[2.8cqw] ${pos}`}
                style={{
                  borderColor:
                    spec.decoration === 'blueprint'
                      ? 'rgba(186,230,253,0.7)'
                      : 'rgba(255,255,255,0.45)',
                }}
              />
            )
          )}
        </div>
      )}

      {/* Thermal receipt top & bottom serrated accents */}
      {!frameUrl && spec.decoration === 'receipt' && (
        <>
          <div
            className="absolute top-0 inset-x-0 h-[1.4cqw] pointer-events-none z-20 opacity-80"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #d4d4d8 25%, transparent 25%), linear-gradient(225deg, #d4d4d8 25%, transparent 25%)',
              backgroundSize: '3.2cqw 1.4cqw',
              backgroundRepeat: 'repeat-x',
            }}
          />
          <div
            className="absolute bottom-0 inset-x-0 h-[1.4cqw] pointer-events-none z-20 opacity-80"
            style={{
              backgroundImage:
                'linear-gradient(315deg, #d4d4d8 25%, transparent 25%), linear-gradient(45deg, #d4d4d8 25%, transparent 25%)',
              backgroundSize: '3.2cqw 1.4cqw',
              backgroundRepeat: 'repeat-x',
            }}
          />
        </>
      )}

      {/* 35mm film sprockets along both margins */}
      {!frameUrl && spec.decoration === 'film-35mm' && (
        <div className="absolute inset-y-[2%] left-[2.8%] right-[2.8%] flex justify-between pointer-events-none z-20">
          {[0, 1].map((side) => (
            <div key={side} className="flex flex-col justify-between h-full">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-zinc-800 border border-white/15 rounded-[0.8cqw]"
                  style={{ width: '4.4cqw', height: '6.2cqw' }}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Dedicated Top Header Region */}
      {!frameUrl && paddings.topPadding >= 7 && (
        <div
          className={`absolute top-0 left-0 right-0 flex flex-col justify-center pointer-events-none z-10 ${fontClassForStyle(spec.fontStyle)}`}
          style={{
            height: `${paddings.topPadding}%`,
            paddingLeft: `${paddings.sidePadding}%`,
            paddingRight: `${paddings.sidePadding}%`,
          }}
        >
          {spec.decoration === 'editorial-press' && (
            <div className="w-full border-t-2 border-b py-[1.4cqw] text-center" style={{ borderColor: spec.textColor }}>
              <div className="font-bold leading-none tracking-tight" style={{ fontSize: '5.4cqw' }}>
                {spec.headerTitle}
              </div>
              <div
                className="font-mono uppercase tracking-[0.14em] mt-[0.8cqw]"
                style={{ fontSize: '2.1cqw', color: spec.mutedTextColor }}
              >
                {spec.headerMeta}
              </div>
            </div>
          )}

          {spec.decoration === 'receipt' && (
            <div className="w-full text-center border-b border-dashed pb-[1.2cqw]" style={{ borderColor: 'rgba(24,24,27,0.4)' }}>
              <div className="font-bold tracking-wider" style={{ fontSize: '3.9cqw' }}>
                {spec.headerTitle}
              </div>
              <div style={{ fontSize: '2.2cqw', color: spec.mutedTextColor }}>{spec.headerMeta}</div>
            </div>
          )}

          {spec.decoration === 'camcorder' && (
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-[1.6cqw]">
                <span className="inline-block w-[2.1cqw] h-[2.1cqw] rounded-full bg-red-500" />
                <span className="font-bold tracking-widest" style={{ fontSize: '3.1cqw' }}>
                  REC
                </span>
              </div>
              <span style={{ fontSize: '2.3cqw', color: spec.mutedTextColor }}>{spec.headerMeta}</span>
            </div>
          )}

          {(spec.decoration === 'contact-sheet' || spec.decoration === 'blueprint') && (
            <div
              className="w-full flex items-center justify-between border-b pb-[1cqw]"
              style={{
                borderColor:
                  spec.decoration === 'blueprint'
                    ? 'rgba(186,230,253,0.35)'
                    : 'rgba(255,255,255,0.16)',
              }}
            >
              <span className="font-bold tracking-wider" style={{ fontSize: '2.5cqw' }}>
                {spec.headerTitle}
              </span>
              <span style={{ fontSize: '2cqw', color: spec.mutedTextColor }}>{spec.headerMeta}</span>
            </div>
          )}

          {spec.decoration === 'blush-ribbon' && (
            <div className="w-full flex items-center justify-center">
              <svg
                viewBox="0 0 80 34"
                className="w-[14cqw] h-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M40 16 C26 4 10 12 20 22 C28 28 36 22 40 18 C44 22 52 28 60 22 C70 12 54 4 40 16 Z"
                  stroke={spec.accentColor}
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <path d="M38 18 L28 31 M42 18 L52 31" stroke={spec.accentColor} strokeWidth="2.4" strokeLinecap="round" />
                <circle cx="40" cy="17" r="3" fill={spec.accentColor} />
              </svg>
            </div>
          )}

          {spec.decoration === 'chrome-y2k' && (
            <div className="w-full flex items-center justify-between px-[1cqw]">
              <svg viewBox="0 0 24 24" className="w-[4.2cqw] h-[4.2cqw]" fill={spec.textColor} aria-hidden="true">
                <path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z" />
              </svg>
              <span className="font-bold tracking-[0.22em]" style={{ fontSize: '2.9cqw' }}>
                {spec.headerTitle}
              </span>
              <svg viewBox="0 0 24 24" className="w-[4.2cqw] h-[4.2cqw]" fill={spec.textColor} aria-hidden="true">
                <path d="M12 1 L14.5 9.5 L23 12 L14.5 14.5 L12 23 L9.5 14.5 L1 12 L9.5 9.5 Z" />
              </svg>
            </div>
          )}

          {spec.decoration === 'linen-serif' && (
            <div className="w-full flex items-center gap-[2.4cqw]">
              <span className="h-px flex-1" style={{ backgroundColor: spec.outerBorderColor }} />
              <span
                className="font-semibold tracking-[0.18em] uppercase whitespace-nowrap"
                style={{ fontSize: '2.2cqw', color: spec.mutedTextColor }}
              >
                {spec.headerTitle}
              </span>
              <span className="h-px flex-1" style={{ backgroundColor: spec.outerBorderColor }} />
            </div>
          )}
        </div>
      )}

      {/* Photo Slots */}
      <div className="absolute inset-0 z-0">
        {slots.map((slot, idx) => {
          const photoSrc = capturedPhotos[slot.photoIdx];
          const isCaptured = Boolean(photoSrc);
          const isActive =
            slot.photoIdx === currentCaptureIndex &&
            (state === 'ready' || state === 'countdown' || state === 'flash');
          const transform = photoTransforms[slot.photoIdx] ?? DEFAULT_PHOTO_TRANSFORM;
          const isSlotSelected = selectedSlotIndex === slot.photoIdx && canModifySlots && !isAdjustingFrame;

          return (
            <div
              key={idx}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleSlotFileDrop(e, slot.photoIdx)}
              onWheel={(e) => isCaptured && handlePhotoWheel(e, slot.photoIdx)}
              className={`absolute overflow-hidden flex items-center justify-center group/slot ${
                isSlotSelected ? 'ring-2 ring-inset ring-white z-20' : ''
              }`}
              style={{
                left: `${slot.leftPercent}%`,
                top: `${slot.topPercent}%`,
                width: `${slot.widthPercent}%`,
                height: `${slot.heightPercent}%`,
                backgroundColor: frameUrl ? '#18181B' : spec.slotBgColor,
                borderRadius: !frameUrl && spec.slotRadiusPercent > 0 ? `${spec.slotRadiusPercent}%` : undefined,
                border: !frameUrl ? `1px solid ${spec.slotBorderColor}` : undefined,
              }}
            >
              {/* Contact sheet or 35mm slot stamp */}
              {!frameUrl && spec.decoration === 'camcorder' && (
                <div className="absolute inset-[3%] pointer-events-none z-20">
                  {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map(
                    (pos, i) => (
                      <span key={i} className={`absolute w-[4.5cqw] h-[4.5cqw] border-white/85 ${pos}`} />
                    )
                  )}
                </div>
              )}

              {isActive && stream ? (
                <LiveVideo
                  stream={stream}
                  isMirrored={isMirrored}
                  cssFilter={activeFilter.cssFilter}
                  className="w-full h-full object-cover"
                />
              ) : isCaptured ? (
                <div
                  onMouseDown={(e) =>
                    canModifySlots &&
                    handlePhotoDragStart(e, slot.photoIdx, e.currentTarget as HTMLDivElement)
                  }
                  onTouchStart={(e) =>
                    canModifySlots &&
                    handlePhotoDragStart(e, slot.photoIdx, e.currentTarget as HTMLDivElement)
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canModifySlots && !isAdjustingFrame) {
                      setSelectedStickerId(null);
                      setSelectedSlotIndex?.(slot.photoIdx);
                    }
                  }}
                  className={`relative w-full h-full ${
                    canModifySlots && !isAdjustingFrame
                      ? 'cursor-grab active:cursor-grabbing touch-none'
                      : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoSrc}
                    alt={`Foto slot ${slot.photoIdx + 1}`}
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={{
                      transform: `translate(${transform.x}%, ${transform.y}%) scale(${transform.zoom})`,
                      transformOrigin: 'center center',
                      filter:
                        activeFilter.cssFilter && activeFilter.cssFilter !== 'none'
                          ? activeFilter.cssFilter
                          : undefined,
                    }}
                  />

                  {/* Slot action controls in Review or Preview */}
                  {canModifySlots && (handleRetakeSingleSlot || handleUploadSingleSlot) && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/slot:opacity-100 sm:focus-within:opacity-100 transition-opacity z-20">
                      {handleRetakeSingleSlot && stream && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetakeSingleSlot(slot.photoIdx);
                          }}
                          aria-label={`Foto ulang slot ${slot.photoIdx + 1}`}
                          title="Foto ulang slot ini"
                          className="p-1.5 rounded-full bg-black/80 hover:bg-black border border-white/25 text-white shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                      {handleUploadSingleSlot && (
                        <button
                          type="button"
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUploadSingleSlot(slot.photoIdx);
                          }}
                          aria-label={`Ganti foto slot ${slot.photoIdx + 1} dari perangkat`}
                          title="Ganti foto dari perangkat"
                          className="p-1.5 rounded-full bg-black/80 hover:bg-black border border-white/25 text-white shadow-md cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-1">
                  {canModifySlots && handleUploadSingleSlot ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUploadSingleSlot(slot.photoIdx);
                      }}
                      aria-label={`Upload foto untuk slot ${slot.photoIdx + 1}`}
                      className="w-full h-full flex flex-col items-center justify-center gap-1 hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                    >
                      <Camera className="w-[7cqw] h-[7cqw] max-w-5 max-h-5 text-zinc-500" aria-hidden="true" />
                      <span className="font-mono text-zinc-400" style={{ fontSize: '2.8cqw' }}>
                        0{slot.photoIdx + 1}
                      </span>
                    </button>
                  ) : (
                    <>
                      <Camera className="w-[7cqw] h-[7cqw] max-w-5 max-h-5 text-zinc-500" aria-hidden="true" />
                      <span className="font-mono text-zinc-500" style={{ fontSize: '2.6cqw' }}>
                        0{slot.photoIdx + 1}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* External slot indices for Contact Sheet & 35mm Film */}
        {!frameUrl &&
          (spec.decoration === 'contact-sheet' || spec.decoration === 'film-35mm') &&
          slots.map((slot, idx) => (
            <span
              key={`idx-${idx}`}
              className="absolute font-mono font-semibold pointer-events-none z-20 leading-none"
              style={{
                left: `${slot.leftPercent + (spec.decoration === 'film-35mm' ? 1 : 0)}%`,
                top: `${Math.max(0.5, slot.topPercent - 1.6)}%`,
                fontSize: spec.decoration === 'film-35mm' ? '2cqw' : '1.7cqw',
                color: spec.decoration === 'film-35mm' ? 'rgba(245,158,11,0.9)' : spec.mutedTextColor,
              }}
            >
              0{slot.photoIdx + 1}A
            </span>
          ))}
      </div>

      {/* Built-In Footer Decoration */}
      {!frameUrl && (
        <div
          className={`absolute bottom-0 left-0 right-0 flex flex-col justify-center items-center z-10 pointer-events-none select-none ${fontClassForStyle(spec.fontStyle)}`}
          style={{
            height: `${paddings.bottomPadding}%`,
            paddingLeft: `${paddings.sidePadding}%`,
            paddingRight: `${paddings.sidePadding}%`,
          }}
        >
          {spec.decoration === 'receipt' ? (
            <div className="w-full h-full flex flex-col items-center justify-evenly border-t border-dashed pt-[1cqw] pb-[1.6cqw]" style={{ borderColor: 'rgba(24,24,27,0.4)' }}>
              <span className="font-bold uppercase tracking-wider truncate max-w-full" style={{ fontSize: '3.5cqw' }}>
                {displayCaption}
              </span>
              {showDate && (
                <span style={{ fontSize: '2.1cqw', color: spec.mutedTextColor }}>
                  {dateText} • QTY {slots.length} SHOTS
                </span>
              )}
              <svg
                viewBox="0 0 100 18"
                preserveAspectRatio="none"
                className="w-[56%] h-[24%]"
                aria-hidden="true"
              >
                {(() => {
                  const total = BARCODE_PATTERN.reduce((a, b) => a + b, 0);
                  let cursor = 0;
                  return BARCODE_PATTERN.map((u, i) => {
                    const x = (cursor / total) * 100;
                    const w = (u / total) * 100;
                    cursor += u;
                    if (i % 2 !== 0) return null;
                    return <rect key={i} x={x} y={0} width={w} height={18} fill={spec.textColor} />;
                  });
                })()}
              </svg>
            </div>
          ) : spec.decoration === 'polaroid' ? (
            <div className="w-full text-center">
              <span className="italic font-semibold block truncate" style={{ fontSize: '4.5cqw' }}>
                {displayCaption}
              </span>
              {showDate && (
                <span
                  className="font-mono block mt-[1.2cqw]"
                  style={{ fontSize: '2.1cqw', color: spec.mutedTextColor }}
                >
                  {dateText}
                </span>
              )}
            </div>
          ) : spec.decoration === 'camcorder' ? (
            <div className="w-full flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider truncate max-w-[60%]" style={{ fontSize: '2.7cqw' }}>
                {displayCaption}
              </span>
              <span style={{ fontSize: '2.3cqw', color: spec.mutedTextColor }}>
                {showDate ? dateText : spec.footerSubtext}
              </span>
            </div>
          ) : (
            <div className="w-full text-center">
              <span
                className={`font-bold block truncate ${spec.fontStyle === 'serif' ? 'italic' : 'uppercase tracking-[0.12em]'}`}
                style={{ fontSize: isWideFrame ? '2.8cqw' : '3.9cqw' }}
              >
                {displayCaption}
              </span>
              {showDate && (
                <span
                  className="font-mono block mt-[0.8cqw] truncate"
                  style={{
                    fontSize: isWideFrame ? '1.65cqw' : '2.2cqw',
                    color: spec.mutedTextColor,
                  }}
                >
                  {spec.footerSubtext ? `${spec.footerSubtext} • ${dateText}` : dateText}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Custom or Sanity PNG Frame Overlay */}
      {frameUrl && (
        <div
          style={{
            position: 'absolute',
            left: selectedTemplate._id === 'custom-user-frame' ? `${customFramePosition.x}%` : '0',
            top: selectedTemplate._id === 'custom-user-frame' ? `${customFramePosition.y}%` : '0',
            width: selectedTemplate._id === 'custom-user-frame' ? `${customFramePosition.w}%` : '100%',
            height: selectedTemplate._id === 'custom-user-frame' ? `${customFramePosition.h}%` : '100%',
            zIndex: 10,
            pointerEvents: isAdjustingFrame ? 'auto' : 'none',
          }}
          className={isAdjustingFrame ? 'border-2 border-dashed border-white cursor-move' : ''}
          onMouseDown={isAdjustingFrame ? handleFrameDragStart : undefined}
          onTouchStart={isAdjustingFrame ? handleFrameDragStart : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameUrl}
            alt={`Frame ${selectedTemplate.name}`}
            className="w-full h-full object-fill pointer-events-none"
          />
          {isAdjustingFrame && (
            <div
              onMouseDown={handleFrameResizeStart}
              onTouchStart={handleFrameResizeStart}
              className="absolute bottom-0 right-0 w-5 h-5 bg-white border-2 border-[#09090B] rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize shadow-lg z-30"
              title="Geser untuk mengubah ukuran frame"
            />
          )}
        </div>
      )}

      {/* Placed Stickers */}
      {placedStickers.map((st) => {
        const isSelected = selectedStickerId === st.id;
        const isInteractable = state !== 'countdown' && state !== 'flash' && !isAdjustingFrame;
        const asset = allStickers.find((a) => a.id === st.stickerId);
        if (!asset) return null;

        return (
          <div
            key={st.id}
            onClick={(e) => {
              e.stopPropagation();
              if (isInteractable) setSelectedStickerId(st.id);
            }}
            onMouseDown={(e) => isInteractable && handleStickerDragStart(e, st.id)}
            onTouchStart={(e) => isInteractable && handleStickerDragStart(e, st.id)}
            className={`absolute select-none p-0.5 rounded-sm flex items-center justify-center ${
              isInteractable ? 'cursor-move' : ''
            } ${isSelected && isInteractable ? 'ring-1 ring-dashed ring-white bg-white/10' : ''}`}
            style={{
              left: `${st.x}%`,
              top: `${st.y}%`,
              transform: `translate(-50%, -50%) rotate(${st.rotation}deg)`,
              width: `${st.size}cqw`,
              height: `${st.size}cqw`,
              lineHeight: 1,
              zIndex: isSelected ? 40 : 30,
            }}
          >
            {asset.isCustom && asset.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={asset.src}
                alt={asset.name}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center pointer-events-none [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                dangerouslySetInnerHTML={{ __html: asset.svg }}
              />
            )}

            {isSelected && isInteractable && (
              <button
                type="button"
                aria-label={`Hapus stiker ${asset.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSticker(st.id);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white border border-white shadow-md cursor-pointer z-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
