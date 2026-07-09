import { PhotoboothTemplate } from '@/types/portfolio';

export type BoothState = 'idle' | 'ready' | 'countdown' | 'flash' | 'processing' | 'review' | 'preview';

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number; // percentage
  y: number; // percentage
  size: number; // cqw scale
  rotation: number; // degrees
}

export interface PhotoFilter {
  id: string;
  name: string;
  class: string;
  canvasFilter: string;
}

export interface SlotCoordinate {
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  heightPercent: number;
  photoIdx: number;
}

export const PHOTO_FILTERS: PhotoFilter[] = [
  { id: 'normal', name: 'Normal', class: '', canvasFilter: 'none' },
  { id: 'grayscale', name: 'B&W', class: 'grayscale', canvasFilter: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', class: 'sepia', canvasFilter: 'sepia(80%)' },
  { id: 'vintage', name: 'Vintage', class: 'sepia(30%) contrast(1.1) brightness(0.95) saturate(1.2)', canvasFilter: 'sepia(30%) contrast(1.1) brightness(0.95) saturate(1.2)' },
  { id: 'warm', name: 'Warm', class: 'hue-rotate(-10deg) saturate(1.1)', canvasFilter: 'hue-rotate(-10deg) saturate(1.1)' },
  { id: 'cool', name: 'Cool', class: 'hue-rotate(10deg) saturate(0.9) brightness(1.05)', canvasFilter: 'hue-rotate(10deg) saturate(0.9) brightness(1.05)' },
  { id: 'cyberpunk', name: 'Cyberpunk', class: 'contrast(1.3) hue-rotate(180deg) saturate(1.5)', canvasFilter: 'contrast(1.3) hue-rotate(180deg) saturate(1.5)' },
];

export const LOCAL_TEMPLATES: PhotoboothTemplate[] = [
  {
    _id: 'local-white-strip',
    name: 'Classic White Strip',
    maxPhotos: 4,
    layout: 'strip',
    isActive: true,
  },
  {
    _id: 'local-black-strip',
    name: 'Classic Black Strip',
    maxPhotos: 4,
    layout: 'strip',
    isActive: true,
  },
  {
    _id: 'local-film-strip',
    name: 'Retro Film Strip',
    maxPhotos: 3,
    layout: 'strip',
    isActive: true,
  },
  {
    _id: 'local-grid',
    name: 'Classic 2x2 Grid',
    maxPhotos: 4,
    layout: 'grid',
    isActive: true,
  },
  {
    _id: 'local-polaroid',
    name: 'Polaroid Single',
    maxPhotos: 1,
    layout: 'single',
    isActive: true,
  }
];

export const DEFAULT_PADDINGS = {
  strip: {
    topPadding: 3,
    bottomPadding: 10,
    sidePadding: 4,
    rowSpacing: 2,
    colSpacing: 4,
  },
  grid: {
    topPadding: 5,
    bottomPadding: 15,
    sidePadding: 4,
    rowSpacing: 3,
    colSpacing: 3,
  },
  single: {
    topPadding: 6,
    bottomPadding: 22,
    sidePadding: 6,
    rowSpacing: 0,
    colSpacing: 0,
  }
};

export const DEFAULT_CUSTOM_PADDINGS = {
  strip: {
    topPadding: 3,
    bottomPadding: 4,
    sidePadding: 2,
    rowSpacing: 1.5,
    colSpacing: 2,
  },
  grid: {
    topPadding: 3,
    bottomPadding: 4,
    sidePadding: 2,
    rowSpacing: 1.5,
    colSpacing: 2,
  },
  single: {
    topPadding: 3,
    bottomPadding: 4,
    sidePadding: 2,
    rowSpacing: 0,
    colSpacing: 0,
  }
};
