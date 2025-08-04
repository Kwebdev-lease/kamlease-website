import { useIsMobile as useIsMobileFromBreakpoint } from './use-breakpoint';

// Re-export the useIsMobile hook from use-breakpoint for backward compatibility
export function useIsMobile() {
  return useIsMobileFromBreakpoint();
}
