'use client';

import { useState } from 'react';
import { useScrollFade } from '@/hooks/useScrollFade';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AboutSectionProps {
  description: string;
}

export function AboutSection({ description }: AboutSectionProps) {
  const { ref, isVisible } = useScrollFade();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Truncate to ~120 characters for mobile
  const truncateLength = 120;
  const shouldTruncate = description.length > truncateLength;
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.slice(0, truncateLength).trim() + '...';

  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      {/* Mobile: Collapsible text */}
      <div className="md:hidden">
        <p className="text-sm text-zinc-400 leading-relaxed">
          {displayText}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show More
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Desktop: Full text */}
      <p className="hidden md:block text-sm text-zinc-400 leading-relaxed">
        {description}
      </p>
    </section>
  );
}
