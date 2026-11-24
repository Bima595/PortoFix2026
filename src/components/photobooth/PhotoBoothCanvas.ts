import { PhotoboothTemplate } from '@/types/portfolio';
import { urlFor } from '@/sanity/lib/image';
import {
  CustomFramePosition,
  DEFAULT_PHOTO_TRANSFORM,
  FrameStyleSpec,
  PhotoFilter,
  PhotoTransform,
  PlacedSticker,
  SlotCoordinate,
} from './PhotoBoothTypes';
import {
  drawCoverImage,
  drawRoundedRectPath,
  formatBoothDate,
  getFrameSpec,
  getLayoutDimensions,
  getTemplatePaddings,
  getTemplateSlots,
} from './PhotoBoothHelpers';
import { drawContainedImage, drawSvgSticker, StickerAsset } from './StickerAssets';

export interface CompileCanvasParams {
  canvas: HTMLCanvasElement;
  selectedTemplate: PhotoboothTemplate;
  templateAspectRatio: number | null;
  customFrameImage: string | null;
  customFramePosition: CustomFramePosition;
  customDetectedSlots?: SlotCoordinate[] | null;
  photos: string[];
  photoTransforms?: Record<number, PhotoTransform>;
  activeFilter: PhotoFilter;
  placedStickers: PlacedSticker[];
  allStickers: StickerAsset[];
  customCaption: string;
  showDate: boolean;
}

const getCanvasFontFamily = (fontStyle: FrameStyleSpec['fontStyle']) => {
  if (fontStyle === 'serif') return 'Georgia, "Times New Roman", serif';
  if (fontStyle === 'mono') return 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  return '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
};

const drawFourPointStar = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  color: string
) => {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawRibbonBow = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) => {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Left loop
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-size * 0.55, -size * 0.45, -size * 0.85, size * 0.2, 0, size * 0.12);
  ctx.stroke();

  // Right loop
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.55, -size * 0.45, size * 0.85, size * 0.2, 0, size * 0.12);
  ctx.stroke();

  // Tails
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, size * 0.08);
  ctx.lineTo(-size * 0.4, size * 0.55);
  ctx.moveTo(size * 0.08, size * 0.08);
  ctx.lineTo(size * 0.4, size * 0.55);
  ctx.stroke();

  // Center knot
  ctx.beginPath();
  ctx.arc(0, size * 0.05, size * 0.11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawCornerMarks = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  arm: number,
  color: string,
  lineWidth: number
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'square';

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + arm);
  ctx.lineTo(x, y);
  ctx.lineTo(x + arm, y);
  // Top-right
  ctx.moveTo(x + w - arm, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + arm);
  // Bottom-left
  ctx.moveTo(x, y + h - arm);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + arm, y + h);
  // Bottom-right
  ctx.moveTo(x + w - arm, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - arm);
  ctx.stroke();
  ctx.restore();
};

const drawBarcode = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string
) => {
  // Deterministic crisp receipt barcode pattern
  const pattern = [2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2];
  const totalUnits = pattern.reduce((a, b) => a + b, 0);
  const unitW = w / totalUnits;
  let cursor = x;
  ctx.save();
  ctx.fillStyle = color;
  pattern.forEach((units, i) => {
    const barW = units * unitW;
    if (i % 2 === 0) {
      ctx.fillRect(cursor, y, Math.max(1, barW), h);
    }
    cursor += barW;
  });
  ctx.restore();
};

const drawBackgroundAndPreDecorations = (
  ctx: CanvasRenderingContext2D,
  spec: FrameStyleSpec,
  width: number,
  height: number,
  paddings: ReturnType<typeof getTemplatePaddings>
) => {
  // Base background fill or gradient
  if (spec.bgGradient) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, spec.bgGradient[0]);
    grad.addColorStop(0.5, spec.bgGradient[1]);
    grad.addColorStop(1, spec.bgGradient[2]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = spec.bgColor;
  }
  ctx.fillRect(0, 0, width, height);

  // Blueprint subtle technical grid lines
  if (spec.decoration === 'blueprint') {
    const step = width * 0.045;
    ctx.save();
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.12)';
    ctx.lineWidth = Math.max(1, width * 0.0012);
    for (let gx = step; gx < width; gx += step) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = step; gy < height; gy += step) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Subtle decorative inner border for select frames
  if (
    spec.decoration === 'blush-ribbon' ||
    spec.decoration === 'linen-serif' ||
    spec.decoration === 'gallery-mat' ||
    spec.decoration === 'chrome-y2k'
  ) {
    const inset = width * 0.025;
    ctx.save();
    ctx.strokeStyle =
      spec.decoration === 'chrome-y2k'
        ? 'rgba(24,24,27,0.35)'
        : spec.decoration === 'blush-ribbon'
          ? '#F4B4C6'
          : spec.outerBorderColor;
    ctx.lineWidth = Math.max(1.5, width * 0.0022);
    ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
    ctx.restore();
  }

  // Thermal receipt serrated top/bottom edge effect
  if (spec.decoration === 'receipt') {
    const toothW = width * 0.032;
    const toothH = width * 0.014;
    ctx.save();
    ctx.fillStyle = '#E4E4E7';
    for (let tx = 0; tx < width; tx += toothW) {
      ctx.beginPath();
      ctx.moveTo(tx, 0);
      ctx.lineTo(tx + toothW / 2, toothH);
      ctx.lineTo(tx + toothW, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx, height);
      ctx.lineTo(tx + toothW / 2, height - toothH);
      ctx.lineTo(tx + toothW, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 35mm film sprocket holes along both margins
  if (spec.decoration === 'film-35mm') {
    const holeW = width * 0.044;
    const holeH = width * 0.062;
    const holeR = width * 0.01;
    const marginX = width * 0.028;
    const gap = holeH * 1.65;
    const startY = width * 0.05;
    const endY = height - width * 0.05;

    ctx.save();
    for (let hy = startY; hy + holeH < endY; hy += gap) {
      ctx.fillStyle = '#27272A';
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = Math.max(1, width * 0.0018);

      drawRoundedRectPath(ctx, marginX, hy, holeW, holeH, holeR);
      ctx.fill();
      ctx.stroke();

      drawRoundedRectPath(ctx, width - marginX - holeW, hy, holeW, holeH, holeR);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Top headers for frames that feature a dedicated header region
  const topRegionH = (paddings.topPadding / 100) * height;
  const sideMargin = (paddings.sidePadding / 100) * width;
  const fontFamily = getCanvasFontFamily(spec.fontStyle);

  if (spec.decoration === 'editorial-press') {
    ctx.save();
    const yTopLine = topRegionH * 0.24;
    const yBottomLine = topRegionH * 0.86;
    ctx.strokeStyle = spec.textColor;
    ctx.lineWidth = Math.max(2, width * 0.003);
    ctx.beginPath();
    ctx.moveTo(sideMargin, yTopLine);
    ctx.lineTo(width - sideMargin, yTopLine);
    ctx.stroke();

    ctx.fillStyle = spec.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(width * 0.056)}px ${fontFamily}`;
    ctx.fillText(spec.headerTitle ?? 'THE DAILY SNAP', width / 2, topRegionH * 0.51);

    ctx.fillStyle = spec.mutedTextColor;
    ctx.font = `600 ${Math.round(width * 0.022)}px ${getCanvasFontFamily('mono')}`;
    ctx.fillText(spec.headerMeta ?? 'VOL. 01 • SPECIAL EDITION', width / 2, topRegionH * 0.74);

    ctx.lineWidth = Math.max(1.5, width * 0.002);
    ctx.beginPath();
    ctx.moveTo(sideMargin, yBottomLine);
    ctx.lineTo(width - sideMargin, yBottomLine);
    ctx.stroke();
    ctx.restore();
  } else if (spec.decoration === 'receipt') {
    ctx.save();
    ctx.fillStyle = spec.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(width * 0.04)}px ${fontFamily}`;
    ctx.fillText(spec.headerTitle ?? '*** PHOTO BOOTH ***', width / 2, topRegionH * 0.42);

    ctx.fillStyle = spec.mutedTextColor;
    ctx.font = `500 ${Math.round(width * 0.023)}px ${fontFamily}`;
    ctx.fillText(spec.headerMeta ?? 'ORDER #0206 • PAID IN SMILES', width / 2, topRegionH * 0.67);

    ctx.strokeStyle = 'rgba(24,24,27,0.4)';
    ctx.lineWidth = Math.max(1.5, width * 0.002);
    ctx.setLineDash([width * 0.012, width * 0.01]);
    ctx.beginPath();
    ctx.moveTo(sideMargin, topRegionH * 0.86);
    ctx.lineTo(width - sideMargin, topRegionH * 0.86);
    ctx.stroke();
    ctx.restore();
  } else if (spec.decoration === 'camcorder') {
    ctx.save();
    const hudY = topRegionH * 0.54;
    const dotR = width * 0.011;
    // Red REC indicator dot
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(sideMargin + dotR, hudY, dotR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = spec.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(width * 0.032)}px ${fontFamily}`;
    ctx.fillText('REC', sideMargin + dotR * 3, hudY);

    ctx.fillStyle = spec.mutedTextColor;
    ctx.textAlign = 'right';
    ctx.font = `500 ${Math.round(width * 0.024)}px ${fontFamily}`;
    ctx.fillText(spec.headerMeta ?? 'BAT 98% • HDV', width - sideMargin, hudY);
    ctx.restore();
  } else if (spec.decoration === 'contact-sheet' || spec.decoration === 'blueprint') {
    ctx.save();
    const hudY = topRegionH * 0.55;
    ctx.fillStyle = spec.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(width * 0.026)}px ${fontFamily}`;
    ctx.fillText(spec.headerTitle ?? 'CONTACT SHEET', sideMargin, hudY);

    ctx.fillStyle = spec.mutedTextColor;
    ctx.textAlign = 'right';
    ctx.font = `500 ${Math.round(width * 0.021)}px ${fontFamily}`;
    ctx.fillText(spec.headerMeta ?? 'ISO 400', width - sideMargin, hudY);

    // Subtle divider under header
    ctx.strokeStyle =
      spec.decoration === 'blueprint' ? 'rgba(186,230,253,0.35)' : 'rgba(255,255,255,0.16)';
    ctx.lineWidth = Math.max(1.5, width * 0.0016);
    ctx.beginPath();
    ctx.moveTo(sideMargin, topRegionH * 0.82);
    ctx.lineTo(width - sideMargin, topRegionH * 0.82);
    ctx.stroke();

    // Sheet corner crop marks
    drawCornerMarks(
      ctx,
      width * 0.025,
      height * 0.022,
      width * 0.95,
      height * 0.956,
      width * 0.026,
      spec.decoration === 'blueprint' ? 'rgba(186,230,253,0.65)' : 'rgba(255,255,255,0.45)',
      Math.max(1.5, width * 0.002)
    );
    ctx.restore();
  } else if (spec.decoration === 'blush-ribbon') {
    drawRibbonBow(ctx, width / 2, topRegionH * 0.54, width * 0.085, spec.accentColor);
  } else if (spec.decoration === 'chrome-y2k') {
    ctx.save();
    const hudY = topRegionH * 0.56;
    drawFourPointStar(ctx, sideMargin + width * 0.03, hudY, width * 0.024, width * 0.007, spec.textColor);
    drawFourPointStar(
      ctx,
      width - sideMargin - width * 0.03,
      hudY,
      width * 0.024,
      width * 0.007,
      spec.textColor
    );

    ctx.fillStyle = spec.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${Math.round(width * 0.03)}px ${fontFamily}`;
    ctx.fillText(spec.headerTitle ?? 'SILVER 2000', width / 2, hudY);
    ctx.restore();
  } else if (spec.decoration === 'linen-serif') {
    ctx.save();
    const hudY = topRegionH * 0.58;
    ctx.strokeStyle = spec.outerBorderColor;
    ctx.lineWidth = Math.max(1.5, width * 0.0018);
    ctx.beginPath();
    ctx.moveTo(sideMargin, hudY);
    ctx.lineTo(width * 0.3, hudY);
    ctx.moveTo(width * 0.7, hudY);
    ctx.lineTo(width - sideMargin, hudY);
    ctx.stroke();

    ctx.fillStyle = spec.mutedTextColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.round(width * 0.024)}px ${fontFamily}`;
    ctx.fillText(spec.headerTitle ?? 'ATELIER NO. 03', width / 2, hudY);
    ctx.restore();
  }
};

const drawPostSlotDecorationsAndFooter = (
  ctx: CanvasRenderingContext2D,
  spec: FrameStyleSpec,
  slots: SlotCoordinate[],
  width: number,
  height: number,
  paddings: ReturnType<typeof getTemplatePaddings>,
  caption: string,
  showDate: boolean
) => {
  const fontFamily = getCanvasFontFamily(spec.fontStyle);
  const sideMargin = (paddings.sidePadding / 100) * width;
  const footerH = (paddings.bottomPadding / 100) * height;
  const footerTop = height - footerH;
  const displayCaption = caption.trim() || spec.defaultCaption;
  const dateText = formatBoothDate();

  // Slot-level markings (contact sheet indices, film numbers, camcorder viewfinder brackets)
  slots.forEach((slot) => {
    const x = (slot.leftPercent / 100) * width;
    const y = (slot.topPercent / 100) * height;
    const w = (slot.widthPercent / 100) * width;
    const h = (slot.heightPercent / 100) * height;

    if (spec.decoration === 'contact-sheet') {
      ctx.save();
      ctx.fillStyle = spec.mutedTextColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.font = `600 ${Math.round(width * 0.017)}px ${getCanvasFontFamily('mono')}`;
      ctx.fillText(`0${slot.photoIdx + 1}A`, x, y - height * 0.006);
      ctx.restore();
    } else if (spec.decoration === 'film-35mm') {
      ctx.save();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.font = `700 ${Math.round(width * 0.02)}px ${getCanvasFontFamily('mono')}`;
      ctx.fillText(`0${slot.photoIdx + 1}A`, x + width * 0.01, y - height * 0.004);
      ctx.restore();
    } else if (spec.decoration === 'camcorder') {
      const pad = width * 0.022;
      drawCornerMarks(
        ctx,
        x + pad,
        y + pad,
        w - pad * 2,
        h - pad * 2,
        width * 0.04,
        'rgba(255,255,255,0.85)',
        Math.max(2, width * 0.003)
      );
    }
  });

  // Footer area typography and ornaments
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (spec.decoration === 'receipt') {
    const dashY = footerTop + footerH * 0.14;
    ctx.strokeStyle = 'rgba(24,24,27,0.4)';
    ctx.lineWidth = Math.max(1.5, width * 0.002);
    ctx.setLineDash([width * 0.012, width * 0.01]);
    ctx.beginPath();
    ctx.moveTo(sideMargin, dashY);
    ctx.lineTo(width - sideMargin, dashY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = spec.textColor;
    ctx.font = `700 ${Math.round(width * 0.036)}px ${fontFamily}`;
    ctx.fillText(displayCaption.toUpperCase(), width / 2, footerTop + footerH * 0.34);

    if (showDate) {
      ctx.fillStyle = spec.mutedTextColor;
      ctx.font = `500 ${Math.round(width * 0.022)}px ${fontFamily}`;
      ctx.fillText(`${dateText} • QTY ${slots.length} SHOTS`, width / 2, footerTop + footerH * 0.5);
    }

    drawBarcode(
      ctx,
      width * 0.22,
      footerTop + footerH * 0.62,
      width * 0.56,
      footerH * 0.22,
      spec.textColor
    );
  } else if (spec.decoration === 'polaroid') {
    ctx.fillStyle = spec.textColor;
    ctx.font = `italic 600 ${Math.round(width * 0.046)}px ${fontFamily}`;
    ctx.fillText(displayCaption, width / 2, footerTop + footerH * 0.44);

    if (showDate) {
      ctx.fillStyle = spec.mutedTextColor;
      ctx.font = `500 ${Math.round(width * 0.022)}px ${getCanvasFontFamily('mono')}`;
      ctx.fillText(dateText, width / 2, footerTop + footerH * 0.69);
    }
  } else if (spec.decoration === 'camcorder') {
    ctx.fillStyle = spec.textColor;
    ctx.textAlign = 'left';
    ctx.font = `700 ${Math.round(width * 0.028)}px ${fontFamily}`;
    ctx.fillText(displayCaption.toUpperCase(), sideMargin, footerTop + footerH * 0.48);

    ctx.fillStyle = spec.mutedTextColor;
    ctx.textAlign = 'right';
    ctx.font = `500 ${Math.round(width * 0.024)}px ${fontFamily}`;
    ctx.fillText(showDate ? dateText : spec.footerSubtext ?? 'TC 00:01:24:08', width - sideMargin, footerTop + footerH * 0.48);
  } else {
    const isWideGrid = width >= 1300;
    const captionPx = Math.round(width * (isWideGrid ? 0.029 : 0.041));
    const subPx = Math.round(width * (isWideGrid ? 0.017 : 0.023));

    ctx.fillStyle = spec.textColor;
    ctx.font = `${spec.fontStyle === 'serif' ? 'italic ' : ''}700 ${captionPx}px ${fontFamily}`;
    ctx.fillText(
      spec.fontStyle === 'serif' ? displayCaption : displayCaption.toUpperCase(),
      width / 2,
      footerTop + footerH * (showDate ? 0.4 : 0.5)
    );

    if (showDate) {
      ctx.fillStyle = spec.mutedTextColor;
      ctx.font = `500 ${subPx}px ${getCanvasFontFamily('mono')}`;
      const subLine = spec.footerSubtext ? `${spec.footerSubtext} • ${dateText}` : dateText;
      ctx.fillText(subLine, width / 2, footerTop + footerH * 0.68);
    }
  }
  ctx.restore();
};

export async function compilePhotoBoothCanvas({
  canvas,
  selectedTemplate,
  templateAspectRatio,
  customFrameImage,
  customFramePosition,
  customDetectedSlots,
  photos,
  photoTransforms = {},
  activeFilter,
  placedStickers,
  allStickers,
  customCaption,
  showDate,
}: CompileCanvasParams): Promise<string | null> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const isLocal = selectedTemplate._id.startsWith('local-');
  const spec = getFrameSpec(selectedTemplate._id);

  // Load captured/uploaded photos safely
  const photoImages = await Promise.all(
    photos.map((src) => {
      if (!src) return Promise.resolve(null);
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    })
  );

  // Load custom or Sanity frame overlay image if present
  let frameImg: HTMLImageElement | null = null;
  let computedAspectRatio = templateAspectRatio;

  if (selectedTemplate._id === 'custom-user-frame' && customFrameImage) {
    frameImg = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.src = customFrameImage;
      img.onload = () => {
        computedAspectRatio = img.naturalWidth / img.naturalHeight;
        resolve(img);
      };
      img.onerror = () => resolve(null);
    });
  } else if (!isLocal && selectedTemplate.frameImage) {
    frameImg = await new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = urlFor(selectedTemplate.frameImage!).url();
      img.onload = () => {
        computedAspectRatio = img.naturalWidth / img.naturalHeight;
        resolve(img);
      };
      img.onerror = () => resolve(null);
    });
  }

  let width = 0;
  let height = 0;

  if (frameImg) {
    const minExportWidth = 1080;
    const scaleUp = frameImg.naturalWidth < minExportWidth ? minExportWidth / frameImg.naturalWidth : 1;
    width = Math.round(frameImg.naturalWidth * scaleUp);
    height = Math.round(frameImg.naturalHeight * scaleUp);
  } else {
    const dims = getLayoutDimensions(selectedTemplate, computedAspectRatio);
    width = dims.totalWidth;
    height = dims.totalHeight;
  }

  canvas.width = width;
  canvas.height = height;

  const paddings = getTemplatePaddings(selectedTemplate);
  const slots = getTemplateSlots(selectedTemplate, computedAspectRatio, customDetectedSlots);

  // 1. Background & Pre-Slot Decorations
  if (frameImg) {
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, 0, width, height);
  } else {
    drawBackgroundAndPreDecorations(ctx, spec, width, height, paddings);
  }

  // 2. Draw Photos into Slots with Filter & Optional Corner Radius
  slots.forEach((slot) => {
    const x = (slot.leftPercent / 100) * width;
    const y = (slot.topPercent / 100) * height;
    const w = (slot.widthPercent / 100) * width;
    const h = (slot.heightPercent / 100) * height;
    const radiusPx = !frameImg ? (spec.slotRadiusPercent / 100) * w : 0;

    // Empty slot placeholder surface
    ctx.save();
    drawRoundedRectPath(ctx, x, y, w, h, radiusPx);
    ctx.fillStyle = frameImg ? '#18181B' : spec.slotBgColor;
    ctx.fill();
    ctx.restore();

    const img = photoImages[slot.photoIdx];
    if (img) {
      const transform = photoTransforms[slot.photoIdx] ?? DEFAULT_PHOTO_TRANSFORM;
      ctx.save();
      if (activeFilter.cssFilter && activeFilter.cssFilter !== 'none') {
        ctx.filter = activeFilter.cssFilter;
      }
      drawCoverImage(ctx, img, x, y, w, h, radiusPx, transform);
      ctx.restore();
    }

    // Crisp slot border
    if (!frameImg && spec.slotBorderColor) {
      ctx.save();
      drawRoundedRectPath(ctx, x, y, w, h, radiusPx);
      ctx.strokeStyle = spec.slotBorderColor;
      ctx.lineWidth = Math.max(1.5, width * 0.002);
      ctx.stroke();
      ctx.restore();
    }
  });

  // 3. Overlay PNG Frame OR Built-In Post-Decorations & Footer
  if (frameImg) {
    if (selectedTemplate._id === 'custom-user-frame') {
      const fx = (customFramePosition.x / 100) * width;
      const fy = (customFramePosition.y / 100) * height;
      const fw = (customFramePosition.w / 100) * width;
      const fh = (customFramePosition.h / 100) * height;
      ctx.drawImage(frameImg, fx, fy, fw, fh);
    } else {
      ctx.drawImage(frameImg, 0, 0, width, height);
    }
  } else {
    drawPostSlotDecorationsAndFooter(
      ctx,
      spec,
      slots,
      width,
      height,
      paddings,
      customCaption,
      showDate
    );
  }

  // 4. Draw Stickers (preserving aspect ratio inside bounding box just like object-contain in DOM)
  for (const st of placedStickers) {
    const asset = allStickers.find((a) => a.id === st.stickerId);
    if (!asset) continue;

    ctx.save();
    const absX = (st.x / 100) * width;
    const absY = (st.y / 100) * height;
    const absBox = (st.size / 100) * width;

    ctx.translate(absX, absY);
    ctx.rotate((st.rotation * Math.PI) / 180);

    if (asset.isCustom && asset.src) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.src = asset.src!;
        img.onload = () => {
          drawContainedImage(ctx, img, -absBox / 2, -absBox / 2, absBox, absBox);
          resolve();
        };
        img.onerror = () => resolve();
      });
    } else {
      await drawSvgSticker(ctx, asset.svg, -absBox / 2, -absBox / 2, absBox, absBox);
    }
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
