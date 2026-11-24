'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  Copy,
  Download,
  FlipHorizontal2,
  ImagePlus,
  Layers,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Smile,
  SwitchCamera,
  Trash2,
  Type,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { PhotoboothTemplate } from '@/types/portfolio';
import { urlFor } from '@/sanity/lib/image';
import { STICKER_ASSETS, StickerAsset } from './StickerAssets';
import {
  BoothState,
  CountdownMode,
  CustomFramePosition,
  DEFAULT_PHOTO_TRANSFORM,
  LOCAL_TEMPLATES,
  PHOTO_FILTERS,
  PhotoFilter,
  PhotoTransform,
  PlacedSticker,
  SlotCoordinate,
} from './PhotoBoothTypes';
import {
  detectTransparentSlotsFromPng,
  getFrameSpec,
  playSound,
} from './PhotoBoothHelpers';
import { compilePhotoBoothCanvas } from './PhotoBoothCanvas';
import PhotoBoothFrame from './PhotoBoothFrame';
import FramePickerPanel from './FramePickerPanel';

interface PhotoBoothClientProps {
  initialSanityTemplates?: PhotoboothTemplate[];
}

type StudioTab = 'frames' | 'filters' | 'caption';
type EditTab = 'stickers' | 'frames' | 'filters' | 'caption';

const DEFAULT_CUSTOM_TEMPLATE: PhotoboothTemplate = {
  _id: 'custom-user-frame',
  name: 'Frame Custom PNG',
  maxPhotos: 4,
  layout: 'strip',
  isActive: true,
  topPadding: 3,
  bottomPadding: 10,
  sidePadding: 4,
  rowSpacing: 2,
  colSpacing: 3,
};

export default function PhotoBoothClient({
  initialSanityTemplates = [],
}: PhotoBoothClientProps) {
  const [customFrameImage, setCustomFrameImage] = useState<string | null>(null);
  const [customFrameConfig, setCustomFrameConfig] = useState<PhotoboothTemplate>(
    DEFAULT_CUSTOM_TEMPLATE
  );

  const templates = useMemo(() => {
    const activeSanity = initialSanityTemplates.filter((t) => t.isActive !== false);
    return [...LOCAL_TEMPLATES, ...activeSanity, customFrameConfig];
  }, [initialSanityTemplates, customFrameConfig]);

  const [state, setState] = useState<BoothState>('idle');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(LOCAL_TEMPLATES[0]._id);
  const [aspectRatioMap, setAspectRatioMap] = useState<Record<string, number>>({});

  const selectedTemplate = useMemo(() => {
    return templates.find((t) => t._id === selectedTemplateId) ?? templates[0];
  }, [templates, selectedTemplateId]);

  const activeFrameUrl = useMemo(() => {
    if (selectedTemplate._id === 'custom-user-frame') return customFrameImage;
    if (!selectedTemplate._id.startsWith('local-') && selectedTemplate.frameImage) {
      return urlFor(selectedTemplate.frameImage).url();
    }
    return null;
  }, [selectedTemplate, customFrameImage]);

  const templateAspectRatio = activeFrameUrl ? (aspectRatioMap[activeFrameUrl] ?? null) : null;

  // Capture & camera state
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const capturedPhotosRef = useRef<string[]>([]);
  const retakeIndexRef = useRef<number | null>(null);
  const [currentCaptureIndex, setCurrentCaptureIndex] = useState(0);
  const [countdown, setCountdown] = useState<number>(3);
  const [countdownMode, setCountdownMode] = useState<CountdownMode>(3);
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>(PHOTO_FILTERS[0]);
  const [isMirrored, setIsMirrored] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);

  // Caption & export state
  const [customCaption, setCustomCaption] = useState('');
  const [showDate, setShowDate] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [copyDone, setCopyDone] = useState(false);

  // Feedback banner (replaces window.alert)
  const [notice, setNotice] = useState<{ type: 'error' | 'info'; message: string } | null>(null);

  // Tabs & stickers state
  const [setupTab, setSetupTab] = useState<StudioTab>('frames');
  const [editTab, setEditTab] = useState<EditTab>('stickers');
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [uploadedStickers, setUploadedStickers] = useState<StickerAsset[]>([]);
  const [isAdjustingFrame, setIsAdjustingFrame] = useState(false);
  const [customFramePosition, setCustomFramePosition] = useState<CustomFramePosition>({
    x: 0,
    y: 0,
    w: 100,
    h: 100,
  });
  const [customDetectedSlots, setCustomDetectedSlots] = useState<SlotCoordinate[] | null>(null);
  const [cmsDetectedSlotsMap, setCmsDetectedSlotsMap] = useState<Record<string, SlotCoordinate[]>>({});
  const [useAutoDetectedSlots, setUseAutoDetectedSlots] = useState(true);
  const [photoTransforms, setPhotoTransforms] = useState<Record<number, PhotoTransform>>({});
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const activeDetectedSlots = useMemo(() => {
    if (selectedTemplate._id === 'custom-user-frame') {
      return useAutoDetectedSlots ? customDetectedSlots : null;
    }
    if (!selectedTemplate._id.startsWith('local-') && activeFrameUrl) {
      return cmsDetectedSlotsMap[activeFrameUrl] ?? null;
    }
    return null;
  }, [selectedTemplate._id, useAutoDetectedSlots, customDetectedSlots, activeFrameUrl, cmsDetectedSlotsMap]);

  // Refs for DOM elements & timer cleanup
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bulkUploadInputRef = useRef<HTMLInputElement>(null);
  const singleSlotInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetSlotRef = useRef<number>(0);

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutIdsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const allSelectableStickers = useMemo(
    () => [...STICKER_ASSETS, ...uploadedStickers],
    [uploadedStickers]
  );

  const selectedSticker = useMemo(
    () => placedStickers.find((s) => s.id === selectedStickerId) ?? null,
    [placedStickers, selectedStickerId]
  );

  const showNotice = useCallback((message: string, type: 'error' | 'info' = 'error') => {
    setNotice({ type, message });
  }, []);

  const clearAllTimers = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    timeoutIdsRef.current.forEach((id) => clearTimeout(id));
    timeoutIdsRef.current.clear();
  }, []);

  const scheduleTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeoutIdsRef.current.delete(id);
      fn();
    }, ms);
    timeoutIdsRef.current.add(id);
    return id;
  }, []);

  // Hydrate saved custom frame & stickers asynchronously after mount
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active || typeof window === 'undefined') return;
      try {
        const savedConfig = localStorage.getItem('pb-custom-frame-config');
        if (savedConfig) {
          setCustomFrameConfig(JSON.parse(savedConfig));
        }
        const savedSelectedId = localStorage.getItem('pb-selected-template-id');
        if (savedSelectedId) {
          setSelectedTemplateId(savedSelectedId);
        }
        const savedImage = localStorage.getItem('pb-custom-frame-image');
        if (savedImage) {
          setCustomFrameImage(savedImage);
          detectTransparentSlotsFromPng(savedImage).then((detected) => {
            if (!active) return;
            if (detected.slots.length > 0) {
              setCustomDetectedSlots(detected.slots);
              setUseAutoDetectedSlots(true);
            }
          });
        }
        const savedStickers = localStorage.getItem('pb-uploaded-stickers');
        if (savedStickers) {
          setUploadedStickers(JSON.parse(savedStickers));
        }
        const savedPosition = localStorage.getItem('pb-custom-frame-position');
        if (savedPosition) {
          setCustomFramePosition(JSON.parse(savedPosition));
        }
      } catch (err) {
        console.error('Failed to restore saved Photo Booth state', err);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist custom frame position
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('pb-custom-frame-position', JSON.stringify(customFramePosition));
    } catch {
      // Ignore storage quota issues
    }
  }, [customFramePosition]);

  // Measure natural aspect ratio & auto-detect transparent slots for Sanity CMS / external PNG frames
  useEffect(() => {
    if (!activeFrameUrl) return;
    const isCmsFrame =
      !selectedTemplate._id.startsWith('local-') && selectedTemplate._id !== 'custom-user-frame';
    const needsAspect = !aspectRatioMap[activeFrameUrl];
    const needsCmsSlots = isCmsFrame && !(activeFrameUrl in cmsDetectedSlotsMap);
    if (!needsAspect && !needsCmsSlots) return;

    let cancelled = false;
    detectTransparentSlotsFromPng(activeFrameUrl).then((detected) => {
      if (cancelled) return;
      if (needsAspect && detected.aspectRatio > 0) {
        setAspectRatioMap((prev) => ({
          ...prev,
          [activeFrameUrl]: detected.aspectRatio,
        }));
      }
      if (needsCmsSlots) {
        setCmsDetectedSlotsMap((prev) => ({
          ...prev,
          [activeFrameUrl]: detected.slots,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeFrameUrl, selectedTemplate._id, aspectRatioMap, cmsDetectedSlotsMap]);

  // Bind webcam stream to primary video element without flickering on re-render
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
  }, [stream, state]);

  // Cleanup camera stream and active timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Persist custom template edits
  const saveCustomConfig = (newConfig: PhotoboothTemplate) => {
    setCustomFrameConfig(newConfig);
    setSelectedTemplateId(newConfig._id);
    try {
      localStorage.setItem('pb-custom-frame-config', JSON.stringify(newConfig));
      localStorage.setItem('pb-selected-template-id', newConfig._id);
    } catch {
      // Ignore quota
    }
  };

  const handleSelectTemplate = (temp: PhotoboothTemplate) => {
    setSelectedTemplateId(temp._id);
    setNotice(null);
    if (temp._id !== 'custom-user-frame') {
      setIsAdjustingFrame(false);
    }
    try {
      localStorage.setItem('pb-selected-template-id', temp._id);
    } catch {
      // Ignore quota
    }
  };

  const handleCustomFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'image/png') {
      showNotice('Format frame custom harus berupa file PNG transparan.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setCustomFrameImage(base64);
      setCustomFramePosition({ x: 0, y: 0, w: 100, h: 100 });

      const detected = await detectTransparentSlotsFromPng(base64);
      setAspectRatioMap((prev) => ({ ...prev, [base64]: detected.aspectRatio }));

      if (detected.slots.length > 0) {
        setCustomDetectedSlots(detected.slots);
        setUseAutoDetectedSlots(true);
        const autoConfig: PhotoboothTemplate = {
          ...customFrameConfig,
          maxPhotos: detected.slots.length,
          layout: detected.layout,
        };
        saveCustomConfig(autoConfig);
        showNotice(
          `Frame PNG otomatis disesuaikan: terdeteksi ${detected.slots.length} kotak foto transparan.`,
          'info'
        );
      } else {
        setCustomDetectedSlots(null);
        setUseAutoDetectedSlots(false);
        showNotice(
          'Tidak ditemukan area transparan di dalam PNG. Pastikan kotak foto sudah transparan atau atur margin secara manual.',
          'info'
        );
      }

      try {
        localStorage.setItem('pb-custom-frame-image', base64);
      } catch {
        localStorage.removeItem('pb-custom-frame-image');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showNotice('File stiker harus berupa gambar (PNG, WebP, JPG, atau SVG).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newSticker: StickerAsset = {
          id: `custom-sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.name.replace(/\.[^.]+$/, '') || 'Stiker Custom',
          svg: '',
          isCustom: true,
          src: base64,
        };

        setUploadedStickers((prev) => {
          const updated = [...prev, newSticker];
          try {
            localStorage.setItem('pb-uploaded-stickers', JSON.stringify(updated));
          } catch {
            showNotice(
              'Penyimpanan lokal browser penuh. Stiker tetap bisa dipakai untuk sesi ini.',
              'info'
            );
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDeleteUploadedSticker = (id: string) => {
    setUploadedStickers((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem('pb-uploaded-stickers', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    setPlacedStickers((prev) => prev.filter((s) => s.stickerId !== id));
  };

  // --- CAMERA CONTROLS ---
  const stopCamera = useCallback(() => {
    clearAllTimers();
    setStream((prev) => {
      if (prev) prev.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, [clearAllTimers]);

  const startCamera = useCallback(
    async (requestedFacing: 'user' | 'environment' = facingMode) => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        showNotice(
          'Browser ini tidak mendukung akses kamera langsung. Gunakan fitur Upload Foto dari Perangkat.'
        );
        return;
      }

      clearAllTimers();
      setNotice(null);
      setIsStartingCamera(true);
      setState('ready');

      try {
        setStream((prev) => {
          if (prev) prev.getTracks().forEach((t) => t.stop());
          return null;
        });

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 960 },
            facingMode: requestedFacing,
          },
          audio: false,
        });

        setStream(mediaStream);
        setFacingMode(requestedFacing);
        if (requestedFacing === 'environment') {
          setIsMirrored(false);
        }
      } catch (err) {
        const error = err as { name?: string };
        const msg =
          error.name === 'NotAllowedError'
            ? 'Akses kamera ditolak browser. Izinkan kamera atau gunakan Upload Foto dari Perangkat.'
            : 'Kamera tidak terdeteksi. Pastikan perangkat kamera aktif atau upload foto langsung.';
        showNotice(msg);
        setState('idle');
      } finally {
        setIsStartingCamera(false);
      }
    },
    [clearAllTimers, facingMode, showNotice]
  );

  const handleToggleFacingCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    startCamera(nextFacing);
  };

  // --- CAPTURE ENGINE ---
  const captureSnapshot = useCallback(
    (slotIndex: number, autoContinue: boolean) => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        showNotice('Kamera belum siap mengambil gambar. Coba sesaat lagi.');
        setState('ready');
        return;
      }

      playSound('shutter', soundEnabled);
      setState('flash');

      scheduleTimeout(() => {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = video.videoWidth || 1280;
        snapCanvas.height = video.videoHeight || 720;
        const ctx = snapCanvas.getContext('2d');

        if (!ctx) {
          setState('ready');
          return;
        }

        if (isMirrored) {
          ctx.translate(snapCanvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, snapCanvas.width, snapCanvas.height);
        const dataUrl = snapCanvas.toDataURL('image/jpeg', 0.95);

        const updated = [...capturedPhotosRef.current];
        updated[slotIndex] = dataUrl;
        capturedPhotosRef.current = updated;
        setCapturedPhotos(updated);

        // Single slot retake finished -> return to review
        if (retakeIndexRef.current !== null) {
          retakeIndexRef.current = null;
          scheduleTimeout(() => {
            setState('review');
          }, 450);
          return;
        }

        const nextIndex = slotIndex + 1;
        if (nextIndex < selectedTemplate.maxPhotos) {
          setCurrentCaptureIndex(nextIndex);
          if (autoContinue && countdownMode > 0) {
            scheduleTimeout(() => {
              // Start next automatic countdown
              setCountdown(countdownMode);
              setState('countdown');
              let remaining: number = countdownMode;
              playSound('beep', soundEnabled);

              countdownIntervalRef.current = setInterval(() => {
                remaining -= 1;
                if (remaining > 0) {
                  setCountdown(remaining);
                  playSound('beep', soundEnabled);
                } else {
                  if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current);
                    countdownIntervalRef.current = null;
                  }
                  captureSnapshot(nextIndex, true);
                }
              }, 1000);
            }, 650);
          } else {
            // Manual mode: pause and let user press shutter when ready for next pose
            scheduleTimeout(() => {
              setState('ready');
            }, 350);
          }
        } else {
          scheduleTimeout(() => {
            setState('review');
          }, 550);
        }
      }, 140);
    },
    [countdownMode, isMirrored, scheduleTimeout, selectedTemplate.maxPhotos, showNotice, soundEnabled]
  );

  const runCountdownForSlot = useCallback(
    (slotIndex: number, autoContinue: boolean) => {
      clearAllTimers();
      setCurrentCaptureIndex(slotIndex);

      if (countdownMode === 0) {
        captureSnapshot(slotIndex, false);
        return;
      }

      setCountdown(countdownMode);
      setState('countdown');
      let remaining: number = countdownMode;
      playSound('beep', soundEnabled);

      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining > 0) {
          setCountdown(remaining);
          playSound('beep', soundEnabled);
        } else {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          captureSnapshot(slotIndex, autoContinue);
        }
      }, 1000);
    },
    [captureSnapshot, clearAllTimers, countdownMode, soundEnabled]
  );

  const handleStartOrSnapShutter = () => {
    if (!stream) return;
    setNotice(null);

    if (countdownMode === 0) {
      // Manual shot-by-shot mode
      const nextEmpty = capturedPhotosRef.current.length;
      const targetIdx =
        nextEmpty < selectedTemplate.maxPhotos ? nextEmpty : currentCaptureIndex;
      retakeIndexRef.current = null;
      runCountdownForSlot(targetIdx, false);
      return;
    }

    // Automatic session mode
    capturedPhotosRef.current = [];
    setCapturedPhotos([]);
    retakeIndexRef.current = null;
    runCountdownForSlot(0, true);
  };

  const handleRetakeSingleSlot = (slotIdx: number) => {
    if (!stream) return;
    retakeIndexRef.current = slotIdx;
    runCountdownForSlot(slotIdx, false);
  };

  const handleRetakeAll = () => {
    clearAllTimers();
    capturedPhotosRef.current = [];
    setCapturedPhotos([]);
    setPhotoTransforms({});
    setSelectedSlotIndex(null);
    retakeIndexRef.current = null;
    setCurrentCaptureIndex(0);
    setPlacedStickers([]);
    setSelectedStickerId(null);
    setNotice(null);
    if (stream) {
      setState('ready');
    } else {
      startCamera(facingMode);
    }
  };

  const handleGoToEditStudio = () => {
    stopCamera();
    setNotice(null);
    setState('preview');
  };

  const handleBackToIdle = () => {
    stopCamera();
    capturedPhotosRef.current = [];
    setCapturedPhotos([]);
    setPhotoTransforms({});
    setSelectedSlotIndex(null);
    setCurrentCaptureIndex(0);
    setPlacedStickers([]);
    setSelectedStickerId(null);
    setNotice(null);
    setState('idle');
  };

  // --- LOCAL PHOTO UPLOAD (NO CAMERA REQUIRED!) ---
  const readImageFileAsDataUrl = (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => resolve((ev.target?.result as string) || null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleBulkPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).slice(0, Math.max(selectedTemplate.maxPhotos, 6));
    const results = await Promise.all(validFiles.map(readImageFileAsDataUrl));
    const dataUrls = results.filter((u): u is string => Boolean(u));
    e.target.value = '';

    if (dataUrls.length === 0) {
      showNotice('File yang dipilih bukan gambar valid (JPG, PNG, atau WebP).');
      return;
    }

    stopCamera();
    capturedPhotosRef.current = dataUrls;
    setCapturedPhotos(dataUrls);
    setPhotoTransforms({});
    setSelectedSlotIndex(0);
    setNotice(null);
    setState('preview');
  };

  const triggerSingleSlotUpload = (slotIdx: number) => {
    uploadTargetSlotRef.current = slotIdx;
    singleSlotInputRef.current?.click();
  };

  const applySingleSlotFile = async (slotIdx: number, file: File) => {
    const dataUrl = await readImageFileAsDataUrl(file);
    if (!dataUrl) {
      showNotice('Format file harus berupa gambar valid (JPG, PNG, atau WebP).');
      return;
    }

    const updated = [...capturedPhotosRef.current];
    updated[slotIdx] = dataUrl;
    capturedPhotosRef.current = updated;
    setCapturedPhotos(updated);
    setPhotoTransforms((prev) => ({
      ...prev,
      [slotIdx]: { ...DEFAULT_PHOTO_TRANSFORM },
    }));
    setSelectedSlotIndex(slotIdx);
    setNotice(null);
    if (state === 'idle') {
      setState('preview');
    }
  };

  const handleSingleSlotUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await applySingleSlotFile(uploadTargetSlotRef.current, file);
  };

  const handleDropFileOnSlot = (slotIdx: number, file: File) => {
    void applySingleSlotFile(slotIdx, file);
  };

  // --- STICKER ACTIONS ---
  const addStickerToCanvas = (stickerId: string) => {
    const jitterX = 42 + Math.round(Math.random() * 16);
    const jitterY = 38 + Math.round(Math.random() * 24);
    const newSticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stickerId,
      x: jitterX,
      y: jitterY,
      size: 20,
      rotation: 0,
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  const updateSelectedSticker = (patch: Partial<PlacedSticker>) => {
    if (!selectedStickerId) return;
    setPlacedStickers((prev) =>
      prev.map((st) => (st.id === selectedStickerId ? { ...st, ...patch } : st))
    );
  };

  const duplicateSelectedSticker = () => {
    if (!selectedSticker) return;
    const copy: PlacedSticker = {
      ...selectedSticker,
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: Math.min(92, selectedSticker.x + 6),
      y: Math.min(92, selectedSticker.y + 6),
    };
    setPlacedStickers((prev) => [...prev, copy]);
    setSelectedStickerId(copy.id);
  };

  // --- HD EXPORT (DOWNLOAD & COPY) ---
  const renderExportDataUrl = async (): Promise<string | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    setIsCompiling(true);
    setNotice(null);
    try {
      return await compilePhotoBoothCanvas({
        canvas,
        selectedTemplate,
        templateAspectRatio,
        customFrameImage,
        customFramePosition,
        customDetectedSlots: activeDetectedSlots,
        photos: capturedPhotos,
        photoTransforms,
        activeFilter,
        placedStickers,
        allStickers: allSelectableStickers,
        customCaption,
        showDate,
      });
    } catch (err) {
      console.error('Canvas compile failed', err);
      showNotice('Gagal menyusun gambar HD. Silakan coba lagi.');
      return null;
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadPNG = async () => {
    const dataUrl = await renderExportDataUrl();
    if (!dataUrl) return;

    const safeName = selectedTemplate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const link = document.createElement('a');
    link.download = `photobooth-${safeName}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadDone(true);
    scheduleTimeout(() => setDownloadDone(false), 2200);
  };

  const handleCopyPNG = async () => {
    const dataUrl = await renderExportDataUrl();
    if (!dataUrl) return;

    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') {
      showNotice('Browser ini tidak mendukung salin gambar langsung. Gunakan tombol Unduh HD PNG.', 'info');
      return;
    }

    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopyDone(true);
      scheduleTimeout(() => setCopyDone(false), 2200);
    } catch {
      showNotice('Clipboard dibatasi oleh browser. Gunakan tombol Unduh HD PNG.', 'info');
    }
  };

  const currentStep = state === 'idle' ? 1 : state === 'preview' ? 3 : 2;
  const filledCount = capturedPhotos.slice(0, selectedTemplate.maxPhotos).filter(Boolean).length;
  const activeSpec = getFrameSpec(selectedTemplate._id);
  const isCaptureRunning = state === 'countdown' || state === 'flash';

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 text-[#FAFAFA]">
      {/* Hidden offscreen HD canvas + file inputs */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
      <input
        ref={bulkUploadInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleBulkPhotoUpload}
        className="sr-only"
        aria-label="Upload foto dari perangkat"
      />
      <input
        ref={singleSlotInputRef}
        type="file"
        accept="image/*"
        onChange={handleSingleSlotUploadChange}
        className="sr-only"
        aria-label="Upload foto untuk slot tertentu"
      />

      {/* Top Studio Header & Step Indicator */}
      <header className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#94949E]">
            STUDIO / PHOTO BOOTH ONLINE
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Photo Booth Studio
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            {templates.length} pilihan frame, {PHOTO_FILTERS.length} filter warna,{' '}
            {STICKER_ASSETS.length} stiker vektor, dan ekspor PNG HD.
          </p>
        </div>

        {/* Clean 3-step studio breadcrumb */}
        <ol className="flex items-center gap-2 text-xs font-mono shrink-0" aria-label="Tahapan sesi">
          {[
            { num: 1, label: 'Frame' },
            { num: 2, label: 'Ambil Foto' },
            { num: 3, label: 'Edit & Simpan' },
          ].map((step) => {
            const isCurrent = currentStep === step.num;
            const isDone = currentStep > step.num;
            return (
              <li
                key={step.num}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
                  isCurrent
                    ? 'bg-white text-[#09090B] border-white font-semibold'
                    : isDone
                      ? 'bg-[#18181B] text-[#FAFAFA] border-zinc-700'
                      : 'bg-[#111113] text-[#94949E] border-zinc-800'
                }`}
              >
                <span>0{step.num}</span>
                <span>{step.label}</span>
              </li>
            );
          })}
        </ol>
      </header>

      {/* Accessible Inline Notice / Error Banner */}
      {notice && (
        <div
          role="alert"
          className={`mb-5 px-4 py-3 rounded-xl border flex items-start justify-between gap-3 text-sm ${
            notice.type === 'error'
              ? 'bg-[#2A1215] border-[#B91C1C] text-[#FECACA]'
              : 'bg-[#18181B] border-zinc-600 text-[#E4E4E7]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{notice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Tutup pemberitahuan"
            className="p-1 rounded-md hover:bg-white/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================== STAGE 1: IDLE / FRAME SETUP ==================== */}
      {state === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Preview Stage */}
          <section
            aria-label="Pratinjau frame terpilih"
            className="lg:col-span-5 bg-[#111113] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#94949E]">
                  Pratinjau Langsung
                </span>
                <h2 className="text-base font-semibold text-white">{selectedTemplate.name}</h2>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#18181B] border border-zinc-700 text-xs font-mono text-[#E4E4E7]">
                {selectedTemplate.maxPhotos} Foto
              </span>
            </div>

            <div className="w-full py-4 px-2 rounded-xl bg-[#09090B] border border-zinc-800/80 flex items-center justify-center min-h-[340px]">
              <PhotoBoothFrame
                selectedTemplate={selectedTemplate}
                templateAspectRatio={templateAspectRatio}
                customFrameImage={customFrameImage}
                customDetectedSlots={activeDetectedSlots}
                capturedPhotos={capturedPhotos}
                photoTransforms={photoTransforms}
                setPhotoTransforms={setPhotoTransforms}
                selectedSlotIndex={selectedSlotIndex}
                setSelectedSlotIndex={setSelectedSlotIndex}
                currentCaptureIndex={0}
                state="idle"
                stream={null}
                isMirrored={isMirrored}
                activeFilter={activeFilter}
                placedStickers={placedStickers}
                setPlacedStickers={setPlacedStickers}
                selectedStickerId={selectedStickerId}
                setSelectedStickerId={setSelectedStickerId}
                handleUploadSingleSlot={triggerSingleSlotUpload}
                onDropFileOnSlot={handleDropFileOnSlot}
                mode="setup"
                containerRef={containerRef}
                allStickers={allSelectableStickers}
                customFramePosition={customFramePosition}
                setCustomFramePosition={setCustomFramePosition}
                isAdjustingFrame={isAdjustingFrame}
                customCaption={customCaption}
                showDate={showDate}
              />
            </div>

            <p className="text-xs text-[#94949E] text-center mt-3">
              Klik slot di atas untuk mengisi satu foto, atau mulai sesi di bawah.
            </p>

            {/* Primary & Secondary Capture CTAs */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                disabled={isStartingCamera}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-white text-[#09090B] hover:bg-zinc-200 disabled:opacity-60 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
              >
                {isStartingCamera ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="w-4 h-4" aria-hidden="true" />
                )}
                Buka Kamera
              </button>

              <button
                type="button"
                onClick={() => bulkUploadInputRef.current?.click()}
                className="min-h-[48px] px-4 py-3 rounded-xl bg-[#18181B] text-[#FAFAFA] hover:bg-zinc-800 border border-zinc-700 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
              >
                <ImagePlus className="w-4 h-4" aria-hidden="true" />
                Upload Foto
              </button>
            </div>
          </section>

          {/* Right Configuration Panel */}
          <section
            aria-label="Katalog frame, filter, dan teks"
            className="lg:col-span-7 bg-[#111113] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5"
          >
            {/* Inspector Tabs */}
            <div
              role="tablist"
              aria-label="Menu pengaturan booth"
              className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#09090B] border border-zinc-800"
            >
              {[
                { id: 'frames' as StudioTab, label: `Frame (${templates.length})`, icon: Layers },
                { id: 'filters' as StudioTab, label: `Filter (${PHOTO_FILTERS.length})`, icon: SlidersHorizontal },
                { id: 'caption' as StudioTab, label: 'Teks & Tanggal', icon: Type },
              ].map(({ id, label, icon: Icon }) => {
                const active = setupTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSetupTab(id)}
                    className={`min-h-[42px] px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      active
                        ? 'bg-white text-[#09090B]'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>

            {setupTab === 'frames' && (
              <FramePickerPanel
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleSelectTemplate}
                customFrameConfig={customFrameConfig}
                customFrameImage={customFrameImage}
                onSaveCustomConfig={saveCustomConfig}
                onCustomFrameUpload={handleCustomFrameUpload}
                isAdjustingFrame={isAdjustingFrame}
                setIsAdjustingFrame={setIsAdjustingFrame}
                customFramePosition={customFramePosition}
                setCustomFramePosition={setCustomFramePosition}
                hasSanityTemplates={initialSanityTemplates.length > 0}
                customDetectedSlotsCount={customDetectedSlots?.length ?? 0}
                useAutoDetectedSlots={useAutoDetectedSlots}
                onToggleAutoDetectedSlots={() => setUseAutoDetectedSlots((v) => !v)}
              />
            )}

            {setupTab === 'filters' && (
              <div className="space-y-3">
                <p className="text-xs text-[#A1A1AA]">
                  Filter diterapkan langsung ke kamera dan hasil foto HD. Anda tetap bisa mengganti filter setelah memotret.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PHOTO_FILTERS.map((filter) => {
                    const active = activeFilter.id === filter.id;
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        aria-pressed={active}
                        className={`min-h-[48px] px-3 py-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          active
                            ? 'bg-white text-[#09090B] border-white font-semibold'
                            : 'bg-[#18181B] text-[#FAFAFA] border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full shrink-0 border border-black/20"
                          style={{ background: filter.swatch }}
                          aria-hidden="true"
                        />
                        <span className="text-xs truncate">{filter.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {setupTab === 'caption' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="pb-setup-caption"
                    className="block text-sm font-medium text-[#FAFAFA]"
                  >
                    Teks Footer Frame
                  </label>
                  <input
                    id="pb-setup-caption"
                    type="text"
                    maxLength={36}
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder={activeSpec.defaultCaption}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-sm text-white placeholder:text-[#94949E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  />
                  <p className="text-xs text-[#94949E]">
                    Kosongkan untuk memakai judul bawaan frame ({activeSpec.defaultCaption}).
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#09090B] border border-zinc-800">
                  <div>
                    <label htmlFor="pb-setup-show-date" className="text-sm font-medium text-white block">
                      Tampilkan Tanggal Cetak
                    </label>
                    <p className="text-xs text-[#94949E]">
                      Mencetak tanggal hari ini di bagian bawah frame.
                    </p>
                  </div>
                  <input
                    id="pb-setup-show-date"
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="w-5 h-5 accent-white cursor-pointer"
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ==================== STAGE 2: CAMERA CAPTURE & REVIEW ==================== */}
      {(state === 'ready' || state === 'countdown' || state === 'flash' || state === 'review') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Camera Viewfinder */}
          <section
            aria-label="Kamera photo booth"
            className="lg:col-span-8 bg-[#111113] border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4"
          >
            {/* Camera Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleBackToIdle}
                className="min-h-[40px] px-3 py-2 rounded-lg bg-[#18181B] border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                Ganti Frame
              </button>

              {/* Countdown selector + camera toggles */}
              <div className="flex flex-wrap items-center gap-1.5">
                <div
                  role="group"
                  aria-label="Durasi hitung mundur"
                  className="flex items-center p-0.5 rounded-lg bg-[#09090B] border border-zinc-800"
                >
                  {([3, 5, 0] as CountdownMode[]).map((sec) => {
                    const active = countdownMode === sec;
                    return (
                      <button
                        key={sec}
                        type="button"
                        disabled={isCaptureRunning}
                        onClick={() => setCountdownMode(sec)}
                        className={`min-h-[34px] px-2.5 rounded-md text-xs font-mono transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                          active ? 'bg-white text-[#09090B] font-semibold' : 'text-[#A1A1AA] hover:text-white'
                        }`}
                      >
                        {sec === 0 ? 'Manual' : `${sec} dtk`}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMirrored((m) => !m)}
                  aria-pressed={isMirrored}
                  title="Balik cermin kamera"
                  className={`min-h-[38px] px-2.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    isMirrored
                      ? 'bg-white text-[#09090B] border-white'
                      : 'bg-[#18181B] text-[#D4D4D8] border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <FlipHorizontal2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Mirror</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleFacingCamera}
                  disabled={isCaptureRunning}
                  aria-label="Tukar kamera depan dan belakang"
                  title="Tukar kamera depan/belakang"
                  className="min-h-[38px] px-2.5 rounded-lg bg-[#18181B] text-[#D4D4D8] border border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-50 flex items-center gap-1.5 text-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <SwitchCamera className="w-3.5 h-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setSoundEnabled((s) => !s)}
                  aria-pressed={soundEnabled}
                  aria-label={soundEnabled ? 'Matikan suara shutter' : 'Aktifkan suara shutter'}
                  title={soundEnabled ? 'Suara aktif' : 'Suara dimatikan'}
                  className="min-h-[38px] px-2.5 rounded-lg bg-[#18181B] text-[#D4D4D8] border border-zinc-700 hover:bg-zinc-800 hover:text-white flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Camera Stage */}
            <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#09090B] border border-zinc-800">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isMirrored ? '-scale-x-100' : ''}`}
                  style={{
                    filter:
                      activeFilter.cssFilter && activeFilter.cssFilter !== 'none'
                        ? activeFilter.cssFilter
                        : undefined,
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#A1A1AA]">
                  <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                  <span className="text-xs font-mono">Menghubungkan kamera...</span>
                </div>
              )}

              {/* Slot Counter HUD */}
              <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 border border-white/15 text-xs font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
                <span>
                  Slot {Math.min(currentCaptureIndex + 1, selectedTemplate.maxPhotos)} /{' '}
                  {selectedTemplate.maxPhotos}
                </span>
                <span className="text-[#A1A1AA]">• {activeFilter.name}</span>
              </div>

              {/* Countdown Number Overlay */}
              {state === 'countdown' && (
                <div
                  aria-live="assertive"
                  className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none"
                >
                  <span className="text-7xl sm:text-8xl font-bold font-mono text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)]">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Camera Flash Overlay */}
              {state === 'flash' && (
                <div className="absolute inset-0 bg-white pointer-events-none" />
              )}

              {/* Review Overlay Hint */}
              {state === 'review' && (
                <div className="absolute inset-x-3 bottom-3 px-4 py-3 rounded-xl bg-black/85 border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs sm:text-sm text-white">
                    Semua {selectedTemplate.maxPhotos} foto selesai. Klik ikon ulang di pratinjau kanan jika ingin mengulang slot tertentu.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Filter Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-mono">
              {PHOTO_FILTERS.map((filter) => {
                const active = activeFilter.id === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      active
                        ? 'bg-white text-[#09090B] font-semibold'
                        : 'bg-[#18181B] text-[#D4D4D8] border border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-black/25"
                      style={{ background: filter.swatch }}
                      aria-hidden="true"
                    />
                    {filter.name}
                  </button>
                );
              })}
            </div>

            {/* Primary Capture Action Row */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              {state === 'ready' && (
                <>
                  <button
                    type="button"
                    onClick={handleStartOrSnapShutter}
                    disabled={!stream}
                    className="min-h-[48px] px-7 py-3 rounded-xl bg-white text-[#09090B] hover:bg-zinc-200 disabled:opacity-50 font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
                  >
                    <Camera className="w-4 h-4" aria-hidden="true" />
                    {countdownMode === 0
                      ? `Ambil Foto ${Math.min(filledCount + 1, selectedTemplate.maxPhotos)}/${selectedTemplate.maxPhotos}`
                      : `Mulai Sesi (${selectedTemplate.maxPhotos} Foto)`}
                  </button>

                  {filledCount > 0 && (
                    <button
                      type="button"
                      onClick={handleGoToEditStudio}
                      className="min-h-[48px] px-5 py-3 rounded-xl bg-[#18181B] text-white border border-zinc-700 hover:bg-zinc-800 font-medium text-sm flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                      Lanjut Edit ({filledCount}/{selectedTemplate.maxPhotos})
                    </button>
                  )}
                </>
              )}

              {isCaptureRunning && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllTimers();
                    retakeIndexRef.current = null;
                    setState(filledCount >= selectedTemplate.maxPhotos ? 'review' : 'ready');
                  }}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#2A1215] border border-[#B91C1C] text-[#FECACA] hover:bg-[#3A161A] text-sm font-medium flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  Batalkan Hitung Mundur
                </button>
              )}

              {state === 'review' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoToEditStudio}
                    className="min-h-[48px] px-7 py-3 rounded-xl bg-white text-[#09090B] hover:bg-zinc-200 font-semibold text-sm flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Lanjut ke Stiker & Simpan
                  </button>

                  <button
                    type="button"
                    onClick={handleRetakeAll}
                    className="min-h-[48px] px-5 py-3 rounded-xl bg-[#18181B] text-[#FAFAFA] border border-zinc-700 hover:bg-zinc-800 font-medium text-sm flex items-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    Ulang Semua
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Right Live Frame Progress Strip */}
          <aside
            aria-label="Hasil sementara frame"
            className="lg:col-span-4 bg-[#111113] border border-zinc-800 rounded-2xl p-5 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#94949E]">
                Live Strip
              </span>
              <span className="text-xs font-mono text-[#FAFAFA]">
                {filledCount}/{selectedTemplate.maxPhotos} terisi
              </span>
            </div>

            <div className="w-full py-4 px-2 rounded-xl bg-[#09090B] border border-zinc-800/80 flex items-center justify-center">
              <PhotoBoothFrame
                selectedTemplate={selectedTemplate}
                templateAspectRatio={templateAspectRatio}
                customFrameImage={customFrameImage}
                customDetectedSlots={activeDetectedSlots}
                capturedPhotos={capturedPhotos}
                photoTransforms={photoTransforms}
                setPhotoTransforms={setPhotoTransforms}
                selectedSlotIndex={selectedSlotIndex}
                setSelectedSlotIndex={setSelectedSlotIndex}
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
                handleUploadSingleSlot={triggerSingleSlotUpload}
                onDropFileOnSlot={handleDropFileOnSlot}
                mode="capture"
                containerRef={containerRef}
                allStickers={allSelectableStickers}
                customFramePosition={customFramePosition}
                setCustomFramePosition={setCustomFramePosition}
                isAdjustingFrame={false}
                customCaption={customCaption}
                showDate={showDate}
              />
            </div>

            <p className="text-xs text-[#94949E] text-center mt-3">
              {state === 'review'
                ? 'Arahkan kursor atau sentuh foto di atas untuk memotret ulang atau mengganti slot.'
                : 'Setiap foto otomatis masuk ke slot frame secara real-time.'}
            </p>
          </aside>
        </div>
      )}

      {/* ==================== STAGE 3: EDIT STUDIO (STICKERS, FRAME SWITCH, HD EXPORT) ==================== */}
      {state === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Interactive Result Preview */}
          <section
            aria-label="Kanvas hasil akhir photo booth"
            className="lg:col-span-5 bg-[#111113] border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between mb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#94949E]">
                  Hasil Siap Cetak
                </span>
                <h2 className="text-base font-semibold text-white">{selectedTemplate.name}</h2>
              </div>
              <span className="text-xs font-mono text-[#A1A1AA]">
                {filledCount}/{selectedTemplate.maxPhotos} foto
              </span>
            </div>

            <div className="w-full py-5 px-3 rounded-xl bg-[#09090B] border border-zinc-800/80 flex items-center justify-center">
              <PhotoBoothFrame
                selectedTemplate={selectedTemplate}
                templateAspectRatio={templateAspectRatio}
                customFrameImage={customFrameImage}
                customDetectedSlots={activeDetectedSlots}
                capturedPhotos={capturedPhotos}
                photoTransforms={photoTransforms}
                setPhotoTransforms={setPhotoTransforms}
                selectedSlotIndex={selectedSlotIndex}
                setSelectedSlotIndex={setSelectedSlotIndex}
                currentCaptureIndex={-1}
                state="preview"
                stream={null}
                isMirrored={isMirrored}
                activeFilter={activeFilter}
                placedStickers={placedStickers}
                setPlacedStickers={setPlacedStickers}
                selectedStickerId={selectedStickerId}
                setSelectedStickerId={setSelectedStickerId}
                handleUploadSingleSlot={triggerSingleSlotUpload}
                onDropFileOnSlot={handleDropFileOnSlot}
                mode="preview"
                containerRef={containerRef}
                allStickers={allSelectableStickers}
                customFramePosition={customFramePosition}
                setCustomFramePosition={setCustomFramePosition}
                isAdjustingFrame={isAdjustingFrame}
                customCaption={customCaption}
                showDate={showDate}
              />
            </div>

            {/* Per-Slot Photo Position & Zoom Controls */}
            {selectedSlotIndex !== null && capturedPhotos[selectedSlotIndex] ? (
              <div className="w-full mt-3 p-3.5 rounded-xl bg-[#09090B] border border-zinc-700 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">
                    Atur Foto Slot {selectedSlotIndex + 1} (Seret langsung pada foto)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSlotIndex(null)}
                    className="text-xs text-[#A1A1AA] hover:text-white px-2 py-0.5 rounded cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Selesai
                  </button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="pb-slot-zoom" className="text-[#A1A1AA]">
                      Zoom Foto
                    </label>
                    <span className="font-mono text-white">
                      {Math.round(
                        (photoTransforms[selectedSlotIndex]?.zoom ?? DEFAULT_PHOTO_TRANSFORM.zoom) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <input
                    id="pb-slot-zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={photoTransforms[selectedSlotIndex]?.zoom ?? DEFAULT_PHOTO_TRANSFORM.zoom}
                    onChange={(e) => {
                      const nextZoom = parseFloat(e.target.value);
                      setPhotoTransforms((prev) => ({
                        ...prev,
                        [selectedSlotIndex]: {
                          ...(prev[selectedSlotIndex] ?? DEFAULT_PHOTO_TRANSFORM),
                          zoom: nextZoom,
                        },
                      }));
                    }}
                    className="w-full accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoTransforms((prev) => ({
                        ...prev,
                        [selectedSlotIndex]: { ...DEFAULT_PHOTO_TRANSFORM },
                      }))
                    }
                    className="flex-1 min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-[#FAFAFA] flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    Reset Posisi
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerSingleSlotUpload(selectedSlotIndex)}
                    className="flex-1 min-h-[36px] px-2.5 py-1.5 rounded-lg bg-[#18181B] border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-[#FAFAFA] flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    Ganti Foto
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#94949E] text-center mt-3">
                Seret langsung foto di dalam kotak untuk mengatur posisi, tarik file gambar ke slot, atau seret stiker di atasnya.
              </p>
            )}

            {/* Primary Export Buttons */}
            <div className="w-full space-y-2.5 mt-4">
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={isCompiling}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-white text-[#09090B] hover:bg-zinc-200 disabled:opacity-60 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111113]"
              >
                {isCompiling ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : downloadDone ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Download className="w-4 h-4" aria-hidden="true" />
                )}
                {isCompiling
                  ? 'Merender HD PNG...'
                  : downloadDone
                    ? 'Tersimpan sebagai PNG HD'
                    : 'Unduh HD PNG'}
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyPNG}
                  disabled={isCompiling}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#18181B] text-[#FAFAFA] hover:bg-zinc-800 border border-zinc-700 disabled:opacity-60 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  {copyDone ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                  {copyDone ? 'Disalin' : 'Salin Gambar'}
                </button>

                <button
                  type="button"
                  onClick={handleRetakeAll}
                  className="min-h-[44px] px-3 py-2.5 rounded-xl bg-[#18181B] text-[#FAFAFA] hover:bg-zinc-800 border border-zinc-700 font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Foto Ulang
                </button>
              </div>
            </div>
          </section>

          {/* Right Editing Tools */}
          <section
            aria-label="Alat edit stiker, frame, filter, dan teks"
            className="lg:col-span-7 bg-[#111113] border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5"
          >
            {/* 4 Edit Tabs */}
            <div
              role="tablist"
              aria-label="Tab editor hasil foto"
              className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#09090B] border border-zinc-800"
            >
              {[
                { id: 'stickers' as EditTab, label: 'Stiker', icon: Smile },
                { id: 'frames' as EditTab, label: 'Frame', icon: Layers },
                { id: 'filters' as EditTab, label: 'Filter', icon: SlidersHorizontal },
                { id: 'caption' as EditTab, label: 'Teks', icon: Type },
              ].map(({ id, label, icon: Icon }) => {
                const active = editTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setEditTab(id)}
                    className={`min-h-[42px] px-2 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                      active
                        ? 'bg-white text-[#09090B]'
                        : 'text-[#A1A1AA] hover:text-white hover:bg-[#18181B]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* STICKERS TAB */}
            {editTab === 'stickers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-[#A1A1AA]">
                    Klik stiker untuk menambahkan, atau tarik langsung ke atas foto.
                  </p>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="pb-sticker-upload"
                      className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#18181B] border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      Upload Stiker
                    </label>
                    <input
                      id="pb-sticker-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleStickerUpload}
                      className="sr-only"
                    />

                    {placedStickers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPlacedStickers([]);
                          setSelectedStickerId(null);
                        }}
                        className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#2A1215] border border-[#B91C1C] text-[#FECACA] hover:bg-[#3A161A] text-xs font-medium flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Hapus Semua
                      </button>
                    )}
                  </div>
                </div>

                {/* Selected Sticker Inspector */}
                {selectedSticker && (
                  <div className="p-4 rounded-xl bg-[#09090B] border border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        Atur Stiker Terpilih
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={duplicateSelectedSticker}
                          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#18181B] border border-zinc-700 hover:bg-zinc-800 text-xs text-[#FAFAFA] flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          Duplikat
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlacedStickers((prev) =>
                              prev.filter((s) => s.id !== selectedSticker.id)
                            );
                            setSelectedStickerId(null);
                          }}
                          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#2A1215] border border-[#B91C1C] text-[#FECACA] hover:bg-[#3A161A] text-xs flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <label htmlFor="pb-sticker-size" className="text-[#A1A1AA]">
                            Ukuran
                          </label>
                          <span className="font-mono text-white">{selectedSticker.size}%</span>
                        </div>
                        <input
                          id="pb-sticker-size"
                          type="range"
                          min={8}
                          max={48}
                          value={selectedSticker.size}
                          onChange={(e) =>
                            updateSelectedSticker({ size: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <label htmlFor="pb-sticker-rotation" className="text-[#A1A1AA]">
                            Rotasi
                          </label>
                          <span className="font-mono text-white">
                            {selectedSticker.rotation} deg
                          </span>
                        </div>
                        <input
                          id="pb-sticker-rotation"
                          type="range"
                          min={-180}
                          max={180}
                          value={selectedSticker.rotation}
                          onChange={(e) =>
                            updateSelectedSticker({ rotation: Number(e.target.value) })
                          }
                          className="w-full accent-white cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Built-in & Uploaded Stickers Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-mono">
                  {allSelectableStickers.map((asset) => (
                    <div
                      key={asset.id}
                      className="relative group"
                    >
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', asset.id)}
                        onClick={() => addStickerToCanvas(asset.id)}
                        title={`Tambah stiker ${asset.name}`}
                        aria-label={`Tambah stiker ${asset.name}`}
                        className="w-full aspect-square p-2.5 rounded-xl bg-[#09090B] border border-zinc-800 hover:border-zinc-500 hover:bg-[#18181B] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        {asset.isCustom && asset.src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.src}
                            alt=""
                            className="w-10 h-10 object-contain pointer-events-none"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 flex items-center justify-center pointer-events-none [&>svg]:w-full [&>svg]:h-full"
                            dangerouslySetInnerHTML={{ __html: asset.svg }}
                          />
                        )}
                      </button>

                      {asset.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteUploadedSticker(asset.id)}
                          aria-label={`Hapus stiker tersimpan ${asset.name}`}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white border border-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SWITCH FRAME LIVE IN EDIT MODE */}
            {editTab === 'frames' && (
              <FramePickerPanel
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={handleSelectTemplate}
                customFrameConfig={customFrameConfig}
                customFrameImage={customFrameImage}
                onSaveCustomConfig={saveCustomConfig}
                onCustomFrameUpload={handleCustomFrameUpload}
                isAdjustingFrame={isAdjustingFrame}
                setIsAdjustingFrame={setIsAdjustingFrame}
                customFramePosition={customFramePosition}
                setCustomFramePosition={setCustomFramePosition}
                hasSanityTemplates={initialSanityTemplates.length > 0}
                customDetectedSlotsCount={customDetectedSlots?.length ?? 0}
                useAutoDetectedSlots={useAutoDetectedSlots}
                onToggleAutoDetectedSlots={() => setUseAutoDetectedSlots((v) => !v)}
              />
            )}

            {/* SWITCH FILTER LIVE IN EDIT MODE */}
            {editTab === 'filters' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PHOTO_FILTERS.map((filter) => {
                  const active = activeFilter.id === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter)}
                      aria-pressed={active}
                      className={`min-h-[48px] px-3 py-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                        active
                          ? 'bg-white text-[#09090B] border-white font-semibold'
                          : 'bg-[#18181B] text-[#FAFAFA] border-zinc-800 hover:border-zinc-600'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full shrink-0 border border-black/20"
                        style={{ background: filter.swatch }}
                        aria-hidden="true"
                      />
                      <span className="text-xs truncate">{filter.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* EDIT CAPTION & DATE */}
            {editTab === 'caption' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="pb-edit-caption"
                    className="block text-sm font-medium text-[#FAFAFA]"
                  >
                    Teks Footer Frame
                  </label>
                  <input
                    id="pb-edit-caption"
                    type="text"
                    maxLength={36}
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    placeholder={activeSpec.defaultCaption}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#09090B] border border-zinc-700 text-sm text-white placeholder:text-[#94949E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  />
                  <p className="text-xs text-[#94949E]">
                    Perubahan langsung terlihat pada pratinjau dan ikut tercetak di HD PNG.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#09090B] border border-zinc-800">
                  <div>
                    <label htmlFor="pb-edit-show-date" className="text-sm font-medium text-white block">
                      Tampilkan Tanggal Cetak
                    </label>
                    <p className="text-xs text-[#94949E]">
                      Menampilkan stempel tanggal di bagian bawah frame bawaan.
                    </p>
                  </div>
                  <input
                    id="pb-edit-show-date"
                    type="checkbox"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="w-5 h-5 accent-white cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-3">
                  <p className="text-xs text-[#A1A1AA]">
                    Ingin mengganti semua foto sekaligus dari galeri?
                  </p>
                  <button
                    type="button"
                    onClick={() => bulkUploadInputRef.current?.click()}
                    className="min-h-[40px] px-3.5 py-2 rounded-lg bg-[#18181B] border border-zinc-700 hover:bg-zinc-800 text-xs font-medium text-white flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <ImagePlus className="w-3.5 h-3.5" aria-hidden="true" />
                    Upload Ulang Foto
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
