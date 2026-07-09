'use client';

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'motion/react';
import { Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { urlFor } from '@/sanity/lib/image';
import type { SideProject } from '@/types/portfolio';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeroSectionProps {
  projects: SideProject[];
}

function CarouselCard({ 
  project, 
  index, 
  progress, 
  isMobile 
}: { 
  project: SideProject; 
  index: number; 
  progress: MotionValue<number>;
  isMobile: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const images = project.coverImage 
    ? [project.coverImage, ...(project.images || [])]
    : (project.images || []);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const currentImage = images[currentImageIndex];

  // Normalized progress slot on the L-curve (exactly 6 cards spaced by 1/6 ~ 0.166 intervals)
  const cardProgress = useTransform(progress, (p: number) => {
    const rawProgress = p + index * (1 / 6);
    return ((rawProgress % 1.0) + 1.0) % 1.0;
  });

  // Precise coordinate mapping from the reference DOM inspect
  const progressMap = [0.0, 0.16, 0.33, 0.5, 0.66, 0.83, 1.0];

  const opacity = useTransform(
    cardProgress,
    progressMap,
    [0.0, 0.64, 0.95, 1.0, 0.83, 0.55, 0.0]
  );

  const x = useTransform(
    cardProgress,
    progressMap,
    isMobile
      ? [-60, -60, -60, -43, 60, 150, 250] // mobile slightly tighter X
      : [-60, -60, -60, -43, 75, 206, 350]
  );

  const y = useTransform(
    cardProgress,
    progressMap,
    isMobile
      ? [-280, -230, -110, -17.7, 20, 20, 20]
      : [-350, -276, -145, -17.7, 20, 20, 20]
  );

  const z = useTransform(
    cardProgress,
    progressMap,
    [-1000, -488, 167, 246, -81, -670, -1000]
  );

  const rotateX = useTransform(
    cardProgress,
    progressMap,
    [4, 3.2, 2.17, 2.05, 2.56, 3.48, 4.0]
  );

  const rotateY = useTransform(
    cardProgress,
    progressMap,
    [-3, -2.33, -1.14, 0.04, 1.23, 2.42, 3.0]
  );

  const scale = useTransform(
    cardProgress,
    progressMap,
    isMobile
      ? [0.44, 0.68, 0.95, 1.08, 0.88, 0.58, 0.44]
      : [0.44, 0.73, 1.11, 1.16, 0.97, 0.63, 0.44]
  );

  const zIndex = useTransform(cardProgress, (cp: number) => {
    const distToCenter = Math.abs(cp - 0.5);
    return Math.round((1.0 - distToCenter) * 100);
  });

  const pointerEvents = useTransform(cardProgress, (cp: number) => {
    const distToCenter = Math.abs(cp - 0.5);
    return distToCenter > 0.4 ? 'none' : 'auto';
  });

  const transform = useTransform(
    [x, y, z, rotateX, rotateY, scale],
    ([cx, cy, cz, crotateX, crotateY, cscale]) => {
      return `translate3d(${cx}%, ${cy}%, ${cz}px) rotateX(${crotateX}deg) rotateY(${crotateY}deg) scale(${cscale})`;
    }
  );

  return (
    <motion.div
      style={{
        position: 'absolute',
        transform,
        opacity,
        zIndex,
        pointerEvents,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      data-card-index={index}
      className="absolute left-1/2 top-1/2 w-[53%] origin-center select-none flex items-center justify-center cursor-pointer"
    >
      <div className="w-full h-auto flex items-center justify-center relative overflow-visible">
        {currentImage ? (
          <div className="relative w-full h-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900/10 backdrop-blur-md opacity-90 hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlFor(currentImage).width(800).quality(90).url()}
              alt={project.name}
              className="w-full h-auto object-contain rounded-2xl"
              draggable={false}
            />
            {/* Subtle, highly transparent overlay with Title and Base */}
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 via-black/30 to-transparent px-4 py-3 pt-8 flex flex-col justify-end select-none pointer-events-none">
              <h3 className="text-[11px] md:text-sm font-semibold text-zinc-100 tracking-wide truncate">
                {project.name}
              </h3>
              <p className="text-[8px] md:text-[10px] text-zinc-400 mt-0.5 font-mono uppercase tracking-wider truncate">
                {project.techStack && project.techStack.length > 0 
                  ? project.techStack.slice(0, 3).join(' / ') 
                  : 'Web Project'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-500 rounded-2xl border border-white/10">
            {project.name}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function HeroSection({ projects }: HeroSectionProps) {
  const [dimensions, setDimensions] = useState({ width: 1200, isMobile: false });
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStartRefY = useRef(0);
  const pointerStartRefX = useRef(0);
  const progressStartRef = useRef(0);
  const velocityRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const clickedCardIndexRef = useRef<number | null>(null);

  const progress = useMotionValue(0);
  const progressSpring = useSpring(progress, { stiffness: 60, damping: 25, mass: 1.0 });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        isMobile: window.innerWidth < 768,
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Guarantee exactly 6 project slots staggered perfectly to allow 5 visible on screen
  const displayProjects = projects.length === 0 
    ? [] 
    : projects.length >= 6
      ? projects.slice(0, 6)
      : Array.from({ length: Math.ceil(6 / projects.length) })
          .flatMap(() => projects)
          .slice(0, 6);

  const count = displayProjects.length;

  // Auto-rotation spins continuously at a swift kinetic pace
  useEffect(() => {
    if (isDragging || isHovered || count === 0) return;
    let animId: number;
    const animate = () => {
      progress.set(progress.get() + 0.0016);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isDragging, isHovered, count, progress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (count === 0) return;
    setIsDragging(true);
    pointerStartRefY.current = e.clientY;
    pointerStartRefX.current = e.clientX;
    progressStartRef.current = progress.get();
    lastPointerTimeRef.current = performance.now();
    lastPointerYRef.current = e.clientY;
    velocityRef.current = 0;

    // Detect if we tapped inside a project card
    const cardEl = (e.target as HTMLElement).closest('[data-card-index]');
    if (cardEl) {
      clickedCardIndexRef.current = parseInt(cardEl.getAttribute('data-card-index') || '0');
    } else {
      clickedCardIndexRef.current = null;
    }
    
    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || count === 0) return;
    const now = performance.now();
    const timeDelta = now - lastPointerTimeRef.current;
    const deltaY = e.clientY - pointerStartRefY.current;

    if (timeDelta > 0) {
      const instantVelocity = (e.clientY - lastPointerYRef.current) / timeDelta;
      velocityRef.current = velocityRef.current * 0.7 + instantVelocity * 0.3;
    }

    // Translate clientY drag into progress change (600px drag = 1 full loop)
    progress.set(progressStartRef.current + deltaY / 600);

    lastPointerTimeRef.current = now;
    lastPointerYRef.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (count === 0) return;
    setIsDragging(false);
    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    // Displacement calculation to separate tap clicks from drag gestures
    const dx = e.clientX - pointerStartRefX.current;
    const dy = e.clientY - pointerStartRefY.current;
    const displacement = Math.hypot(dx, dy);

    if (displacement < 6 && clickedCardIndexRef.current !== null) {
      // Navigate to separate details page
      const clickedProject = displayProjects[clickedCardIndexRef.current];
      router.push(`/projects/${clickedProject._id}`);
    } else {
      // Apply inertia momentum glide on release
      const glideFactor = 0.08;
      const velocityRotation = velocityRef.current * glideFactor;
      progress.set(progress.get() + velocityRotation);
    }
  };

  return (
    <section className="relative w-full min-h-dvh flex items-center overflow-hidden bg-transparent pt-20 pb-12">
      {/* Decorative background glow elements */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-800/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-[1.1] tracking-tight mb-4">
              We build high-quality websites &amp; digital support
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-zinc-400 leading-tight tracking-tight">
              tailored for your growth.
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base text-zinc-400 mb-8 max-w-md leading-relaxed"
          >
            Launch your vision with professional web development and keep it running smoothly with our dedicated virtual assistance and digital support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-row flex-wrap gap-4 justify-start"
          >
            <Link 
              href="/book" 
              className="px-6 py-3 rounded-full bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-white/5 flex items-center gap-2 group cursor-pointer"
            >
              Book a call
              <Calendar className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              href="#pricing" 
              className="px-6 py-3 rounded-full bg-zinc-900 text-zinc-200 font-semibold text-sm border border-zinc-800 hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              Pricing
            </Link>
          </motion.div>
        </div>

        {/* Right Column: Waterfall Arc Carousel on Desktop, Flat Horizontal Scroll on Mobile */}
        <div className="lg:col-span-7 w-full overflow-visible select-none">
          {count > 0 ? (
            <>
              {/* Desktop View: 3D Waterfall Arc Carousel */}
              <div 
                ref={containerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => {
                  setIsHovered(false);
                  setIsDragging(false);
                }}
                style={{
                  touchAction: 'none',
                  perspective: '3400px',
                }}
                className={`hidden md:flex w-full h-[600px] items-center justify-center overflow-visible relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              >
                <div 
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(3deg) rotateY(-4deg)',
                  }}
                  className="w-full h-full relative overflow-visible"
                >
                  {displayProjects.map((project, index) => (
                    <CarouselCard 
                      key={`${project._id}-${index}`} 
                      project={project} 
                      index={index} 
                      progress={progressSpring}
                      isMobile={false}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile View: Flat Horizontal Scroll ("Lurus") */}
              <div className="flex md:hidden w-full overflow-x-auto gap-4 py-6 px-4 snap-x snap-mandatory scrollbar-none scroll-smooth">
                {displayProjects.map((project) => {
                  const coverImage = project.coverImage || (project.images && project.images[0]);
                  return (
                    <Link
                      key={project._id}
                      href={`/projects/${project._id}`}
                      className="w-[75vw] shrink-0 snap-center bg-zinc-900 rounded-2xl border border-white/10 overflow-hidden relative shadow-xl block"
                    >
                      {coverImage ? (
                        <div className="relative w-full aspect-[4/3] bg-zinc-950 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={urlFor(coverImage).width(600).quality(90).url()}
                            alt={project.name}
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 py-3 pt-8">
                            <h3 className="text-sm font-semibold text-zinc-100 truncate">
                              {project.name}
                            </h3>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-mono uppercase tracking-wider truncate">
                              {project.techStack && project.techStack.length > 0 
                                ? project.techStack.slice(0, 3).join(' / ') 
                                : 'Web Project'}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-[4/3] flex items-center justify-center bg-zinc-950 text-zinc-500 font-medium">
                          {project.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-zinc-900/20 border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs">
              No projects configured
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
