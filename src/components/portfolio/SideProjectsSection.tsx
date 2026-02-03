'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import type { SideProject } from '@/types/portfolio';
import { ImageLightbox } from '@/components/ImageLightbox';
import { useScrollFade } from '@/hooks/useScrollFade';

interface SideProjectsSectionProps {
  sideProjects: SideProject[];
}

export function SideProjectsSection({ sideProjects }: SideProjectsSectionProps) {
  const [lightboxState, setLightboxState] = useState<{
    images: { url: string; alt: string }[];
    currentIndex: number;
  } | null>(null);
  const { ref, isVisible } = useScrollFade();

  if (!sideProjects || sideProjects.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 tracking-tight">Side Projects</h2>
        <div className="text-sm text-zinc-500 italic">
          No side projects added yet.
        </div>
      </section>
    );
  }

  const handleNextImage = () => {
    if (!lightboxState) return;
    setLightboxState({
      ...lightboxState,
      currentIndex: (lightboxState.currentIndex + 1) % lightboxState.images.length
    });
  };

  const handlePrevImage = () => {
    if (!lightboxState) return;
    setLightboxState({
      ...lightboxState,
      currentIndex: (lightboxState.currentIndex - 1 + lightboxState.images.length) % lightboxState.images.length
    });
  };

  return (
    <section 
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2 className="text-lg font-semibold mb-6 tracking-tight">Side Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sideProjects.map((project) => (
          <ProjectCard 
            key={project._id} 
            project={project}
            onImageClick={(images, index) => setLightboxState({ images, currentIndex: index })}
          />
        ))}
      </div>

      {/* Image Lightbox */}
      {lightboxState && (
        <ImageLightbox
          isOpen={!!lightboxState}
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          onClose={() => setLightboxState(null)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </section>
  );
}

interface ProjectCardProps {
  project: SideProject;
  onImageClick: (images: { url: string; alt: string }[], index: number) => void;
}

function ProjectCard({ project, onImageClick }: ProjectCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = project.images || [];
  const hasMultipleImages = images.length > 1;

  // Auto-slide every 3 seconds when not hovered
  useEffect(() => {
    if (!hasMultipleImages || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultipleImages, isHovered, images.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDotClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Prepare all images for lightbox
  const allImages = images.map((image) => ({
    url: urlFor(image).width(1920).quality(95).url(),
    alt: image.alt || `${project.name} screenshot`
  }));

  const currentImage = images[currentImageIndex];

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Project Image - Top Half with Slider */}
      {currentImage && (
        <div 
          className="relative w-full aspect-video bg-zinc-100 dark:bg-zinc-900 cursor-pointer group"
          onClick={() => onImageClick(allImages, currentImageIndex)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={urlFor(currentImage).width(800).quality(85).url()}
            alt={currentImage.alt || `${project.name} screenshot`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={85}
          />

          {/* Navigation Arrows - Show on hover if multiple images */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => handleDotClick(index, e)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white w-4'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Info - Bottom Half */}
      <div className="flex flex-col gap-3 p-5">
        {/* Title and Year */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
              {project.name}
            </h3>
            {project.year && (
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-0.5">
                {project.year}
              </p>
            )}
          </div>
          
          {/* Links */}
          <div className="flex items-center gap-1.5 shrink-0">
            {project.repoLink && (
              <a
                href={project.repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="View repository"
              >
                <Github className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </a>
            )}
            {project.demoLink && (
              <a
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                aria-label="View demo"
              >
                <ExternalLink className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {project.description}
          </p>
        )}

        {/* Tech Stack */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
