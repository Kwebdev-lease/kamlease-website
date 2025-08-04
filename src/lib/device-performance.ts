/**
 * Device performance detection and optimization utilities
 * Detects device capabilities and adjusts animations accordingly
 */

export interface DevicePerformance {
  tier: 'low' | 'medium' | 'high';
  memory: number | null;
  cores: number | null;
  connection: 'slow' | 'fast' | 'unknown';
  supportsWebGL: boolean;
  supportsIntersectionObserver: boolean;
  supportsPerformanceObserver: boolean;
  isMobile: boolean;
  isLowEndDevice: boolean;
}

export interface PerformanceOptimizedAnimationConfig {
  duration: number;
  enableComplexAnimations: boolean;
  enableParticles: boolean;
  enableBlur: boolean;
  enableShadows: boolean;
  staggerDelay: number;
  maxConcurrentAnimations: number;
}

/**
 * Detect device performance characteristics
 */
export function detectDevicePerformance(): DevicePerformance {
  // Default values for server-side rendering
  if (typeof window === 'undefined') {
    return {
      tier: 'medium',
      memory: null,
      cores: null,
      connection: 'unknown',
      supportsWebGL: false,
      supportsIntersectionObserver: false,
      supportsPerformanceObserver: false,
      isMobile: false,
      isLowEndDevice: false,
    };
  }

  // Detect memory (Chrome only)
  const memory = (performance as any).memory?.jsHeapSizeLimit 
    ? Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024) 
    : null;

  // Detect CPU cores
  const cores = navigator.hardwareConcurrency || null;

  // Detect connection speed
  const connection = getConnectionSpeed();

  // Detect WebGL support
  const supportsWebGL = detectWebGLSupport();

  // Detect API support
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  const supportsPerformanceObserver = 'PerformanceObserver' in window;

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth < 768;

  // Calculate performance tier
  const tier = calculatePerformanceTier({
    memory,
    cores,
    connection,
    supportsWebGL,
    isMobile,
  });

  // Determine if it's a low-end device
  const isLowEndDevice = tier === 'low' || 
    (memory !== null && memory < 1000) || 
    (cores !== null && cores <= 2) ||
    connection === 'slow';

  return {
    tier,
    memory,
    cores,
    connection,
    supportsWebGL,
    supportsIntersectionObserver,
    supportsPerformanceObserver,
    isMobile,
    isLowEndDevice,
  };
}

/**
 * Get connection speed classification
 */
function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    if (connection.effectiveType) {
      // 'slow-2g', '2g', '3g', '4g'
      return ['slow-2g', '2g'].includes(connection.effectiveType) ? 'slow' : 'fast';
    }
    
    if (connection.downlink !== undefined) {
      // Downlink in Mbps
      return connection.downlink < 1.5 ? 'slow' : 'fast';
    }
  }
  
  return 'unknown';
}

/**
 * Detect WebGL support
 */
function detectWebGLSupport(): boolean {
  // Handle test environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * Calculate performance tier based on device characteristics
 */
function calculatePerformanceTier(params: {
  memory: number | null;
  cores: number | null;
  connection: 'slow' | 'fast' | 'unknown';
  supportsWebGL: boolean;
  isMobile: boolean;
}): 'low' | 'medium' | 'high' {
  const { memory, cores, connection, supportsWebGL, isMobile } = params;
  
  let score = 0;
  
  // Memory scoring
  if (memory !== null) {
    if (memory >= 4000) score += 3;
    else if (memory >= 2000) score += 2;
    else if (memory >= 1000) score += 1;
  } else {
    score += 2; // Default assumption for unknown memory
  }
  
  // CPU cores scoring
  if (cores !== null) {
    if (cores >= 8) score += 3;
    else if (cores >= 4) score += 2;
    else if (cores >= 2) score += 1;
  } else {
    score += 2; // Default assumption for unknown cores
  }
  
  // Connection scoring
  if (connection === 'fast') score += 2;
  else if (connection === 'unknown') score += 1;
  
  // WebGL support
  if (supportsWebGL) score += 1;
  
  // Mobile penalty
  if (isMobile) score -= 1;
  
  // Determine tier based on score
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/**
 * Get performance-optimized animation configuration
 */
export function getPerformanceOptimizedConfig(
  devicePerformance: DevicePerformance
): PerformanceOptimizedAnimationConfig {
  const { tier, isMobile, isLowEndDevice } = devicePerformance;
  
  switch (tier) {
    case 'high':
      return {
        duration: isMobile ? 0.5 : 0.6,
        enableComplexAnimations: true,
        enableParticles: true,
        enableBlur: true,
        enableShadows: true,
        staggerDelay: 0.1,
        maxConcurrentAnimations: 10,
      };
      
    case 'medium':
      return {
        duration: isMobile ? 0.4 : 0.5,
        enableComplexAnimations: true,
        enableParticles: !isMobile,
        enableBlur: !isMobile,
        enableShadows: true,
        staggerDelay: 0.08,
        maxConcurrentAnimations: 6,
      };
      
    case 'low':
    default:
      return {
        duration: isMobile ? 0.3 : 0.4,
        enableComplexAnimations: false,
        enableParticles: false,
        enableBlur: false,
        enableShadows: !isLowEndDevice,
        staggerDelay: 0.05,
        maxConcurrentAnimations: 3,
      };
  }
}

/**
 * Hook for device performance detection with caching
 */
let cachedPerformance: DevicePerformance | null = null;

export function useDevicePerformance(): DevicePerformance {
  if (!cachedPerformance) {
    cachedPerformance = detectDevicePerformance();
  }
  return cachedPerformance;
}

/**
 * Get responsive animation duration based on device and screen size
 */
export function getResponsiveAnimationDuration(
  baseDesktopDuration: number,
  devicePerformance: DevicePerformance
): number {
  const config = getPerformanceOptimizedConfig(devicePerformance);
  const performanceMultiplier = config.duration / 0.6; // 0.6 is the base desktop duration
  
  return baseDesktopDuration * performanceMultiplier;
}

/**
 * Check if complex animations should be enabled
 */
export function shouldEnableComplexAnimations(
  devicePerformance: DevicePerformance,
  prefersReducedMotion: boolean
): boolean {
  if (prefersReducedMotion) return false;
  
  const config = getPerformanceOptimizedConfig(devicePerformance);
  return config.enableComplexAnimations;
}

/**
 * Get maximum concurrent animations based on device performance
 */
export function getMaxConcurrentAnimations(
  devicePerformance: DevicePerformance
): number {
  const config = getPerformanceOptimizedConfig(devicePerformance);
  return config.maxConcurrentAnimations;
}

/**
 * Performance monitoring for animations
 */
export class AnimationPerformanceMonitor {
  private activeAnimations = new Set<string>();
  private performanceEntries: { [key: string]: number[] } = {};
  
  startAnimation(animationId: string): void {
    this.activeAnimations.add(animationId);
    
    if (!this.performanceEntries[animationId]) {
      this.performanceEntries[animationId] = [];
    }
    
    // Mark performance start
    if (performance.mark) {
      performance.mark(`animation-${animationId}-start`);
    }
  }
  
  endAnimation(animationId: string): void {
    this.activeAnimations.delete(animationId);
    
    // Mark performance end and measure
    if (performance.mark && performance.measure) {
      performance.mark(`animation-${animationId}-end`);
      
      try {
        performance.measure(
          `animation-${animationId}`,
          `animation-${animationId}-start`,
          `animation-${animationId}-end`
        );
        
        const measure = performance.getEntriesByName(`animation-${animationId}`)[0];
        if (measure) {
          this.performanceEntries[animationId].push(measure.duration);
          
          // Log warning for slow animations
          if (measure.duration > 100) {
            console.warn(`Animation ${animationId} took ${measure.duration.toFixed(2)}ms`);
          }
        }
      } catch (error) {
        // Ignore measurement errors
      }
    }
  }
  
  getActiveAnimationCount(): number {
    return this.activeAnimations.size;
  }
  
  getAverageAnimationDuration(animationId: string): number {
    const entries = this.performanceEntries[animationId];
    if (!entries || entries.length === 0) return 0;
    
    const sum = entries.reduce((acc, duration) => acc + duration, 0);
    return sum / entries.length;
  }
  
  shouldThrottleAnimations(maxConcurrent: number): boolean {
    return this.activeAnimations.size >= maxConcurrent;
  }
}

// Global animation performance monitor instance
export const animationMonitor = new AnimationPerformanceMonitor();