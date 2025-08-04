/**
 * Accessibility utilities for SEO and user experience optimization
 */

export interface AccessibilityConfig {
  enableFocusManagement: boolean
  enableAriaLiveRegions: boolean
  enableKeyboardNavigation: boolean
  enableScreenReaderOptimizations: boolean
  enableColorContrastChecking: boolean
}

export interface AccessibilityAuditResult {
  score: number
  issues: AccessibilityIssue[]
  recommendations: string[]
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info'
  element: string
  description: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor'
  wcagLevel: 'A' | 'AA' | 'AAA'
  fix: string
}

/**
 * Accessibility manager for comprehensive a11y support
 */
export class AccessibilityManager {
  private config: AccessibilityConfig
  private liveRegion: HTMLElement | null = null
  private focusHistory: HTMLElement[] = []
  private keyboardTrapStack: HTMLElement[] = []

  constructor(config: Partial<AccessibilityConfig> = {}) {
    this.config = {
      enableFocusManagement: true,
      enableAriaLiveRegions: true,
      enableKeyboardNavigation: true,
      enableScreenReaderOptimizations: true,
      enableColorContrastChecking: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    if (this.config.enableAriaLiveRegions) {
      this.createLiveRegion()
    }

    if (this.config.enableKeyboardNavigation) {
      this.setupKeyboardNavigation()
    }

    if (this.config.enableFocusManagement) {
      this.setupFocusManagement()
    }
  }

  /**
   * Create ARIA live region for dynamic content announcements
   */
  private createLiveRegion() {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.className = 'sr-only'
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    document.body.appendChild(this.liveRegion)
  }

  /**
   * Announce message to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return

    this.liveRegion.setAttribute('aria-live', priority)
    this.liveRegion.textContent = message

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = ''
      }
    }, 1000)
  }

  /**
   * Setup keyboard navigation enhancements
   */
  private setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      // Skip to main content (Alt + M)
      if (event.altKey && event.key === 'm') {
        event.preventDefault()
        this.skipToMain()
      }

      // Focus management for modals (Escape)
      if (event.key === 'Escape') {
        this.handleEscapeKey()
      }

      // Tab trapping in modals
      if (event.key === 'Tab') {
        this.handleTabKey(event)
      }
    })
  }

  /**
   * Setup focus management
   */
  private setupFocusManagement() {
    // Track focus history for better navigation
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement
      if (target && target !== document.body) {
        this.focusHistory.push(target)
        // Keep only last 10 focused elements
        if (this.focusHistory.length > 10) {
          this.focusHistory.shift()
        }
      }
    })
  }

  /**
   * Skip to main content
   */
  skipToMain() {
    const main = document.querySelector('main, [role="main"], #main-content')
    if (main instanceof HTMLElement) {
      main.focus()
      main.scrollIntoView({ behavior: 'smooth', block: 'start' })
      this.announce('Navigated to main content')
    }
  }

  /**
   * Handle escape key for modal dismissal
   */
  private handleEscapeKey() {
    // Close topmost modal or dialog
    const modal = document.querySelector('[role="dialog"]:last-of-type, .modal:last-of-type')
    if (modal) {
      const closeButton = modal.querySelector('[aria-label*="close"], [data-dismiss], .close')
      if (closeButton instanceof HTMLElement) {
        closeButton.click()
      }
    }
  }

  /**
   * Handle tab key for focus trapping
   */
  private handleTabKey(event: KeyboardEvent) {
    const activeModal = this.keyboardTrapStack[this.keyboardTrapStack.length - 1]
    if (!activeModal) return

    const focusableElements = this.getFocusableElements(activeModal)
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element): element is HTMLElement => {
        return element instanceof HTMLElement && 
               this.isVisible(element) && 
               !element.hasAttribute('disabled')
      })
  }

  /**
   * Check if element is visible
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0
  }

  /**
   * Trap focus within an element (for modals)
   */
  trapFocus(element: HTMLElement) {
    this.keyboardTrapStack.push(element)
    
    // Focus first focusable element
    const focusableElements = this.getFocusableElements(element)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }

  /**
   * Release focus trap
   */
  releaseFocusTrap() {
    this.keyboardTrapStack.pop()
    
    // Return focus to previous element
    if (this.focusHistory.length > 0) {
      const previousElement = this.focusHistory[this.focusHistory.length - 2]
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus()
      }
    }
  }

  /**
   * Add ARIA attributes for better screen reader support
   */
  enhanceElement(element: HTMLElement, enhancements: {
    label?: string
    description?: string
    role?: string
    expanded?: boolean
    controls?: string
    describedBy?: string
  }) {
    if (enhancements.label) {
      element.setAttribute('aria-label', enhancements.label)
    }

    if (enhancements.description) {
      const descId = `desc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const descElement = document.createElement('div')
      descElement.id = descId
      descElement.className = 'sr-only'
      descElement.textContent = enhancements.description
      element.parentNode?.insertBefore(descElement, element.nextSibling)
      element.setAttribute('aria-describedby', descId)
    }

    if (enhancements.role) {
      element.setAttribute('role', enhancements.role)
    }

    if (enhancements.expanded !== undefined) {
      element.setAttribute('aria-expanded', enhancements.expanded.toString())
    }

    if (enhancements.controls) {
      element.setAttribute('aria-controls', enhancements.controls)
    }

    if (enhancements.describedBy) {
      element.setAttribute('aria-describedby', enhancements.describedBy)
    }
  }

  /**
   * Perform comprehensive accessibility audit
   */
  auditPage(): AccessibilityAuditResult {
    const issues: AccessibilityIssue[] = []
    let score = 100

    // Check for missing alt text on images
    const images = document.querySelectorAll('img')
    images.forEach((img, index) => {
      if (!img.alt && !img.hasAttribute('aria-hidden')) {
        issues.push({
          type: 'error',
          element: `img[${index}]`,
          description: 'Image missing alt text',
          impact: 'serious',
          wcagLevel: 'A',
          fix: 'Add descriptive alt text or aria-hidden="true" for decorative images'
        })
        score -= 5
      }

      // Check for missing width/height attributes (CLS prevention)
      if (!img.width || !img.height) {
        issues.push({
          type: 'warning',
          element: `img[${index}]`,
          description: 'Image missing width/height attributes',
          impact: 'moderate',
          wcagLevel: 'AA',
          fix: 'Add width and height attributes to prevent layout shift'
        })
        score -= 2
      }
    })

    // Check for heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let previousLevel = 0
    let hasH1 = false
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1))
      
      if (level === 1) {
        if (hasH1) {
          issues.push({
            type: 'warning',
            element: `h1[${index}]`,
            description: 'Multiple H1 elements found',
            impact: 'moderate',
            wcagLevel: 'AA',
            fix: 'Use only one H1 per page for better SEO and accessibility'
          })
          score -= 3
        }
        hasH1 = true
      }
      
      if (level > previousLevel + 1) {
        issues.push({
          type: 'warning',
          element: `${heading.tagName.toLowerCase()}[${index}]`,
          description: 'Heading level skipped',
          impact: 'moderate',
          wcagLevel: 'AA',
          fix: 'Use proper heading hierarchy (h1 → h2 → h3, etc.)'
        })
        score -= 3
      }
      previousLevel = level
    })

    if (!hasH1) {
      issues.push({
        type: 'error',
        element: 'document',
        description: 'No H1 element found',
        impact: 'serious',
        wcagLevel: 'A',
        fix: 'Add an H1 element to define the main page heading'
      })
      score -= 8
    }

    // Check for form labels and accessibility
    const inputs = document.querySelectorAll('input, select, textarea')
    inputs.forEach((input, index) => {
      const hasLabel = input.hasAttribute('aria-label') || 
                      input.hasAttribute('aria-labelledby') ||
                      document.querySelector(`label[for="${input.id}"]`)
      
      if (!hasLabel) {
        issues.push({
          type: 'error',
          element: `${input.tagName.toLowerCase()}[${index}]`,
          description: 'Form control missing label',
          impact: 'critical',
          wcagLevel: 'A',
          fix: 'Add a label element or aria-label attribute'
        })
        score -= 8
      }

      // Check for missing required indicators
      if (input.hasAttribute('required') && !input.hasAttribute('aria-required')) {
        issues.push({
          type: 'warning',
          element: `${input.tagName.toLowerCase()}[${index}]`,
          description: 'Required field missing aria-required attribute',
          impact: 'moderate',
          wcagLevel: 'AA',
          fix: 'Add aria-required="true" to required form fields'
        })
        score -= 2
      }
    })

    // Check for interactive elements without proper roles
    const buttons = document.querySelectorAll('button, [role="button"]')
    buttons.forEach((button, index) => {
      if (!button.hasAttribute('aria-label') && !button.textContent?.trim()) {
        issues.push({
          type: 'error',
          element: `button[${index}]`,
          description: 'Button missing accessible name',
          impact: 'critical',
          wcagLevel: 'A',
          fix: 'Add aria-label or visible text content to button'
        })
        score -= 8
      }
    })

    // Check for links without proper context
    const links = document.querySelectorAll('a')
    links.forEach((link, index) => {
      if (!link.textContent?.trim() && !link.hasAttribute('aria-label')) {
        issues.push({
          type: 'error',
          element: `a[${index}]`,
          description: 'Link missing accessible name',
          impact: 'critical',
          wcagLevel: 'A',
          fix: 'Add descriptive text or aria-label to link'
        })
        score -= 8
      }

      // Check for links that open in new window without warning
      if (link.target === '_blank' && !link.hasAttribute('aria-describedby')) {
        issues.push({
          type: 'warning',
          element: `a[${index}]`,
          description: 'Link opens in new window without warning',
          impact: 'moderate',
          wcagLevel: 'AA',
          fix: 'Add aria-describedby or visual indicator for external links'
        })
        score -= 2
      }
    })

    // Check for missing landmarks
    const landmarks = {
      main: document.querySelector('main, [role="main"]'),
      nav: document.querySelector('nav, [role="navigation"]'),
      header: document.querySelector('header, [role="banner"]'),
      footer: document.querySelector('footer, [role="contentinfo"]')
    }

    Object.entries(landmarks).forEach(([landmark, element]) => {
      if (!element) {
        issues.push({
          type: 'warning',
          element: 'document',
          description: `Missing ${landmark} landmark`,
          impact: 'moderate',
          wcagLevel: 'AA',
          fix: `Add a ${landmark} element or appropriate ARIA role`
        })
        score -= 3
      }
    })

    // Check for missing skip links
    const skipLink = document.querySelector('a[href^="#"]:first-child')
    if (!skipLink) {
      issues.push({
        type: 'warning',
        element: 'document',
        description: 'Missing skip to main content link',
        impact: 'moderate',
        wcagLevel: 'AA',
        fix: 'Add a skip link as the first focusable element'
      })
      score -= 3
    }

    // Check for missing language attribute
    const htmlElement = document.documentElement
    if (!htmlElement.hasAttribute('lang')) {
      issues.push({
        type: 'error',
        element: 'html',
        description: 'Missing language attribute',
        impact: 'serious',
        wcagLevel: 'A',
        fix: 'Add lang attribute to html element'
      })
      score -= 5
    }

    // Check for color contrast (basic check)
    if (this.config.enableColorContrastChecking) {
      this.checkColorContrast(issues)
      score -= issues.filter(i => i.description.includes('contrast')).length * 4
    }

    // Check for focus indicators
    this.checkFocusIndicators(issues)
    score -= issues.filter(i => i.description.includes('focus')).length * 3

    // Check for ARIA attributes usage
    this.checkAriaUsage(issues)
    score -= issues.filter(i => i.description.includes('ARIA')).length * 2

    const recommendations = this.generateRecommendations(issues)

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  /**
   * Check for proper focus indicators
   */
  private checkFocusIndicators(issues: AccessibilityIssue[]): void {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element, ':focus')
      const hasOutline = styles.outline !== 'none' && styles.outline !== '0px'
      const hasBoxShadow = styles.boxShadow !== 'none'
      const hasBorder = styles.borderWidth !== '0px'

      if (!hasOutline && !hasBoxShadow && !hasBorder) {
        issues.push({
          type: 'warning',
          element: `${element.tagName.toLowerCase()}[${index}]`,
          description: 'Focusable element missing focus indicator',
          impact: 'moderate',
          wcagLevel: 'AA',
          fix: 'Add visible focus indicator (outline, box-shadow, or border)'
        })
      }
    })
  }

  /**
   * Check for proper ARIA attributes usage
   */
  private checkAriaUsage(issues: AccessibilityIssue[]): void {
    const elementsWithAria = document.querySelectorAll('[aria-expanded], [aria-controls], [aria-describedby]')

    elementsWithAria.forEach((element, index) => {
      // Check aria-expanded usage
      if (element.hasAttribute('aria-expanded')) {
        const expanded = element.getAttribute('aria-expanded')
        if (expanded !== 'true' && expanded !== 'false') {
          issues.push({
            type: 'error',
            element: `${element.tagName.toLowerCase()}[${index}]`,
            description: 'Invalid aria-expanded value',
            impact: 'serious',
            wcagLevel: 'A',
            fix: 'Use "true" or "false" for aria-expanded attribute'
          })
        }
      }

      // Check aria-controls references
      if (element.hasAttribute('aria-controls')) {
        const controlsId = element.getAttribute('aria-controls')
        if (controlsId && !document.getElementById(controlsId)) {
          issues.push({
            type: 'error',
            element: `${element.tagName.toLowerCase()}[${index}]`,
            description: 'aria-controls references non-existent element',
            impact: 'serious',
            wcagLevel: 'A',
            fix: 'Ensure aria-controls references an existing element ID'
          })
        }
      }

      // Check aria-describedby references
      if (element.hasAttribute('aria-describedby')) {
        const describedById = element.getAttribute('aria-describedby')
        if (describedById && !document.getElementById(describedById)) {
          issues.push({
            type: 'error',
            element: `${element.tagName.toLowerCase()}[${index}]`,
            description: 'aria-describedby references non-existent element',
            impact: 'serious',
            wcagLevel: 'A',
            fix: 'Ensure aria-describedby references an existing element ID'
          })
        }
      }
    })
  }

  /**
   * Basic color contrast checking
   */
  private checkColorContrast(issues: AccessibilityIssue[]) {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button')
    
    textElements.forEach((element, index) => {
      if (element.textContent?.trim()) {
        const styles = window.getComputedStyle(element)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // Simple check - if both are very light or very dark, flag it
        if (this.isLowContrast(color, backgroundColor)) {
          issues.push({
            type: 'warning',
            element: `${element.tagName.toLowerCase()}[${index}]`,
            description: 'Potentially low color contrast',
            impact: 'moderate',
            wcagLevel: 'AA',
            fix: 'Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)'
          })
        }
      }
    })
  }

  /**
   * Simple low contrast detection
   */
  private isLowContrast(color: string, backgroundColor: string): boolean {
    // This is a simplified check - in production, you'd want a proper contrast ratio calculation
    const isLightColor = color.includes('rgb(255') || color.includes('#fff') || color.includes('white')
    const isLightBackground = backgroundColor.includes('rgb(255') || backgroundColor.includes('#fff') || backgroundColor.includes('white')
    
    return isLightColor && isLightBackground
  }

  /**
   * Generate accessibility recommendations
   */
  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = []
    
    if (issues.some(i => i.description.includes('alt text'))) {
      recommendations.push('Add descriptive alt text to all images for screen reader users')
    }
    
    if (issues.some(i => i.description.includes('heading'))) {
      recommendations.push('Use proper heading hierarchy to improve content structure')
    }
    
    if (issues.some(i => i.description.includes('label'))) {
      recommendations.push('Ensure all form controls have associated labels')
    }
    
    if (issues.some(i => i.description.includes('contrast'))) {
      recommendations.push('Review color contrast ratios to meet WCAG guidelines')
    }

    // Add general recommendations
    recommendations.push('Test with keyboard navigation only')
    recommendations.push('Test with screen reader software')
    recommendations.push('Ensure all interactive elements are focusable')

    return recommendations
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.liveRegion) {
      document.body.removeChild(this.liveRegion)
      this.liveRegion = null
    }
    
    this.focusHistory = []
    this.keyboardTrapStack = []
  }
}

// Global accessibility manager instance
export const accessibilityManager = new AccessibilityManager()

/**
 * Hook for accessibility features
 */
export function useAccessibility() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    accessibilityManager.announce(message, priority)
  }

  const trapFocus = (element: HTMLElement) => {
    accessibilityManager.trapFocus(element)
  }

  const releaseFocusTrap = () => {
    accessibilityManager.releaseFocusTrap()
  }

  const enhanceElement = (element: HTMLElement, enhancements: Parameters<typeof accessibilityManager.enhanceElement>[1]) => {
    accessibilityManager.enhanceElement(element, enhancements)
  }

  const auditPage = () => {
    return accessibilityManager.auditPage()
  }

  return {
    announce,
    trapFocus,
    releaseFocusTrap,
    enhanceElement,
    auditPage
  }
}

/**
 * Utility functions for common accessibility patterns
 */
export const a11yUtils = {
  /**
   * Create skip link for keyboard navigation
   */
  createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-blue-600 focus:text-white'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
    
    return skipLink
  },

  /**
   * Add screen reader only text
   */
  addScreenReaderText(element: HTMLElement, text: string) {
    const srText = document.createElement('span')
    srText.className = 'sr-only'
    srText.textContent = text
    element.appendChild(srText)
  },

  /**
   * Make element focusable
   */
  makeFocusable(element: HTMLElement) {
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0')
    }
  },

  /**
   * Remove from tab order
   */
  removeFromTabOrder(element: HTMLElement) {
    element.setAttribute('tabindex', '-1')
  },

  /**
   * Check if element is focusable
   */
  isFocusable(element: HTMLElement): boolean {
    return accessibilityManager.getFocusableElements(element.parentElement || document.body).includes(element)
  }
}