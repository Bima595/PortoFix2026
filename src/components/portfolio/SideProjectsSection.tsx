'use client';

import { urlFor } from '@/sanity/lib/image';
import type { SideProject } from '@/types/portfolio';
import { useScrollFade } from '@/hooks/useScrollFade';
import { useRouter } from 'next/navigation';

interface SideProjectsSectionProps {
  sideProjects: SideProject[];
}

export function SideProjectsSection({ sideProjects }: SideProjectsSectionProps) {
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

  return (
    <section 
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2 className="text-lg font-semibold mb-6 tracking-tight">Side Projects</h2>
      <div className="grid grid-cols-2 gap-4 md:gap-8 md:-mx-20 md:w-[calc(100%+10rem)]">
        {sideProjects.map((project) => (
          <ProjectCard 
            key={project._id} 
            project={project}
          />
        ))}
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: SideProject;
}

function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  const images = project.coverImage
    ? [project.coverImage, ...(project.images || [])]
    : (project.images || []);

  const currentImage = images[0];

  return (
    <div 
      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200/10 dark:border-white/5 flex items-center justify-center shadow-xl cursor-pointer group"
      onClick={() => router.push(`/projects/${project._id}`)}
    >
      {currentImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlFor(currentImage).width(800).quality(85).url()}
            alt={currentImage.alt || `${project.name} screenshot`}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:blur-[2px] group-hover:opacity-75"
            draggable={false}
          />

          {/* Title Overlay at the bottom */}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/45 to-transparent p-4 pt-12 flex items-end z-10 transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
            <h3 className="font-semibold text-xs sm:text-sm md:text-base text-zinc-100 tracking-wide font-sans wrap-break-word line-clamp-2 leading-snug">
              {project.name}
            </h3>
          </div>

          {/* Centered View Project Overlay on hover - Smaller badge */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <span className="px-3 py-1 bg-white/95 text-zinc-950 font-bold text-[9px] md:text-xs tracking-wider uppercase rounded-full shadow-md transform translate-y-1.5 group-hover:translate-y-0 transition-all duration-300">
              View Project
            </span>
          </div>
        </>
      )}
    </div>
  );
}
