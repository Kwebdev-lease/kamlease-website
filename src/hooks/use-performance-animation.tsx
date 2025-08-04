/**
 * Performance-aware animation hook
 * Automatically adjusts animation settings based on device performance
 */

import { useMemo } from 'react';
import { Variants, Transition } from 'framer-motion';
import { useDevicePerformance, getPerformanceOptimizedConfig, animationMonitor } from '../lib/device-performance';
import { useAccessibilityPreferences } from './use-accessibility-preferences';
import { useBreakpoint } from './use-breakpoint';

export interface PerformanceAnimationOptions {
  baseAnimation: Variants;
  fallbackAnimation?: Variants;
  enableOnLowEnd?: boolean;
  priority?: 'high' | 'medium' | 'low';
  complexityLevel?: 'simple' | 'medium' | 'complex';
}

export interface PerformanceAnimationResult {
  animation: Variants;
  shouldAnimate: boolean;
  isOptimized: boolean;
  performanceTier: 'low' | 'medium' | 'high';
  config: {
    duration: number;
    enableComplexAnimations: boolean;
    enableParticles: boolean;
    enableBlur: boolean;
    enableShadows: boolean;
    staggerDelay: number;
    maxConcurrentAnimations: number;
  };
}

/**
 * Hook for performance-aware animations
 */
export function usePerformanceAnimation(
  options: PerformanceAnimationOptions
): PerformanceAnimationResult {
  const {
    baseAnimation,
    fallbackAnimation,
    enableOnLowEnd = false,
    priority = 'medium',
    complexityLevel = 'medium',
  } = options;

  const devicePerformance = useDevicePerformance();
  const { prefersReducedMotion } = useAccessibilityPreferences();
  const { sm: isMobile } = useBreakpoint();
  const performanceConfig = getPerformanceOptimizedConfig(devicePerformance);

  const result = useMemo(() => {
    // Check if animations should be disabled
    if (prefersReducedMotion) {
      return {
        animation: fallbackAnimation || { hidden: {}, visible: {} },
        shouldAnimate: false,
        isOptimized: true,
        performanceTier: devicePerformance.tier,
        config: performanceConfig,
      };
    }

    // Check if device can handle the animation complexity
    const canHandleComplexity = 
      (complexityLevel === 'simple') ||
      (complexityLevel === 'medium' && devicePerformance.tier !== 'low') ||
      (complexityLevel === 'complex' && devicePerformance.tier === 'high');

    // Check if we should throttle based on concurrent animations
    const shouldThrottle = animationMonitor.shouldThrottleAnimations(
      performanceConfig.maxConcurrentAnimations
    );

    // Determine if animation should run
    const shouldAnimate = 
      (enableOnLowEnd || devicePerformance.tier !== 'low') &&
      canHandleComplexity &&
      !shouldThrottle &&
      (priority === 'high' || !isMobile || devicePerformance.tier !== 'low');

    // Select appropriate animation
    let selectedAnimation = baseAnimation;
    let isOptimized = false;

    if (!shouldAnimate && fallbackAnimation) {
      selectedAnimation = fallbackAnimation;
      isOptimized = true;
    } else if (shouldAnimate) {
      // Optimize animation based on device performance
      selectedAnimation = optimizeAnimationForDevice(baseAnimation, devicePerformance);
      isOptimized = selectedAnimation !== baseAnimation;
    }

    return {
      animation: selectedAnimation,
      shouldAnimate,
      isOptimized,
      performanceTier: devicePerformance.tier,
      config: performanceConfig,
    };
  }, [
    baseAnimation,
    fallbackAnimation,
    enableOnLowEnd,
    priority,
    complexityLevel,
    devicePerformance,
    prefersReducedMotion,
    isMobile,
    performanceConfig,
  ]);

  return result;
}

/**
 * Optimize animation variants based on device performance
 */
function optimizeAnimationForDevice(
  animation: Variants,
  devicePerformance: DevicePerformance
): Variants {
  const config = getPerformanceOptimizedConfig(devicePerformance);
  const optimized: Variants = {};

  for (const [key, variant] of Object.entries(animation)) {
    if (typeof variant === 'object' && variant !== null) {
      optimized[key] = optimizeVariant(variant, config, devicePerformance);
    } else {
      optimized[key] = variant;
    }
  }

  return optimized;
}

/**
 * Optimize individual animation variant
 */
function optimizeVariant(
  variant: any,
  config: ReturnType<typeof getPerformanceOptimizedConfig>,
  devicePerformance: DevicePerformance
): any {
  const optimized = { ...variant };

  // Adjust transition duration
  if (optimized.transition) {
    if (typeof optimized.transition === 'object') {
      optimized.transition = {
        ...optimized.transition,
        duration: config.duration,
      };

      // Adjust stagger timing
      if (optimized.transition.staggerChildren) {
        optimized.transition.staggerChildren = config.staggerDelay;
      }
    }
  }

  // Remove complex effects on low-end devices
  if (devicePerformance.tier === 'low') {
    // Remove blur effects
    if (!config.enableBlur && optimized.filter) {
      delete optimized.filter;
    }

    // Simplify shadows
    if (!config.enableShadows && optimized.boxShadow) {
      optimized.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    }

    // Remove 3D transforms
    if (optimized.rotateX || optimized.rotateY || optimized.rotateZ) {
      delete optimized.rotateX;
      delete optimized.rotateY;
      delete optimized.rotateZ;
    }

    // Simplify scale animations
    if (optimized.scale && typeof optimized.scale === 'number' && optimized.scale > 1.1) {
      optimized.scale = Math.min(optimized.scale, 1.05);
    }
  }

  // Optimize for mobile
  if (devicePerformance.isMobile) {
    // Reduce animation distance
    if (optimized.y && typeof optimized.y === 'number') {
      optimized.y = optimized.y * 0.7;
    }
    if (optimized.x && typeof optimized.x === 'number') {
      optimized.x = optimized.x * 0.7;
    }

    // Reduce scale effects
    if (optimized.scale && typeof optimized.scale === 'number') {
      optimized.scale = 1 + (optimized.scale - 1) * 0.5;
    }
  }

  return optimized;
}

/**
 * Hook for managing animation queue based on performance
 */
export function useAnimationQueue(maxConcurrent?: number) {
  const devicePerformance = useDevicePerformance();
  const config = getPerformanceOptimizedConfig(devicePerformance);
  const limit = maxConcurrent ?? config.maxConcurrentAnimations;

  return {
    canAnimate: () => !animationMonitor.shouldThrottleAnimations(limit),
    activeCount: () => animationMonitor.getActiveAnimationCount(),
    maxConcurrent: limit,
  };
}

/**
 * Hook for responsive animation durations
 */
export function useResponsiveAnimationDuration(baseDuration: number = 0.6) {
  const devicePerformance = useDevicePerformance();
  const { sm: isMobile } = useBreakpoint();
  const config = getPerformanceOptimizedConfig(devicePerformance);

  return useMemo(() => {
    let duration = baseDuration;

    // Apply performance-based adjustment
    duration *= (config.duration / 0.6);

    // Apply mobile adjustment
    if (isMobile) {
      duration *= 0.8;
    }

    return Math.max(0.1, duration); // Minimum duration
  }, [baseDuration, config.duration, isMobile]);
}

/**
 * Hook for conditional complex animations
 */
export function useConditionalAnimation<T extends Variants>(
  complexAnimation: T,
  simpleAnimation: T,
  condition?: boolean
): T {
  const devicePerformance = useDevicePerformance();
  const config = getPerformanceOptimizedConfig(devicePerformance);
  const { prefersReducedMotion } = useAccessibilityPreferences();

  return useMemo(() => {
    if (prefersReducedMotion) {
      return simpleAnimation;
    }

    if (condition !== undefined) {
      return condition ? complexAnimation : simpleAnimation;
    }

    return config.enableComplexAnimations ? complexAnimation : simpleAnimation;
  }, [complexAnimation, simpleAnimation, condition, config.enableComplexAnimations, prefersReducedMotion]);
}

/**
 * Hook for performance-aware stagger animations
 */
export function usePerformanceStagger(itemCount: number, baseDelay: number = 0.1) {
  const devicePerformance = useDevicePerformance();
  const config = getPerformanceOptimizedConfig(devicePerformance);

  return useMemo(() => {
    let staggerDelay = config.staggerDelay;
    
    // Reduce stagger delay for many items on low-end devices
    if (devicePerformance.tier === 'low' && itemCount > 6) {
      staggerDelay *= 0.5;
    }

    // Limit total stagger duration
    const maxTotalDuration = devicePerformance.tier === 'low' ? 1 : 2;
    const totalDuration = staggerDelay * itemCount;
    
    if (totalDuration > maxTotalDuration) {
      staggerDelay = maxTotalDuration / itemCount;
    }

    return Math.max(0.02, staggerDelay); // Minimum stagger delay
  }, [devicePerformance.tier, config.staggerDelay, itemCount]);
}