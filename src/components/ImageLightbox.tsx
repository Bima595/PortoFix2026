'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  images: { url: string; alt: string }[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ImageLightbox({
  isOpen,
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];
  const showNavigation = images.length > 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={currentImage.alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-zinc-900/90 text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Close preview"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {showNavigation && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute top-1/2 left-4 z-10 inline-flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-900/90 text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {showNavigation && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute top-1/2 right-4 z-10 inline-flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-900/90 text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Next image"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      <div
        className="relative h-[82vh] w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          fill
          className="object-contain"
          quality={95}
          sizes="(max-width: 1024px) 95vw, 1024px"
        />
      </div>

      <div className="pointer-events-none absolute right-4 bottom-5 left-4 z-10 flex flex-col items-center gap-1.5 text-center">
        <p className="max-w-xl rounded-full border border-white/10 bg-zinc-950/90 px-4 py-1.5 text-xs font-medium text-zinc-100 sm:text-sm">
          {currentImage.alt}
        </p>
        {showNavigation && (
          <span className="text-xs tabular-nums text-zinc-400">
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
}
