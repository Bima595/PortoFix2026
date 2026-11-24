'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { urlFor } from '@/sanity/lib/image';
import type { Certificate } from '@/types/portfolio';

const ImageLightbox = dynamic(
  () => import('@/components/ImageLightbox').then((mod) => mod.ImageLightbox),
  { ssr: false }
);

interface CertificatesSectionProps {
  certificates: Certificate[];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];
const formatIndex = (num: number) => String(num).padStart(2, '0');

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}$/.test(dateString)) return dateString;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : String(date.getFullYear());
};

const getIssuerInitials = (issuer: string): string => {
  const words = issuer.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'CR';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
};

export function CertificatesSection({
  certificates,
  indexLabel = '06',
}: CertificatesSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const thumbRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const items = certificates ?? [];
  const count = items.length;
  const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;
  const active = items[safeIndex];

  const lightboxImages = useMemo(() => {
    return (certificates ?? [])
      .filter((cert) => Boolean(cert.image))
      .map((cert) => ({
        id: cert._id,
        url: urlFor(cert.image!).width(1600).quality(95).url(),
        alt: cert.image?.alt || `${cert.title} - ${cert.issuer}`,
      }));
  }, [certificates]);

  const openLightboxForCert = (certId: string) => {
    const idx = lightboxImages.findIndex((item) => item.id === certId);
    if (idx >= 0) {
      setLightboxIndex(idx);
    }
  };

  const revealThumb = (idx: number) => {
    thumbRefs.current[idx]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  };

  const handlePrev = () => {
    if (count <= 1) return;
    const next = (safeIndex - 1 + count) % count;
    setActiveIndex(next);
    revealThumb(next);
  };

  const handleNext = () => {
    if (count <= 1) return;
    const next = (safeIndex + 1) % count;
    setActiveIndex(next);
    revealThumb(next);
  };

  const handleThumbKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (count <= 1) return;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') {
      nextIndex = (idx + 1) % count;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (idx - 1 + count) % count;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = count - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      setActiveIndex(nextIndex);
      revealThumb(nextIndex);
      thumbRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section
      id="certificates"
      aria-labelledby="certificates-heading"
      className="space-y-8 sm:space-y-10"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5"
      >
        <div className="space-y-1.5">
          <span className="block text-xs font-medium tabular-nums text-[#94949E]">
            {indexLabel}
          </span>
          <h2
            id="certificates-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
          >
            Certificates
          </h2>
          {count > 0 && (
            <p className="text-sm text-zinc-400">
              {count === 1
                ? '1 credential.'
                : `${count} credentials. Select one below to view it.`}
            </p>
          )}
        </div>

        {count > 1 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-[#94949E] sm:text-sm">
              {formatIndex(safeIndex + 1)} / {formatIndex(count)}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous certificate"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#676773] text-zinc-100 transition-colors hover:border-white/50 hover:bg-white/[0.08] active:scale-95"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next certificate"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#676773] text-zinc-100 transition-colors hover:border-white/50 hover:bg-white/[0.08] active:scale-95"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {!active ? (
        <p className="text-sm text-[#94949E]">
          No certificates have been published yet.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Viewer (Stage + Info Panel) */}
          <div
            id="certificate-viewer"
            role="tabpanel"
            aria-label={active.title}
            className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
          >
            {/* Large Uncropped Stage (8 cols) */}
            <div className="overflow-hidden rounded-3xl border border-white/12 bg-[#111113] lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: EASE }}
                >
                  {active.image ? (
                    <button
                      type="button"
                      onClick={() => openLightboxForCert(active._id)}
                      aria-label={`View ${active.title} full size`}
                      className="relative block h-[260px] w-full bg-[#0B0B0D] p-5 transition-colors hover:bg-[#101014] sm:h-[380px] sm:p-8 lg:h-[440px]"
                    >
                      <div className="relative h-full w-full">
                        <Image
                          src={urlFor(active.image).width(1080).auto('format').quality(82).url()}
                          alt={active.image.alt || `${active.title} certificate`}
                          fill
                          loading="lazy"
                          className="object-contain"
                          sizes="(max-width: 1024px) 92vw, 640px"
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="flex h-[260px] w-full items-center justify-center bg-[#0B0B0D] p-6 text-center text-base font-medium text-[#94949E] sm:h-[380px] lg:h-[440px]">
                      {active.issuer}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Info Panel (4 cols) */}
            <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-white/10 bg-[#111113] p-6 sm:p-7 lg:col-span-4">
              <div className="space-y-5">
                <p className="text-xs font-medium tabular-nums text-[#94949E]">
                  Credential {formatIndex(safeIndex + 1)} of {formatIndex(count)}
                </p>

                <h3 className="text-xl font-bold leading-snug tracking-[-0.02em] text-white sm:text-2xl">
                  {active.title}
                </h3>

                <dl className="divide-y divide-white/10 border-t border-b border-white/10">
                  <div className="flex items-baseline justify-between gap-4 py-3.5">
                    <dt className="shrink-0 text-xs text-[#94949E]">Issued by</dt>
                    <dd className="text-right text-sm font-medium text-zinc-100">
                      {active.issuer}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 py-3.5">
                    <dt className="shrink-0 text-xs text-[#94949E]">Issued</dt>
                    <dd className="text-right text-sm font-medium tabular-nums text-zinc-100">
                      {formatDate(active.issueDate)}
                    </dd>
                  </div>
                </dl>
              </div>

              {(active.credentialLink || active.image) && (
                <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
                  {active.credentialLink && (
                    <a
                      href={active.credentialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 active:scale-[0.98]"
                    >
                      <span>Verify credential</span>
                      <svg
                        aria-hidden="true"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17 17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </a>
                  )}

                  {active.image && (
                    <button
                      type="button"
                      onClick={() => openLightboxForCert(active._id)}
                      className="inline-flex min-h-[44px] w-full items-center justify-center rounded-full border border-[#676773] px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-white/50 hover:bg-white/[0.06] active:scale-[0.98]"
                    >
                      View full size
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Clickable Filmstrip */}
          {count > 1 && (
            <div className="space-y-2.5">
              <p className="text-xs text-[#94949E]">All certificates</p>
              <div
                role="tablist"
                aria-label="Certificate list"
                className="scrollbar-mono -mx-5 flex gap-3 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
              >
                {items.map((cert, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={cert._id}
                      ref={(el) => {
                        thumbRefs.current[idx] = el;
                      }}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="certificate-viewer"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => {
                        setActiveIndex(idx);
                        revealThumb(idx);
                      }}
                      onKeyDown={(e) => handleThumbKeyDown(e, idx)}
                      className="w-[148px] shrink-0 text-left"
                    >
                      <div
                        className={`relative h-[100px] w-full overflow-hidden rounded-xl border bg-[#0B0B0D] p-2 transition-all duration-200 ${
                          isActive
                            ? 'border-white ring-1 ring-white'
                            : 'border-white/10 opacity-70 hover:border-white/30 hover:opacity-100'
                        }`}
                      >
                        {cert.image ? (
                          <div className="relative h-full w-full">
                            <Image
                              src={urlFor(cert.image).width(296).auto('format').quality(75).url()}
                              alt={cert.image.alt || cert.title}
                              fill
                              loading="lazy"
                              sizes="148px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#94949E]">
                            {getIssuerInitials(cert.issuer)}
                          </div>
                        )}
                      </div>
                      <span
                        className={`mt-2 block truncate text-xs font-medium ${
                          isActive ? 'text-white' : 'text-zinc-400'
                        }`}
                      >
                        {cert.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <ImageLightbox
        isOpen={lightboxIndex !== null}
        images={lightboxImages}
        currentIndex={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onNext={() =>
          setLightboxIndex((prev) =>
            prev === null ? null : (prev + 1) % lightboxImages.length
          )
        }
        onPrev={() =>
          setLightboxIndex((prev) =>
            prev === null
              ? null
              : (prev - 1 + lightboxImages.length) % lightboxImages.length
          )
        }
      />
    </section>
  );
}
