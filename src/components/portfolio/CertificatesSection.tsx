'use client';

import { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/sanity/lib/image';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { useScrollFade } from '@/hooks/useScrollFade';
import type { Certificate } from '@/types/portfolio';

interface CertificatesSectionProps {
  certificates: Certificate[];
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

export function CertificatesSection({ certificates }: CertificatesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const { ref, isVisible } = useScrollFade();

  if (!certificates || certificates.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-6 tracking-tight">Certificates</h2>
        <div className="text-sm text-zinc-500 italic">
          No certificates added yet.
        </div>
      </section>
    );
  }

  const displayedCertificates = showAll ? certificates : certificates.slice(0, 6);
  const hasMore = certificates.length > 6;

  return (
    <section 
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <h2 className="text-lg font-semibold mb-8 tracking-tight">Certificates</h2>
      
      {/* Grid Layout - 3 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
        {displayedCertificates.map((cert) => (
          <div key={cert._id} className="flex flex-col items-center gap-3 group">
            {/* Certificate Badge/Image - Preserve aspect ratio */}
            {cert.image && (
              <div className="relative w-full max-w-[256px] aspect-square flex items-center justify-center transition-all duration-300 group-hover:scale-105">
                <div className="relative w-full h-full">
                  <Image
                    src={urlFor(cert.image).width(400).quality(90).url()}
                    alt={cert.image.alt || cert.title}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                    sizes="256px"
                    quality={90}
                  />
                </div>
              </div>
            )}

            {/* Certificate Info */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-zinc-100 leading-tight">
                  {cert.title}
                </h3>
                {cert.credentialLink && (
                  <a
                    href={cert.credentialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    aria-label="View credential"
                  >
                    <ExternalLink className="w-3 h-3 text-zinc-400 hover:text-zinc-200" />
                  </a>
                )}
              </div>
              
              <p className="text-xs text-zinc-400">
                {cert.issuer}
              </p>
              
              <p className="text-xs text-zinc-500">
                Issued {formatDate(cert.issueDate)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all duration-300 group"
          >
            <span>{showAll ? 'Show Less' : 'Show More'}</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : 'rotate-0'}`}
            />
          </button>
        </div>
      )}
    </section>
  );
}
