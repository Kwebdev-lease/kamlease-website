import { useEffect, useRef, useState, RefObject, useCallback } from 'react';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
}

interface ScrollAnimationReturn {
  ref: RefObject<HTMLElement>;
  isInView: boolean;
  hasAnimated: boolean;
}

/**
 * Custom hook for scroll-based animations using Intersection Observer
 * Respects user's prefers-reduced-motion preference
 */
export function useScrollAnimation(options: ScrollAnimationOptions = {}): ScrollAnimationReturn {
  const {
    threshold = 0.1,
    rootMargin = '-10% 0px -10% 0px',
    triggerOnce = true,
    disabled = false,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Intersection Observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      const isCurrentlyInView = entry.isIntersecting;
      
      setIsInView(isCurrentlyInView);
      
      if (isCurrentlyInView && !hasAnimated) {
        setHasAnimated(true);
        
        // If triggerOnce is true, stop observing after first trigger
        if (triggerOnce) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, [hasAnimated, triggerOnce]);

  useEffect(() => {
    const element = ref.current;
    
    // Don't set up observer if disabled, element doesn't exist, or user prefers reduced motion
    if (disabled || !element) {
      return;
    }

    // If reduced motion is preferred, immediately set as in view and animated
    if (prefersReducedMotion) {
      setIsInView(true);
      setHasAnimated(true);
      return;
    }

    // Check if Intersection Observer is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: immediately trigger animation if no support
      setIsInView(true);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, threshold, rootMargin, disabled, prefersReducedMotion]);

  return {
    ref,
    isInView: prefersReducedMotion ? true : isInView,
    hasAnimated: prefersReducedMotion ? true : hasAnimated,
  };
}

// Utility hook for multiple elements with staggered animations
export function useStaggeredScrollAnimation(
  count: number,
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn[] {
  const results: ScrollAnimationReturn[] = [];
  
  for (let i = 0; i < count; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results.push(useScrollAnimation(options));
  }
  
  return results;
}

// Hook specifically for checking prefers-reduced-motion
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}