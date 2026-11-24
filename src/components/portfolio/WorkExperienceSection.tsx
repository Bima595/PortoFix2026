'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'motion/react';
import { urlFor } from '@/sanity/lib/image';
import type { WorkExperience } from '@/types/portfolio';

interface WorkExperienceSectionProps {
  workExperience: WorkExperience[];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}$/.test(dateString)) return dateString;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : String(date.getFullYear());
};

export function WorkExperienceSection({
  workExperience,
  indexLabel = '01',
}: WorkExperienceSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="space-y-6 sm:space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="border-b border-white/10 pb-5"
      >
        <span className="block text-xs font-medium tabular-nums text-[#94949E]">
          {indexLabel}
        </span>
        <h2
          id="experience-heading"
          className="mt-1.5 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
        >
          Experience
        </h2>
      </motion.div>

      {!workExperience || workExperience.length === 0 ? (
        <p className="text-sm text-[#94949E]">
          No work experience entries have been published yet.
        </p>
      ) : (
        <div className="divide-y divide-white/10">
          {workExperience.map((job, idx) => {
            const isExpanded = expandedIds.has(job._id);
            const hasHighlights = Boolean(job.highlights && job.highlights.length > 0);
            const highlightsId = `highlights-${job._id}`;

            return (
              <motion.article
                key={job._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(idx * 0.06, 0.24),
                  ease: EASE,
                }}
                className="grid grid-cols-1 gap-4 py-7 first:pt-2 last:pb-0 md:grid-cols-[148px_240px_minmax(0,1fr)] md:gap-8 sm:py-8"
              >
                {/* Col 1: Years */}
                <p className="pt-0.5 text-xs font-medium tabular-nums text-[#94949E] sm:text-sm">
                  {formatDate(job.startDate)} -{' '}
                  {job.isCurrent ? (
                    <span className="font-semibold text-white">Present</span>
                  ) : (
                    formatDate(job.endDate || '')
                  )}
                </p>

                {/* Col 2: Role & Company */}
                <div className="flex min-w-0 items-start gap-3">
                  {job.companyLogo && (
                    <Image
                      src={urlFor(job.companyLogo).width(72).height(72).fit('crop').quality(90).url()}
                      alt={job.companyLogo.alt || `${job.company} logo`}
                      width={32}
                      height={32}
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-lg border border-white/15 bg-zinc-900 object-cover"
                    />
                  )}
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-base font-semibold leading-snug text-white sm:text-[17px]">
                      {job.role}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {job.companyLink ? (
                        <a
                          href={job.companyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white"
                        >
                          <span>{job.company}</span>
                          <svg
                            aria-hidden="true"
                            width="12"
                            height="12"
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
                      ) : (
                        <span>{job.company}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Col 3: Description, Stack & Highlights */}
                <div className="min-w-0 space-y-3">
                  {job.description && (
                    <p className="text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                      {job.description}
                    </p>
                  )}

                  {job.techStack && job.techStack.length > 0 && (
                    <p className="text-xs leading-relaxed text-[#94949E]">
                      {job.techStack.join(' · ')}
                    </p>
                  )}

                  {hasHighlights && job.highlights && (
                    <div>
                      <button
                        type="button"
                        onClick={() => toggleExpand(job._id)}
                        aria-expanded={isExpanded}
                        aria-controls={highlightsId}
                        className="-ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <svg
                          aria-hidden="true"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                        <span>
                          {isExpanded
                            ? 'Hide highlights'
                            : `Show highlights (${job.highlights.length})`}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.ul
                            id={highlightsId}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="list-disc space-y-1.5 overflow-hidden pt-2 pl-5 text-sm leading-relaxed text-zinc-400 marker:text-[#94949E]"
                          >
                            {job.highlights.map((highlight, hIdx) => (
                              <li key={hIdx}>{highlight}</li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
