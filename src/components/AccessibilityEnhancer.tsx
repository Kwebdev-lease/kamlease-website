import React, { useEffect, useRef } from 'react'
import { useAccessibility } from '@/lib/accessibility-utils'

/**
 * Accessibility enhancer component that automatically improves accessibility
 * of its children elements
 */
export interface AccessibilityEnhancerProps {
  children: React.ReactNode
  autoEnhance?: boolean
  announceChanges?: boolean
  className?: string
}

export function AccessibilityEnhancer({
  children,
  autoEnhance = true,
  announceChanges = true,
  className = ''
}: AccessibilityEnhancerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { enhanceElement, announce } = useAccessibility()
  const previousContentRef = useRef<string>('')

  useEffect(() => {
    if (!autoEnhance || !containerRef.current) return

    const container = containerRef.current
    
    // Enhance images without alt text
    const images = container.querySelectorAll('img:not([alt])')
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        // Generate alt text based on src or context
        const altText = generateAltText(img)
        img.setAttribute('alt', altText)
      }
    })

    // Enhance buttons without accessible names
    const buttons = container.querySelectorAll('button:not([aria-label])')
    buttons.forEach((button, index) => {
      if (button instanceof HTMLElement && !button.textContent?.trim()) {
        enhanceElement(button, {
          label: `Button ${index + 1}`
        })
      }
    })

    // Enhance links without accessible names
    const links = container.querySelectorAll('a:not([aria-label])')
    links.forEach((link, index) => {
      if (link instanceof HTMLElement && !link.textContent?.trim()) {
        enhanceElement(link, {
          label: `Link ${index + 1}`
        })
      }

      // Add external link indicators
      if (link instanceof HTMLAnchorElement && link.target === '_blank') {
        enhanceElement(link, {
          description: 'Opens in new window'
        })
      }
    })

    // Enhance form inputs without labels
    const inputs = container.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
    inputs.forEach((input) => {
      if (input instanceof HTMLInputElement) {
        const label = generateInputLabel(input)
        enhanceElement(input, { label })
      }
    })

    // Add focus indicators to focusable elements without them
    const focusableElements = container.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    focusableElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        // Add focus enhancement class if not already styled
        if (!hasFocusStyles(element)) {
          element.classList.add('focus-enhanced')
        }
      }
    })

  }, [autoEnhance, enhanceElement])

  // Announce content changes
  useEffect(() => {
    if (!announceChanges || !containerRef.current) return

    const container = containerRef.current
    const currentContent = container.textContent || ''
    
    if (previousContentRef.current && previousContentRef.current !== currentContent) {
      // Announce significant content changes
      const contentDiff = Math.abs(currentContent.length - previousContentRef.current.length)
      if (contentDiff > 50) { // Only announce substantial changes
        announce('Content updated', 'polite')
      }
    }
    
    previousContentRef.current = currentContent
  }, [children, announceChanges, announce])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

/**
 * Generate alt text for images based on src or context
 */
function generateAltText(img: HTMLImageElement): string {
  const src = img.src
  const fileName = src.split('/').pop()?.split('.')[0] || ''
  
  // Try to extract meaningful text from filename
  const cleanFileName = fileName
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .trim()

  // Check if image is likely decorative
  const decorativePatterns = ['decoration', 'bg', 'background', 'spacer', 'divider']
  const isDecorative = decorativePatterns.some(pattern => 
    cleanFileName.includes(pattern) || src.includes(pattern)
  )

  if (isDecorative) {
    img.setAttribute('aria-hidden', 'true')
    return ''
  }

  // Generate descriptive alt text
  if (cleanFileName) {
    return `Image: ${cleanFileName}`
  }

  return 'Image'
}

/**
 * Generate label for form inputs
 */
function generateInputLabel(input: HTMLInputElement): string {
  const type = input.type
  const name = input.name
  const placeholder = input.placeholder
  
  if (placeholder) {
    return placeholder
  }
  
  if (name) {
    return name.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  }
  
  switch (type) {
    case 'email':
      return 'Email address'
    case 'password':
      return 'Password'
    case 'tel':
      return 'Phone number'
    case 'url':
      return 'Website URL'
    case 'search':
      return 'Search'
    case 'number':
      return 'Number'
    case 'date':
      return 'Date'
    case 'time':
      return 'Time'
    default:
      return 'Text input'
  }
}

/**
 * Check if element has focus styles
 */
function hasFocusStyles(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element, ':focus')
  
  return (
    styles.outline !== 'none' && styles.outline !== '0px' ||
    styles.boxShadow !== 'none' ||
    styles.borderWidth !== '0px' ||
    element.classList.contains('focus:') || // Tailwind focus classes
    element.classList.contains('focus-visible:') ||
    element.classList.contains('focus-enhanced')
  )
}

/**
 * Hook for accessibility enhancement
 */
export function useAccessibilityEnhancement() {
  const { enhanceElement, announce } = useAccessibility()

  const enhanceContainer = (container: HTMLElement) => {
    // Auto-enhance all accessibility issues in container
    const enhancer = new AccessibilityEnhancer({
      children: null,
      autoEnhance: true
    })
    
    // Apply enhancements manually
    const images = container.querySelectorAll('img:not([alt])')
    images.forEach((img) => {
      if (img instanceof HTMLImageElement) {
        const altText = generateAltText(img)
        img.setAttribute('alt', altText)
      }
    })
  }

  const announceUpdate = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority)
  }

  return {
    enhanceContainer,
    announceUpdate,
    enhanceElement
  }
}

/**
 * CSS for focus enhancement (to be added to global styles)
 */
export const focusEnhancementStyles = `
.focus-enhanced:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.focus-enhanced:focus:not(:focus-visible) {
  outline: none;
  box-shadow: none;
}

.focus-enhanced:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .focus-enhanced:focus,
  .focus-enhanced:focus-visible {
    outline: 3px solid;
    outline-offset: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .focus-enhanced:focus,
  .focus-enhanced:focus-visible {
    transition: none;
  }
}
`