'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Calendar } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import type { SideProject } from '@/types/portfolio';
import Link from 'next/link';

interface HeroSectionProps {
  projects: SideProject[];
}

function ProjectCard({ project, index }: { project: SideProject; index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const images = project.images || [];

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const currentImage = images[currentImageIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
      className="shrink-0 w-96 md:w-[480px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-zinc-900/50 hover:shadow-zinc-700/30 hover:border-white/20 transition-all duration-300"
    >
      {currentImage ? (
        <div className="relative aspect-16/10 bg-zinc-900">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={urlFor(currentImage).width(1000).quality(90).url()}
                alt={`${project.name} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <div className="aspect-16/10 bg-zinc-900 flex items-center justify-center">
          <p className="text-zinc-500">{project.name}</p>
        </div>
      )}
    </motion.div>
  );
}

export function HeroSection({ projects }: HeroSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    // Prevent text selection while dragging
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Reduced sensitivity from 2 to 1
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Prevent click events when dragging
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (projects.length === 0) {
    return (
      <section className="relative w-full min-h-screen flex flex-col justify-center px-6 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto z-10 mb-12 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-[1.1] tracking-tight mb-4">
              We build high-quality websites & provide digital support
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-8 leading-tight tracking-tight">
              tailored for your growth.
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-zinc-400 mb-8 max-w-2xl"
          >
            Launch your vision with professional web development and keep it running smoothly with our dedicated Virtual Assistance and Digital Support services.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-row flex-wrap gap-4 justify-start"
          >
            <Link href="/book" className="px-6 py-3 rounded-full bg-white text-zinc-900 font-bold text-base hover:bg-zinc-100 transition-all duration-300 shadow-xl shadow-white/10 group">
              <span className="flex items-center gap-2">
                Book a call
                <Calendar className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="#pricing" className="px-6 py-3 rounded-full bg-zinc-900 text-zinc-200 font-medium text-base border border-zinc-700 hover:bg-zinc-800 transition-all duration-300">
              Pricing
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center py-10 md:py-20 overflow-hidden">
      {/* Header Content */}
      <div className="max-w-6xl mx-auto z-10 mb-6 md:mb-12 px-6 text-left">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-zinc-100 leading-[1.1] tracking-tight mb-4">
            We build high-quality websites & provide digital support
          </h1>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-zinc-100 mb-8 leading-tight tracking-tight">
            tailored for your growth.
          </h2>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg text-zinc-400 mb-8 max-w-2xl"
        >
          Launch your vision with professional web development and keep it running smoothly with our dedicated Virtual Assistance and Digital Support services.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-row flex-wrap gap-4 justify-start"
        >
          <Link href="/book" className="px-6 py-3 rounded-full bg-zinc-800 text-zinc-200 font-medium hover:bg-zinc-700 transition-all duration-300">
            Book a call
          </Link>
          <Link href="#pricing" className="px-6 py-3 rounded-full bg-zinc-900 text-zinc-200 font-medium border border-zinc-700 hover:bg-zinc-800 transition-all duration-300">
            Pricing
          </Link>
        </motion.div>
      </div>

      {/* Horizontal Scrollable Project Cards with Drag */}
      <div 
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`w-full overflow-x-auto scrollbar-hide select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <div className="flex gap-8 pb-4 pl-8 pr-20">
          {projects.map((project, index) => (
            <ProjectCard key={project._id} project={project} index={index} />
          ))}
        </div>
      </div>

    </section>
  );
}
