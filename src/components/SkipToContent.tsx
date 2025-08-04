import React from 'react';
import { useLanguage } from '@/contexts/LanguageProvider';
import { cn } from '@/lib/utils';
import { accessibilityManager } from '@/lib/accessibility-utils';

interface SkipToContentProps {
  className?: string;
}

export function SkipToContent({ className }: SkipToContentProps) {
  const { t, language } = useLanguage();

  const handleSkipToTarget = (targetId: string, announcementKey: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      // Make target focusable if it isn't already
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Announce to screen readers
      accessibilityManager.announce(t(announcementKey));
    }
  };

  const handleKeyDown = (targetId: string, announcementKey: string) => (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSkipToTarget(targetId, announcementKey)(e as any);
    }
  };

  const skipLinks = [
    {
      href: '#main-content',
      targetId: 'main-content',
      textKey: 'accessibility.skipToContent',
      announcementKey: 'accessibility.navigatedToContent'
    },
    {
      href: '#main-navigation',
      targetId: 'main-navigation',
      textKey: 'accessibility.skipToNavigation',
      announcementKey: 'accessibility.navigatedToNavigation'
    },
    {
      href: '#footer',
      targetId: 'footer',
      textKey: 'accessibility.skipToFooter',
      announcementKey: 'accessibility.navigatedToFooter'
    }
  ];

  return (
    <nav 
      className={cn("sr-only focus-within:not-sr-only", className)}
      aria-label={t('accessibility.skipLinksLabel')}
    >
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        {skipLinks.map((link) => (
          <a
            key={link.targetId}
            href={link.href}
            onClick={handleSkipToTarget(link.targetId, link.announcementKey)}
            onKeyDown={handleKeyDown(link.targetId, link.announcementKey)}
            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 hover:bg-orange-700 focus:bg-orange-700"
            aria-describedby={`${link.targetId}-description`}
          >
            {t(link.textKey)}
            <span 
              id={`${link.targetId}-description`} 
              className="sr-only"
            >
              {t('accessibility.skipLinkDescription')}
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export default SkipToContent;