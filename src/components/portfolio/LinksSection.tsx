'use client';

import { motion } from 'motion/react';
import type { Bio } from '@/types/portfolio';

interface LinksSectionProps {
  socialLinks?: Bio['socialLinks'];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

export function LinksSection({ socialLinks, indexLabel = '07' }: LinksSectionProps) {
  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  return (
    <motion.section
      id="links"
      aria-labelledby="links-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="space-y-6 border-t border-white/10 pt-14 sm:pt-20"
    >
      <div className="space-y-1.5">
        <span className="block text-xs font-medium tabular-nums text-[#94949E]">
          {indexLabel}
        </span>
        <h2
          id="links-heading"
          className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl"
        >
          Links
        </h2>
      </div>

      <ul className="divide-y divide-white/10 border-t border-b border-white/10">
        {socialLinks.map((link, index) => (
          <li key={`${link.platform}-${index}`}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-[64px] items-center justify-between gap-6 py-4 transition-colors hover:bg-white/[0.03] sm:min-h-[72px] sm:px-3"
            >
              <span className="text-sm font-medium text-[#94949E] transition-colors group-hover:text-zinc-200 sm:text-base">
                {link.platform}
              </span>
              <span className="inline-flex min-w-0 items-center gap-2.5 truncate text-base font-semibold tracking-[-0.01em] text-zinc-100 transition-all duration-200 group-hover:translate-x-1 group-hover:text-white sm:text-xl">
                <span className="truncate">{link.username}</span>
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
                  className="shrink-0 text-[#94949E] transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
