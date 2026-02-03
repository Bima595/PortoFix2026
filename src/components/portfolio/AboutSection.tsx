'use client';

import { useScrollFade } from '@/hooks/useScrollFade';

interface AboutSectionProps {
  description: string;
}

export function AboutSection({ description }: AboutSectionProps) {
  const { ref, isVisible } = useScrollFade();

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </section>
  );
}
