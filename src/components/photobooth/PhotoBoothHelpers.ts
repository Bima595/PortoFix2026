import { PhotoboothTemplate } from '@/types/portfolio';
import { SlotCoordinate, DEFAULT_PADDINGS, DEFAULT_CUSTOM_PADDINGS } from './PhotoBoothTypes';

// --- SOUND UTILITIES USING WEB AUDIO API ---
export const playSound = (type: 'beep' | 'shutter') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    
    if (type === 'beep') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'shutter') {
      const bufferSize = audioCtx.sampleRate * 0.25;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      noise.start();
      noise.stop(audioCtx.currentTime + 0.25);
    }
  } catch (err) {
    console.error('Audio playback failed', err);
  }
};

// --- LAYOUT CALCULATORS ---
export const getLayoutDimensions = (temp: PhotoboothTemplate, aspectRatio: number | null) => {
  const layout = temp.layout;
  const numPhotos = temp.maxPhotos;
  const isLocal = temp._id.startsWith('local-');
  const isDoubleStrip = layout === 'strip' && !isLocal && aspectRatio !== null && aspectRatio > 0.45;

  if (layout === 'strip') {
    const border = 15;
    const spacing = 15;
    const photoW = 270;
    const photoH = 202.5; // 4:3 ratio
    const footerH = 65;
    const totalWidth = isDoubleStrip ? (photoW * 2 + border * 3) : (photoW + border * 2);
    const displayRows = isDoubleStrip ? Math.ceil(numPhotos / 2) : numPhotos;
    const totalHeight = (border * 2) + (photoH * displayRows) + (spacing * (displayRows - 1)) + footerH;
    return { totalWidth, totalHeight, border, spacing, photoW, photoH, footerH, isDoubleStrip };
  } else if (layout === 'grid') {
    const border = 20;
    const spacing = 15;
    const photoW = 270;
    const photoH = 202.5;
    const footerH = 60;
    const displayCols = numPhotos === 1 ? 1 : 2;
    const displayRows = Math.ceil(numPhotos / displayCols);
    const totalWidth = (border * 2) + (photoW * displayCols) + (spacing * (displayCols - 1));
    const totalHeight = (border * 2) + (photoH * displayRows) + (spacing * (displayRows - 1)) + footerH;
    return { totalWidth, totalHeight, border, spacing, photoW, photoH, footerH, isDoubleStrip: false };
  } else {
    // single (Polaroid)
    const border = 18;
    const photoW = 340;
    const photoH = 255;
    const footerH = 75;
    const totalWidth = photoW + (border * 2);
    const totalHeight = border + photoH + footerH;
    return { totalWidth, totalHeight, border, spacing: 0, photoW, photoH, footerH, isDoubleStrip: false };
  }
};

export const getTemplateSlots = (
  temp: PhotoboothTemplate,
  aspectRatio: number | null
): SlotCoordinate[] => {
  const layout = temp.layout;
  const isLocal = temp._id.startsWith('local-');
  const isDoubleStrip = layout === 'strip' && !isLocal && aspectRatio !== null && aspectRatio > 0.45;

  const defaults = isLocal
    ? (DEFAULT_PADDINGS[layout] || DEFAULT_PADDINGS.strip)
    : (DEFAULT_CUSTOM_PADDINGS[layout] || DEFAULT_CUSTOM_PADDINGS.strip);

  const topPadding = typeof temp.topPadding === 'number' ? temp.topPadding : defaults.topPadding;
  const bottomPadding = typeof temp.bottomPadding === 'number' ? temp.bottomPadding : defaults.bottomPadding;
  const sidePadding = typeof temp.sidePadding === 'number' ? temp.sidePadding : defaults.sidePadding;
  const rowSpacing = typeof temp.rowSpacing === 'number' ? temp.rowSpacing : defaults.rowSpacing;
  const colSpacing = typeof temp.colSpacing === 'number' ? temp.colSpacing : defaults.colSpacing;

  const slots: SlotCoordinate[] = [];

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

  const availW = 100 - (sidePadding * 2);
  const autoSlotW = (availW - (cols - 1) * colSpacing) / cols;

  const availH = 100 - topPadding - bottomPadding;
  const autoSlotH = (availH - (rows - 1) * rowSpacing) / rows;

  const customTemp = temp as unknown as { slotWidth?: number; slotHeight?: number };
  const slotW = typeof customTemp.slotWidth === 'number' ? customTemp.slotWidth : autoSlotW;
  const slotH = typeof customTemp.slotHeight === 'number' ? customTemp.slotHeight : autoSlotH;

  // Apply a small bleed (oversize) for custom templates to prevent subpixel black gaps
  const bleedW = isLocal ? 0 : 1.6;
  const bleedH = isLocal ? 0 : 1.6;

  if (layout === 'strip' && isDoubleStrip) {
    for (let r = 0; r < rows; r++) {
      const top = topPadding + r * (slotH + rowSpacing);
      const leftL = sidePadding;
      const leftR = sidePadding + slotW + colSpacing;
      
      slots.push({ 
        leftPercent: leftL - bleedW / 2, 
        topPercent: top - bleedH / 2, 
        widthPercent: slotW + bleedW, 
        heightPercent: slotH + bleedH, 
        photoIdx: r * 2 
      });

      if (r * 2 + 1 < temp.maxPhotos) {
        slots.push({ 
          leftPercent: leftR - bleedW / 2, 
          topPercent: top - bleedH / 2, 
          widthPercent: slotW + bleedW, 
          heightPercent: slotH + bleedH, 
          photoIdx: r * 2 + 1 
        });
      }
    }
  } else if (layout === 'grid') {
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
        photoIdx: idx 
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
        photoIdx: r 
      });
    }
  }

  return slots;
};

export const drawCoverImage = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) => {
  const imgRatio = img.width / img.height;
  const targetRatio = w / h;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (imgRatio > targetRatio) {
    sw = img.height * targetRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / targetRatio;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};
