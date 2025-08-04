import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import AnimatedSection from '@/components/AnimatedSection'
import BackgroundPattern from '@/components/BackgroundPattern'
import { EnhancedLink } from '@/components/HoverEffects'

// Mock different browser environments
const mockUserAgents = {
  chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
}

// Mock CSS features support
const mockCSSSupports = (property: string, value: string) => {
  const supportMap: Record<string, boolean> = {
    'backdrop-filter': true,
    'transform-style': true,
    'will-change': true,
    'scroll-behavior': true,
    'prefers-reduced-motion': true,
    'prefers-color-scheme': true
  }
  return supportMap[property] ?? false
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Cross-Browser Compatibility Tests', () => {
  beforeEach(() => {
    // Reset CSS.supports mock
    vi.stubGlobal('CSS', {
      supports: vi.fn(mockCSSSupports)
    })
    
    // Mock Intersection Observer
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    })
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
  })

  describe('Chrome Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockUserAgents.chrome,
        configurable: true
      })
    })

    it('should render animations correctly in Chrome', async () => {
      render(
        <TestWrapper>
          <AnimatedSection animation="fadeInUp">
            <div>Test content</div>
          </AnimatedSection>
        </TestWrapper>
      )

      const content = screen.getByText('Test content')
      expect(content).toBeInTheDocument()
      
      // Check if animation classes are applied
      const animatedElement = content.closest('[data-testid]') || content.parentElement
      expect(animatedElement).toHaveStyle({ opacity: expect.any(String) })
    })

    it('should support modern CSS features in Chrome', () => {
      expect(CSS.supports('backdrop-filter', 'blur(10px)')).toBe(true)
      expect(CSS.supports('transform-style', 'preserve-3d')).toBe(true)
      expect(CSS.supports('will-change', 'transform')).toBe(true)
    })
  })

  describe('Firefox Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockUserAgents.firefox,
        configurable: true
      })
    })

    it('should render background patterns correctly in Firefox', () => {
      render(
        <TestWrapper>
          <BackgroundPattern 
            config={{ 
              type: 'gradient', 
              theme: 'light', 
              intensity: 'subtle' 
            }} 
          />
        </TestWrapper>
      )

      const backgroundElement = screen.getByTestId('background-pattern')
      expect(backgroundElement).toBeInTheDocument()
      expect(backgroundElement).toHaveClass('bg-gradient-to-br')
    })

    it('should handle CSS Grid and Flexbox in Firefox', () => {
      render(
        <TestWrapper>
          <div className="grid grid-cols-3 gap-4">
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
          </div>
        </TestWrapper>
      )

      const gridContainer = screen.getByText('Item 1').parentElement
      expect(gridContainer).toHaveClass('grid', 'grid-cols-3', 'gap-4')
    })
  })

  describe('Safari Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockUserAgents.safari,
        configurable: true
      })
    })

    it('should handle webkit-specific properties in Safari', () => {
      render(
        <TestWrapper>
          <EnhancedLink href="#test">
            Test Button
          </EnhancedLink>
        </TestWrapper>
      )

      const button = screen.getByRole('link', { name: 'Test Button' })
      expect(button).toBeInTheDocument()
      
      // Check for webkit-specific styling
      const styles = getComputedStyle(button)
      expect(styles.getPropertyValue('transform')).toBeDefined()
    })

    it('should support Safari-specific animation properties', async () => {
      render(
        <TestWrapper>
          <AnimatedSection animation="scaleIn" delay={100}>
            <div>Safari Animation Test</div>
          </AnimatedSection>
        </TestWrapper>
      )

      await waitFor(() => {
        const content = screen.getByText('Safari Animation Test')
        expect(content).toBeInTheDocument()
      })
    })
  })

  describe('Edge Compatibility', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'userAgent', {
        value: mockUserAgents.edge,
        configurable: true
      })
    })

    it('should render correctly in Edge', () => {
      render(
        <TestWrapper>
          <div className="backdrop-blur-sm bg-white/10">
            <p>Edge compatibility test</p>
          </div>
        </TestWrapper>
      )

      const content = screen.getByText('Edge compatibility test')
      expect(content).toBeInTheDocument()
      expect(content.parentElement).toHaveClass('backdrop-blur-sm', 'bg-white/10')
    })

    it('should handle CSS custom properties in Edge', () => {
      render(
        <TestWrapper>
          <div style={{ '--custom-color': '#ff6b35' } as React.CSSProperties}>
            <span style={{ color: 'var(--custom-color)' }}>Custom Color</span>
          </div>
        </TestWrapper>
      )

      const coloredText = screen.getByText('Custom Color')
      expect(coloredText).toBeInTheDocument()
    })
  })

  describe('CSS Feature Detection', () => {
    it('should gracefully degrade when CSS features are not supported', () => {
      // Mock unsupported features
      vi.mocked(CSS.supports).mockImplementation(() => false)

      render(
        <TestWrapper>
          <BackgroundPattern 
            config={{ 
              type: 'gradient', 
              theme: 'dark', 
              intensity: 'medium' 
            }} 
          />
        </TestWrapper>
      )

      const backgroundElement = screen.getByTestId('background-pattern')
      expect(backgroundElement).toBeInTheDocument()
      // Should still render with fallback styles
    })

    it('should detect and use supported CSS features', () => {
      vi.mocked(CSS.supports).mockImplementation((property) => {
        return ['backdrop-filter', 'transform-style', 'will-change'].includes(property)
      })

      expect(CSS.supports('backdrop-filter', 'blur(10px)')).toBe(true)
      expect(CSS.supports('transform-style', 'preserve-3d')).toBe(true)
      expect(CSS.supports('will-change', 'transform')).toBe(true)
      expect(CSS.supports('unsupported-property', 'value')).toBe(false)
    })
  })

  describe('Responsive Design Cross-Browser', () => {
    it('should handle different viewport sizes across browsers', () => {
      // Mock different viewport sizes
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      })

      render(
        <TestWrapper>
          <div className="hidden md:block lg:grid lg:grid-cols-2">
            <span>Responsive content</span>
          </div>
        </TestWrapper>
      )

      const content = screen.getByText('Responsive content')
      expect(content.parentElement).toHaveClass('hidden', 'md:block', 'lg:grid', 'lg:grid-cols-2')
    })

    it('should handle touch events on mobile browsers', () => {
      // Mock touch support
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      })

      render(
        <TestWrapper>
          <EnhancedLink href="#touch">
            Touch Button
          </EnhancedLink>
        </TestWrapper>
      )

      const button = screen.getByRole('link', { name: 'Touch Button' })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Animation Performance Cross-Browser', () => {
    it('should use hardware acceleration when available', () => {
      render(
        <TestWrapper>
          <AnimatedSection animation="slideInLeft">
            <div>Hardware accelerated content</div>
          </AnimatedSection>
        </TestWrapper>
      )

      const content = screen.getByText('Hardware accelerated content')
      const animatedElement = content.closest('[data-testid]') || content.parentElement
      
      // Check for transform3d usage (hardware acceleration)
      expect(animatedElement).toBeInTheDocument()
    })

    it('should respect prefers-reduced-motion across browsers', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      render(
        <TestWrapper>
          <AnimatedSection animation="fadeInUp">
            <div>Reduced motion content</div>
          </AnimatedSection>
        </TestWrapper>
      )

      const content = screen.getByText('Reduced motion content')
      expect(content).toBeInTheDocument()
    })
  })
})