'use client';

import { motion } from 'motion/react';
import type { Reward } from '@/types/portfolio';

interface RewardsSectionProps {
  rewards: Reward[];
  indexLabel?: string;
}

const EASE = [0.21, 0.47, 0.32, 0.98] as [number, number, number, number];

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  if (/^\d{4}$/.test(dateString)) return dateString;
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : String(date.getFullYear());
};

export function RewardsSection({ rewards, indexLabel = '04' }: RewardsSectionProps) {
  return (
    <motion.section
      id="awards"
      aria-labelledby="awards-heading"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: 0.06, ease: EASE }}
      className="space-y-6"
    >
      <div className="space-y-1.5">
        <span className="block text-xs font-medium tabular-nums text-[#94949E]">
          {indexLabel}
        </span>
        <h2
          id="awards-heading"
          className="text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl"
        >
          Awards
        </h2>
      </div>

      {!rewards || rewards.length === 0 ? (
        <p className="text-sm text-[#94949E]">
          No awards have been published yet.
        </p>
      ) : (
        <div className="divide-y divide-white/10">
          {rewards.map((reward) => (
            <article key={reward._id} className="space-y-1.5 py-5 first:pt-2 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-[15px] font-semibold leading-snug text-zinc-100">
                  {reward.name}
                </h3>
                <span className="shrink-0 text-xs tabular-nums text-[#94949E]">
                  {formatDate(reward.date)}
                </span>
              </div>
              {reward.description && (
                <p className="text-sm leading-relaxed text-zinc-400">
                  {reward.description}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </motion.section>
  );
}
