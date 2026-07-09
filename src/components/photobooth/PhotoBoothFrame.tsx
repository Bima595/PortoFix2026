import React from 'react';
import { Camera, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import LiveVideo from './LiveVideo';
import { StickerAsset } from './StickerAssets';
import { getLayoutDimensions, getTemplateSlots } from './PhotoBoothHelpers';
import { PhotoboothTemplate } from '@/types/portfolio';
import { BoothState, PlacedSticker, PhotoFilter } from './PhotoBoothTypes';

interface PhotoBoothFrameProps {
  selectedTemplate: PhotoboothTemplate;
  templateAspectRatio: number | null;
  customFrameImage: string | null;
  capturedPhotos: string[];
  currentCaptureIndex: number;
  state: BoothState;
  stream: MediaStream | null;
  isMirrored: boolean;
  activeFilter: PhotoFilter;
  placedStickers: PlacedSticker[];
  setPlacedStickers: React.Dispatch<React.SetStateAction<PlacedSticker[]>>;
  selectedStickerId: string | null;
  setSelectedStickerId: React.Dispatch<React.SetStateAction<string | null>>;
  handleRetakeSingleSlot: (idx: number) => void;
  mode?: 'setup' | 'preview';
  containerRef: React.RefObject<HTMLDivElement | null>;
  allStickers: StickerAsset[];
  customFramePosition?: { x: number; y: number; w: number; h: number };
  setCustomFramePosition?: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number }>>;
  isAdjustingFrame?: boolean;
}

export default function PhotoBoothFrame({
  selectedTemplate,
  templateAspectRatio,
  customFrameImage,
  capturedPhotos,
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
  mode = 'setup',
  containerRef,
  allStickers,
  customFramePosition = { x: 0, y: 0, w: 100, h: 100 },
  setCustomFramePosition,
  isAdjustingFrame = false
}: PhotoBoothFrameProps) {
  const dims = getLayoutDimensions(selectedTemplate, templateAspectRatio);
  const layout = selectedTemplate.layout;
  const isLocal = selectedTemplate._id.startsWith('local-');
  
  // Background and text colors for fallbacks
  let bgClass = 'bg-white text-zinc-950 border-zinc-200';
  if (selectedTemplate._id === 'local-black-strip') {
    bgClass = 'bg-zinc-900 border-zinc-800 text-zinc-400';
  } else if (selectedTemplate._id === 'local-film-strip') {
    bgClass = 'bg-zinc-950 border-zinc-900 text-zinc-500';
  }

  const frameUrl = selectedTemplate._id === 'custom-user-frame'
    ? customFrameImage
    : (!isLocal && selectedTemplate.frameImage) 
    ? urlFor(selectedTemplate.frameImage).url() 
    : null;

  // Use percentage-based slots
  const slots = getTemplateSlots(selectedTemplate, templateAspectRatio);

  // Dynamic aspect ratio based on natural size or defaults
  const aspect = (frameUrl && templateAspectRatio) 
    ? templateAspectRatio 
    : (dims.totalWidth / dims.totalHeight);

  const sizeClass = mode === 'preview' 
    ? 'w-[240px] md:w-[300px] lg:w-[340px]' 
    : 'w-[160px] lg:w-[220px]';

  const handleDeleteSticker = (id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
    setSelectedStickerId(null);
  };

  const handleStickerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const stickerId = e.dataTransfer.getData('text/plain');
    if (!stickerId) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    const xPercent = Math.max(0, Math.min(100, (xPx / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (yPx / rect.height) * 100));

    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      stickerId,
      x: xPercent,
      y: yPercent,
      size: 15,
      rotation: 0,
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleStickerDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    setSelectedStickerId(id);
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const xPx = clientX - rect.left;
      const yPx = clientY - rect.top;
      
      const xPercent = Math.max(0, Math.min(100, (xPx / rect.width) * 100));
      const yPercent = Math.max(0, Math.min(100, (yPx / rect.height) * 100));
      
      setPlacedStickers(prev => prev.map(st => 
        st.id === id ? { ...st, x: xPercent, y: yPercent } : st
      ));
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const handleFrameDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!setCustomFramePosition) return;
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const initialX = customFramePosition.x;
    const initialY = customFramePosition.y;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dxPx = clientX - startX;
      const dyPx = clientY - startY;
      
      const dxPercent = (dxPx / rect.width) * 100;
      const dyPercent = (dyPx / rect.height) * 100;
      
      const newX = Math.max(-100, Math.min(100, initialX + dxPercent));
      const newY = Math.max(-100, Math.min(100, initialY + dyPercent));
      
      setCustomFramePosition({
        ...customFramePosition,
        x: newX,
        y: newY
      });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  const handleFrameResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!setCustomFramePosition) return;
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const initialW = customFramePosition.w;
    const initialH = customFramePosition.h;
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const clientY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const dxPx = clientX - startX;
      const dyPx = clientY - startY;
      
      const dwPercent = (dxPx / rect.width) * 100;
      const dhPercent = (dyPx / rect.height) * 100;
      
      const newW = Math.max(10, Math.min(300, initialW + dwPercent));
      const newH = Math.max(10, Math.min(300, initialH + dhPercent));
      
      setCustomFramePosition({
        ...customFramePosition,
        w: newW,
        h: newH
      });
    };

    const handleUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
  };

  return (
    <div 
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleStickerDrop}
      className={`relative shadow-2xl rounded-lg overflow-hidden select-none border transition-colors duration-300 ${sizeClass} ${
        frameUrl ? 'border-zinc-800 bg-zinc-950 animate-fade-in' : bgClass
      }`}
      style={{ 
        aspectRatio: String(aspect),
        containerType: 'inline-size'
      }}
    >
      {selectedTemplate._id === 'custom-user-frame' && !customFrameImage && (
        <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-zinc-700 rounded-lg z-30 pointer-events-none">
          <ImageIcon className="w-8 h-8 text-zinc-500 mb-2 animate-pulse" />
          <p className="text-zinc-400 text-2xs font-medium">Belum Ada Frame</p>
          <p className="text-zinc-600 text-3xs mt-1">Upload gambar PNG transparan di panel kanan</p>
        </div>
      )}
      
      {/* Film sprocket holes for Retro Film strip */}
      {!frameUrl && selectedTemplate._id === 'local-film-strip' && (
        <div className="absolute inset-y-0 left-1 right-1 flex justify-between pointer-events-none z-20">
          <div className="flex flex-col justify-around h-full py-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-1.5 bg-black rounded-xs border border-white/5" />
            ))}
          </div>
          <div className="flex flex-col justify-around h-full py-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-1 h-1.5 bg-black rounded-xs border border-white/5" />
            ))}
          </div>
        </div>
      )}

      {/* Photo Slots */}
      <div className="absolute inset-0 z-0">
        {slots.map((slot, idx) => {
          const isCaptured = slot.photoIdx < capturedPhotos.length;
          const isActive = slot.photoIdx === currentCaptureIndex && (state === 'ready' || state === 'countdown' || state === 'flash');

          return (
            <div 
              key={idx} 
              className="absolute bg-zinc-850 border border-black/10 overflow-hidden flex items-center justify-center"
              style={{
                left: `${slot.leftPercent}%`,
                top: `${slot.topPercent}%`,
                width: `${slot.widthPercent}%`,
                height: `${slot.heightPercent}%`,
              }}
            >
              {isActive && stream ? (
                <LiveVideo 
                  stream={stream} 
                  isMirrored={isMirrored} 
                  filterClass={activeFilter.class} 
                  className="w-full h-full object-cover"
                />
              ) : isCaptured && capturedPhotos[slot.photoIdx] ? (
                <div className="relative w-full h-full group/slot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={capturedPhotos[slot.photoIdx]} 
                    alt={`Captured ${slot.photoIdx}`} 
                    className={`w-full h-full object-cover ${activeFilter.class}`} 
                  />
                  
                  {/* Floating Retake Button in review state */}
                  {state === 'review' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRetakeSingleSlot(slot.photoIdx);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-zinc-900 border border-white/20 text-white transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer z-25"
                      title="Foto Ulang Slot Ini"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              ) : (
                <Camera className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Local template text footer decoration */}
      {!frameUrl && (
        <div 
          className="absolute bottom-0 left-0 right-0 text-center flex flex-col justify-center items-center z-10 pointer-events-none select-none"
          style={{ height: `${(dims.footerH / dims.totalHeight) * 100}%` }}
        >
          {layout === 'strip' ? (
            <>
              <span className="text-[7px] font-bold tracking-wider uppercase block truncate max-w-[90%]">
                Satriabanyu Photo Booth Online
              </span>
              <span className="text-[5px] font-mono text-zinc-550 block mt-0.5">
                {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </span>
            </>
          ) : layout === 'grid' ? (
            <>
              <span className="text-[7px] font-bold tracking-widest uppercase block text-zinc-950">Satriabanyu Photo Booth Online</span>
              <span className="text-[5px] text-zinc-550 block mt-0.5">• PHOTO BOOTH •</span>
            </>
          ) : (
            <span className="text-[8px] font-serif italic block text-zinc-800">Satriabanyu Photo Booth Online</span>
          )}
        </div>
      )}

      {/* Frame Overlay Image */}
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
          className={isAdjustingFrame ? 'border-2 border-dashed border-amber-500 cursor-move' : ''}
          onMouseDown={isAdjustingFrame ? handleFrameDragStart : undefined}
          onTouchStart={isAdjustingFrame ? handleFrameDragStart : undefined}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={frameUrl} 
            alt="Frame Overlay" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              pointerEvents: 'none'
            }} 
          />
          {isAdjustingFrame && (
            <div
              onMouseDown={handleFrameResizeStart}
              onTouchStart={handleFrameResizeStart}
              className="absolute bottom-0 right-0 w-4 h-4 bg-amber-500 border border-white rounded-full translate-x-1/2 translate-y-1/2 cursor-se-resize flex items-center justify-center shadow-lg z-30"
              title="Drag untuk Ubah Ukuran Frame"
            />
          )}
        </div>
      )}

      {/* Placed Stickers */}
      {placedStickers.map((st) => {
        const isSelected = selectedStickerId === st.id;
        const isInteractable = state !== 'countdown' && state !== 'flash' && state !== 'processing' && !isAdjustingFrame;
        return (
          <div
            key={st.id}
            onMouseDown={(e) => isInteractable && handleStickerDragStart(e, st.id)}
            onTouchStart={(e) => isInteractable && handleStickerDragStart(e, st.id)}
            className={`absolute select-none p-0.5 rounded-xs flex items-center justify-center ${
              isInteractable ? 'cursor-move' : ''
            } ${
              isSelected && isInteractable ? 'border border-dashed border-zinc-100 bg-white/10' : ''
            }`}
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
            {(() => {
              const asset = allStickers.find(a => a.id === st.stickerId);
              if (!asset) return null;
              if (asset.isCustom && asset.src) {
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={asset.src} 
                    alt={asset.name} 
                    className="w-full h-full object-contain pointer-events-none" 
                  />
                );
              }
              return (
                <div 
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                  dangerouslySetInnerHTML={{ __html: asset.svg }} 
                />
              );
            })()}
            
            {isSelected && isInteractable && (
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDeleteSticker(st.id);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  handleDeleteSticker(st.id);
                }}
                className="absolute -top-2 -right-2 w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white shadow-lg cursor-pointer z-40"
                title="Hapus Stiker"
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
