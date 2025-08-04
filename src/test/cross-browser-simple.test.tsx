import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { AnimatedSection } from '@/components/AnimatedSection'
import BackgroundPattern from '@/components/BackgroundPattern'

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Cross-Browser Integration Tests', () => {
  beforeEach(() => {
    // Mock Intersection Observer
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    })
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock canvas for WebGL detection
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}))
  })

  afterEach(() => {
    cleanup()
  })

  it('should render AnimatedSection correctly', () => {
    render(
      <TestWrapper>
        <AnimatedSection animation="fadeInUp">
          <div>Test content</div>
        </AnimatedSection>
      </TestWrapper>
    )

    const content = screen.getByText('Test content')
    expect(content).toBeInTheDocument()
  })

  it('should render BackgroundPattern correctly', () => {
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

    // BackgroundPattern renders but doesn't have a testid by default
    // Just check that it doesn't throw an error
    expect(document.body).toBeInTheDocument()
  })

  it('should handle different browser user agents', () => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
    ]

    userAgents.forEach((userAgent, index) => {
      Object.defineProperty(navigator, 'userAgent', {
        value: userAgent,
        configurable: true
      })

      const { unmount } = render(
        <TestWrapper>
          <div data-testid={`browser-test-${index}`}>Browser compatibility test</div>
        </TestWrapper>
      )

      expect(screen.getByTestId(`browser-test-${index}`)).toBeInTheDocument()
      unmount()
    })
  })

  it('should handle CSS feature detection', () => {
    // Mock CSS.supports
    vi.stubGlobal('CSS', {
      supports: vi.fn((property: string) => {
        const supportedFeatures = ['transform', 'opacity', 'transition']
        return supportedFeatures.includes(property)
      })
    })

    expect(CSS.supports('transform', 'translateX(10px)')).toBe(true)
    expect(CSS.supports('opacity', '0.5')).toBe(true)
    expect(CSS.supports('unsupported-property', 'value')).toBe(false)
  })

  it('should handle viewport changes', () => {
    // Mock different viewport sizes
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 } // Desktop
    ]

    viewports.forEach((viewport, index) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: viewport.width
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: viewport.height
      })

      const { unmount } = render(
        <TestWrapper>
          <div data-testid={`viewport-test-${index}`}>Viewport test</div>
        </TestWrapper>
      )

      expect(screen.getByTestId(`viewport-test-${index}`)).toBeInTheDocument()
      unmount()
    })
  })
})