'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollFade } from '@/hooks/useScrollFade';
import type { Education } from '@/types/portfolio';

interface EducationSectionProps {
  education: Education[];
}

// Format date to YYYY (year only)
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  // If already a 4-digit year, return as is
  if (/^\d{4}$/.test(dateString)) return dateString;
  // Otherwise extract year
  const date = new Date(dateString);
  return String(date.getFullYear());
};

export function EducationSection({ education }: EducationSectionProps) {
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

  if (!education || education.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 tracking-tight">Education</h2>
        <div className="text-sm text-zinc-500 italic">
          No education added yet.
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
      <h2 className="text-lg font-semibold mb-6 tracking-tight">Education</h2>
      
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col gap-5 md:hidden">
        {education.map((edu) => {
          const isExpanded = expandedIds.has(edu._id);
          const hasDetails = edu.description || (edu.achievements && edu.achievements.length > 0);

          return (
            <div key={edu._id} className="flex flex-col gap-0.5">
              {/* Date Range */}
              <div className="text-sm text-zinc-500">
                {formatDate(edu.startDate)} – {edu.endDate ? formatDate(edu.endDate) : 'present'}
              </div>

              {/* Degree and Field */}
              <h3 className="font-semibold text-base text-zinc-100">
                {edu.degree}
                {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
              </h3>

              {/* Institution */}
              <p className="text-sm text-zinc-400">
                {edu.institution}
              </p>

              {/* GPA and Honors */}
              {(edu.gpa || edu.honors) && (
                <p className="text-sm text-zinc-500">
                  {edu.gpa && `GPA: ${edu.gpa}`}
                  {edu.gpa && edu.honors && ' • '}
                  {edu.honors}
                </p>
              )}

              {/* Mobile Expansion Toggle */}
              {hasDetails && (
                <div className="mt-1">
                  <button
                    onClick={() => toggleExpand(edu._id)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <span>{isExpanded ? 'Less' : 'More'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 flex flex-col gap-3">
                      {edu.description && (
                        <p className="text-sm text-zinc-400 leading-relaxed italic">
                          {edu.description}
                        </p>
                      )}
                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="ml-4 space-y-1 text-sm text-zinc-400">
                          {edu.achievements.map((achievement, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-zinc-600">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop Layout - Side by side */}
      <div className="hidden md:flex flex-col gap-8">
        {education.map((edu) => (
          <div key={edu._id} className="flex gap-12">
            {/* Date - Left Side */}
            <div className="w-28 shrink-0 text-sm text-zinc-500 whitespace-nowrap">
              {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'present'}
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Degree and Institution */}
              <div>
                <h3 className="font-semibold text-base text-zinc-100">
                  {edu.degree}
                  {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                </h3>
                <p className="text-sm text-zinc-400 mt-0.5">
                  {edu.institution}
                </p>
              </div>

              {/* GPA and Honors */}
              {(edu.gpa || edu.honors) && (
                <div className="flex flex-wrap gap-3 text-sm">
                  {edu.gpa && (
                    <span className="text-zinc-400">
                      GPA: <span className="text-zinc-300 font-medium">{edu.gpa}</span>
                    </span>
                  )}
                  {edu.honors && (
                    <span className="text-zinc-400">
                      • <span className="text-zinc-300">{edu.honors}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {edu.description && (
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {edu.description}
                </p>
              )}

              {/* Achievements */}
              {edu.achievements && edu.achievements.length > 0 && (
                <ul className="ml-4 space-y-1 text-sm text-zinc-400">
                  {edu.achievements.map((achievement, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-zinc-600">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
