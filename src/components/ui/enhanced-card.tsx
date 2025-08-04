import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getThemeHoverAnimation } from '@/lib/animation-config';
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences';
import { useLanguage } from '@/contexts/LanguageProvider';

export interface EnhancedCardProps extends HTMLMotionProps<"div"> {
  variant?: 'default' | 'value' | 'expertise' | 'process' | 'contact';
  hoverEffect?: 'none' | 'subtle' | 'enhanced' | 'glow';
  interactive?: boolean;
  focusable?: boolean;
  glowColor?: 'orange' | 'blue' | 'green' | 'purple';
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant = 'default',
    hoverEffect = 'enhanced',
    interactive = true,
    focusable = false,
    glowColor = 'orange',
    children,
    ...props 
  }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();
    const { t } = useLanguage();
    const [focusVisible, setFocusVisible] = React.useState(false);

    // Choose animation variant based on card variant and theme
    const getAnimationVariant = () => {
      if (prefersReducedMotion || hoverEffect === 'none' || !interactive) {
        return {};
      }
      
      switch (variant) {
        case 'value':
          return getThemeHoverAnimation('valueCardHover', theme);
        case 'expertise':
        case 'process':
        case 'contact':
          return getThemeHoverAnimation('cardHover', theme);
        default:
          return getThemeHoverAnimation('cardHover', theme);
      }
    };

    const getGlowColors = () => {
      const isDark = theme === 'dark';
      
      switch (glowColor) {
        case 'blue':
          return {
            primary: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.15)', // blue-400/500
            secondary: isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(59, 130, 246, 0.3)',
            border: isDark ? 'rgba(96, 165, 250, 0.5)' : 'rgba(59, 130, 246, 0.4)',
          };
        case 'green':
          return {
            primary: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(34, 197, 94, 0.15)', // green-400/500
            secondary: isDark ? 'rgba(74, 222, 128, 0.35)' : 'rgba(34, 197, 94, 0.3)',
            border: isDark ? 'rgba(74, 222, 128, 0.5)' : 'rgba(34, 197, 94, 0.4)',
          };
        case 'purple':
          return {
            primary: isDark ? 'rgba(196, 181, 253, 0.2)' : 'rgba(168, 85, 247, 0.15)', // purple-300/500
            secondary: isDark ? 'rgba(196, 181, 253, 0.35)' : 'rgba(168, 85, 247, 0.3)',
            border: isDark ? 'rgba(196, 181, 253, 0.5)' : 'rgba(168, 85, 247, 0.4)',
          };
        default: // orange
          return {
            primary: isDark ? 'rgba(251, 146, 60, 0.2)' : 'rgba(249, 115, 22, 0.15)', // orange-400/500
            secondary: isDark ? 'rgba(251, 146, 60, 0.35)' : 'rgba(249, 115, 22, 0.3)',
            border: isDark ? 'rgba(251, 146, 60, 0.5)' : 'rgba(249, 115, 22, 0.4)',
          };
      }
    };

    const glowColors = getGlowColors();
    const animationVariant = getAnimationVariant();

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      if (focusable) {
        setFocusVisible(true);
      }
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      setFocusVisible(false);
      props.onBlur?.(e);
    };

    // Accessibility attributes
    const getAccessibilityProps = () => {
      const baseProps: Record<string, any> = {};

      if (interactive) {
        baseProps.role = 'button';
        baseProps['aria-label'] = props['aria-label'] || t('interactions.clickToExpand');
        baseProps.title = props.title || t('interactions.hoverForDetails');
      }

      if (focusable) {
        baseProps.tabIndex = 0;
        baseProps['aria-describedby'] = prefersReducedMotion ? t('accessibility.animationsDisabled') : undefined;
      }

      return baseProps;
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm relative overflow-hidden",
          interactive && "cursor-pointer",
          focusable && "focus:outline-none",
          className
        )}
        variants={animationVariant}
        initial="rest"
        whileHover={interactive ? "hover" : "rest"}
        whileTap={interactive ? "tap" : "rest"}
        animate={focusVisible ? "focus" : "rest"}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...getAccessibilityProps()}
        {...props}
      >
        {/* Background Glow Effect */}
        {hoverEffect !== 'none' && interactive && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${glowColors.primary}, transparent, ${glowColors.primary})`
            }}
            initial={{ opacity: 0 }}
            whileHover={{ 
              opacity: 1,
              transition: { duration: 0.3 }
            }}
          />
        )}

        {/* Border Glow */}
        {hoverEffect === 'glow' && interactive && (
          <motion.div
            className="absolute -inset-0.5 rounded-xl opacity-0 pointer-events-none blur-sm"
            style={{
              background: `linear-gradient(135deg, ${glowColors.secondary}, ${glowColors.border})`
            }}
            initial={{ opacity: 0 }}
            whileHover={{ 
              opacity: 1,
              transition: { duration: 0.3 }
            }}
          />
        )}

        {/* Focus Ring */}
        {focusable && (
          <motion.div
            className="absolute -inset-1 rounded-xl border-2 opacity-0 pointer-events-none"
            style={{ borderColor: glowColors.border }}
            animate={focusVisible ? { 
              opacity: 1,
              scale: 1.02,
              transition: { duration: 0.2 }
            } : { 
              opacity: 0,
              scale: 1,
              transition: { duration: 0.2 }
            }}
          />
        )}

        {/* Corner Accent */}
        {variant === 'value' && hoverEffect !== 'none' && interactive && (
          <motion.div
            className="absolute top-0 right-0 w-20 h-20 opacity-0 pointer-events-none rounded-xl"
            style={{
              background: `linear-gradient(to bottom left, ${glowColors.primary}, transparent)`
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ 
              opacity: 1,
              scale: 1.1,
              transition: { duration: 0.3 }
            }}
          />
        )}

        {/* Bottom Accent Line */}
        {(variant === 'expertise' || variant === 'process') && hoverEffect !== 'none' && interactive && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 rounded-full"
            style={{ backgroundColor: glowColors.border }}
            initial={{ width: 0, opacity: 0 }}
            whileHover={{ 
              width: '100%',
              opacity: 1,
              transition: { duration: 0.4, ease: "easeOut" }
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export { EnhancedCard };