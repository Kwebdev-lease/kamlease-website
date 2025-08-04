import { renderHook, act } from '@testing-library/react';
import { useBreakpoint, useIsMobile, useIsTablet, useIsDesktop } from '../use-breakpoint';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { describe } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { expect } from 'vitest';
import { it } from 'vitest';
import { vi } from 'vitest';
import { beforeEach } from 'vitest';
import { describe } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';

// Mock window.matchMedia
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  const mockMediaQueryList = (query: string) => {
    const minWidth = parseInt(query.match(/\d+/)?.[0] || '0');
    return {
      matches: width >= minWidth,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(mockMediaQueryList),
  });
};

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct breakpoints for mobile screen (320px)', () => {
    mockMatchMedia(320);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current).toEqual({
      sm: false,
      md: false,
      lg: false,
      xl: false,
    });
  });

  it('should return correct breakpoints for small screen (640px)', () => {
    mockMatchMedia(640);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current).toEqual({
      sm: true,
      md: false,
      lg: false,
      xl: false,
    });
  });

  it('should return correct breakpoints for medium screen (768px)', () => {
    mockMatchMedia(768);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current).toEqual({
      sm: true,
      md: true,
      lg: false,
      xl: false,
    });
  });

  it('should return correct breakpoints for large screen (1024px)', () => {
    mockMatchMedia(1024);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current).toEqual({
      sm: true,
      md: true,
      lg: true,
      xl: false,
    });
  });

  it('should return correct breakpoints for extra large screen (1280px)', () => {
    mockMatchMedia(1280);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current).toEqual({
      sm: true,
      md: true,
      lg: true,
      xl: true,
    });
  });

  it('should call matchMedia for each breakpoint on initialization', () => {
    mockMatchMedia(768);
    
    renderHook(() => useBreakpoint());
    
    // Verify that matchMedia was called for each breakpoint
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 640px)');
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1280px)');
  });
});

describe('useIsMobile', () => {
  it('should return true for mobile screens (< 768px)', () => {
    mockMatchMedia(320);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false for tablet and desktop screens (>= 768px)', () => {
    mockMatchMedia(768);
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  it('should return false for mobile screens (< 768px)', () => {
    mockMatchMedia(320);
    
    const { result } = renderHook(() => useIsTablet());
    
    expect(result.current).toBe(false);
  });

  it('should return true for tablet screens (768px - 1023px)', () => {
    mockMatchMedia(768);
    
    const { result } = renderHook(() => useIsTablet());
    
    expect(result.current).toBe(true);
  });

  it('should return false for desktop screens (>= 1024px)', () => {
    mockMatchMedia(1024);
    
    const { result } = renderHook(() => useIsTablet());
    
    expect(result.current).toBe(false);
  });
});

describe('useIsDesktop', () => {
  it('should return false for mobile and tablet screens (< 1024px)', () => {
    mockMatchMedia(768);
    
    const { result } = renderHook(() => useIsDesktop());
    
    expect(result.current).toBe(false);
  });

  it('should return true for desktop screens (>= 1024px)', () => {
    mockMatchMedia(1024);
    
    const { result } = renderHook(() => useIsDesktop());
    
    expect(result.current).toBe(true);
  });
});