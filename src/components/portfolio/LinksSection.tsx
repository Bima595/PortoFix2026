'use client';

import { ExternalLink } from 'lucide-react';
import { useScrollFade } from '@/hooks/useScrollFade';
import type { Bio } from '@/types/portfolio';

interface LinksSectionProps {
  socialLinks?: Bio['socialLinks'];
}

export function LinksSection({ socialLinks }: LinksSectionProps) {
  const { ref, isVisible } = useScrollFade();

  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <section 
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2 className="text-lg font-semibold mb-8 tracking-tight">Links</h2>
      <div className="flex flex-col gap-6">
        {socialLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-12 transition-all duration-300"
          >
            {/* Platform Name - Left */}
            <span className="w-28 text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">
              {link.platform}
            </span>
            
            {/* Username/Handle - Right with Icon */}
            <div className="flex items-center gap-2">
              <span className="text-base text-zinc-100 group-hover:text-white transition-colors">
                {link.username}
              </span>
              <ExternalLink 
                className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" 
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
