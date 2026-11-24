'use client';

import { useState } from 'react';

interface AboutSectionProps {
  description: string;
}

export function AboutSection({ description }: AboutSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return null;
  }

  const truncateLength = 240;
  const shouldTruncate = description.length > truncateLength;
  const mobileText =
    isExpanded || !shouldTruncate
      ? description
      : `${description.slice(0, truncateLength).trimEnd()}...`;

  return (
    <div className="max-w-[66ch]">
      <div className="sm:hidden">
        <p className="text-[15px] leading-[1.75] text-[#A1A1AA]">{mobileText}</p>
        {shouldTruncate && (
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            className="mt-1 -ml-2 inline-flex min-h-[44px] items-center px-2 text-sm font-medium text-white underline-offset-4 hover:underline"
          >
            {isExpanded ? 'Show less' : 'Read full bio'}
          </button>
        )}
      </div>

      <p className="hidden text-base leading-[1.78] text-[#A1A1AA] sm:block sm:text-[16.5px]">
        {description}
      </p>
    </div>
  );
}
