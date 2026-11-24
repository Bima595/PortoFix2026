'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { urlFor } from '@/sanity/lib/image';
import type { SideProject } from '@/types/portfolio';

interface SideProjectsSectionProps {
  sideProjects: SideProject[];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];
const formatIndex = (num: number) => String(num).padStart(2, '0');

export function SideProjectsSection({
  sideProjects,
  indexLabel = '02',
}: SideProjectsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [listHasMore, setListHasMore] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const desktopTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mobileTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const projects = sideProjects ?? [];
  const count = projects.length;
  const safeIndex = count > 0 ? Math.min(activeIndex, count - 1) : 0;
  const activeProject = projects[safeIndex];

  const updateListOverflow = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setListHasMore(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const rafId = requestAnimationFrame(updateListOverflow);
    const observer = new ResizeObserver(updateListOverflow);
    observer.observe(el);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [count, updateListOverflow]);

  const revealTab = (idx: number) => {
    desktopTabRefs.current[idx]?.scrollIntoView({
      block: 'nearest',
      inline: 'nearest',
      behavior: 'smooth',
    });
    mobileTabRefs.current[idx]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    });
  };

  const handlePrev = () => {
    if (count <= 1) return;
    const next = (safeIndex - 1 + count) % count;
    setActiveIndex(next);
    revealTab(next);
  };

  const handleNext = () => {
    if (count <= 1) return;
    const next = (safeIndex + 1) % count;
    setActiveIndex(next);
    revealTab(next);
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
    orientation: 'horizontal' | 'vertical'
  ) => {
    if (count <= 1) return;

    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    let nextIndex: number | null = null;

    if (event.key === nextKey) {
      nextIndex = (idx + 1) % count;
    } else if (event.key === prevKey) {
      nextIndex = (idx - 1 + count) % count;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = count - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      setActiveIndex(nextIndex);
      revealTab(nextIndex);
      const refs = orientation === 'vertical' ? desktopTabRefs : mobileTabRefs;
      refs.current[nextIndex]?.focus();
    }
  };

  const activeImages = activeProject
    ? activeProject.coverImage
      ? [activeProject.coverImage, ...(activeProject.images || [])]
      : activeProject.images || []
    : [];
  const activePreview = activeImages[0];
  const activePanelId = activeProject ? `project-panel-${activeProject._id}` : undefined;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="space-y-6 sm:space-y-8"
    >
      {/* Header with Helper Copy, Counter & Stepper Controls */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5"
      >
        <div className="space-y-1.5">
          <span className="block text-xs font-medium tabular-nums text-[#94949E]">
            {indexLabel}
          </span>
          <h2
            id="projects-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
          >
            Selected Projects
          </h2>
          {count > 0 && (
            <p className="text-sm text-zinc-400">
              {count === 1
                ? '1 project.'
                : `${count} projects. Pick one from the list to preview it.`}
            </p>
          )}
        </div>

        {count > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-[#94949E] sm:text-sm">
              {formatIndex(safeIndex + 1)} / {formatIndex(count)}
            </span>

            {count > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous project"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#676773] text-zinc-100 transition-colors hover:border-white/50 hover:bg-white/[0.08] active:scale-95"
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next project"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#676773] text-zinc-100 transition-colors hover:border-white/50 hover:bg-white/[0.08] active:scale-95"
                >
                  <svg
                    aria-hidden="true"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Segmented Position Bar */}
      {count > 1 && count <= 24 && (
        <div aria-hidden="true" className="flex gap-1">
          {projects.map((project, idx) => (
            <span
              key={project._id}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                idx === safeIndex ? 'bg-white' : 'bg-white/15'
              }`}
            />
          ))}
        </div>
      )}

      {!activeProject ? (
        <p className="text-sm text-[#94949E]">
          No projects have been published yet.
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8"
        >
          {/* Mobile Project Selector Strip */}
          {count > 1 && (
            <div className="space-y-2 lg:hidden">
              <p className="text-xs text-[#94949E]">
                Swipe to browse all {count} projects
              </p>
              <div
                role="tablist"
                aria-label="Project list"
                className="scrollbar-mono -mx-5 flex gap-2 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8"
              >
                {projects.map((project, idx) => {
                  const isActive = idx === safeIndex;
                  return (
                    <button
                      key={project._id}
                      ref={(el) => {
                        mobileTabRefs.current[idx] = el;
                      }}
                      id={`project-tab-mobile-${project._id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`project-panel-${project._id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveIndex(idx)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx, 'horizontal')}
                      className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-medium transition-colors sm:text-sm ${
                        isActive
                          ? 'border-white bg-white text-zinc-950'
                          : 'border-white/15 bg-[#111113] text-zinc-300 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <span
                        className={`tabular-nums ${
                          isActive ? 'text-[#52525B]' : 'text-[#94949E]'
                        }`}
                      >
                        {formatIndex(idx + 1)}
                      </span>
                      <span className="max-w-[180px] truncate">{project.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desktop Interactive Index List with Thumbnails (Left 5 cols) */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="relative">
              <div
                ref={listRef}
                role="tablist"
                aria-label="Project list"
                aria-orientation="vertical"
                onScroll={updateListOverflow}
                className="scrollbar-mono max-h-[600px] space-y-1.5 overflow-y-auto pr-2"
              >
                {projects.map((project, idx) => {
                  const isActive = idx === safeIndex;
                  const cover = project.coverImage || project.images?.[0];
                  return (
                    <button
                      key={project._id}
                      ref={(el) => {
                        desktopTabRefs.current[idx] = el;
                      }}
                      id={`project-tab-desktop-${project._id}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`project-panel-${project._id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setActiveIndex(idx)}
                      onKeyDown={(e) => handleTabKeyDown(e, idx, 'vertical')}
                      className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition-all duration-200 ${
                        isActive
                          ? 'border-white bg-white text-zinc-950'
                          : 'border-transparent bg-transparent text-zinc-300 hover:border-white/10 hover:bg-[#111113] hover:text-white'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`w-5 shrink-0 text-xs font-semibold tabular-nums ${
                            isActive ? 'text-[#52525B]' : 'text-[#94949E]'
                          }`}
                        >
                          {formatIndex(idx + 1)}
                        </span>

                        <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[#0B0B0D]">
                          {cover ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={urlFor(cover).width(160).auto('format').quality(75).url()}
                              alt=""
                              width={64}
                              height={40}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain"
                              draggable={false}
                            />
                          ) : (
                            <span className="text-[11px] font-medium tabular-nums text-[#94949E]">
                              {formatIndex(idx + 1)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <span className="block truncate text-[15px] font-semibold leading-snug">
                            {project.name}
                          </span>
                          {project.techStack && project.techStack.length > 0 && (
                            <span
                              className={`mt-0.5 block truncate text-xs ${
                                isActive ? 'text-[#52525B]' : 'text-[#94949E]'
                              }`}
                            >
                              {project.techStack.slice(0, 3).join(' · ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {project.year && (
                        <span
                          className={`shrink-0 text-xs font-medium tabular-nums ${
                            isActive ? 'text-[#52525B]' : 'text-[#94949E]'
                          }`}
                        >
                          {project.year}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {listHasMore && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-2xl bg-gradient-to-t from-[#09090B] to-transparent"
                />
              )}
            </div>

            <p className="pt-3 text-xs text-[#94949E]">
              {listHasMore
                ? `Scroll the list to see all ${count} projects`
                : `All ${count} ${count === 1 ? 'project' : 'projects'} shown`}
            </p>
          </div>

          {/* Uncropped Live Preview Stage (Right 7 cols on desktop, full width on mobile) */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject._id}
                id={activePanelId}
                role="tabpanel"
                aria-label={activeProject.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="overflow-hidden rounded-3xl border border-white/12 bg-[#111113]"
              >
                <Link
                  href={`/projects/${activeProject._id}`}
                  aria-label={`Open ${activeProject.name} details`}
                  className="group relative flex h-[240px] w-full items-center justify-center border-b border-white/10 bg-[#0B0B0D] p-4 sm:h-[340px] sm:p-6"
                >
                  {activePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={urlFor(activePreview).width(960).auto('format').quality(82).url()}
                      alt={activePreview.alt || `${activeProject.name} preview`}
                      width={960}
                      height={540}
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full rounded-xl object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                      draggable={false}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-[#94949E]">
                      {activeProject.name}
                    </span>
                  )}
                </Link>

                <div className="space-y-5 p-5 sm:p-7">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="text-xl font-bold tracking-[-0.02em] text-white sm:text-2xl">
                        {activeProject.name}
                      </h3>
                      {activeProject.year && (
                        <span className="text-xs font-medium tabular-nums text-[#94949E] sm:text-sm">
                          {activeProject.year}
                        </span>
                      )}
                    </div>

                    {activeProject.description && (
                      <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                        {activeProject.description}
                      </p>
                    )}
                  </div>

                  {activeProject.techStack && activeProject.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeProject.techStack.slice(0, 6).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                    <Link
                      href={`/projects/${activeProject._id}`}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 active:scale-[0.98]"
                    >
                      <span>View project details</span>
                      <svg
                        aria-hidden="true"
                        width="15"
                        height="15"
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
                    </Link>

                    {activeProject.demoLink && (
                      <a
                        href={activeProject.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-[#676773] px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-white/50 hover:bg-white/[0.06]"
                      >
                        <span>Live demo</span>
                        <svg
                          aria-hidden="true"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M7 17 17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </a>
                    )}

                    {activeProject.repoLink && (
                      <a
                        href={activeProject.repoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center rounded-full px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        Source code
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </section>
  );
}
