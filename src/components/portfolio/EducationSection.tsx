'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Education } from '@/types/portfolio';

interface EducationSectionProps {
  education: Education[];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}$/.test(dateString)) return dateString;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : String(date.getFullYear());
};

export function EducationSection({
  education,
  indexLabel = '03',
}: EducationSectionProps) {
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
    <motion.section
      id="education"
      aria-labelledby="education-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <span className="block text-xs font-medium tabular-nums text-[#94949E]">
          {indexLabel}
        </span>
        <h2
          id="education-heading"
          className="text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl"
        >
          Education
        </h2>
      </div>

      {!education || education.length === 0 ? (
        <p className="text-sm text-[#94949E]">
          No education entries have been published yet.
        </p>
      ) : (
        <div className="divide-y divide-white/10">
          {education.map((edu) => {
            const isExpanded = expandedIds.has(edu._id);
            const hasDetails = Boolean(
              edu.description || (edu.achievements && edu.achievements.length > 0)
            );
            const detailsId = `education-details-${edu._id}`;

            return (
              <article key={edu._id} className="space-y-2 py-6 first:pt-2 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="text-base font-semibold leading-snug text-white sm:text-[17px]">
                    {edu.degree}
                    {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                  </h3>
                  <p className="shrink-0 text-xs tabular-nums text-[#94949E]">
                    {formatDate(edu.startDate)} -{' '}
                    {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                  </p>
                </div>

                <p className="text-sm text-zinc-400">{edu.institution}</p>

                {(edu.gpa || edu.honors) && (
                  <p className="text-xs text-[#94949E]">
                    {edu.gpa && `GPA ${edu.gpa}`}
                    {edu.gpa && edu.honors && ' · '}
                    {edu.honors}
                  </p>
                )}

                {hasDetails && (
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(edu._id)}
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
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
                      <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={detailsId}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="space-y-3 overflow-hidden pt-2"
                        >
                          {edu.description && (
                            <p className="text-sm leading-relaxed text-zinc-400">
                              {edu.description}
                            </p>
                          )}
                          {edu.achievements && edu.achievements.length > 0 && (
                            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-400 marker:text-[#94949E]">
                              {edu.achievements.map((achievement, idx) => (
                                <li key={idx}>{achievement}</li>
                              ))}
                            </ul>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
