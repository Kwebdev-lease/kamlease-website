import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { getThemeHoverAnimation } from '@/lib/animation-config';
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences';
import { useLanguage } from '@/contexts/LanguageProvider';

const enhancedButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'bg-transparent',
        link: 'text-primary underline-offset-4',
        primary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg',
        'primary-outline': 'border-2 border-orange-500 text-orange-500 bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-14 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
      },
      hoverEffect: {
        none: '',
        subtle: '',
        enhanced: '',
        glow: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hoverEffect: 'enhanced',
    },
  }
);

export interface EnhancedButtonProps 
  extends Omit<HTMLMotionProps<"button">, "size">, 
  VariantProps<typeof enhancedButtonVariants> {
  asChild?: boolean;
  ripple?: boolean;
  focusRing?: boolean;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    hoverEffect = 'enhanced',
    asChild = false, 
    ripple = true,
    focusRing = true,
    children,
    disabled,
    ...props 
  }, ref) => {
    const { prefersReducedMotion, theme } = useAccessibilityPreferences();
    const { t } = useLanguage();
    const [isRippling, setIsRippling] = React.useState(false);
    const [focusVisible, setFocusVisible] = React.useState(false);

    // Choose animation variant based on button variant and theme
    const getAnimationVariant = () => {
      if (prefersReducedMotion || hoverEffect === 'none') {
        return {};
      }
      
      switch (variant) {
        case 'primary':
          return getThemeHoverAnimation('primaryButtonHover', theme);
        case 'primary-outline':
        case 'outline':
          return getThemeHoverAnimation('secondaryButtonHover', theme);
        default:
          return getThemeHoverAnimation('buttonHover', theme);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled) {
        setIsRippling(true);
        setTimeout(() => setIsRippling(false), 600);
      }
      props.onClick?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
      setFocusVisible(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
      setFocusVisible(false);
      props.onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (ripple && !disabled) {
          setIsRippling(true);
          setTimeout(() => setIsRippling(false), 600);
        }
      }
      props.onKeyDown?.(e);
    };

    // Accessibility attributes
    const getAccessibilityProps = () => {
      const baseProps = {
        'aria-disabled': disabled,
        title: props.title || (disabled ? undefined : t('interactions.pressEnterToActivate')),
      };

      if (prefersReducedMotion) {
        return {
          ...baseProps,
          'aria-label': props['aria-label'] ? `${props['aria-label']} (${t('accessibility.animationsDisabled')})` : t('accessibility.animationsDisabled'),
        };
      }

      return baseProps;
    };

    const Comp = asChild ? Slot : motion.button;
    const animationVariant = getAnimationVariant();

    return (
      <Comp
        className={cn(enhancedButtonVariants({ variant, size, hoverEffect, className }))}
        ref={ref}
        disabled={disabled}
        variants={animationVariant}
        initial="rest"
        whileHover={disabled ? "rest" : "hover"}
        whileTap={disabled ? "rest" : "tap"}
        animate={focusVisible && focusRing ? "focus" : "rest"}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...getAccessibilityProps()}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <motion.div
            className="absolute inset-0 bg-white/30 rounded-full pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={isRippling ? { 
              scale: 2, 
              opacity: [0.3, 0],
              transition: { duration: 0.6, ease: "easeOut" }
            } : { scale: 0, opacity: 0 }}
          />
        )}

        {/* Enhanced Glow Effect for Primary Buttons - Theme Adaptive */}
        {(variant === 'primary' || variant === 'primary-outline') && hoverEffect !== 'none' && (
          <>
            <motion.div
              className={`absolute -inset-2 rounded-lg blur-xl opacity-0 pointer-events-none ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-orange-300/50 to-orange-500/50' 
                  : 'bg-gradient-to-r from-orange-400/40 to-orange-600/40'
              }`}
              initial={{ opacity: 0 }}
              whileHover={disabled ? {} : { 
                opacity: theme === 'dark' ? 0.8 : 1,
                transition: { duration: 0.3 }
              }}
            />
            <motion.div
              className={`absolute inset-0 rounded-md opacity-0 pointer-events-none ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-orange-300/25 to-orange-500/25'
                  : 'bg-gradient-to-r from-orange-400/20 to-orange-600/20'
              }`}
              initial={{ opacity: 0 }}
              whileHover={disabled ? {} : { 
                opacity: 1,
                transition: { duration: 0.2 }
              }}
            />
          </>
        )}

        {/* Focus Ring - Theme Adaptive */}
        {focusRing && (
          <motion.div
            className={`absolute -inset-1 rounded-lg border-2 opacity-0 pointer-events-none ${
              theme === 'dark' 
                ? 'border-orange-400/60' 
                : 'border-orange-500/50'
            }`}
            animate={focusVisible ? { 
              opacity: 1,
              scale: 1.05,
              transition: { duration: 0.2 }
            } : { 
              opacity: 0,
              scale: 1,
              transition: { duration: 0.2 }
            }}
          />
        )}

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Comp>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton, enhancedButtonVariants };