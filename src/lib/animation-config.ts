import { Variants, Transition } from 'framer-motion';
import { DevicePerformance, getPerformanceOptimizedConfig } from './device-performance';

// Base animation configuration
export const ANIMATION_CONFIG = {
  // Default transition settings
  defaultTransition: {
    type: "tween" as const,
    duration: 0.6,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  },
  
  // Responsive duration adjustments
  responsive: {
    mobile: { duration: 0.4 },
    tablet: { duration: 0.5 },
    desktop: { duration: 0.6 },
  },
  
  // Performance-aware duration adjustments
  performance: {
    high: { duration: 0.6, stagger: 0.1 },
    medium: { duration: 0.5, stagger: 0.08 },
    low: { duration: 0.3, stagger: 0.05 },
  },
  
  // Stagger configuration
  stagger: {
    children: 0.1,
    delayChildren: 0.2,
  },
} as const;

// Common animation variants
export const SCROLL_ANIMATIONS: Record<string, Variants> = {
  // Fade in from bottom
  fadeInUp: {
    hidden: {
      opacity: 0,
      y: 60,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: ANIMATION_CONFIG.defaultTransition,
    },
  },
  
  // Slide in from left
  slideInLeft: {
    hidden: {
      opacity: 0,
      x: -60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: ANIMATION_CONFIG.defaultTransition,
    },
  },
  
  // Slide in from right
  slideInRight: {
    hidden: {
      opacity: 0,
      x: 60,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: ANIMATION_CONFIG.defaultTransition,
    },
  },
  
  // Scale in animation
  scaleIn: {
    hidden: {
      opacity: 0,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: ANIMATION_CONFIG.defaultTransition,
    },
  },
  
  // Container for staggered children
  staggerContainer: {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        ...ANIMATION_CONFIG.defaultTransition,
        staggerChildren: ANIMATION_CONFIG.stagger.children,
        delayChildren: ANIMATION_CONFIG.stagger.delayChildren,
      },
    },
  },
  
  // Child items for stagger animation
  staggerChild: {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: ANIMATION_CONFIG.defaultTransition,
    },
  },
};

// Theme-specific animation configurations
export const THEME_ANIMATION_CONFIG = {
  light: {
    glow: {
      primary: "rgba(249, 115, 22, 0.3)",
      secondary: "rgba(249, 115, 22, 0.2)",
      focus: "rgba(249, 115, 22, 0.25)",
      subtle: "rgba(249, 115, 22, 0.15)",
    },
    shadow: {
      primary: "0 8px 25px 0 rgba(249, 115, 22, 0.3)",
      secondary: "0 4px 14px 0 rgba(249, 115, 22, 0.2)",
      card: "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 30px rgba(249, 115, 22, 0.08)",
      focus: "0 0 0 3px rgba(249, 115, 22, 0.2)",
    },
    border: {
      primary: "rgba(249, 115, 22, 0.4)",
      secondary: "rgba(249, 115, 22, 0.3)",
      subtle: "rgba(249, 115, 22, 0.2)",
    },
    background: {
      hover: "rgba(249, 115, 22, 0.05)",
      active: "rgba(249, 115, 22, 0.1)",
      glow: "rgba(249, 115, 22, 0.08)",
    },
  },
  dark: {
    glow: {
      primary: "rgba(251, 146, 60, 0.4)",
      secondary: "rgba(251, 146, 60, 0.3)",
      focus: "rgba(251, 146, 60, 0.35)",
      subtle: "rgba(251, 146, 60, 0.2)",
    },
    shadow: {
      primary: "0 8px 25px 0 rgba(251, 146, 60, 0.4), 0 0 40px rgba(251, 146, 60, 0.2)",
      secondary: "0 4px 14px 0 rgba(251, 146, 60, 0.3)",
      card: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 40px rgba(251, 146, 60, 0.15)",
      focus: "0 0 0 3px rgba(251, 146, 60, 0.3)",
    },
    border: {
      primary: "rgba(251, 146, 60, 0.5)",
      secondary: "rgba(251, 146, 60, 0.4)",
      subtle: "rgba(251, 146, 60, 0.3)",
    },
    background: {
      hover: "rgba(251, 146, 60, 0.08)",
      active: "rgba(251, 146, 60, 0.12)",
      glow: "rgba(251, 146, 60, 0.1)",
    },
  },
} as const;

// Utility function to get theme-specific animation values
export const getThemeAnimationValues = (theme: 'light' | 'dark') => {
  return THEME_ANIMATION_CONFIG[theme];
};

// Hover animation variants with theme support
export const HOVER_ANIMATIONS: Record<string, Variants> = {
  // Enhanced button hover with multiple states
  buttonHover: {
    rest: {
      scale: 1,
      boxShadow: "0 0 0 rgba(249, 115, 22, 0)",
      y: 0,
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px rgba(249, 115, 22, 0.3)",
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
      y: 0,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.2), 0 0 15px rgba(249, 115, 22, 0.25)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Primary button with enhanced glow - theme-adaptive
  primaryButtonHover: {
    rest: {
      scale: 1,
      boxShadow: "0 4px 14px 0 rgba(249, 115, 22, 0.2)",
      y: 0,
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px 0 rgba(249, 115, 22, 0.4), 0 0 30px rgba(249, 115, 22, 0.3)",
      y: -3,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      scale: 0.98,
      y: -1,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.3), 0 8px 25px 0 rgba(249, 115, 22, 0.4)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Theme-specific primary button variants
  primaryButtonHoverLight: {
    rest: {
      scale: 1,
      boxShadow: "0 4px 14px 0 rgba(249, 115, 22, 0.2)",
      y: 0,
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px 0 rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.2)",
      y: -3,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      scale: 0.98,
      y: -1,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.2), 0 8px 25px 0 rgba(249, 115, 22, 0.3)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  primaryButtonHoverDark: {
    rest: {
      scale: 1,
      boxShadow: "0 4px 14px 0 rgba(251, 146, 60, 0.3)",
      y: 0,
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 8px 25px 0 rgba(251, 146, 60, 0.4), 0 0 40px rgba(251, 146, 60, 0.3)",
      y: -3,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      scale: 0.98,
      y: -1,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      scale: 1.02,
      boxShadow: "0 0 0 3px rgba(251, 146, 60, 0.3), 0 8px 25px 0 rgba(251, 146, 60, 0.4)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Secondary button with subtle effects
  secondaryButtonHover: {
    rest: {
      scale: 1,
      borderColor: "rgba(249, 115, 22, 0.5)",
      backgroundColor: "transparent",
      y: 0,
    },
    hover: {
      scale: 1.03,
      borderColor: "rgba(249, 115, 22, 1)",
      backgroundColor: "rgba(249, 115, 22, 0.05)",
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
      backgroundColor: "rgba(249, 115, 22, 0.1)",
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      scale: 1.01,
      borderColor: "rgba(249, 115, 22, 1)",
      boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.2)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Enhanced card hover with elevation and glow
  cardHover: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderColor: "rgba(229, 231, 235, 1)", // gray-200
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 30px rgba(249, 115, 22, 0.1)",
      borderColor: "rgba(249, 115, 22, 0.3)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      y: -4,
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      y: -4,
      scale: 1.01,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(249, 115, 22, 0.2)",
      borderColor: "rgba(249, 115, 22, 0.5)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Theme-specific card hover variants
  cardHoverLight: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      borderColor: "rgba(229, 231, 235, 1)",
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 30px rgba(249, 115, 22, 0.08)",
      borderColor: "rgba(249, 115, 22, 0.3)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      y: -4,
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      y: -4,
      scale: 1.01,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(249, 115, 22, 0.2)",
      borderColor: "rgba(249, 115, 22, 0.4)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  cardHoverDark: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      borderColor: "rgba(75, 85, 99, 1)", // gray-600
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 40px rgba(251, 146, 60, 0.15)",
      borderColor: "rgba(251, 146, 60, 0.4)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      y: -4,
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
    focus: {
      y: -4,
      scale: 1.01,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(251, 146, 60, 0.3)",
      borderColor: "rgba(251, 146, 60, 0.5)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Value card with enhanced glow
  valueCardHover: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(229, 231, 235, 1)",
    },
    hover: {
      y: -12,
      scale: 1.03,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 40px rgba(249, 115, 22, 0.15)",
      borderColor: "rgba(249, 115, 22, 0.4)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      y: -6,
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
  
  // Theme-specific value card variants
  valueCardHoverLight: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      borderColor: "rgba(229, 231, 235, 1)",
    },
    hover: {
      y: -12,
      scale: 1.03,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 0 40px rgba(249, 115, 22, 0.12)",
      borderColor: "rgba(249, 115, 22, 0.4)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      y: -6,
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
  
  valueCardHoverDark: {
    rest: {
      y: 0,
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
      borderColor: "rgba(75, 85, 99, 1)",
    },
    hover: {
      y: -12,
      scale: 1.03,
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(251, 146, 60, 0.2)",
      borderColor: "rgba(251, 146, 60, 0.5)",
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      y: -6,
      scale: 1.01,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
  
  // Icon hover with enhanced rotation and scale
  iconHover: {
    rest: {
      rotate: 0,
      scale: 1,
    },
    hover: {
      rotate: 8,
      scale: 1.15,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    tap: {
      rotate: 4,
      scale: 1.05,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
  
  // Icon container with glow
  iconContainerHover: {
    rest: {
      scale: 1,
      boxShadow: "0 0 0 rgba(249, 115, 22, 0)",
      backgroundColor: "rgba(249, 115, 22, 0.1)",
    },
    hover: {
      scale: 1.1,
      boxShadow: "0 0 20px rgba(249, 115, 22, 0.3)",
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 1.05,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
  
  // Link hover with underline animation
  linkHover: {
    rest: {
      color: "rgba(107, 114, 128, 1)", // gray-500
    },
    hover: {
      color: "rgba(249, 115, 22, 1)", // orange-500
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    focus: {
      color: "rgba(249, 115, 22, 1)",
      textShadow: "0 0 8px rgba(249, 115, 22, 0.3)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Input field focus states
  inputFocus: {
    rest: {
      borderColor: "rgba(209, 213, 219, 1)", // gray-300
      boxShadow: "0 0 0 rgba(249, 115, 22, 0)",
    },
    focus: {
      borderColor: "rgba(249, 115, 22, 1)",
      boxShadow: "0 0 0 3px rgba(249, 115, 22, 0.1)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    error: {
      borderColor: "rgba(239, 68, 68, 1)", // red-500
      boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  },
  
  // Process step hover
  processStepHover: {
    rest: {
      y: 0,
      scale: 1,
    },
    hover: {
      y: -8,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    tap: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
  
  // Contact info item hover
  contactItemHover: {
    rest: {
      x: 0,
      backgroundColor: "transparent",
    },
    hover: {
      x: 8,
      backgroundColor: "rgba(249, 115, 22, 0.05)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      x: 4,
      transition: {
        duration: 0.1,
        ease: "easeInOut",
      },
    },
  },
};

// Utility function to get responsive duration
export const getResponsiveDuration = (breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop'): number => {
  return ANIMATION_CONFIG.responsive[breakpoint].duration;
};

// Utility function to get performance-aware duration
export const getPerformanceAwareDuration = (
  devicePerformance: DevicePerformance,
  baseDuration?: number
): number => {
  const performanceConfig = getPerformanceOptimizedConfig(devicePerformance);
  return baseDuration ? baseDuration * (performanceConfig.duration / 0.6) : performanceConfig.duration;
};

// Utility function to get performance-aware stagger delay
export const getPerformanceAwareStagger = (devicePerformance: DevicePerformance): number => {
  const performanceConfig = getPerformanceOptimizedConfig(devicePerformance);
  return performanceConfig.staggerDelay;
};

// Utility function to create custom transition
export const createTransition = (
  duration?: number,
  delay?: number,
  ease?: [number, number, number, number]
): Transition => ({
  type: "tween",
  duration: duration ?? ANIMATION_CONFIG.defaultTransition.duration,
  delay: delay ?? 0,
  ease: ease ?? ANIMATION_CONFIG.defaultTransition.ease,
});

// Utility function to create theme-specific animation variants
export const createThemeVariant = (
  baseVariant: Variants,
  theme: 'light' | 'dark'
): Variants => {
  const themeConfig = getThemeAnimationValues(theme);
  
  const adaptVariant = (variant: any): any => {
    if (!variant || typeof variant !== 'object') return variant;
    
    const adapted = { ...variant };
    
    // Replace boxShadow values with theme-specific ones
    if (adapted.boxShadow && typeof adapted.boxShadow === 'string') {
      if (adapted.boxShadow.includes('rgba(249, 115, 22')) {
        // Primary button shadows
        if (adapted.boxShadow.includes('0 8px 25px')) {
          adapted.boxShadow = themeConfig.shadow.primary;
        } else if (adapted.boxShadow.includes('0 4px 14px')) {
          adapted.boxShadow = themeConfig.shadow.secondary;
        } else if (adapted.boxShadow.includes('0 25px 50px')) {
          adapted.boxShadow = themeConfig.shadow.card;
        } else if (adapted.boxShadow.includes('0 0 0 3px')) {
          adapted.boxShadow = themeConfig.shadow.focus;
        }
      }
    }
    
    // Replace borderColor values
    if (adapted.borderColor && typeof adapted.borderColor === 'string') {
      if (adapted.borderColor.includes('rgba(249, 115, 22')) {
        if (adapted.borderColor.includes('0.5')) {
          adapted.borderColor = themeConfig.border.primary;
        } else if (adapted.borderColor.includes('0.4')) {
          adapted.borderColor = themeConfig.border.secondary;
        } else {
          adapted.borderColor = themeConfig.border.subtle;
        }
      }
    }
    
    // Replace backgroundColor values
    if (adapted.backgroundColor && typeof adapted.backgroundColor === 'string') {
      if (adapted.backgroundColor.includes('rgba(249, 115, 22')) {
        if (adapted.backgroundColor.includes('0.1')) {
          adapted.backgroundColor = themeConfig.background.active;
        } else if (adapted.backgroundColor.includes('0.05')) {
          adapted.backgroundColor = themeConfig.background.hover;
        }
      }
    }
    
    return adapted;
  };
  
  const result: Variants = {};
  for (const [key, value] of Object.entries(baseVariant)) {
    result[key] = adaptVariant(value);
  }
  
  return result;
};

// Utility function to get theme-specific hover animation
export const getThemeHoverAnimation = (
  animationType: keyof typeof HOVER_ANIMATIONS,
  theme: 'light' | 'dark'
): Variants => {
  const themeSpecificKey = `${animationType}${theme.charAt(0).toUpperCase() + theme.slice(1)}` as keyof typeof HOVER_ANIMATIONS;
  
  // Return theme-specific variant if it exists, otherwise create one
  if (HOVER_ANIMATIONS[themeSpecificKey]) {
    return HOVER_ANIMATIONS[themeSpecificKey];
  }
  
  // Create theme-specific variant from base
  const baseVariant = HOVER_ANIMATIONS[animationType];
  if (baseVariant) {
    return createThemeVariant(baseVariant, theme);
  }
  
  return baseVariant || {};
};

// Performance optimization settings
export const PERFORMANCE_CONFIG = {
  // Use will-change for better performance
  willChange: "transform, opacity",
  
  // Reduce motion for accessibility
  reducedMotionConfig: {
    duration: 0.01,
    ease: "linear" as const,
  },
  
  // Intersection Observer options for scroll animations
  intersectionOptions: {
    threshold: 0.1,
    rootMargin: "-10% 0px -10% 0px",
  },
} as const;