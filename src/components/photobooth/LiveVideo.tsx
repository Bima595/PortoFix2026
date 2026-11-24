'use client';

import React, { useRef, useEffect } from 'react';

interface LiveVideoProps {
  stream: MediaStream | null;
  isMirrored: boolean;
  cssFilter: string;
  className?: string;
}

export default function LiveVideo({
  stream,
  isMirrored,
  cssFilter,
  className = '',
}: LiveVideoProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = localVideoRef.current;
    if (!videoEl) return;
    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      className={`${className} ${isMirrored ? '-scale-x-100' : ''}`}
      style={{
        filter: cssFilter && cssFilter !== 'none' ? cssFilter : undefined,
      }}
    />
  );
}
