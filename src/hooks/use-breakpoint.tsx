import * as React from 'react';

// Tailwind CSS default breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export interface BreakpointConfig {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
}

export function useBreakpoint(): BreakpointConfig {
  const [breakpoints, setBreakpoints] = React.useState<BreakpointConfig>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
  });

  React.useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        sm: width >= BREAKPOINTS.sm,
        md: width >= BREAKPOINTS.md,
        lg: width >= BREAKPOINTS.lg,
        xl: width >= BREAKPOINTS.xl,
      });
    };

    // Set initial values
    updateBreakpoints();

    // Create media query listeners for each breakpoint
    const mediaQueries = Object.entries(BREAKPOINTS).map(([key, value]) => {
      const mql = window.matchMedia(`(min-width: ${value}px)`);
      const handler = () => updateBreakpoints();
      mql.addEventListener('change', handler);
      return { mql, handler };
    });

    // Cleanup function
    return () => {
      mediaQueries.forEach(({ mql, handler }) => {
        mql.removeEventListener('change', handler);
      });
    };
  }, []);

  return breakpoints;
}

// Additional utility hooks for common use cases
export function useIsMobile(): boolean {
  const { md } = useBreakpoint();
  return !md;
}

export function useIsTablet(): boolean {
  const { md, lg } = useBreakpoint();
  return md && !lg;
}

export function useIsDesktop(): boolean {
  const { lg } = useBreakpoint();
  return lg;
}