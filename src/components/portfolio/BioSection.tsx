'use client';

import Image from 'next/image';
import { Download, Briefcase } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import type { Bio } from '@/types/portfolio';
import { useScrollFade } from '@/hooks/useScrollFade';

interface BioSectionProps {
  bio: Bio;
}

export function BioSection({ bio }: BioSectionProps) {
  const { ref, isVisible } = useScrollFade();

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="flex items-center gap-4">
        {bio.avatar && (
          <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full overflow-hidden ring-1 ring-zinc-800 transition-all duration-500 hover:scale-110 hover:ring-2 hover:ring-zinc-400 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-zinc-500/20 shrink-0">
            <Image
              src={urlFor(bio.avatar).width(800).quality(100).url()}
              alt={bio.name}
              fill
              className="object-cover transition-transform duration-700 hover:scale-110"
              priority
              unoptimized
              sizes="(max-width: 768px) 96px, 112px"
            />
          </div>
        )}
        <div className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight">{bio.name}</h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-400">
            {bio.position && <span>{bio.position}</span>}
            {bio.currentCompany && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[10px] uppercase tracking-wider font-medium text-zinc-300">
                <Briefcase className="w-3 h-3" />
                <span>{bio.currentCompany}</span>
              </div>
            )}
          </div>
          {bio.place && (
            <p className="text-sm text-zinc-500 mt-0.5">{bio.place}</p>
          )}
          {bio.resume && (
            <a
              href={`${bio.resume}?dl=${bio.name.replace(/\s+/g, '_')}_Resume.pdf`}
              className="mt-1.5 md:mt-3 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors group"
            >
              <Download className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              Download Resume
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
