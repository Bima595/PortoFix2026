'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import type { SideProject } from '@/types/portfolio';
import { useRouter } from 'next/navigation';

interface ProjectDetailsClientProps {
  project: SideProject;
}

export function ProjectDetailsClient({ project }: ProjectDetailsClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const images = project.coverImage
    ? [project.coverImage, ...(project.images || [])]
    : (project.images || []);

  useEffect(() => {
    if (isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const currentImage = images[activeIndex];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-24 pb-16 px-6 md:px-12 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-zinc-800/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full z-10 flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium w-fit cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* Two-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {currentImage ? (
              <div
                className="relative w-full h-[300px] md:h-[500px] bg-zinc-900/30 rounded-3xl overflow-hidden border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={urlFor(currentImage).width(1200).quality(95).url()}
                  alt={`${project.name} screenshot ${activeIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-2xl p-4 select-none"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="w-full h-[300px] md:h-[500px] bg-zinc-900/20 border border-zinc-800 rounded-3xl flex items-center justify-center text-zinc-500 font-mono text-sm">
                No screenshot available
              </div>
            )}

            {/* Thumbnails row below */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent select-none">
                {images.map((imgObj, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative w-20 md:w-28 aspect-video rounded-xl overflow-hidden border transition-all shrink-0 cursor-pointer bg-zinc-900/40 ${
                      idx === activeIndex
                        ? 'border-zinc-100 scale-95 shadow-md shadow-white/5'
                        : 'border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={urlFor(imgObj).width(200).quality(75).url()}
                      alt={`${project.name} thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Project Data Details */}
          <div className="lg:col-span-5 flex flex-col gap-6 bg-zinc-900/10 border border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
            {/* Title & Metadata */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
                {project.name}
              </h1>
              {project.year && (
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mt-1.5">
                  Project Release: {project.year}
                </p>
              )}
            </div>

            {/* Description */}
            {project.description && (
              <div className="border-t border-white/5 pt-5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2.5">
                  Overview
                </h3>
                <p className="text-sm md:text-base text-zinc-400 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>
            )}

            {/* Tech Stack Tags */}
            {project.techStack && project.techStack.length > 0 && (
              <div className="border-t border-white/5 pt-5">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 text-xs font-mono tracking-wide bg-zinc-800/40 border border-zinc-700/50 text-zinc-300 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons (Repo / Live Demo) */}
            {(project.repoLink || project.demoLink) && (
              <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row gap-3 mt-2">
                {project.demoLink && (
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-5 py-3 rounded-full bg-zinc-100 text-zinc-950 font-bold text-sm hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Live Demo
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {project.repoLink && (
                  <a
                    href={project.repoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-5 py-3 rounded-full bg-zinc-900 text-zinc-200 font-semibold text-sm border border-zinc-800 hover:bg-zinc-800 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Repository
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
