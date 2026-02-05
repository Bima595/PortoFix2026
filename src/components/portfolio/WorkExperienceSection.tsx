'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { urlFor } from '@/sanity/lib/image';
import { useScrollFade } from '@/hooks/useScrollFade';
import type { WorkExperience } from '@/types/portfolio';

interface WorkExperienceSectionProps {
  workExperience: WorkExperience[];
}

// Format date to YYYY (year only)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}$/.test(dateString)) return dateString;
  const date = new Date(dateString);
  return String(date.getFullYear());
};

export function WorkExperienceSection({ workExperience }: WorkExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { ref, isVisible } = useScrollFade();

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!workExperience || workExperience.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 tracking-tight">Work Experience</h2>
        <div className="text-sm text-zinc-500 italic">
          No work experience added yet.
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
      <h2 className="text-lg font-semibold mb-6 md:mb-8 tracking-tight">Work Experience</h2>
      
      {/* Mobile Layout - Stacked, compact */}
      <div className="flex flex-col gap-5 md:hidden">
        {workExperience.map((job) => {
          const isExpanded = expandedIds.has(job._id);
          const hasHighlights = job.highlights && job.highlights.length > 0;

          return (
            <div key={job._id} className="flex flex-col gap-0.5">
              {/* Date Range */}
              <div className="text-sm text-zinc-500">
                {formatDate(job.startDate)} – {job.isCurrent ? 'present' : formatDate(job.endDate || '')}
              </div>

              {/* Job Title and Company with Link */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-zinc-100">
                  {job.role} – {job.company}
                </h3>
                {job.companyLink && (
                  <a
                    href={job.companyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit company website"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition-colors" />
                  </a>
                )}
              </div>

              {/* Description */}
              {job.description && (
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {job.description}
                </p>
              )}

              {/* Tech Stack - Dot separated */}
              {job.techStack && job.techStack.length > 0 && (
                <p className="text-sm text-zinc-500">
                  {job.techStack.join(' • ')}
                </p>
              )}

              {/* Highlights Dropdown */}
              {hasHighlights && (
                <div className="mt-1">
                  <button
                    onClick={() => toggleExpand(job._id)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <span>{isExpanded ? 'Less' : 'More'}</span>
                  </button>

                  {isExpanded && job.highlights && (
                    <ul className="mt-2 ml-4 space-y-1 text-sm text-zinc-400">
                      {job.highlights.map((highlight, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-zinc-600">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Layout - Side by side with logos */}
      <div className="hidden md:flex flex-col gap-8">
        {workExperience.map((job) => {
          const isExpanded = expandedIds.has(job._id);
          const hasHighlights = job.highlights && job.highlights.length > 0;

          return (
            <div key={job._id} className="flex gap-12">
              {/* Date - Left Side */}
              <div className="w-28 shrink-0 text-sm text-zinc-500 whitespace-nowrap">
                {formatDate(job.startDate)} - {job.isCurrent ? 'present' : formatDate(job.endDate || '')}
              </div>

              {/* Content - Right Side */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Title with Logo and Link */}
                <div className="flex items-start gap-3">
                  {/* Company Logo */}
                  {job.companyLogo && (
                    <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-zinc-900 ring-1 ring-zinc-800">
                      <Image
                        src={urlFor(job.companyLogo).width(80).quality(90).url()}
                        alt={job.companyLogo.alt || `${job.company} logo`}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 flex items-start gap-2">
                    <h3 className="font-semibold text-base text-zinc-100">
                      {job.role} – {job.company}
                    </h3>
                    {job.companyLink && (
                      <a
                        href={job.companyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 mt-0.5"
                        aria-label="Visit company website"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition-colors" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                {job.description && (
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {job.description}
                  </p>
                )}

                {/* Tech Stack */}
                {job.techStack && job.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {job.techStack.map((tech, i) => (
                      <span key={i} className="text-xs text-zinc-500">
                        {tech}{i < job.techStack!.length - 1 ? ' •' : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Highlights Dropdown */}
                {hasHighlights && (
                  <div className="mt-1">
                    <button
                      onClick={() => toggleExpand(job._id)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      <span>{isExpanded ? 'Less' : 'More'}</span>
                    </button>

                    {isExpanded && job.highlights && (
                      <ul className="mt-2 ml-4 space-y-1 text-sm text-zinc-400">
                        {job.highlights.map((highlight, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-zinc-600">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
