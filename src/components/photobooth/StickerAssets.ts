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
    svg: `<svg viewBox="0 0 100 42" width="100" height="42" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="36" height="26" rx="8" fill="#111113" stroke="#ffffff" stroke-width="2.5"/>
      <rect x="58" y="8" width="36" height="26" rx="8" fill="#111113" stroke="#ffffff" stroke-width="2.5"/>
      <path d="M42 16 Q50 11 58 16" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      <path d="M13 15 L24 23" stroke="rgba(255,255,255,0.28)" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M65 15 L76 23" stroke="rgba(255,255,255,0.28)" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'star-shades',
    name: 'Kacamata Bintang',
    svg: `<svg viewBox="0 0 100 46" width="100" height="46" xmlns="http://www.w3.org/2000/svg">
      <polygon points="24,4 29,16 42,16 32,24 36,37 24,29 12,37 16,24 6,16 19,16" fill="#ec4899" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
      <polygon points="76,4 81,16 94,16 84,24 88,37 76,29 64,37 68,24 58,16 71,16" fill="#ec4899" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M39 19 Q50 14 61 19" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'crown',
    name: 'Mahkota Emas',
    svg: `<svg viewBox="0 0 100 80" width="100" height="80" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 68 L20 26 L40 48 L50 16 L60 48 L80 26 L90 68 Z" fill="#f59e0b" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="20" cy="23" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="50" cy="13" r="5.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="80" cy="23" r="5" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="12" y="64" width="76" height="8" rx="4" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'heart',
    name: 'Hati Merah',
    svg: `<svg viewBox="0 0 100 92" width="100" height="92" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 84 C50 84 12 58 12 32 C12 17 24 8 38 8 C45 8 49 13 50 15 C51 13 55 8 62 8 C76 8 88 17 88 32 C88 58 50 84 50 84 Z" fill="#ef4444" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/>
      <path d="M27 24 C22 29 22 38 27 43" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },
  {
    id: 'sparkles',
    name: 'Bintang Kilau',
    svg: `<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 L55 38 L83 43 L55 48 L50 76 L45 48 L17 43 L45 38 Z" fill="#fbbf24" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <path d="M24 62 L26 73 L37 75 L26 77 L24 88 L22 77 L11 75 L22 73 Z" fill="#fde047"/>
      <path d="M77 12 L79 20 L87 22 L79 24 L77 32 L75 24 L67 22 L75 20 Z" fill="#fde047"/>
    </svg>`,
  },
  {
    id: 'ribbon',
    name: 'Pita Pink',
    svg: `<svg viewBox="0 0 100 80" width="100" height="80" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 44 C8 26 26 12 42 29 L50 37 L58 29 C74 12 92 26 86 44 C80 56 64 56 50 42 C36 56 20 56 14 44 Z" fill="#f472b6" stroke="#ffffff" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M48 40 L28 74 L43 68 L50 45 Z" fill="#ec4899" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <path d="M52 40 L72 74 L57 68 L50 45 Z" fill="#ec4899" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="50" cy="39" r="7" fill="#db2777" stroke="#ffffff" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'cat_ears',
    name: 'Telinga Kucing',
    svg: `<svg viewBox="0 0 100 48" width="100" height="48" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 42 L23 8 L45 36 Z" fill="#18181b" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M17 37 L25 18 L36 34 Z" fill="#f472b6"/>
      <path d="M92 42 L77 8 L55 36 Z" fill="#18181b" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M83 37 L75 18 L64 34 Z" fill="#f472b6"/>
    </svg>`,
  },
  {
    id: 'partyhat',
    name: 'Topi Pesta',
    svg: `<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 14 L15 86 L85 86 Z" fill="#6366f1" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M23 70 Q50 64 77 70 L85 86 L15 86 Z" fill="#f43f5e"/>
      <circle cx="50" cy="14" r="8" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/>
      <circle cx="38" cy="48" r="4.5" fill="#38bdf8"/>
      <circle cx="62" cy="44" r="4.5" fill="#34d399"/>
      <circle cx="50" cy="63" r="4.5" fill="#fbbf24"/>
    </svg>`,
  },
  {
    id: 'mustache',
    name: 'Kumis Retro',
    svg: `<svg viewBox="0 0 100 32" width="100" height="32" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 18 Q40 4 24 8 Q10 11 4 21 Q20 24 35 16 Q44 13 50 18 Q56 13 65 16 Q80 24 96 21 Q90 11 76 8 Q60 4 50 18 Z" fill="#18181b" stroke="#ffffff" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'butterfly',
    name: 'Kupu-Kupu',
    svg: `<svg viewBox="0 0 100 84" width="100" height="84" xmlns="http://www.w3.org/2000/svg">
      <path d="M49 42 C36 10 8 10 10 34 C12 46 28 48 48 44 Z" fill="#60a5fa" stroke="#ffffff" stroke-width="2.2"/>
      <path d="M51 42 C64 10 92 10 90 34 C88 46 72 48 52 44 Z" fill="#60a5fa" stroke="#ffffff" stroke-width="2.2"/>
      <path d="M48 45 C30 48 16 62 24 72 C32 80 46 66 49 48 Z" fill="#93c5fd" stroke="#ffffff" stroke-width="2.2"/>
      <path d="M52 45 C70 48 84 62 76 72 C68 80 54 66 51 48 Z" fill="#93c5fd" stroke="#ffffff" stroke-width="2.2"/>
      <rect x="47" y="24" width="6" height="40" rx="3" fill="#1e293b" stroke="#ffffff" stroke-width="1.5"/>
    </svg>`,
  },
  {
    id: 'daisy',
    name: 'Bunga Daisy',
    svg: `<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <g fill="#ffffff" stroke="#e4e4e7" stroke-width="1.8">
        <ellipse cx="50" cy="22" rx="11" ry="18"/>
        <ellipse cx="50" cy="78" rx="11" ry="18"/>
        <ellipse cx="22" cy="50" rx="18" ry="11"/>
        <ellipse cx="78" cy="50" rx="18" ry="11"/>
        <ellipse cx="30" cy="30" rx="11" ry="17" transform="rotate(-45 30 30)"/>
        <ellipse cx="70" cy="70" rx="11" ry="17" transform="rotate(-45 70 70)"/>
        <ellipse cx="70" cy="30" rx="11" ry="17" transform="rotate(45 70 30)"/>
        <ellipse cx="30" cy="70" rx="11" ry="17" transform="rotate(45 30 70)"/>
      </g>
      <circle cx="50" cy="50" r="15" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'cherry',
    name: 'Ceri Manis',
    svg: `<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 62 Q42 26 62 16 Q66 36 70 64" fill="none" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M62 16 Q80 12 84 26 Q68 30 62 16 Z" fill="#22c55e" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="30" cy="70" r="18" fill="#e11d48" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="70" cy="72" r="18" fill="#be123c" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="24" cy="64" r="4" fill="rgba(255,255,255,0.45)"/>
      <circle cx="64" cy="66" r="4" fill="rgba(255,255,255,0.45)"/>
    </svg>`,
  },
  {
    id: 'lightning',
    name: 'Petir Kuning',
    svg: `<svg viewBox="0 0 80 100" width="80" height="100" xmlns="http://www.w3.org/2000/svg">
      <polygon points="48,6 14,54 38,54 30,94 66,44 42,44" fill="#facc15" stroke="#18181b" stroke-width="3.5" stroke-linejoin="round"/>
    </svg>`,
  },
  {
    id: 'film-cam',
    name: 'Kamera Retro',
    svg: `<svg viewBox="0 0 100 76" width="100" height="76" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="18" width="84" height="50" rx="8" fill="#18181b" stroke="#ffffff" stroke-width="2.5"/>
      <rect x="8" y="18" width="84" height="16" rx="4" fill="#d4d4d8" stroke="#ffffff" stroke-width="1.5"/>
      <rect x="18" y="10" width="22" height="10" rx="3" fill="#a1a1aa" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="54" cy="45" r="16" fill="#27272a" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="54" cy="45" r="9" fill="#09090b" stroke="#71717a" stroke-width="1.5"/>
      <circle cx="51" cy="42" r="2.5" fill="rgba(255,255,255,0.6)"/>
      <circle cx="24" cy="40" r="4" fill="#ef4444"/>
    </svg>`,
  },
  {
    id: 'tape-strip',
    name: 'Washi Tape',
    svg: `<svg viewBox="0 0 120 36" width="120" height="36" xmlns="http://www.w3.org/2000/svg">
      <polygon points="4,4 116,4 112,12 118,18 112,26 116,32 4,32 8,24 2,18 8,10" fill="rgba(253,230,138,0.88)" stroke="rgba(180,83,9,0.35)" stroke-width="1.5"/>
      <line x1="18" y1="4" x2="18" y2="32" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
      <line x1="42" y1="4" x2="42" y2="32" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
      <line x1="66" y1="4" x2="66" y2="32" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
      <line x1="90" y1="4" x2="90" y2="32" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
    </svg>`,
  },
  {
    id: 'stamp-captured',
    name: 'Stempel Captured',
    svg: `<svg viewBox="0 0 120 52" width="120" height="52" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="112" height="44" rx="6" fill="rgba(225,29,72,0.12)" stroke="#e11d48" stroke-width="3.5"/>
      <rect x="9" y="9" width="102" height="34" rx="3" fill="none" stroke="#e11d48" stroke-width="1.2" stroke-dasharray="4 3"/>
      <text x="60" y="32" text-anchor="middle" fill="#e11d48" font-family="monospace" font-size="16" font-weight="700" letter-spacing="2">CAPTURED</text>
    </svg>`,
  },
  {
    id: 'badge-best',
    name: 'Badge Best Moment',
    svg: `<svg viewBox="0 0 130 46" width="130" height="46" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="124" height="40" rx="20" fill="#111113" stroke="#ffffff" stroke-width="2.5"/>
      <text x="65" y="28" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="1.4">BEST MOMENT</text>
    </svg>`,
  },
  {
    id: 'vinyl-disc',
    name: 'Piringan Vinyl',
    svg: `<svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="#111113" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="26" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="16" fill="#f97316" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="50" cy="50" r="4.5" fill="#111113"/>
    </svg>`,
  },
];

export const drawContainedImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
) => {
  const natW = img.naturalWidth || img.width || boxW;
  const natH = img.naturalHeight || img.height || boxH;
  const scale = Math.min(boxW / natW, boxH / natH);
  const drawW = natW * scale;
  const drawH = natH * scale;
  const dx = boxX + (boxW - drawW) / 2;
  const dy = boxY + (boxH - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
};

export const drawSvgSticker = (
  ctx: CanvasRenderingContext2D,
  svgStr: string,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
): Promise<void> => {
  return new Promise<void>((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
    img.onload = () => {
      drawContainedImage(ctx, img, boxX, boxY, boxW, boxH);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
  });
};
