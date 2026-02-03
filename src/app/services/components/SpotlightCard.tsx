'use client';

import { useRef, useState } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export default function SpotlightCard({ 
  children, 
  className = "", 
  spotlightColor = "rgba(255, 255, 255, 0.15)" 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group/spotlight ${className}`}
    >
      {/* Background Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-10 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      
      {/* Border Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 z-30 group-hover/spotlight:opacity-100"
        style={{
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${spotlightColor.replace(/[\d.]+\)$/, '1)')}, transparent 80%)`,
          maskImage: 'linear-gradient(black, black), linear-gradient(black, black)',
          maskClip: 'content-box, border-box',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1.5px'
        }}
      />

      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  );
}
