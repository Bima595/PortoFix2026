'use client';

import { motion } from 'motion/react';
import type { Skill } from '@/types/portfolio';

interface SkillsSectionProps {
  skills: Skill[];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

export function SkillsSection({ skills, indexLabel = '05' }: SkillsSectionProps) {
  return (
    <motion.section
      id="skills"
      aria-labelledby="skills-heading"
      initial={{ opacity: 0, y: 24, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: EASE }}
      className="rounded-3xl border border-white/20 bg-[#F4F4F5] p-6 text-[#09090B] sm:p-10 md:p-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-zinc-950/15 pb-6">
        <div className="space-y-1.5">
          <span className="block text-xs font-semibold tabular-nums text-[#52525B]">
            {indexLabel}
          </span>
          <h2
            id="skills-heading"
            className="text-3xl font-bold tracking-[-0.03em] text-[#09090B] sm:text-4xl"
          >
            Skills &amp; Stack
          </h2>
        </div>

        {skills && skills.length > 0 && (
          <p className="text-xs font-medium tabular-nums text-[#52525B] sm:text-sm">
            {String(skills.length).padStart(2, '0')}{' '}
            {skills.length === 1 ? 'Category' : 'Categories'}
          </p>
        )}
      </div>

      {!skills || skills.length === 0 ? (
        <p className="pt-6 text-sm text-[#52525B]">
          No skills have been published yet.
        </p>
      ) : (
        <dl className="divide-y divide-zinc-950/15 pt-2">
          {skills.map((skillGroup, idx) => (
            <motion.div
              key={skillGroup._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: Math.min(idx * 0.05, 0.2),
                ease: EASE,
              }}
              className="grid grid-cols-1 gap-2 py-5 last:pb-0 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-baseline sm:gap-8 sm:py-6"
            >
              <dt className="text-sm font-semibold tracking-[-0.01em] text-[#09090B] sm:text-base">
                {skillGroup.category}
              </dt>
              <dd className="text-sm leading-relaxed text-[#3F3F46] sm:text-[15px]">
                {skillGroup.skills.join(' · ')}
              </dd>
            </motion.div>
          ))}
        </dl>
      )}
    </motion.section>
  );
}
