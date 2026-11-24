'use client';

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { urlFor } from '@/sanity/lib/image';
import type { SideProject } from '@/types/portfolio';
import Link from 'next/link';

interface HeroSectionProps {
  projects: SideProject[];
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

function buildLoopList(
  source: SideProject[],
  minItems: number
): Array<{ project: SideProject; isRepeat: boolean }> {
  if (source.length === 0) return [];
  const repeats = Math.max(1, Math.ceil(minItems / source.length));
  return Array.from({ length: repeats }).flatMap((_, repIdx) =>
    source.map((project) => ({
      project,
      isRepeat: repIdx > 0,
    }))
  );
}

interface ShowcasePlateProps {
  project: SideProject;
  didDragRef: React.RefObject<boolean>;
  isDuplicate?: boolean;
  eager?: boolean;
}

function ShowcasePlate({
  project,
  didDragRef,
  isDuplicate = false,
  eager = false,
}: ShowcasePlateProps) {
  const coverImage =
    project.coverImage || (project.images && project.images[0]);

  return (
    <Link
      href={`/projects/${project._id}`}
      tabIndex={isDuplicate ? -1 : undefined}
      aria-label={isDuplicate ? undefined : `Open ${project.name} project details`}
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      onClick={(e) => {
        if (didDragRef.current) {
          e.preventDefault();
        }
      }}
      className="group relative block w-full overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-[0_28px_65px_-16px_rgba(0,0,0,0.95)] transition-all duration-300 ease-out hover:border-white/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={urlFor(coverImage).width(1400).quality(92).url()}
          alt={isDuplicate ? '' : coverImage.alt || `${project.name} preview`}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          className="block h-auto w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.015]"
          draggable={false}
        />
      ) : (
        <div className="flex aspect-[16/10] w-full items-center justify-center bg-[#111113] px-6 text-center text-base font-semibold text-[#94949E]">
          {project.name}
        </div>
      )}

      {/* Subtle high-contrast bottom scrim caption */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-5 pt-10 pb-3.5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="truncate text-sm font-semibold tracking-[-0.01em] text-white sm:text-[15px]">
            {project.name}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-zinc-300">
            {project.year || project.techStack?.[0] || ''}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HeroSection({ projects }: HeroSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const halfRef = useRef<HTMLDivElement>(null);
  const cycleHeightRef = useRef(0);
  const offsetRef = useRef(0);
  const speedFactorRef = useRef(1);
  const velocityYRef = useRef(0);

  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const pointerStartXRef = useRef(0);
  const pointerStartYRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const lastPointerTimeRef = useRef(0);

  const y = useMotionValue(0);

  // Clean, readable 3D isometric angle that gently faces forward on hover for crisp inspection
  const targetRx = useMotionValue(9);
  const targetRy = useMotionValue(-11);
  const targetRz = useMotionValue(4.5);

  const rx = useSpring(targetRx, { stiffness: 120, damping: 24 });
  const ry = useSpring(targetRy, { stiffness: 120, damping: 24 });
  const rz = useSpring(targetRz, { stiffness: 120, damping: 24 });

  const wallTransform = useTransform(
    [rx, ry, rz],
    ([crx, cry, crz]: number[]) =>
      `rotateX(${crx}deg) rotateY(${cry}deg) rotateZ(${crz}deg)`
  );

  const baseItems = useMemo(() => buildLoopList(projects ?? [], 4), [projects]);
  const hasProjects = baseItems.length > 0;

  useEffect(() => {
    const el = halfRef.current;
    if (!el) return;

    const measure = () => {
      cycleHeightRef.current = el.offsetHeight;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [baseItems.length]);

  // Global window drag listeners so desktop mouse dragging keeps tracking even outside the stage
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const cycleHeight = cycleHeightRef.current;
      if (cycleHeight <= 0) return;

      const totalDx = e.clientX - pointerStartXRef.current;
      const totalDy = e.clientY - pointerStartYRef.current;
      if (Math.hypot(totalDx, totalDy) > 6) {
        didDragRef.current = true;
      }

      const now = performance.now();
      const dt = (now - lastPointerTimeRef.current) / 1000;
      const stepDy = e.clientY - lastPointerYRef.current;

      if (dt > 0.001) {
        const instVel = stepDy / dt;
        velocityYRef.current = velocityYRef.current * 0.65 + instVel * 0.35;
      }

      offsetRef.current =
        (((offsetRef.current - stepDy) % cycleHeight) + cycleHeight) %
        cycleHeight;
      y.set(-offsetRef.current);

      lastPointerYRef.current = e.clientY;
      lastPointerTimeRef.current = now;
    };

    const handleWindowPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      window.setTimeout(() => {
        didDragRef.current = false;
      }, 60);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [y]);

  useAnimationFrame((_, delta) => {
    const cycleHeight = cycleHeightRef.current;
    if (cycleHeight <= 0 || isDraggingRef.current) return;

    const clampedDelta = Math.min(delta, 50);
    const dtSec = clampedDelta / 1000;

    const targetSpeed = isHovered ? 0.22 : 1;
    speedFactorRef.current +=
      (targetSpeed - speedFactorRef.current) * Math.min(1, clampedDelta * 0.008);

    // Base continuous upward flow (56px/sec) + decaying drag throw inertia
    const baseAdvance = 56 * speedFactorRef.current * dtSec;
    let momentumAdvance = 0;

    if (Math.abs(velocityYRef.current) > 2) {
      momentumAdvance = -velocityYRef.current * dtSec;
      velocityYRef.current *= Math.pow(0.06, dtSec);
    } else {
      velocityYRef.current = 0;
    }

    offsetRef.current =
      (((offsetRef.current + baseAdvance + momentumAdvance) % cycleHeight) +
        cycleHeight) %
      cycleHeight;
    y.set(-offsetRef.current);
  });

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Enable click-and-drag scrolling on desktop (mouse/pen) without hijacking mobile touch scroll
    if (!hasProjects || e.pointerType === 'touch' || e.button !== 0) return;

    isDraggingRef.current = true;
    didDragRef.current = false;
    setIsDragging(true);

    pointerStartXRef.current = e.clientX;
    pointerStartYRef.current = e.clientY;
    lastPointerYRef.current = e.clientY;
    lastPointerTimeRef.current = performance.now();
    velocityYRef.current = 0;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    targetRx.set(4);
    targetRy.set(-4);
    targetRz.set(1.5);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    targetRx.set(4 - ny * 5);
    targetRy.set(-4 + nx * 6);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    targetRx.set(9);
    targetRy.set(-11);
    targetRz.set(4.5);
  };

  return (
    <section className="relative flex min-h-dvh w-full items-center overflow-hidden bg-transparent pt-16 pb-16 sm:pt-20">
      {/* Subtle monochrome top studio light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_80%_420px_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Compact Editorial Copy & Actions */}
        <div className="relative z-20 flex flex-col justify-center text-left lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: EASE }}
            className="mb-6 space-y-3"
          >
            <h1 className="text-3xl font-bold leading-[1.06] tracking-[-0.035em] text-white md:text-5xl lg:text-[52px]">
              We build high-quality websites &amp; digital support
            </h1>
            <p className="text-xl font-medium leading-snug tracking-[-0.02em] text-zinc-400 md:text-2xl lg:text-3xl">
              tailored for your growth.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE }}
            className="mb-8 max-w-md text-[15px] leading-relaxed text-zinc-400 sm:text-base"
          >
            Launch your vision with custom web development and keep operations running smoothly
            with dedicated virtual assistance and technical support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18, ease: EASE }}
            className="flex flex-wrap items-center gap-3.5"
          >
            <Link
              href="/book"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-zinc-200 active:scale-[0.98]"
            >
              Book a call
            </Link>
            <Link
              href="#pricing"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#676773] bg-[#111113] px-6 py-3 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-white/50 hover:bg-[#18181B] active:scale-[0.98]"
            >
              View pricing
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Wide Single-Lane 3D Angled Isometric Showcase with Desktop Drag-Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          className="relative w-full lg:col-span-7"
        >
          {hasProjects ? (
            <div
              ref={stageRef}
              onPointerDown={handleStagePointerDown}
              onDragStart={(e) => e.preventDefault()}
              onMouseEnter={handleMouseEnter}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                perspective: '1800px',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 9%, black 91%, transparent 100%)',
              }}
              className={`relative h-[440px] w-full overflow-hidden select-none sm:h-[560px] lg:h-[660px] ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              <motion.div
                style={{
                  transform: wallTransform,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
                className="mx-auto h-full w-full max-w-[680px] px-3 sm:px-6"
              >
                <motion.div
                  style={{ y, willChange: 'transform' }}
                  className="flex flex-col"
                >
                  <div ref={halfRef} className="flex flex-col gap-6 pb-6">
                    {baseItems.map(({ project, isRepeat }, idx) => (
                      <ShowcasePlate
                        key={`a-${project._id}-${idx}`}
                        project={project}
                        didDragRef={didDragRef}
                        isDuplicate={isRepeat}
                        eager={idx < 3}
                      />
                    ))}
                  </div>

                  <div aria-hidden="true" className="flex flex-col gap-6 pb-6">
                    {baseItems.map(({ project }, idx) => (
                      <ShowcasePlate
                        key={`b-${project._id}-${idx}`}
                        project={project}
                        didDragRef={didDragRef}
                        isDuplicate
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <div className="flex min-h-[320px] w-full items-center justify-center rounded-3xl border border-white/10 bg-[#111113] text-sm text-[#94949E]">
              No showcase projects published yet.
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
