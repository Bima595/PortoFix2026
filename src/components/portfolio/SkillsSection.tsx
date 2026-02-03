'use client';

import { useScrollFade } from '@/hooks/useScrollFade';
import type { Skill } from '@/types/portfolio';

interface SkillsSectionProps {
  skills: Skill[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const { ref, isVisible } = useScrollFade();

  if (!skills || skills.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 tracking-tight">Skills</h2>
        <div className="text-sm text-zinc-500 italic">
          No skills added yet.
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
      <h2 className="text-lg font-semibold mb-8 tracking-tight">Skills</h2>
      <div className="flex flex-col gap-4">
        {skills.map((skillGroup) => (
          <div key={skillGroup._id} className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-zinc-300">
              {skillGroup.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillGroup.skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
