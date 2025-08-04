import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useScrollAnimation } from '../hooks/use-scroll-animation';
import { 
  SCROLL_ANIMATIONS, 
  ANIMATION_CONFIG, 
  PERFORMANCE_CONFIG,
  getPerformanceAwareDuration,
  getPerformanceAwareStagger
} from '../lib/animation-config';
import { useDevicePerformance, animationMonitor } from '../lib/device-performance';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageProvider';
import { useAccessibilityPreferences } from '../hooks/use-accessibility-preferences';

export type AnimationType = 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'staggerChildren';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  disabled?: boolean;
  staggerDelay?: number;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * AnimatedSection - A reusable component for scroll-triggered animations
 * Supports fadeInUp, slideInLeft, slideInRight, scaleIn, and staggerChildren animations
 */
export function AnimatedSection({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration,
  className,
  threshold = 0.1,
  rootMargin = '-10% 0px -10% 0px',
  triggerOnce = true,
  disabled = false,
  staggerDelay,
  as: Component = 'div',
}: AnimatedSectionProps) {
  const { t } = useLanguage();
  const { prefersReducedMotion } = useAccessibilityPreferences();
  const devicePerformance = useDevicePerformance();
  const animationId = React.useId();
  
  const { ref, isInView, hasAnimated } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce,
    disabled: disabled || prefersReducedMotion,
  });

  // Get the base animation variant
  const getAnimationVariant = (): Variants => {
    if (animation === 'staggerChildren') {
      return SCROLL_ANIMATIONS.staggerContainer;
    }
    return SCROLL_ANIMATIONS[animation] || SCROLL_ANIMATIONS.fadeInUp;
  };

  // Create custom transition with provided duration and delay
  const createCustomTransition = () => {
    const baseTransition = ANIMATION_CONFIG.defaultTransition;
    const performanceAwareDuration = getPerformanceAwareDuration(
      devicePerformance,
      duration ?? baseTransition.duration
    );
    const performanceAwareStagger = getPerformanceAwareStagger(devicePerformance);
    
    return {
      ...baseTransition,
      duration: performanceAwareDuration,
      delay: delay,
      ...(animation === 'staggerChildren' && {
        staggerChildren: staggerDelay ?? performanceAwareStagger,
        delayChildren: delay + (performanceAwareStagger * 2),
      }),
    };
  };

  // Get the animation variants with custom transition
  const animationVariants: Variants = React.useMemo(() => {
    const baseVariant = getAnimationVariant();
    const customTransition = createCustomTransition();

    return {
      hidden: baseVariant.hidden,
      visible: {
        ...baseVariant.visible,
        transition: customTransition,
      },
    };
  }, [animation, duration, delay, staggerDelay]);

  // Performance monitoring
  React.useEffect(() => {
    if (isInView && !hasAnimated && !disabled && !prefersReducedMotion) {
      animationMonitor.startAnimation(animationId);
    }
  }, [isInView, hasAnimated, disabled, prefersReducedMotion, animationId]);

  React.useEffect(() => {
    if (hasAnimated) {
      animationMonitor.endAnimation(animationId);
    }
  }, [hasAnimated, animationId]);

  // Determine animation state
  const animationState = disabled || prefersReducedMotion || hasAnimated ? 'visible' : 'hidden';

  // Accessibility attributes
  const accessibilityProps = prefersReducedMotion ? {
    'aria-label': t('accessibility.animationsDisabled'),
  } : isInView && !hasAnimated ? {
    'aria-label': t('animations.animationInProgress'),
    'aria-live': 'polite' as const,
  } : hasAnimated ? {
    'aria-label': t('animations.animationComplete'),
  } : {};

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={animationVariants}
      initial="hidden"
      animate={animationState}
      style={{
        willChange: PERFORMANCE_CONFIG.willChange,
      }}
      as={Component}
      {...accessibilityProps}
    >
      {animation === 'staggerChildren' ? (
        <StaggeredChildren>{children}</StaggeredChildren>
      ) : (
        children
      )}
    </motion.div>
  );
}

/**
 * StaggeredChildren - Wrapper for children that should animate with stagger effect
 */
function StaggeredChildren({ children }: { children: React.ReactNode }) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={SCROLL_ANIMATIONS.staggerChild}
          className="w-full"
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}

/**
 * AnimatedItem - Individual item for use within staggered animations
 * Can be used independently or as part of AnimatedSection with staggerChildren
 */
export function AnimatedItem({
  children,
  className,
  delay = 0,
  duration,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const customVariants: Variants = React.useMemo(() => ({
    hidden: SCROLL_ANIMATIONS.staggerChild.hidden,
    visible: {
      ...SCROLL_ANIMATIONS.staggerChild.visible,
      transition: {
        ...ANIMATION_CONFIG.defaultTransition,
        duration: duration ?? ANIMATION_CONFIG.defaultTransition.duration,
        delay,
      },
    },
  }), [delay, duration]);

  return (
    <motion.div
      className={cn(className)}
      variants={customVariants}
      style={{
        willChange: PERFORMANCE_CONFIG.willChange,
      }}
    >
      {children}
    </motion.div>
  );
}

// Export types for external use
export type { AnimatedSectionProps };