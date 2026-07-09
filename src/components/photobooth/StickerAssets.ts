export interface StickerAsset {
  id: string;
  name: string;
  svg: string;
  isCustom?: boolean;
  src?: string;
}

export const STICKER_ASSETS: StickerAsset[] = [
  {
    id: 'glasses',
    name: 'Kacamata Hitam',
    svg: `<svg viewBox="0 0 100 40" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 10 H35 V28 C35 32 30 35 25 35 C20 35 15 32 15 28 Z" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
      <path d="M65 10 H85 V28 C85 32 80 35 75 35 C70 35 65 32 65 28 Z" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
      <path d="M35 15 Q50 20 65 15" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <path d="M18 14 L28 20" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-linecap="round"/>
      <path d="M68 14 L78 20" stroke="rgba(255,255,255,0.15)" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'crown',
    name: 'Mahkota Emas',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 70 L20 30 L40 50 L50 20 L60 50 L80 30 L90 70 Z" fill="#f59e0b" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="20" cy="27" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
      <circle cx="50" cy="17" r="5" fill="#3b82f6" stroke="#ffffff" stroke-width="1"/>
      <circle cx="80" cy="27" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1"/>
      <ellipse cx="50" cy="70" rx="40" ry="6" fill="#d97706"/>
    </svg>`
  },
  {
    id: 'heart',
    name: 'Cinta',
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 85 C50 85 15 60 15 35 C15 20 27 10 40 10 C47 10 50 15 50 15 C50 15 53 10 60 10 C73 10 85 20 85 35 C85 60 50 85 50 85 Z" fill="#ef4444" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
      <path d="M30 25 C25 30 25 40 30 45" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: 'mustache',
    name: 'Kumis Retro',
    svg: `<svg viewBox="0 0 100 30" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 18 Q40 5 25 8 Q10 11 5 20 Q20 22 35 15 Q45 13 50 18 Q55 13 65 15 Q80 22 95 20 Q90 11 75 8 Q60 5 50 18 Z" fill="#18181b" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  },
  {
    id: 'sparkles',
    name: 'Sparkle Emas',
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 L53 38 L76 41 L53 44 L50 67 L47 44 L24 41 L47 38 Z" fill="#fbbf24"/>
      <path d="M25 60 L26 70 L36 71 L26 72 L25 82 L24 72 L14 71 L24 70 Z" fill="#fbbf24"/>
      <path d="M75 15 L76 22 L83 23 L76 24 L75 31 L74 24 L67 23 L74 22 Z" fill="#fbbf24"/>
    </svg>`
  },
  {
    id: 'partyhat',
    name: 'Topi Party',
    svg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 15 L15 85 L85 85 Z" fill="#8b5cf6" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <path d="M23 70 Q50 65 77 70 L85 85 L15 85 Z" fill="#f43f5e"/>
      <circle cx="50" cy="15" r="7" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="35" cy="50" r="4" fill="#3b82f6"/>
      <circle cx="65" cy="45" r="4" fill="#10b981"/>
      <circle cx="50" cy="65" r="4.5" fill="#fbbf24"/>
    </svg>`
  },
  {
    id: 'ribbon',
    name: 'Pita Pink',
    svg: `<svg viewBox="0 0 100 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 45 C10 30 25 15 40 30 C50 38 50 38 50 38 C50 38 50 38 60 30 C75 15 90 30 85 45 C80 55 65 55 50 42 C35 55 20 55 15 45 Z" fill="#ec4899" stroke="#ffffff" stroke-width="2"/>
      <path d="M50 38 L30 75 L45 70 L50 45 Z" fill="#db2777" stroke="#ffffff" stroke-width="1.5"/>
      <path d="M50 38 L70 75 L55 70 L50 45 Z" fill="#db2777" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="50" cy="39" r="6" fill="#ec4899" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`
  },
  {
    id: 'cat_ears',
    name: 'Telinga Kucing',
    svg: `<svg viewBox="0 0 100 50" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 40 L25 10 L45 35 Z" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
      <path d="M18 37 L26 18 L36 34 Z" fill="#f472b6"/>
      <path d="M90 40 L75 10 L55 35 Z" fill="#18181b" stroke="#ffffff" stroke-width="2"/>
      <path d="M82 37 L74 18 L64 34 Z" fill="#f472b6"/>
    </svg>`
  }
];

export const drawSvgSticker = (ctx: CanvasRenderingContext2D, svgStr: string, x: number, y: number, w: number, h: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = () => {
      ctx.drawImage(img, x, y, w, h);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
  });
};
