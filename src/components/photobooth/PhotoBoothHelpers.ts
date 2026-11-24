import { PhotoboothTemplate } from '@/types/portfolio';
import {
  BUILTIN_FRAME_SPECS,
  DEFAULT_CUSTOM_PADDINGS,
  DEFAULT_PADDINGS,
  DEFAULT_PHOTO_TRANSFORM,
  FrameStyleSpec,
  PhotoTransform,
  SlotCoordinate,
} from './PhotoBoothTypes';

// Reuse a single lazy AudioContext to avoid exhausting browser limits across shots
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
};

export const playSound = (type: 'beep' | 'shutter', enabled = true) => {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;

    if (type === 'beep') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'shutter') {
      const bufferSize = Math.floor(audioCtx.sampleRate * 0.18);
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.32, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.16);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
      noise.stop(audioCtx.currentTime + 0.18);
    }
  } catch (err) {
    console.error('Audio playback failed', err);
  }
};

export const getFrameSpec = (templateId: string): FrameStyleSpec => {
  return BUILTIN_FRAME_SPECS[templateId] ?? BUILTIN_FRAME_SPECS['local-white-strip'];
};

export const formatBoothDate = (date = new Date()): string => {
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

export const getTemplateGridShape = (temp: PhotoboothTemplate, aspectRatio: number | null) => {
  const layout = temp.layout;
  const isLocal = temp._id.startsWith('local-');
  const isDoubleStrip = layout === 'strip' && !isLocal && aspectRatio !== null && aspectRatio > 0.45;

  let cols = 1;
  let rows = 1;
  if (layout === 'strip') {
    cols = isDoubleStrip ? 2 : 1;
    rows = isDoubleStrip ? Math.ceil(temp.maxPhotos / 2) : temp.maxPhotos;
  } else if (layout === 'grid') {
    cols = temp.maxPhotos === 1 ? 1 : 2;
    rows = Math.ceil(temp.maxPhotos / cols);
  } else {
    cols = 1;
    rows = 1;
  }

  return { cols, rows, isDoubleStrip, isLocal };
};

export const getTemplatePaddings = (temp: PhotoboothTemplate) => {
  const isLocal = temp._id.startsWith('local-');
  const defaults = isLocal
    ? DEFAULT_PADDINGS[temp.layout] || DEFAULT_PADDINGS.strip
    : DEFAULT_CUSTOM_PADDINGS[temp.layout] || DEFAULT_CUSTOM_PADDINGS.strip;

  return {
    topPadding: typeof temp.topPadding === 'number' ? temp.topPadding : defaults.topPadding,
    bottomPadding: typeof temp.bottomPadding === 'number' ? temp.bottomPadding : defaults.bottomPadding,
    sidePadding: typeof temp.sidePadding === 'number' ? temp.sidePadding : defaults.sidePadding,
    rowSpacing: typeof temp.rowSpacing === 'number' ? temp.rowSpacing : defaults.rowSpacing,
    colSpacing: typeof temp.colSpacing === 'number' ? temp.colSpacing : defaults.colSpacing,
  };
};

// Computes exact HD export canvas dimensions so each slot matches targetPhotoAspect seamlessly
export const getLayoutDimensions = (temp: PhotoboothTemplate, aspectRatio: number | null) => {
  const { cols, rows, isDoubleStrip, isLocal } = getTemplateGridShape(temp, aspectRatio);
  const { topPadding, bottomPadding, sidePadding, rowSpacing, colSpacing } = getTemplatePaddings(temp);

  const spec = isLocal ? getFrameSpec(temp._id) : null;
  const targetPhotoAspect = spec ? spec.targetPhotoAspect : 4 / 3;
  const totalWidth = spec
    ? spec.exportWidth
    : temp.layout === 'grid' || isDoubleStrip
      ? 1400
      : temp.layout === 'single'
        ? 1200
        : 1080;

  const availWPercent = Math.max(10, 100 - sidePadding * 2 - (cols - 1) * colSpacing);
  const slotWPercent = availWPercent / cols;

  const availHPercent = Math.max(10, 100 - topPadding - bottomPadding - (rows - 1) * rowSpacing);
  const slotHPercent = availHPercent / rows;

  const totalHeight = Math.round((totalWidth * (slotWPercent / slotHPercent)) / targetPhotoAspect);

  return {
    totalWidth,
    totalHeight,
    topPadding,
    bottomPadding,
    sidePadding,
    isDoubleStrip,
  };
};

export const getTemplateSlots = (
  temp: PhotoboothTemplate,
  aspectRatio: number | null,
  detectedSlots?: SlotCoordinate[] | null
): SlotCoordinate[] => {
  if (
    !temp._id.startsWith('local-') &&
    detectedSlots &&
    detectedSlots.length > 0
  ) {
    return detectedSlots;
  }

  const { cols, rows, isDoubleStrip, isLocal } = getTemplateGridShape(temp, aspectRatio);
  const { topPadding, bottomPadding, sidePadding, rowSpacing, colSpacing } = getTemplatePaddings(temp);

  const availW = 100 - sidePadding * 2;
  const slotW = (availW - (cols - 1) * colSpacing) / cols;

  const availH = 100 - topPadding - bottomPadding;
  const slotH = (availH - (rows - 1) * rowSpacing) / rows;

  // Apply tiny bleed for custom PNG overlays to prevent subpixel gaps
  const bleedW = isLocal ? 0 : 1.4;
  const bleedH = isLocal ? 0 : 1.4;

  const slots: SlotCoordinate[] = [];

  if (temp.layout === 'strip' && isDoubleStrip) {
    for (let r = 0; r < rows; r++) {
      const top = topPadding + r * (slotH + rowSpacing);
      const leftL = sidePadding;
      const leftR = sidePadding + slotW + colSpacing;

      slots.push({
        leftPercent: leftL - bleedW / 2,
        topPercent: top - bleedH / 2,
        widthPercent: slotW + bleedW,
        heightPercent: slotH + bleedH,
        photoIdx: r * 2,
      });

      if (r * 2 + 1 < temp.maxPhotos) {
        slots.push({
          leftPercent: leftR - bleedW / 2,
          topPercent: top - bleedH / 2,
          widthPercent: slotW + bleedW,
          heightPercent: slotH + bleedH,
          photoIdx: r * 2 + 1,
        });
      }
    }
  } else if (temp.layout === 'grid') {
    for (let idx = 0; idx < temp.maxPhotos; idx++) {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const left = sidePadding + c * (slotW + colSpacing);
      const top = topPadding + r * (slotH + rowSpacing);
      slots.push({
        leftPercent: left - bleedW / 2,
        topPercent: top - bleedH / 2,
        widthPercent: slotW + bleedW,
        heightPercent: slotH + bleedH,
        photoIdx: idx,
      });
    }
  } else {
    for (let r = 0; r < rows; r++) {
      const left = sidePadding;
      const top = topPadding + r * (slotH + rowSpacing);
      slots.push({
        leftPercent: left - bleedW / 2,
        topPercent: top - bleedH / 2,
        widthPercent: slotW + bleedW,
        heightPercent: slotH + bleedH,
        photoIdx: r,
      });
    }
  }

  return slots;
};

export const drawRoundedRectPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) => {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const drawCoverImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radiusPx = 0,
  transform: PhotoTransform = DEFAULT_PHOTO_TRANSFORM
) => {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  const tx = (transform.x / 100) * w;
  const ty = (transform.y / 100) * h;
  const zoom = Math.max(0.5, transform.zoom || 1);

  ctx.save();
  if (radiusPx > 0) {
    drawRoundedRectPath(ctx, x, y, w, h, radiusPx);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  }
  ctx.clip();

  // Matches CSS transform: translate(x%, y%) scale(zoom) with transform-origin: center
  ctx.translate(x + w / 2 + tx, y + h / 2 + ty);
  ctx.scale(zoom, zoom);
  ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  ctx.restore();
};

export interface DetectedPngFrameResult {
  slots: SlotCoordinate[];
  aspectRatio: number;
  layout: 'strip' | 'grid' | 'single';
}

// Automatically detects interior transparent cutouts in an uploaded or CMS PNG frame
export const detectTransparentSlotsFromPng = (
  imageUrl: string
): Promise<DetectedPngFrameResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    if (!imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const natW = img.naturalWidth || 1;
      const natH = img.naturalHeight || 1;
      const aspectRatio = natW / natH;

      const maxDim = 260;
      const scale = Math.min(1, maxDim / Math.max(natW, natH));
      const w = Math.max(16, Math.round(natW * scale));
      const h = Math.max(16, Math.round(natH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve({ slots: [], aspectRatio, layout: 'strip' });
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      const totalPixels = w * h;
      const isTransparent = new Uint8Array(totalPixels);
      for (let i = 0; i < totalPixels; i++) {
        if (data[i * 4 + 3] < 48) {
          isTransparent[i] = 1;
        }
      }

      const visited = new Uint8Array(totalPixels);
      const queue = new Int32Array(totalPixels);

      const floodFill = (startIdx: number) => {
        let head = 0;
        let tail = 0;
        queue[tail++] = startIdx;
        visited[startIdx] = 1;

        let minX = w;
        let maxX = 0;
        let minY = h;
        let maxY = 0;
        let count = 0;

        while (head < tail) {
          const idx = queue[head++];
          const px = idx % w;
          const py = (idx - px) / w;
          count++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;

          if (px > 0) {
            const n = idx - 1;
            if (isTransparent[n] && !visited[n]) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
          if (px < w - 1) {
            const n = idx + 1;
            if (isTransparent[n] && !visited[n]) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
          if (py > 0) {
            const n = idx - w;
            if (isTransparent[n] && !visited[n]) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
          if (py < h - 1) {
            const n = idx + w;
            if (isTransparent[n] && !visited[n]) {
              visited[n] = 1;
              queue[tail++] = n;
            }
          }
        }

        return { minX, maxX, minY, maxY, count };
      };

      // 1. Mark exterior transparent pixels connected to outer frame edges
      for (let x = 0; x < w; x++) {
        const topIdx = x;
        if (isTransparent[topIdx] && !visited[topIdx]) floodFill(topIdx);
        const botIdx = (h - 1) * w + x;
        if (isTransparent[botIdx] && !visited[botIdx]) floodFill(botIdx);
      }
      for (let y = 0; y < h; y++) {
        const leftIdx = y * w;
        if (isTransparent[leftIdx] && !visited[leftIdx]) floodFill(leftIdx);
        const rightIdx = y * w + (w - 1);
        if (isTransparent[rightIdx] && !visited[rightIdx]) floodFill(rightIdx);
      }

      // 2. Collect interior transparent cutouts (photo slots)
      const rawBoxes: Array<{
        left: number;
        top: number;
        width: number;
        height: number;
        areaRatio: number;
      }> = [];

      for (let i = 0; i < totalPixels; i++) {
        if (isTransparent[i] && !visited[i]) {
          const box = floodFill(i);
          const bw = box.maxX - box.minX + 1;
          const bh = box.maxY - box.minY + 1;
          const widthPct = (bw / w) * 100;
          const heightPct = (bh / h) * 100;
          const areaRatio = box.count / totalPixels;

          if (widthPct >= 10 && heightPct >= 5 && areaRatio >= 0.012) {
            rawBoxes.push({
              left: (box.minX / w) * 100,
              top: (box.minY / h) * 100,
              width: widthPct,
              height: heightPct,
              areaRatio,
            });
          }
        }
      }

      if (rawBoxes.length === 0) {
        resolve({ slots: [], aspectRatio, layout: aspectRatio > 0.72 ? 'grid' : 'strip' });
        return;
      }

      // 3. Sort cutouts naturally: top-to-bottom rows, left-to-right columns
      rawBoxes.sort((a, b) => {
        if (Math.abs(a.top - b.top) > 5) return a.top - b.top;
        return a.left - b.left;
      });

      // Add slight bleed (0.9%) behind PNG border to avoid hairline seams
      const bleed = 0.9;
      const slots: SlotCoordinate[] = rawBoxes.slice(0, 12).map((b, idx) => ({
        leftPercent: Math.max(0, b.left - bleed / 2),
        topPercent: Math.max(0, b.top - bleed / 2),
        widthPercent: Math.min(100, b.width + bleed),
        heightPercent: Math.min(100, b.height + bleed),
        photoIdx: idx,
      }));

      // Infer layout from detected slot distribution
      let layout: 'strip' | 'grid' | 'single' = 'strip';
      if (slots.length === 1) {
        layout = 'single';
      } else {
        const hasMultipleColumns = slots.some((a, i) =>
          slots.some((b, j) => i !== j && Math.abs(a.topPercent - b.topPercent) <= 5 && Math.abs(a.leftPercent - b.leftPercent) > 10)
        );
        layout = hasMultipleColumns ? 'grid' : 'strip';
      }

      resolve({ slots, aspectRatio, layout });
    };
    img.onerror = () => resolve({ slots: [], aspectRatio: 0.35, layout: 'strip' });
    img.src = imageUrl;
  });
};
