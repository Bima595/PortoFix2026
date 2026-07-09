'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Download, 
  RotateCcw, 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react';
import { PhotoboothTemplate } from '@/types/portfolio';
import { urlFor } from '@/sanity/lib/image';
import { STICKER_ASSETS, drawSvgSticker, StickerAsset } from './StickerAssets';
import { 
  BoothState, 
  PlacedSticker, 
  PhotoFilter, 
  PHOTO_FILTERS, 
  LOCAL_TEMPLATES,
  DEFAULT_CUSTOM_PADDINGS
} from './PhotoBoothTypes';
import { 
  playSound, 
  getLayoutDimensions, 
  getTemplateSlots, 
  drawCoverImage 
} from './PhotoBoothHelpers';
import PhotoBoothFrame from './PhotoBoothFrame';

export default function PhotoBoothClient() {
  const [customFrameImage, setCustomFrameImage] = useState<string | null>(null);
  const [customFrameConfig, setCustomFrameConfig] = useState<PhotoboothTemplate>({
    _id: 'custom-user-frame',
    name: 'Frame Custom (Buat Sendiri)',
    maxPhotos: 2,
    layout: 'strip',
    isActive: true,
    topPadding: 3,
    bottomPadding: 8,
    sidePadding: 3,
    rowSpacing: 3,
    colSpacing: 3,
  });

  const templates = [...LOCAL_TEMPLATES, customFrameConfig];

  const [state, setState] = useState<BoothState>('idle');
  const [selectedTemplate, setSelectedTemplate] = useState<PhotoboothTemplate>(templates[0]);
  const [templateAspectRatio, setTemplateAspectRatio] = useState<number | null>(null);

  const retakeIndexRef = useRef<number | null>(null);
  const capturedPhotosRef = useRef<string[]>([]);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>(PHOTO_FILTERS[0]);
  const [isMirrored, setIsMirrored] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  // Stickers state
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'layout' | 'stickers'>('layout');
  const [uploadedStickers, setUploadedStickers] = useState<StickerAsset[]>([]);
  const [isAdjustingFrame, setIsAdjustingFrame] = useState(false);
  const [customFramePosition, setCustomFramePosition] = useState({ x: 0, y: 0, w: 100, h: 100 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const allSelectableStickers = [...STICKER_ASSETS, ...uploadedStickers];

  // Load custom frame configuration from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedConfig = localStorage.getItem('pb-custom-frame-config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setCustomFrameConfig(parsed);
        
        const savedSelectedId = localStorage.getItem('pb-selected-template-id');
        if (savedSelectedId === 'custom-user-frame') {
          setSelectedTemplate(parsed);
        } else if (savedSelectedId) {
          const matched = LOCAL_TEMPLATES.find(t => t._id === savedSelectedId);
          if (matched) setSelectedTemplate(matched);
        }
      }
      const savedImage = localStorage.getItem('pb-custom-frame-image');
      if (savedImage) {
        setCustomFrameImage(savedImage);
      }
      const savedStickers = localStorage.getItem('pb-uploaded-stickers');
      if (savedStickers) {
        try {
          setUploadedStickers(JSON.parse(savedStickers));
        } catch (e) {
          console.error('Failed to parse uploaded stickers', e);
        }
      }
      const savedPosition = localStorage.getItem('pb-custom-frame-position');
      if (savedPosition) {
        try {
          setCustomFramePosition(JSON.parse(savedPosition));
        } catch (e) {
          console.error('Failed to parse custom frame position', e);
        }
      }
    } catch (e) {
      console.error('Failed to load custom frame from localStorage', e);
    }
  }, []);

  // Save custom frame position when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pb-custom-frame-position', JSON.stringify(customFramePosition));
    } catch (e) {
      console.error('Failed to save custom frame position to localStorage', e);
    }
  }, [customFramePosition]);

  // Save custom frame config
  const saveCustomConfig = (newConfig: PhotoboothTemplate) => {
    setCustomFrameConfig(newConfig);
    setSelectedTemplate(newConfig);
    try {
      localStorage.setItem('pb-custom-frame-config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save custom frame config', e);
    }
  };

  // Save custom frame base64 image
  const saveCustomImage = (base64Image: string) => {
    setCustomFrameImage(base64Image);
    try {
      localStorage.setItem('pb-custom-frame-image', base64Image);
    } catch (e) {
      console.warn('LocalStorage quota exceeded for custom frame image, keeping in memory only.', e);
      localStorage.removeItem('pb-custom-frame-image');
    }
  };

  const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      alert('Format file harus berupa PNG transparan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      saveCustomImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Format file harus berupa gambar.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newSticker: StickerAsset = {
          id: `custom-sticker-${Date.now()}-${Math.random()}`,
          name: file.name.split('.')[0] || 'Custom Sticker',
          svg: '',
          isCustom: true,
          src: base64
        };

        setUploadedStickers(prev => {
          const updated = [...prev, newSticker];
          try {
            localStorage.setItem('pb-uploaded-stickers', JSON.stringify(updated));
          } catch (err) {
            console.warn('LocalStorage quota exceeded for uploaded stickers.', err);
            alert('Penyimpanan lokal penuh, beberapa stiker tidak dapat disimpan secara permanen.');
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDeleteUploadedSticker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedStickers(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem('pb-uploaded-stickers', JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      return updated;
    });
    setPlacedStickers(prev => prev.filter(s => s.stickerId !== id));
  };

  const handleSelectTemplate = (temp: PhotoboothTemplate) => {
    setSelectedTemplate(temp);
    try {
      localStorage.setItem('pb-selected-template-id', temp._id);
    } catch (e) {
      console.error(e);
    }
  };

  // Stop camera stream when component unmounts or state changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Load natural aspect ratio of frames
  useEffect(() => {
    setTemplateAspectRatio(null);
    const isLocal = selectedTemplate._id.startsWith('local-');
    if (selectedTemplate._id === 'custom-user-frame') {
      if (customFrameImage) {
        const img = new Image();
        img.src = customFrameImage;
        img.onload = () => {
          setTemplateAspectRatio(img.naturalWidth / img.naturalHeight);
        };
      }
    } else if (!isLocal && selectedTemplate.frameImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = urlFor(selectedTemplate.frameImage).url();
      img.onload = () => {
        setTemplateAspectRatio(img.naturalWidth / img.naturalHeight);
      };
    }
  }, [selectedTemplate, customFrameImage]);

  // Camera helpers
  const startCamera = async () => {
    setCameraError(null);
    setState('ready');
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
    } catch (err) {
      const error = err as { name?: string };
      console.error('Error accessing camera:', err);
      setCameraError(
        error.name === 'NotAllowedError' 
          ? 'Kamera tidak diizinkan. Harap izinkan akses kamera di browser Anda.' 
          : 'Gagal mendeteksi kamera. Pastikan kamera terhubung.'
      );
      setState('idle');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Start automated capture session
  const startCaptureSession = () => {
    if (!stream) return;
    setCapturedPhotos([]);
    capturedPhotosRef.current = [];
    retakeIndexRef.current = null;
    setCurrentCaptureIndex(0);
    startCountdown(0);
  };

  // Countdown timer cycle
  const startCountdown = (index: number) => {
    setCurrentCaptureIndex(index);
    setCountdown(3);
    setState('countdown');
    
    let currentCount = 3;
    playSound('beep');
    
    const interval = setInterval(() => {
      currentCount--;
      if (currentCount > 0) {
        setCountdown(currentCount);
        playSound('beep');
      } else {
        clearInterval(interval);
        capturePhoto(index);
      }
    }, 1000);
  };

  const handleRetakeSingleSlot = (idx: number) => {
    retakeIndexRef.current = idx;
    startCountdown(idx);
  };

  const capturePhoto = (index: number) => {
    const video = videoRef.current || document.querySelector('video');
    if (!video) return;

    playSound('shutter');
    setState('flash');

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        if (isMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        if (retakeIndexRef.current !== null) {
          const updatedPhotos = [...capturedPhotosRef.current];
          updatedPhotos[retakeIndexRef.current] = dataUrl;
          capturedPhotosRef.current = updatedPhotos;
          setCapturedPhotos(updatedPhotos);
          
          retakeIndexRef.current = null;
          setTimeout(() => {
            setState('review');
          }, 1000);
        } else {
          const updatedPhotos = [...capturedPhotosRef.current, dataUrl];
          capturedPhotosRef.current = updatedPhotos;
          setCapturedPhotos(updatedPhotos);
          
          const nextIndex = index + 1;
          if (nextIndex < selectedTemplate.maxPhotos) {
            setTimeout(() => {
              startCountdown(nextIndex);
            }, 1000);
          } else {
            setTimeout(() => {
              setState('review');
            }, 1000);
          }
        }
      }
    }, 150);
  };

  // Compile photos onto canvas when downloading
  const compilePhotos = async (photos: string[], currentStickers = placedStickers, showSpinner = true): Promise<string | null> => {
    if (showSpinner) setIsCompiling(true);
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const layout = selectedTemplate.layout;
    const isLocal = selectedTemplate._id.startsWith('local-');

    // Load captured photos
    const photoImages = await Promise.all(
      photos.map(src => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
        });
      })
    );

    // Load frame overlay
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
      width = frameImg.naturalWidth;
      height = frameImg.naturalHeight;
    } else {
      const dims = getLayoutDimensions(selectedTemplate, computedAspectRatio);
      width = dims.totalWidth;
      height = dims.totalHeight;
    }

    canvas.width = width;
    canvas.height = height;

    // 1. Background
    if (selectedTemplate._id === 'local-black-strip') {
      ctx.fillStyle = '#121212';
    } else if (selectedTemplate._id === 'local-film-strip') {
      ctx.fillStyle = '#09090b';
    } else if (layout === 'single') {
      ctx.fillStyle = '#fcf8f2';
    } else {
      ctx.fillStyle = '#ffffff';
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Film Strip Sprockets
    if (!frameImg && selectedTemplate._id === 'local-film-strip') {
      ctx.fillStyle = '#18181b';
      const holeW = 6;
      const holeH = 10;
      const holeGap = 16;
      for (let y = 10; y < height - 10; y += holeGap) {
        ctx.fillRect(4, y, holeW, holeH);
        ctx.fillRect(width - 4 - holeW, y, holeW, holeH);
      }
    }

    // 3. Draw Photos
    const slots = getTemplateSlots(selectedTemplate, computedAspectRatio);
    slots.forEach((slot) => {
      const img = photoImages[slot.photoIdx];
      if (!img) return;

      const x = (slot.leftPercent / 100) * width;
      const y = (slot.topPercent / 100) * height;
      const w = (slot.widthPercent / 100) * width;
      const h = (slot.heightPercent / 100) * height;

      ctx.save();
      if (activeFilter.canvasFilter !== 'none') {
        ctx.filter = activeFilter.canvasFilter;
      }
      drawCoverImage(ctx, img, x, y, w, h);
      ctx.restore();

      if (!frameImg && selectedTemplate._id === 'local-film-strip') {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
      
      if (!frameImg && layout === 'single') {
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
    });

    // 4. Frame Overlay Image / Footer Text
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
      ctx.fillStyle = selectedTemplate._id === 'local-black-strip' ? '#71717a' : '#18181b';
      ctx.textAlign = 'center';

      if (layout === 'strip') {
        ctx.font = 'bold 12px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI"';
        ctx.fillText('Satriabanyu Photo Booth Online', width / 2, height - 32);
        ctx.font = 'italic 9px serif';
        ctx.fillStyle = selectedTemplate._id === 'local-black-strip' ? '#52525b' : '#71717a';
        ctx.fillText(
          new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }),
          width / 2,
          height - 16
        );
      } else if (layout === 'grid') {
        ctx.font = 'bold 13px system-ui';
        ctx.fillText('Satriabanyu Photo Booth Online', width / 2, height - 28);
        ctx.font = '9px system-ui';
        ctx.fillStyle = '#71717a';
        ctx.fillText('• Captured with Satriabanyu Photo Booth •', width / 2, height - 12);
      } else {
        ctx.fillStyle = '#27272a';
        ctx.font = 'italic 14px Georgia, serif';
        ctx.fillText('Satriabanyu Photo Booth Online', width / 2, height - 36);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText(
          new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
          width / 2,
          height - 18
        );
      }
    }

    // 5. Draw Stickers
    for (const st of currentStickers) {
      const asset = allSelectableStickers.find(a => a.id === st.stickerId);
      if (!asset) continue;

      ctx.save();
      const absX = (st.x / 100) * width;
      const absY = (st.y / 100) * height;
      const absW = (st.size / 100) * width;
      const absH = absW;
      
      ctx.translate(absX, absY);
      ctx.rotate((st.rotation * Math.PI) / 180);
      
      if (asset.isCustom && asset.src) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.src = asset.src!;
          img.onload = () => {
            ctx.drawImage(img, -absW / 2, -absH / 2, absW, absH);
            resolve();
          };
          img.onerror = () => resolve();
        });
      } else {
        await drawSvgSticker(ctx, asset.svg, -absW / 2, -absH / 2, absW, absH);
      }
      ctx.restore();
    }

    const compiledUrl = canvas.toDataURL('image/png');
    if (showSpinner) setIsCompiling(false);
    return compiledUrl;
  };

  const handleFilterChange = (filter: PhotoFilter) => {
    setActiveFilter(filter);
  };

  const handleConfirmReview = () => {
    stopCamera();
    setPlacedStickers([]);
    setSelectedStickerId(null);
    setState('preview');
  };

  const handleRetakeAll = () => {
    setCapturedPhotos([]);
    capturedPhotosRef.current = [];
    retakeIndexRef.current = null;
    setCurrentCaptureIndex(0);
    setPlacedStickers([]);
    setSelectedStickerId(null);
    startCamera();
  };

  const handleRetake = () => {
    setCapturedPhotos([]);
    capturedPhotosRef.current = [];
    retakeIndexRef.current = null;
    setPlacedStickers([]);
    setSelectedStickerId(null);
    startCamera();
  };

  const handleBackToIdle = () => {
    stopCamera();
    setCapturedPhotos([]);
    capturedPhotosRef.current = [];
    retakeIndexRef.current = null;
    setPlacedStickers([]);
    setSelectedStickerId(null);
    setState('idle');
  };

  const handleDownload = async () => {
    setIsCompiling(true);
    try {
      const url = await compilePhotos(capturedPhotos, placedStickers, false);
      if (!url) return;
      const link = document.createElement('a');
      link.download = `photobooth-${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to compile and download image:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAddSticker = (stickerId: string) => {
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      stickerId,
      x: 50,
      y: 50,
      size: 15,
      rotation: 0,
    };
    setPlacedStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const handleDeleteSticker = (id: string) => {
    setPlacedStickers(prev => prev.filter(s => s.id !== id));
    setSelectedStickerId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16 text-zinc-100 min-h-[80vh] flex flex-col items-center justify-center">
      {/* Hidden Canvas used for photo compiling */}
      <canvas ref={canvasRef} className="hidden" />

      {/* FLASH SCREEN EFFECT */}
      <AnimatePresence>
        {state === 'flash' && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* HEADER */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 mb-3"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Interactive Portfolio Add-on</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-medium tracking-tight bg-linear-to-br from-white to-zinc-500 bg-clip-text text-transparent"
          >
            Photo <span className="font-serif italic text-zinc-400">Booth</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-sm md:text-base mt-2 max-w-md mx-auto"
          >
            Ambil foto instan menggunakan webcam Anda dengan template dan filter estetika ala cetakan film fisik.
          </motion.p>
        </div>

        {/* STATE: IDLE */}
        {state === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 md:p-10 flex flex-col items-center gap-8 shadow-2xl shadow-black/50"
          >
            <div className="w-full max-w-md aspect-4/3 bg-zinc-950 rounded-2xl flex flex-col items-center justify-center border border-zinc-800 text-center p-6 relative group overflow-hidden">
              <div className="absolute inset-0 bg-radial from-zinc-900 to-zinc-950 opacity-50" />
              <Video className="w-16 h-16 text-zinc-650 mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-zinc-400 font-medium text-sm relative z-10">Webcam tidak aktif</p>
              <p className="text-zinc-500 text-xs mt-1 relative z-10">Izinkan akses kamera untuk mengambil gambar.</p>
            </div>

            {cameraError && (
              <div className="flex items-center gap-3 bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-xl max-w-md">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium">{cameraError}</span>
              </div>
            )}

            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-8 py-4 rounded-full bg-zinc-100 text-zinc-950 hover:bg-white hover:scale-105 transition-all duration-300 font-semibold text-base shadow-xl shadow-zinc-950/20 active:scale-95"
            >
              <Camera className="w-5 h-5" />
              Aktifkan Kamera
            </button>
          </motion.div>
        )}

        {/* STATE: READY, COUNTDOWN, FLASH & REVIEW */}
        {(state === 'ready' || state === 'countdown' || state === 'flash' || state === 'review') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 flex flex-col lg:flex-row gap-6 shadow-2xl shadow-black/50"
          >
            {/* Column 1: Main Live Camera Feed */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              <div className="relative aspect-4/3 bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-inner">
                {stream && (
                  <video 
                    ref={el => {
                      videoRef.current = el;
                      if (el && stream) el.srcObject = stream;
                    }}
                    autoPlay 
                    playsInline 
                    muted
                    className={`w-full h-full object-cover transition-all duration-300 ${activeFilter.class} ${isMirrored ? '-scale-x-100' : ''}`}
                  />
                )}

                {/* Countdown Overlay */}
                <AnimatePresence>
                  {state === 'countdown' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      key={countdown}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs z-10"
                    >
                      <span className="text-8xl font-black tracking-tight text-white drop-shadow-lg select-none">
                        {countdown}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Review Overlay */}
                {state === 'review' && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center select-none z-10 animate-fade-in">
                    <Sparkles className="w-12 h-12 text-amber-400 mb-3 animate-bounce" />
                    <h3 className="text-lg font-bold text-white mb-1">Sesi Foto Selesai</h3>
                    <p className="text-zinc-300 text-xs max-w-xs leading-relaxed">
                      {"Klik tombol ulang ("}<RotateCcw className="inline w-3.5 h-3.5 mx-0.5" />{") pada slot foto di bingkai untuk mengulang, atau klik \"Konfirmasi & Cetak\" untuk memproses."}
                    </p>
                  </div>
                )}

                {/* Progress bar */}
                {capturedPhotos.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 z-10">
                    {Array.from({ length: selectedTemplate.maxPhotos }).map((_, idx) => (
                      <div 
                        key={idx}
                        className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                          idx < capturedPhotos.length 
                            ? 'bg-zinc-100' 
                            : idx === currentCaptureIndex && state === 'countdown' 
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Controls below Feed */}
              <div className="flex items-center justify-between gap-4 px-2">
                <button
                  onClick={handleBackToIdle}
                  disabled={state === 'countdown' || state === 'flash'}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Kembali
                </button>
                <button
                  onClick={() => setIsMirrored(prev => !prev)}
                  disabled={state === 'countdown' || state === 'flash'}
                  className="p-2.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Mirror</span>
                </button>
              </div>
            </div>

            {/* Column 2: Live Template Preview */}
            <div className="shrink-0 flex flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l lg:border-r border-zinc-800/60 pt-4 lg:pt-0 lg:px-6 min-w-[190px] lg:min-w-[260px]">
              <span className="text-2xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Live Frame Preview</span>
              <div className="flex items-center justify-center h-full min-h-[160px]">
                <PhotoBoothFrame
                  selectedTemplate={selectedTemplate}
                  templateAspectRatio={templateAspectRatio}
                  customFrameImage={customFrameImage}
                  capturedPhotos={capturedPhotos}
                  currentCaptureIndex={currentCaptureIndex}
                  state={state}
                  stream={stream}
                  isMirrored={isMirrored}
                  activeFilter={activeFilter}
                  placedStickers={placedStickers}
                  setPlacedStickers={setPlacedStickers}
                  selectedStickerId={selectedStickerId}
                  setSelectedStickerId={setSelectedStickerId}
                  handleRetakeSingleSlot={handleRetakeSingleSlot}
                  containerRef={containerRef}
                  mode="setup"
                  allStickers={allSelectableStickers}
                  customFramePosition={customFramePosition}
                  setCustomFramePosition={setCustomFramePosition}
                  isAdjustingFrame={isAdjustingFrame}
                />
              </div>
            </div>

            {/* Column 3: Configuration & Controls */}
            <div className="w-full lg:w-64 flex flex-col gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
              {state === 'review' ? (
                <div className="flex flex-col gap-6 h-full justify-between grow animate-fade-in">
                  <div className="flex flex-col gap-4">
                    <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Review Foto
                      </span>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        Klik tombol putar (<RotateCcw className="inline w-3 h-3 mx-0.5" />) pada slot foto di bingkai untuk mengulang foto tersebut, atau klik <strong>Konfirmasi & Cetak</strong> jika sudah puas.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Pilih Filter
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {PHOTO_FILTERS.map((filt) => (
                          <button
                            key={filt.id}
                            type="button"
                            onClick={() => handleFilterChange(filt)}
                            className={`px-1.5 py-2 rounded-lg text-2xs font-semibold border text-center transition-all duration-305 ${
                              activeFilter.id === filt.id
                                ? 'bg-zinc-200 text-zinc-950 border-zinc-200'
                                : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 hover:border-zinc-700'
                            }`}
                          >
                            {filt.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-auto">
                    <button
                      type="button"
                      onClick={handleConfirmReview}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all duration-300 shadow-lg shadow-emerald-500/10 active:scale-98 cursor-pointer"
                    >
                      <Check className="w-5 h-5" />
                      Konfirmasi & Cetak
                    </button>
                    <button
                      type="button"
                      onClick={handleRetakeAll}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all duration-300 font-semibold text-sm active:scale-98 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Foto Ulang Semua
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex border-b border-zinc-800 pb-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('layout')}
                      className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                        activeTab === 'layout' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      Bingkai & Layout
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('stickers')}
                      className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                        activeTab === 'stickers' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-zinc-500 hover:text-zinc-350'
                      }`}
                    >
                      Stiker & Filter
                    </button>
                  </div>

                  {activeTab === 'layout' ? (
                    <>
                      <div className="flex flex-col gap-2 animate-fade-in">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          Pilih Bingkai / Layout
                        </label>
                        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-hide">
                          {templates.map((temp) => (
                            <button
                              key={temp._id}
                              type="button"
                              onClick={() => state !== 'countdown' && state !== 'flash' && handleSelectTemplate(temp)}
                              disabled={state === 'countdown' || state === 'flash'}
                              className={`w-full text-left p-3 rounded-xl border text-sm transition-all duration-350 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed ${
                                selectedTemplate._id === temp._id
                                  ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-semibold'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:border-zinc-700'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span>{temp.name}</span>
                                <span className={`text-2xs ${selectedTemplate._id === temp._id ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-zinc-400'}`}>
                                  {temp.layout.toUpperCase()} Layout • {temp.maxPhotos} Jepretan
                                </span>
                              </div>
                              {selectedTemplate._id === temp._id && <Check className="w-4 h-4 text-zinc-950 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {selectedTemplate._id === 'custom-user-frame' && (() => {
                        const customDefaults = DEFAULT_CUSTOM_PADDINGS[customFrameConfig.layout] || DEFAULT_CUSTOM_PADDINGS.strip;
                        const cTop = typeof customFrameConfig.topPadding === 'number' ? customFrameConfig.topPadding : customDefaults.topPadding;
                        const cBottom = typeof customFrameConfig.bottomPadding === 'number' ? customFrameConfig.bottomPadding : customDefaults.bottomPadding;
                        const cSide = typeof customFrameConfig.sidePadding === 'number' ? customFrameConfig.sidePadding : customDefaults.sidePadding;
                        const cRowSp = typeof customFrameConfig.rowSpacing === 'number' ? customFrameConfig.rowSpacing : customDefaults.rowSpacing;
                        const cColSp = typeof customFrameConfig.colSpacing === 'number' ? customFrameConfig.colSpacing : customDefaults.colSpacing;

                        let cCols = 1;
                        let cRows = 1;
                        const cIsDoubleStrip = customFrameConfig.layout === 'strip' && templateAspectRatio !== null && templateAspectRatio > 0.45;
                        if (customFrameConfig.layout === 'strip') {
                          cCols = cIsDoubleStrip ? 2 : 1;
                          cRows = cIsDoubleStrip ? Math.ceil(customFrameConfig.maxPhotos / 2) : customFrameConfig.maxPhotos;
                        } else if (customFrameConfig.layout === 'grid') {
                          cCols = customFrameConfig.maxPhotos === 1 ? 1 : 2;
                          cRows = Math.ceil(customFrameConfig.maxPhotos / cCols);
                        }

                        const cAvailW = 100 - (cSide * 2);
                        const autoCWidth = Math.round((cAvailW - (cCols - 1) * cColSp) / cCols);

                        const cAvailH = 100 - cTop - cBottom;
                        const autoCHeight = Math.round((cAvailH - (cRows - 1) * cRowSp) / cRows);

                        const customTemp = customFrameConfig as unknown as { slotWidth?: number; slotHeight?: number };
                        const currentWidth = typeof customTemp.slotWidth === 'number' 
                          ? customTemp.slotWidth 
                          : autoCWidth;
                        const currentHeight = typeof customTemp.slotHeight === 'number' 
                          ? customTemp.slotHeight 
                          : autoCHeight;

                        return (
                          <div className="flex flex-col gap-3.5 bg-zinc-950/40 p-4 border border-zinc-800 rounded-2xl animate-fade-in text-xs">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold uppercase text-2xs tracking-wider text-zinc-500">Upload Frame PNG</span>
                              <input
                                type="file"
                                accept="image/png"
                                onChange={handleCustomFrameUpload}
                                className="hidden"
                                id="pb-custom-frame-input"
                              />
                              <label
                                htmlFor="pb-custom-frame-input"
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 cursor-pointer font-semibold text-center transition-all"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                                {customFrameImage ? 'Ganti Frame PNG' : 'Pilih Frame PNG'}
                              </label>
                              {customFrameImage && (
                                <div className="flex flex-col gap-1.5 mt-1 border-t border-zinc-800/80 pt-2">
                                  <button
                                    type="button"
                                    onClick={() => setIsAdjustingFrame(prev => !prev)}
                                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border font-semibold text-center transition-all cursor-pointer ${
                                      isAdjustingFrame
                                        ? 'bg-amber-500 text-zinc-950 border-amber-500 hover:bg-amber-400 font-bold'
                                        : 'bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-200'
                                    }`}
                                  >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {isAdjustingFrame ? 'Selesai Atur Frame' : 'Atur Posisi & Ukuran Frame'}
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomFramePosition({ x: 0, y: 0, w: 100, h: 100 });
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer font-semibold text-2xs text-center transition-all"
                                  >
                                    Reset Posisi Frame
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCustomFrameImage(null);
                                      localStorage.removeItem('pb-custom-frame-image');
                                      localStorage.removeItem('pb-custom-frame-position');
                                      setCustomFramePosition({ x: 0, y: 0, w: 100, h: 100 });
                                      setIsAdjustingFrame(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-950/45 hover:bg-red-900/40 border border-red-900/50 text-red-400 cursor-pointer font-semibold text-center transition-all mt-1"
                                  >
                                    Hapus Frame
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="font-bold uppercase text-2xs tracking-wider text-zinc-500">Gaya Layout</span>
                              <div className="grid grid-cols-3 gap-1">
                                {(['strip', 'grid', 'single'] as const).map((lay) => (
                                  <button
                                    key={lay}
                                    type="button"
                                    onClick={() => {
                                      const newConfig = { 
                                        ...customFrameConfig, 
                                        layout: lay,
                                        maxPhotos: lay === 'single' ? 1 : lay === 'grid' ? 6 : 4 
                                      };
                                      saveCustomConfig(newConfig);
                                    }}
                                    className={`py-1.5 rounded-md font-semibold border text-center transition-all ${
                                      customFrameConfig.layout === lay
                                        ? 'bg-zinc-200 text-zinc-950 border-zinc-200'
                                        : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-800'
                                    }`}
                                  >
                                    {lay === 'strip' ? 'Strip' : lay === 'grid' ? 'Grid' : 'Single'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold uppercase text-2xs tracking-wider text-zinc-500">Jumlah Foto</span>
                                <span className="font-semibold text-zinc-300">{customFrameConfig.maxPhotos}x</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max={customFrameConfig.layout === 'single' ? '1' : '6'}
                                value={customFrameConfig.maxPhotos}
                                onChange={(e) => {
                                  const newConfig = { ...customFrameConfig, maxPhotos: parseInt(e.target.value) };
                                  saveCustomConfig(newConfig);
                                }}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                              />
                            </div>

                            <div className="flex flex-col gap-2 mt-1 border-t border-zinc-800/80 pt-2.5">
                              <span className="font-bold uppercase text-2xs tracking-wider text-zinc-500 block mb-1">Posisi Slot Foto</span>
                              
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                  <span>Jarak Atas</span>
                                  <span>{customFrameConfig.topPadding}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="-50"
                                  max="100"
                                  value={customFrameConfig.topPadding ?? 10}
                                  onChange={(e) => {
                                    const newConfig = { ...customFrameConfig, topPadding: parseFloat(e.target.value) };
                                    saveCustomConfig(newConfig);
                                  }}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                  <span>Jarak Bawah</span>
                                  <span>{customFrameConfig.bottomPadding}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="-50"
                                  max="100"
                                  value={customFrameConfig.bottomPadding ?? 10}
                                  onChange={(e) => {
                                    const newConfig = { ...customFrameConfig, bottomPadding: parseFloat(e.target.value) };
                                    saveCustomConfig(newConfig);
                                  }}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                  <span>Jarak Samping</span>
                                  <span>{customFrameConfig.sidePadding}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="-50"
                                  max="100"
                                  value={customFrameConfig.sidePadding ?? 10}
                                  onChange={(e) => {
                                    const newConfig = { ...customFrameConfig, sidePadding: parseFloat(e.target.value) };
                                    saveCustomConfig(newConfig);
                                  }}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                                />
                              </div>

                              {customFrameConfig.layout !== 'single' && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                    <span>Jarak Antar Baris</span>
                                    <span>{customFrameConfig.rowSpacing}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-20"
                                    max="50"
                                    value={customFrameConfig.rowSpacing ?? 5}
                                    onChange={(e) => {
                                      const newConfig = { ...customFrameConfig, rowSpacing: parseFloat(e.target.value) };
                                      saveCustomConfig(newConfig);
                                    }}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                                  />
                                </div>
                              )}

                              {(customFrameConfig.layout === 'grid' || customFrameConfig.layout === 'strip') && (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                    <span>Jarak Antar Kolom</span>
                                    <span>{customFrameConfig.colSpacing}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-20"
                                    max="50"
                                    value={customFrameConfig.colSpacing ?? 5}
                                    onChange={(e) => {
                                      const newConfig = { ...customFrameConfig, colSpacing: parseFloat(e.target.value) };
                                      saveCustomConfig(newConfig);
                                    }}
                                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
                                  />
                                </div>
                              )}

                              {/* Custom size overrides */}
                              <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-2.5">
                                <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                  <span>Lebar Kamera (Ukuran)</span>
                                  <span>{currentWidth}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="5"
                                  max="200"
                                  value={currentWidth}
                                  onChange={(e) => {
                                    const newConfig = { ...customFrameConfig, slotWidth: parseFloat(e.target.value) };
                                    saveCustomConfig(newConfig);
                                  }}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                  <span>Tinggi Kamera (Ukuran)</span>
                                  <span>{currentHeight}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="5"
                                  max="200"
                                  value={currentHeight}
                                  onChange={(e) => {
                                    const newConfig = { ...customFrameConfig, slotHeight: parseFloat(e.target.value) };
                                    saveCustomConfig(newConfig);
                                  }}
                                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                              </div>

                              {(customTemp.slotWidth !== undefined || customTemp.slotHeight !== undefined) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextConfig = { ...customFrameConfig } as unknown as { slotWidth?: number; slotHeight?: number };
                                    delete nextConfig.slotWidth;
                                    delete nextConfig.slotHeight;
                                    saveCustomConfig(nextConfig as unknown as PhotoboothTemplate);
                                  }}
                                  className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-3xs uppercase tracking-wider transition-colors cursor-pointer mt-1"
                                >
                                  Gunakan Ukuran Kamera Otomatis
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  const nextConfig = {
                                    _id: 'custom-user-frame',
                                    name: 'Frame Custom (Buat Sendiri)',
                                    maxPhotos: customFrameConfig.maxPhotos,
                                    layout: customFrameConfig.layout,
                                    isActive: true,
                                    topPadding: 3,
                                    bottomPadding: 8,
                                    sidePadding: 3,
                                    rowSpacing: 3,
                                    colSpacing: 3,
                                  };
                                  saveCustomConfig(nextConfig);
                                }}
                                className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-500 hover:text-zinc-300 text-3xs uppercase tracking-wider transition-colors cursor-pointer mt-1"
                              >
                                Reset Posisi & Layout Default
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      <div className="bg-zinc-950/40 p-4 border border-zinc-800 rounded-2xl flex flex-col gap-4 animate-fade-in">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Tempel Stiker Lucu
                        </span>
                        
                        <div className="flex flex-col gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleStickerUpload}
                            className="hidden"
                            id="pb-custom-sticker-input-setup"
                          />
                          <label
                            htmlFor="pb-custom-sticker-input-setup"
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 cursor-pointer font-semibold text-2xs text-center transition-all"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            Upload Stiker Custom (.png/.jpg)
                          </label>
                        </div>

                        <div className="grid grid-cols-4 gap-2 bg-zinc-900/50 p-2 rounded-xl border border-zinc-850/60 max-h-36 overflow-y-auto">
                          {allSelectableStickers.map((asset) => (
                            <div key={asset.id} className="relative group/stickerItem w-10 h-10 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleAddSticker(asset.id)}
                                draggable="true"
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', asset.id);
                                }}
                                className="w-full h-full hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer flex items-center justify-center p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 overflow-hidden"
                                title={asset.name}
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
                                    className="w-full h-full flex items-center justify-center pointer-events-none" 
                                    dangerouslySetInnerHTML={{ __html: asset.svg }} 
                                  />
                                )}
                              </button>
                              {asset.isCustom && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteUploadedSticker(asset.id, e)}
                                  className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white shadow-lg cursor-pointer z-10 opacity-0 group-hover/stickerItem:opacity-100 transition-opacity"
                                  title="Hapus Stiker Custom"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="text-[10px] text-zinc-550 leading-tight">
                          💡 Klik stiker untuk menempel di tengah, atau <strong>drag & drop</strong> stiker langsung ke frame preview!
                        </div>

                        {selectedStickerId && (() => {
                          const sticker = placedStickers.find(s => s.id === selectedStickerId);
                          if (!sticker) return null;
                          return (
                            <div className="flex flex-col gap-3.5 bg-zinc-900/60 p-3.5 border border-zinc-800/80 rounded-xl text-xs">
                              <div className="flex justify-between items-center text-2xs uppercase font-bold text-zinc-555">
                                <span>Pengaturan Stiker</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSticker(sticker.id)}
                                  className="text-red-400 hover:text-red-300 font-semibold"
                                >
                                  Hapus
                                </button>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                                  <span>Ukuran</span>
                                  <span>{sticker.size}%</span>
                                </div>
                                <input
                                  type="range"
                                  min="5"
                                  max="35"
                                  value={sticker.size}
                                  onChange={(e) => {
                                    const newSize = parseInt(e.target.value);
                                    setPlacedStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, size: newSize } : s));
                                  }}
                                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between text-3xs text-zinc-555 font-semibold">
                                  <span>Putaran</span>
                                  <span>{sticker.rotation}°</span>
                                </div>
                                <input
                                  type="range"
                                  min="-180"
                                  max="180"
                                  value={sticker.rotation}
                                  onChange={(e) => {
                                    const newRot = parseInt(e.target.value);
                                    setPlacedStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, rotation: newRot } : s));
                                  }}
                                  className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                />
                              </div>
                            </div>
                          );
                        })()}

                        {placedStickers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setPlacedStickers([]);
                              setSelectedStickerId(null);
                            }}
                            className="w-full py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-3xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Hapus Semua Stiker
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 animate-fade-in">
                        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Pilih Filter
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {PHOTO_FILTERS.map((filt) => (
                            <button
                              key={filt.id}
                              type="button"
                              onClick={() => handleFilterChange(filt)}
                              className={`px-1.5 py-2 rounded-lg text-2xs font-semibold border text-center transition-all duration-300 ${
                                activeFilter.id === filt.id
                                  ? 'bg-zinc-200 text-zinc-950 border-zinc-200'
                                  : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200 hover:border-zinc-700'
                              }`}
                            >
                              {filt.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={startCaptureSession}
                    disabled={state === 'countdown' || state === 'flash'}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-650 disabled:cursor-not-allowed text-zinc-950 font-bold transition-all duration-300 shadow-lg shadow-amber-500/10 active:scale-98 mt-auto cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    Mulai Berfoto ({selectedTemplate.maxPhotos}x)
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* STATE: PROCESSING */}
        {state === 'processing' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 shadow-2xl shadow-black/50"
          >
            <Loader2 className="w-10 h-10 text-zinc-400 animate-spin" />
            <p className="font-semibold text-lg">Membuat Kolase Foto...</p>
            <p className="text-zinc-400 text-xs max-w-xs">Foto Anda sedang digabungkan dan dibakar dengan filter dan bingkai pilihan.</p>
          </motion.div>
        )}

        {/* STATE: PREVIEW */}
        {state === 'preview' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center animate-fade-in"
          >
            {/* Left Column: Frame representation */}
            <div className="relative p-4 md:p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-white/5 shadow-2xl flex justify-center items-center select-none w-full lg:max-w-md">
              <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
              
              <div className="relative flex justify-center items-center w-full">
                <PhotoBoothFrame
                  selectedTemplate={selectedTemplate}
                  templateAspectRatio={templateAspectRatio}
                  customFrameImage={customFrameImage}
                  capturedPhotos={capturedPhotos}
                  currentCaptureIndex={currentCaptureIndex}
                  state={state}
                  stream={stream}
                  isMirrored={isMirrored}
                  activeFilter={activeFilter}
                  placedStickers={placedStickers}
                  setPlacedStickers={setPlacedStickers}
                  selectedStickerId={selectedStickerId}
                  setSelectedStickerId={setSelectedStickerId}
                  handleRetakeSingleSlot={handleRetakeSingleSlot}
                  containerRef={containerRef}
                  mode="preview"
                  allStickers={allSelectableStickers}
                  customFramePosition={customFramePosition}
                  setCustomFramePosition={setCustomFramePosition}
                  isAdjustingFrame={isAdjustingFrame}
                />
              </div>
            </div>

            {/* Right Column: Settings, Stickers, & Filters */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tempel Stiker Lucu
                </span>
                
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleStickerUpload}
                    className="hidden"
                    id="pb-custom-sticker-input-preview"
                  />
                  <label
                    htmlFor="pb-custom-sticker-input-preview"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 cursor-pointer font-semibold text-2xs text-center transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload Stiker Custom (.png/.jpg)
                  </label>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-zinc-950/40 p-3 rounded-2xl border border-zinc-800/60 max-h-36 overflow-y-auto">
                  {allSelectableStickers.map((asset) => (
                    <div key={asset.id} className="relative group/stickerItem w-10 h-10 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleAddSticker(asset.id)}
                        draggable="true"
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', asset.id);
                        }}
                        className="w-full h-full hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer flex items-center justify-center p-1.5 rounded-lg bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 hover:border-zinc-700 overflow-hidden"
                        title={asset.name}
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
                            className="w-full h-full flex items-center justify-center pointer-events-none" 
                            dangerouslySetInnerHTML={{ __html: asset.svg }} 
                          />
                        )}
                      </button>
                      {asset.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteUploadedSticker(asset.id, e)}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white shadow-lg cursor-pointer z-10 opacity-0 group-hover/stickerItem:opacity-100 transition-opacity"
                          title="Hapus Stiker Custom"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-zinc-550 leading-tight">
                  💡 Klik stiker untuk menempel di tengah, atau <strong>drag & drop</strong> stiker langsung ke frame preview!
                </div>

                {selectedStickerId && (() => {
                  const sticker = placedStickers.find(s => s.id === selectedStickerId);
                  if (!sticker) return null;
                  return (
                    <div className="flex flex-col gap-3.5 bg-zinc-950/40 p-4 border border-zinc-800/80 rounded-2xl text-xs animate-fade-in">
                      <div className="flex justify-between items-center text-2xs uppercase font-bold text-zinc-500">
                        <span>Pengaturan Stiker</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteSticker(sticker.id)}
                          className="text-red-400 hover:text-red-300 font-semibold"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-3xs text-zinc-500 font-semibold">
                          <span>Ukuran</span>
                          <span>{sticker.size}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="35"
                          value={sticker.size}
                          onChange={(e) => {
                            const newSize = parseInt(e.target.value);
                            setPlacedStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, size: newSize } : s));
                          }}
                          className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-3xs text-zinc-550 font-semibold">
                          <span>Putaran</span>
                          <span>{sticker.rotation}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={sticker.rotation}
                          onChange={(e) => {
                            const newRot = parseInt(e.target.value);
                            setPlacedStickers(prev => prev.map(s => s.id === sticker.id ? { ...s, rotation: newRot } : s));
                          }}
                          className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    </div>
                  );
                })()}

                {placedStickers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPlacedStickers([]);
                      setSelectedStickerId(null);
                    }}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-semibold text-2xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Hapus Semua Stiker
                  </button>
                )}
              </div>

              <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Edit Filter
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {PHOTO_FILTERS.map((filt) => (
                    <button
                      key={filt.id}
                      type="button"
                      onClick={() => handleFilterChange(filt)}
                      className={`px-1.5 py-2 rounded-lg text-2xs font-semibold border text-center transition-all duration-300 ${
                        activeFilter.id === filt.id
                          ? 'bg-zinc-200 text-zinc-950 border-zinc-200'
                          : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                      }`}
                    >
                      {filt.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isCompiling}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-650 text-zinc-950 transition-all duration-300 font-bold text-sm active:scale-95 shadow-xl shadow-emerald-500/10 cursor-pointer"
                >
                  {isCompiling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Memproses Unduhan...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Simpan Foto
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRetake}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white transition-all duration-300 font-semibold text-sm active:scale-95 shadow-md cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Foto Ulang
                </button>
              </div>

              <button
                type="button"
                onClick={handleBackToIdle}
                className="text-2xs text-zinc-550 hover:text-zinc-300 transition-colors uppercase tracking-widest font-bold text-center mt-2 cursor-pointer"
              >
                Kembali ke Menu Utama
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
