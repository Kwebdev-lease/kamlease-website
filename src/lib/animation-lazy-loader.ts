/**
 * Lazy loading system for complex animations
 * Loads animations only when needed to improve initial page load performance
 */

import { Variants } from 'framer-motion';
import { DevicePerformance, getPerformanceOptimizedConfig } from './device-performance';

export interface LazyAnimationConfig {
  id: string;
  priority: 'high' | 'medium' | 'low';
  loader: () => Promise<Variants>;
  fallback?: Variants;
  preload?: boolean;
}

export interface AnimationLoadState {
  loading: boolean;
  loaded: boolean;
  error: boolean;
  animation?: Variants;
}

/**
 * Animation lazy loader class
 */
class AnimationLazyLoader {
  private cache = new Map<string, Variants>();
  private loadingStates = new Map<string, AnimationLoadState>();
  private loadPromises = new Map<string, Promise<Variants>>();
  private preloadQueue: LazyAnimationConfig[] = [];
  private isPreloading = false;

  /**
   * Register a lazy animation
   */
  register(config: LazyAnimationConfig): void {
    if (config.preload) {
      this.preloadQueue.push(config);
      this.startPreloading();
    }
  }

  /**
   * Load an animation by ID
   */
  async load(
    animationId: string,
    loader: () => Promise<Variants>,
    fallback?: Variants
  ): Promise<Variants> {
    // Return cached animation if available
    if (this.cache.has(animationId)) {
      return this.cache.get(animationId)!;
    }

    // Return existing promise if already loading
    if (this.loadPromises.has(animationId)) {
      return this.loadPromises.get(animationId)!;
    }

    // Set loading state
    this.loadingStates.set(animationId, {
      loading: true,
      loaded: false,
      error: false,
    });

    // Create load promise
    const loadPromise = this.loadAnimation(animationId, loader, fallback);
    this.loadPromises.set(animationId, loadPromise);

    return loadPromise;
  }

  /**
   * Get animation load state
   */
  getLoadState(animationId: string): AnimationLoadState {
    return this.loadingStates.get(animationId) || {
      loading: false,
      loaded: false,
      error: false,
    };
  }

  /**
   * Check if animation is loaded
   */
  isLoaded(animationId: string): boolean {
    return this.cache.has(animationId);
  }

  /**
   * Preload animations based on priority and device performance
   */
  async preload(
    configs: LazyAnimationConfig[],
    devicePerformance: DevicePerformance
  ): Promise<void> {
    const performanceConfig = getPerformanceOptimizedConfig(devicePerformance);
    
    // Filter animations based on device capabilities
    const filteredConfigs = configs.filter(config => {
      if (!performanceConfig.enableComplexAnimations && config.priority === 'low') {
        return false;
      }
      return true;
    });

    // Sort by priority
    const sortedConfigs = filteredConfigs.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Load animations with concurrency limit
    const maxConcurrent = Math.min(3, performanceConfig.maxConcurrentAnimations);
    const chunks = this.chunkArray(sortedConfigs, maxConcurrent);

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(config => 
          this.load(config.id, config.loader, config.fallback)
        )
      );
    }
  }

  /**
   * Clear cache and reset states
   */
  clear(): void {
    this.cache.clear();
    this.loadingStates.clear();
    this.loadPromises.clear();
  }

  /**
   * Get cache size for debugging
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Internal method to load animation
   */
  private async loadAnimation(
    animationId: string,
    loader: () => Promise<Variants>,
    fallback?: Variants
  ): Promise<Variants> {
    try {
      const animation = await loader();
      
      // Cache the loaded animation
      this.cache.set(animationId, animation);
      
      // Update loading state
      this.loadingStates.set(animationId, {
        loading: false,
        loaded: true,
        error: false,
        animation,
      });

      return animation;
    } catch (error) {
      console.warn(`Failed to load animation ${animationId}:`, error);
      
      // Update error state
      this.loadingStates.set(animationId, {
        loading: false,
        loaded: false,
        error: true,
        animation: fallback,
      });

      // Return fallback or empty animation
      const fallbackAnimation = fallback || { hidden: {}, visible: {} };
      this.cache.set(animationId, fallbackAnimation);
      return fallbackAnimation;
    } finally {
      // Clean up promise
      this.loadPromises.delete(animationId);
    }
  }

  /**
   * Start preloading queue
   */
  private async startPreloading(): Promise<void> {
    if (this.isPreloading || this.preloadQueue.length === 0) {
      return;
    }

    this.isPreloading = true;

    try {
      // Process preload queue
      const configs = [...this.preloadQueue];
      this.preloadQueue = [];

      await Promise.allSettled(
        configs.map(config => 
          this.load(config.id, config.loader, config.fallback)
        )
      );
    } finally {
      this.isPreloading = false;
      
      // Process any new items added during preloading
      if (this.preloadQueue.length > 0) {
        setTimeout(() => this.startPreloading(), 100);
      }
    }
  }

  /**
   * Utility to chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

// Global lazy loader instance
export const animationLazyLoader = new AnimationLazyLoader();

/**
 * Complex animation definitions for lazy loading
 */
export const LAZY_ANIMATIONS: { [key: string]: LazyAnimationConfig } = {
  particleBackground: {
    id: 'particleBackground',
    priority: 'low',
    preload: false,
    loader: async () => {
      // Simulate loading complex particle animation
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 2,
            ease: 'easeInOut',
          },
        },
      };
    },
    fallback: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },

  complexCardHover: {
    id: 'complexCardHover',
    priority: 'medium',
    preload: true,
    loader: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        rest: {
          scale: 1,
          rotateY: 0,
          z: 0,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        hover: {
          scale: 1.05,
          rotateY: 5,
          z: 50,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transition: {
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          },
        },
      };
    },
    fallback: {
      rest: { scale: 1 },
      hover: { scale: 1.02 },
    },
  },

  morphingIcon: {
    id: 'morphingIcon',
    priority: 'low',
    preload: false,
    loader: async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
      return {
        initial: { pathLength: 0, opacity: 0 },
        animate: {
          pathLength: 1,
          opacity: 1,
          transition: {
            pathLength: { duration: 1.5, ease: 'easeInOut' },
            opacity: { duration: 0.5 },
          },
        },
        hover: {
          scale: 1.2,
          rotate: 180,
          transition: { duration: 0.3 },
        },
      };
    },
    fallback: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      hover: { scale: 1.1 },
    },
  },

  liquidButton: {
    id: 'liquidButton',
    priority: 'medium',
    preload: true,
    loader: async () => {
      await new Promise(resolve => setTimeout(resolve, 75));
      return {
        rest: {
          scale: 1,
          borderRadius: '8px',
        },
        hover: {
          scale: 1.05,
          borderRadius: ['8px', '12px', '16px', '12px', '8px'],
          transition: {
            borderRadius: {
              duration: 1.5,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatType: 'reverse' as const,
            },
            scale: {
              duration: 0.2,
            },
          },
        },
        tap: {
          scale: 0.95,
          borderRadius: '4px',
        },
      };
    },
    fallback: {
      rest: { scale: 1 },
      hover: { scale: 1.05 },
      tap: { scale: 0.95 },
    },
  },
};

/**
 * Hook for using lazy-loaded animations
 */
export function useLazyAnimation(
  animationId: string,
  devicePerformance: DevicePerformance
): {
  animation: Variants | null;
  loading: boolean;
  error: boolean;
  load: () => Promise<void>;
} {
  const config = LAZY_ANIMATIONS[animationId];
  const performanceConfig = getPerformanceOptimizedConfig(devicePerformance);
  
  // Don't load complex animations on low-end devices
  const shouldLoad = performanceConfig.enableComplexAnimations || config?.priority === 'high';
  
  const loadState = animationLazyLoader.getLoadState(animationId);
  
  const load = async () => {
    if (!config || !shouldLoad) return;
    
    await animationLazyLoader.load(
      config.id,
      config.loader,
      config.fallback
    );
  };

  return {
    animation: shouldLoad ? loadState.animation || null : config?.fallback || null,
    loading: shouldLoad ? loadState.loading : false,
    error: shouldLoad ? loadState.error : false,
    load,
  };
}

/**
 * Initialize lazy loading system
 */
export function initializeLazyAnimations(devicePerformance: DevicePerformance): void {
  // Register all animations
  Object.values(LAZY_ANIMATIONS).forEach(config => {
    animationLazyLoader.register(config);
  });

  // Start preloading based on device performance
  const performanceConfig = getPerformanceOptimizedConfig(devicePerformance);
  
  if (performanceConfig.enableComplexAnimations) {
    // Preload high and medium priority animations
    const preloadConfigs = Object.values(LAZY_ANIMATIONS).filter(
      config => config.preload && ['high', 'medium'].includes(config.priority)
    );
    
    // Delay preloading to not interfere with initial page load
    setTimeout(() => {
      animationLazyLoader.preload(preloadConfigs, devicePerformance);
    }, 1000);
  }
}

/**
 * Utility to check if device supports complex animations
 */
export function supportsComplexAnimations(devicePerformance: DevicePerformance): boolean {
  const config = getPerformanceOptimizedConfig(devicePerformance);
  return config.enableComplexAnimations;
}