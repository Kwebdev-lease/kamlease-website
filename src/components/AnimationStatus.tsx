import React from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { useAccessibilityPreferences } from '@/hooks/use-accessibility-preferences';

interface AnimationStatusProps {
  isAnimating?: boolean;
  animationType?: string;
  className?: string;
}

/**
 * AnimationStatus - A component that provides screen reader announcements for animations
 * This component is visually hidden but provides important context for screen reader users
 */
export function AnimationStatus({ 
  isAnimating = false, 
  animationType = 'general',
  className = '' 
}: AnimationStatusProps) {
  const { t } = useLanguage();
  const { prefersReducedMotion } = useAccessibilityPreferences();

  const getStatusMessage = () => {
    if (prefersReducedMotion) {
      return t('accessibility.animationsDisabled');
    }
    
    if (isAnimating) {
      return t('animations.animationInProgress');
    }
    
    return t('animations.animationComplete');
  };

  return (
    <div 
      className={`sr-only ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {getStatusMessage()}
    </div>
  );
}

export default AnimationStatus;