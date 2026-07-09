import React, { useRef, useEffect } from 'react';

interface LiveVideoProps {
  stream: MediaStream | null;
  isMirrored: boolean;
  filterClass: string;
  className?: string;
}

export default function LiveVideo({ stream, isMirrored, filterClass, className = '' }: LiveVideoProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      className={`${className} ${filterClass} ${isMirrored ? '-scale-x-100' : ''}`}
    />
  );
}
