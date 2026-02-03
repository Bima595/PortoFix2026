'use client';

import { useScrollFade } from '@/hooks/useScrollFade';
import type { Reward } from '@/types/portfolio';

interface RewardsSectionProps {
  rewards: Reward[];
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

export function RewardsSection({ rewards }: RewardsSectionProps) {
  const { ref, isVisible } = useScrollFade();

  if (!rewards || rewards.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 tracking-tight">Rewards & Awards</h2>
        <div className="text-sm text-zinc-500 italic">
          No rewards added yet.
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
      <h2 className="text-lg font-semibold mb-8 tracking-tight">Rewards & Awards</h2>
      <div className="flex flex-col gap-6">
        {rewards.map((reward) => (
          <div key={reward._id} className="flex gap-12">
            {/* Date - Left Side */}
            <div className="w-28 shrink-0 text-sm text-zinc-500 whitespace-nowrap">
              {formatDate(reward.date)}
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 flex flex-col gap-2">
              <h3 className="font-semibold text-base text-zinc-100">
                {reward.name}
              </h3>
              
              {reward.description && (
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {reward.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
