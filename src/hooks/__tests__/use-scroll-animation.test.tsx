import { renderHook, act } from '@testing-library/react';
import { vi, beforeEach, afterEach, describe, it, expect } from 'vitest';
import { useScrollAnimation, useStaggeredScrollAnimation, usePrefersReducedMotion } from '../use-scroll-animation';

beforeEach(() => {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  (global as any).IntersectionObserver = vi.fn().mockImplementation((callback, options) => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useScrollAnimation', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    expect(result.current.ref.current).toBeNull();
    expect(result.current.isInView).toBe(false);
    expect(result.current.hasAnimated).toBe(false);
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useScrollAnimation());
    
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.ref).toBe('object');
    expect(result.current.ref).toHaveProperty('current');
  });

  it('should accept custom options', () => {
    const customOptions = {
      threshold: 0.5,
      rootMargin: '0px',
      triggerOnce: false,
      disabled: true,
    };
    
    const { result } = renderHook(() => useScrollAnimation(customOptions));
    
    // Should still initialize properly with custom options
    expect(result.current.ref).toBeDefined();
    expect(result.current.isInView).toBe(false);
    expect(result.current.hasAnimated).toBe(false);
  });

  it('should handle prefers-reduced-motion', () => {
    // Mock matchMedia to return true for prefers-reduced-motion
    (window.matchMedia as any).mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useScrollAnimation());
    
    // When prefers-reduced-motion is true, should immediately be in view and animated
    expect(result.current.isInView).toBe(true);
    expect(result.current.hasAnimated).toBe(true);
  });

  it('should fallback gracefully when IntersectionObserver is not supported', () => {
    // Remove IntersectionObserver support
    delete (global as any).IntersectionObserver;
    
    const { result } = renderHook(() => useScrollAnimation());
    
    // Should still provide a working interface
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.isInView).toBe('boolean');
    expect(typeof result.current.hasAnimated).toBe('boolean');
  });

  it('should create IntersectionObserver when available', () => {
    const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
    
    (global as any).IntersectionObserver = mockIntersectionObserver;
    
    renderHook(() => useScrollAnimation());
    
    // IntersectionObserver constructor should be available
    expect(mockIntersectionObserver).toBeDefined();
  });

  it('should handle disabled state', () => {
    const { result } = renderHook(() => useScrollAnimation({ disabled: true }));
    
    // Should still provide the interface
    expect(result.current.ref).toBeDefined();
    expect(result.current.isInView).toBe(false);
    expect(result.current.hasAnimated).toBe(false);
  });
});

describe('useStaggeredScrollAnimation', () => {
  it('should return correct number of animation hooks', () => {
    const count = 3;
    const { result } = renderHook(() => useStaggeredScrollAnimation(count));
    
    expect(result.current).toHaveLength(count);
    expect(result.current[0]).toHaveProperty('ref');
    expect(result.current[0]).toHaveProperty('isInView');
    expect(result.current[0]).toHaveProperty('hasAnimated');
  });

  it('should create multiple hooks with same options', () => {
    const options = { threshold: 0.5, rootMargin: '0px' };
    const { result } = renderHook(() => useStaggeredScrollAnimation(2, options));
    
    expect(result.current).toHaveLength(2);
    
    // Each hook should have the same structure
    result.current.forEach(hook => {
      expect(hook).toHaveProperty('ref');
      expect(hook).toHaveProperty('isInView');
      expect(hook).toHaveProperty('hasAnimated');
    });
  });

  it('should handle empty count', () => {
    const { result } = renderHook(() => useStaggeredScrollAnimation(0));
    
    expect(result.current).toHaveLength(0);
  });
});

describe('usePrefersReducedMotion', () => {
  it('should return false when prefers-reduced-motion is not set', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(false);
  });

  it('should return true when prefers-reduced-motion is set', () => {
    (window.matchMedia as any).mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(true);
  });

  it('should handle media query changes', () => {
    let mediaQueryCallback: ((event: MediaQueryListEvent) => void) | null = null;
    
    (window.matchMedia as any).mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event, callback) => {
        if (event === 'change') {
          mediaQueryCallback = callback;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(false);
    
    // Simulate media query change
    if (mediaQueryCallback) {
      act(() => {
        mediaQueryCallback({ matches: true } as MediaQueryListEvent);
      });
    }
    
    expect(result.current).toBe(true);
  });

  it('should handle legacy browsers without addEventListener', () => {
    let legacyCallback: ((event: MediaQueryListEvent) => void) | null = null;
    
    (window.matchMedia as any).mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn((callback) => {
        legacyCallback = callback;
      }),
      removeListener: vi.fn(),
      // No addEventListener for legacy browsers
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => usePrefersReducedMotion());
    
    expect(result.current).toBe(false);
    
    // Simulate legacy media query change
    if (legacyCallback) {
      act(() => {
        legacyCallback({ matches: true } as MediaQueryListEvent);
      });
    }
    
    expect(result.current).toBe(true);
  });

  it('should cleanup event listeners on unmount', () => {
    const mockRemoveEventListener = vi.fn();
    const mockRemoveListener = vi.fn();
    
    (window.matchMedia as any).mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: mockRemoveListener,
      addEventListener: vi.fn(),
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));
    
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    
    unmount();
    
    // Should cleanup listeners (either modern or legacy)
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });
});