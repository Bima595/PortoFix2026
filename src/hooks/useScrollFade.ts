'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollFadeOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollFade(options: UseScrollFadeOptions = {}) {
  const { threshold = 0.3, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLElement>(null);
  
  // Initialize to false to match server rendering (hydration safe)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check mobile status inside useEffect (client-only)
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Defer state update to avoid synchronous render warning
      setTimeout(() => setIsVisible(true), 0);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
}
