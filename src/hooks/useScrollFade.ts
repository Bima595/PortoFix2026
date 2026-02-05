'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

interface UseScrollFadeOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

// Subscribe to window resize for mobile detection
function subscribeToResize(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getIsMobileSnapshot(): boolean {
  return window.innerWidth < 768;
}

function getServerSnapshot(): boolean {
  return false; // SSR fallback
}

export function useScrollFade(options: UseScrollFadeOptions = {}) {
  const { threshold = 0.3, rootMargin = '0px', triggerOnce = false } = options;
  const ref = useRef<HTMLElement>(null);
  
  // Use useSyncExternalStore for mobile detection (no setState in useEffect)
  const isMobile = useSyncExternalStore(
    subscribeToResize,
    getIsMobileSnapshot,
    getServerSnapshot
  );
  
  // Initialize visibility: mobile = visible immediately, desktop = hidden for scroll fade
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    // On mobile, content is always visible (no scroll animation)
    if (isMobile) return;

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
  }, [threshold, rootMargin, triggerOnce, isMobile]);

  // Return isMobile-aware visibility
  return { ref, isVisible: isMobile ? true : isVisible };
}
