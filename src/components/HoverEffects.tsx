import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getThemeHoverAnimation } from '@/lib/animation-config';
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences';
import { useLanguage } from '@/contexts/LanguageProvider';

// Enhanced Link Component
interface EnhancedLinkProps extends HTMLMotionProps<"a"> {
  underlineAnimation?: boolean;
  glowOnFocus?: boolean;
}

export const EnhancedLink = React.forwardRef<HTMLAnchorElement, EnhancedLinkProps>(
  ({ className, underlineAnimation = true, glowOnFocus = true, children, ...props }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();
    const { t } = useLanguage();
    const [focusVisible, setFocusVisible] = React.useState(false);

    return (
      <motion.a
        ref={ref}
        className={cn(
          "relative inline-block transition-colors focus:outline-none",
          className
        )}
        variants={prefersReducedMotion ? {} : getThemeHoverAnimation('linkHover', theme)}
        initial="rest"
        whileHover="hover"
        animate={focusVisible && glowOnFocus ? "focus" : "rest"}
        onFocus={() => setFocusVisible(true)}
        onBlur={() => setFocusVisible(false)}
        title={props.title || t('interactions.hoverForDetails')}
        {...props}
      >
        {children}
        
        {/* Animated Underline - Theme Adaptive */}
        {underlineAnimation && (
          <motion.div
            className={`absolute bottom-0 left-0 h-0.5 rounded-full ${
              theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500'
            }`}
            initial={{ width: 0, opacity: 0 }}
            whileHover={{ 
              width: '100%',
              opacity: 1,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            animate={focusVisible ? {
              width: '100%',
              opacity: 1,
              transition: { duration: 0.2 }
            } : {
              width: 0,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
          />
        )}
      </motion.a>
    );
  }
);

EnhancedLink.displayName = 'EnhancedLink';

// Enhanced Icon Container
interface EnhancedIconContainerProps extends HTMLMotionProps<"div"> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'filled' | 'outlined';
  glowColor?: 'orange' | 'blue' | 'green' | 'purple';
}

export const EnhancedIconContainer = React.forwardRef<HTMLDivElement, EnhancedIconContainerProps>(
  ({ 
    className, 
    size = 'md', 
    variant = 'default',
    glowColor = 'orange',
    children, 
    ...props 
  }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();
    const { t } = useLanguage();

    const sizeClasses = {
      sm: 'w-8 h-8 p-1.5',
      md: 'w-12 h-12 p-3',
      lg: 'w-16 h-16 p-4',
      xl: 'w-20 h-20 p-5',
    };

    const variantClasses = {
      default: 'bg-orange-100 dark:bg-orange-900/30',
      filled: 'bg-orange-500 text-white',
      outlined: 'border-2 border-orange-500 bg-transparent',
    };

    // Theme-adaptive glow colors
    const getGlowColors = () => {
      const isDark = theme === 'dark';
      return {
        orange: isDark ? 'rgba(251, 146, 60, 0.4)' : 'rgba(249, 115, 22, 0.3)',
        blue: isDark ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.3)',
        green: isDark ? 'rgba(74, 222, 128, 0.4)' : 'rgba(34, 197, 94, 0.3)',
        purple: isDark ? 'rgba(196, 181, 253, 0.4)' : 'rgba(168, 85, 247, 0.3)',
      };
    };

    const glowColors = getGlowColors();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer transition-colors duration-300",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        variants={prefersReducedMotion ? {} : getThemeHoverAnimation('iconContainerHover', theme)}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        role="button"
        tabIndex={0}
        aria-label={props['aria-label'] || t('interactions.tapToInteract')}
        title={props.title || t('interactions.hoverForDetails')}
        {...props}
      >
        {/* Glow Effect - Theme Adaptive */}
        <motion.div
          className="absolute -inset-2 rounded-lg opacity-0 pointer-events-none blur-lg transition-all duration-300"
          style={{ backgroundColor: glowColors[glowColor] }}
          initial={{ opacity: 0 }}
          whileHover={{ 
            opacity: theme === 'dark' ? 0.8 : 1,
            transition: { duration: 0.3 }
          }}
        />
        
        {/* Icon Content */}
        <motion.div
          variants={prefersReducedMotion ? {} : getThemeHoverAnimation('iconHover', theme)}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          className="relative z-10"
        >
          {children}
        </motion.div>
      </motion.div>
    );
  }
);

EnhancedIconContainer.displayName = 'EnhancedIconContainer';

// Enhanced Input Field
interface EnhancedInputProps extends HTMLMotionProps<"input"> {
  error?: boolean;
  success?: boolean;
}

export const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ className, error = false, success = false, ...props }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();
    const [focusVisible, setFocusVisible] = React.useState(false);

    const getAnimationState = () => {
      if (error) return "error";
      if (focusVisible) return "focus";
      return "rest";
    };

    return (
      <motion.input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && "border-red-500",
          success && "border-green-500",
          className
        )}
        variants={prefersReducedMotion ? {} : getThemeHoverAnimation('inputFocus', theme)}
        initial="rest"
        animate={getAnimationState()}
        onFocus={() => setFocusVisible(true)}
        onBlur={() => setFocusVisible(false)}
        {...props}
      />
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

// Enhanced List Item
interface EnhancedListItemProps extends HTMLMotionProps<"li"> {
  interactive?: boolean;
  accent?: boolean;
}

export const EnhancedListItem = React.forwardRef<HTMLLIElement, EnhancedListItemProps>(
  ({ className, interactive = true, accent = true, children, ...props }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();
    const { t } = useLanguage();

    return (
      <motion.li
        ref={ref}
        className={cn(
          "flex items-start space-x-3 p-3 rounded-lg transition-colors relative",
          interactive && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
          className
        )}
        variants={prefersReducedMotion ? {} : getThemeHoverAnimation('contactItemHover', theme)}
        initial="rest"
        whileHover={interactive ? "hover" : "rest"}
        whileTap={interactive ? "tap" : "rest"}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive && props['aria-label'] ? props['aria-label'] : interactive ? t('interactions.clickToExpand') : undefined}
        {...props}
      >
        {/* Accent Dot - Theme Adaptive */}
        {accent && (
          <motion.div 
            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-colors duration-300 ${
              theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500'
            }`}
            whileHover={interactive && !prefersReducedMotion ? { 
              scale: 1.5,
              transition: { duration: 0.2 }
            } : {}}
          />
        )}
        
        {/* Content */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* Hover Background - Theme Adaptive */}
        {interactive && (
          <motion.div
            className={`absolute inset-0 rounded-lg opacity-0 pointer-events-none transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-orange-900/25 to-transparent' 
                : 'bg-gradient-to-r from-orange-50/30 to-transparent'
            }`}
            initial={{ opacity: 0, x: -20 }}
            whileHover={{ 
              opacity: 1,
              x: 0,
              transition: { duration: 0.3 }
            }}
          />
        )}
      </motion.li>
    );
  }
);

EnhancedListItem.displayName = 'EnhancedListItem';

// Enhanced Text with Hover Effects
interface EnhancedTextProps extends HTMLMotionProps<"p"> {
  highlight?: boolean;
  interactive?: boolean;
}

export const EnhancedText = React.forwardRef<HTMLParagraphElement, EnhancedTextProps>(
  ({ className, highlight = false, interactive = false, children, ...props }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();

    // Theme-adaptive hover color
    const getHoverColor = () => {
      return theme === 'dark' ? "rgba(251, 146, 60, 1)" : "rgba(249, 115, 22, 1)";
    };

    return (
      <motion.p
        ref={ref}
        className={cn(
          "relative transition-colors duration-300",
          interactive && "cursor-pointer",
          className
        )}
        whileHover={interactive && !prefersReducedMotion ? {
          color: getHoverColor(),
          transition: { duration: 0.2 }
        } : {}}
        {...props}
      >
        {children}
        
        {/* Highlight Background - Theme Adaptive */}
        {highlight && interactive && (
          <motion.div
            className={`absolute inset-0 opacity-0 rounded-lg -mx-2 -my-1 pointer-events-none transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-transparent via-orange-400/12 to-transparent'
                : 'bg-gradient-to-r from-transparent via-orange-500/8 to-transparent'
            }`}
            initial={{ opacity: 0 }}
            whileHover={{ 
              opacity: 1,
              transition: { duration: 0.3 }
            }}
          />
        )}
      </motion.p>
    );
  }
);

EnhancedText.displayName = 'EnhancedText';