'use client';

import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { AboutSection } from '@/components/portfolio/AboutSection';
import type { Bio, WorkExperience } from '@/types/portfolio';

interface BioSectionProps {
  bio: Bio;
  hasProjects?: boolean;
  currentJob?: WorkExperience | null;
}

export function BioSection({
  bio,
  hasProjects = true,
  currentJob = null,
}: BioSectionProps) {
  const role = bio.position || currentJob?.role;
  const company = bio.currentCompany || currentJob?.company;
  const companyLink =
    currentJob &&
    company &&
    currentJob.company.toLowerCase() === company.toLowerCase()
      ? currentJob.companyLink
      : undefined;
  const place = bio.place;
  const hasActions = Boolean(bio.resume || bio.email || hasProjects);

  return (
    <section
      aria-label="Introduction"
      className="w-full border-b border-white/10 pt-2 pb-12 sm:pt-4 sm:pb-16"
    >
      <div className="space-y-7 sm:space-y-8">
        {/* Identity Lockup: Portrait + Name + Workplace & Location (Zero opacity-0 delay for instant mobile LCP) */}
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          {bio.avatar && (
            <div className="shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 ring-1 ring-white/5">
              <Image
                src={urlFor(bio.avatar).width(176).height(176).fit('crop').auto('format').quality(85).url()}
                alt={bio.name}
                width={88}
                height={88}
                sizes="(max-width: 640px) 72px, 88px"
                priority
                fetchPriority="high"
                className="h-18 w-18 object-cover sm:h-[88px] sm:w-[88px]"
              />
            </div>
          )}

          <div className="min-w-0 space-y-2.5">
            <h1 className="text-[clamp(1.75rem,3.8vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
              {bio.name}
            </h1>

            {(role || company || place) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-zinc-300 sm:text-[15px]">
                {(role || company) && (
                  <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <svg
                      aria-hidden="true"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-[#94949E]"
                    >
                      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      <rect width="20" height="14" x="2" y="6" rx="2" />
                    </svg>
                    {role && <span>{role}</span>}
                    {company && (
                      <>
                        {role && <span className="text-[#94949E]">at</span>}
                        {companyLink ? (
                          <a
                            href={companyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                          >
                            <span>{company}</span>
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
                              className="shrink-0"
                            >
                              <path d="M7 17 17 7" />
                              <path d="M7 7h10v10" />
                            </svg>
                          </a>
                        ) : (
                          <span className="font-medium text-white">{company}</span>
                        )}
                      </>
                    )}
                  </span>
                )}

                {(role || company) && place && (
                  <span
                    aria-hidden="true"
                    className="hidden h-3.5 w-px bg-white/15 sm:inline-block"
                  />
                )}

                {place && (
                  <span className="inline-flex items-center gap-1.5 text-zinc-300">
                    <svg
                      aria-hidden="true"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-[#94949E]"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{place}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio Summary */}
        <div>
          <AboutSection description={bio.description} />
        </div>

        {/* Actions & Quick Anchor */}
        {hasActions && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              {bio.resume && (
                <a
                  href={`${bio.resume}?dl=${bio.name.replace(/\s+/g, '_')}_Resume.pdf`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-zinc-200 active:scale-[0.98]"
                >
                  Download Resume
                </a>
              )}
              {bio.email && (
                <a
                  href={`mailto:${bio.email}`}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#676773] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-zinc-100 transition-all duration-200 hover:border-white/50 hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  Email me
                </a>
              )}
            </div>

            {hasProjects && (
              <a
                href="#projects"
                className="-mx-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[#A1A1AA] transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <span>Selected projects</span>
                <svg
                  aria-hidden="true"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
