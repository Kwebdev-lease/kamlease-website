import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { AnimatedSection } from '@/components/AnimatedSection'
import { BackgroundPattern } from '@/components/BackgroundPattern'

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: mockObserve,
  unobserve: mockUnobserve,
  disconnect: mockDisconnect,
}))

// Mock storage
const mockStorage = new Map<string, string>()

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks()
  mockStorage.clear()

  // Mock IntersectionObserver
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  })

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  })

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockStorage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => mockStorage.set(key, value)),
      removeItem: vi.fn((key: string) => mockStorage.delete(key)),
      clear: vi.fn(() => mockStorage.clear()),
    },
    writable: true,
  })

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
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

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
  global.cancelAnimationFrame = vi.fn()

  // Mock getBoundingClientRect
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }))
})

afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('Animation Integration Tests', () => {
  describe('Component Rendering', () => {
    it('should render AnimatedSection with content', async () => {
      render(
        <TestWrapper>
          <div data-testid="test-container">
            <AnimatedSection animation="fadeInUp">
              <div>Test content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const testContainer = screen.getByTestId('test-container')
      expect(testContainer).toBeInTheDocument()
      expect(screen.getByText('Test content')).toBeInTheDocument()
      
      // Verify IntersectionObserver was called
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('should render BackgroundPattern component', async () => {
      render(
        <TestWrapper>
          <div data-testid="background-container">
            <BackgroundPattern 
              config={{ 
                type: 'gradient', 
                theme: 'light', 
                intensity: 'medium',
                animated: true 
              }} 
            />
          </div>
        </TestWrapper>
      )

      const backgroundContainer = screen.getByTestId('background-container')
      expect(backgroundContainer).toBeInTheDocument()
    })
  })

  describe('Prefers Reduced Motion Behavior', () => {
    it('should handle prefers-reduced-motion setting', async () => {
      // Mock prefers-reduced-motion: reduce
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('prefers-reduced-motion: reduce'),
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
          <div data-testid="reduced-motion-test">
            <AnimatedSection animation="fadeInUp">
              <div>Reduced motion content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('Reduced motion content')).toBeInTheDocument()
      // Component should still render when reduced motion is preferred
      expect(screen.getByTestId('reduced-motion-test')).toBeInTheDocument()
    })

    it('should enable animations when prefers-reduced-motion is not set', async () => {
      render(
        <TestWrapper>
          <div data-testid="normal-motion-test">
            <AnimatedSection animation="fadeInUp">
              <div>Normal motion content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      expect(screen.getByText('Normal motion content')).toBeInTheDocument()
      expect(screen.getByTestId('normal-motion-test')).toBeInTheDocument()
      
      // Verify IntersectionObserver was set up
      expect(mockIntersectionObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalled()
    })
  })

  describe('Theme Consistency', () => {
    it('should render components with light theme', async () => {
      render(
        <TestWrapper>
          <div data-testid="light-theme-test">
            <BackgroundPattern 
              config={{ 
                type: 'gradient', 
                theme: 'light', 
                intensity: 'medium',
                animated: true 
              }} 
            />
            <AnimatedSection animation="fadeInUp">
              <div>Light theme content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const themeTest = screen.getByTestId('light-theme-test')
      expect(themeTest).toBeInTheDocument()
      expect(screen.getByText('Light theme content')).toBeInTheDocument()
    })

    it('should render components with dark theme', async () => {
      render(
        <TestWrapper>
          <div data-testid="dark-theme-test">
            <BackgroundPattern 
              config={{ 
                type: 'gradient', 
                theme: 'dark', 
                intensity: 'medium',
                animated: true 
              }} 
            />
            <AnimatedSection animation="fadeInUp">
              <div>Dark theme content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const themeTest = screen.getByTestId('dark-theme-test')
      expect(themeTest).toBeInTheDocument()
      expect(screen.getByText('Dark theme content')).toBeInTheDocument()
    })
  })

  describe('Responsive Animation Behavior', () => {
    it('should render animations on different viewport sizes', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(
        <TestWrapper>
          <div data-testid="responsive-test">
            <AnimatedSection animation="fadeInUp">
              <div>Responsive content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const responsiveTest = screen.getByTestId('responsive-test')
      expect(responsiveTest).toBeInTheDocument()
      expect(screen.getByText('Responsive content')).toBeInTheDocument()
    })

    it('should handle viewport changes gracefully', async () => {
      render(
        <TestWrapper>
          <div data-testid="viewport-test">
            <AnimatedSection animation="slideInLeft">
              <div>Viewport content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const viewportTest = screen.getByTestId('viewport-test')
      expect(viewportTest).toBeInTheDocument()
      expect(screen.getByText('Viewport content')).toBeInTheDocument()

      // Simulate viewport change
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      // Component should still work after viewport change
      expect(viewportTest).toBeInTheDocument()
    })
  })

  describe('Complex Animation Scenarios', () => {
    it('should handle multiple animated sections simultaneously', async () => {
      render(
        <TestWrapper>
          <div data-testid="multiple-animations">
            <AnimatedSection animation="fadeInUp">
              <div>Section 1</div>
            </AnimatedSection>
            <AnimatedSection animation="slideInLeft">
              <div>Section 2</div>
            </AnimatedSection>
            <AnimatedSection animation="scaleIn">
              <div>Section 3</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const multipleAnimations = screen.getByTestId('multiple-animations')
      expect(multipleAnimations).toBeInTheDocument()
      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Section 2')).toBeInTheDocument()
      expect(screen.getByText('Section 3')).toBeInTheDocument()

      // Multiple IntersectionObserver instances should be created
      expect(mockIntersectionObserver).toHaveBeenCalledTimes(3)
    })

    it('should handle staggered animations', async () => {
      render(
        <TestWrapper>
          <div data-testid="stagger-test">
            <AnimatedSection animation="staggerChildren">
              <div>Child 1</div>
              <div>Child 2</div>
              <div>Child 3</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const staggerTest = screen.getByTestId('stagger-test')
      expect(staggerTest).toBeInTheDocument()
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('should handle animations with background patterns', async () => {
      render(
        <TestWrapper>
          <div data-testid="animation-with-background">
            <BackgroundPattern 
              config={{ 
                type: 'pattern', 
                theme: 'light', 
                intensity: 'subtle',
                animated: true 
              }} 
            />
            <AnimatedSection animation="fadeInUp">
              <div>Content with animated background</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const animationWithBackground = screen.getByTestId('animation-with-background')
      expect(animationWithBackground).toBeInTheDocument()
      expect(screen.getByText('Content with animated background')).toBeInTheDocument()
    })
  })

  describe('Performance and Error Handling', () => {
    it('should handle IntersectionObserver setup', async () => {
      render(
        <TestWrapper>
          <div data-testid="observer-test">
            <AnimatedSection animation="fadeInUp">
              <div>Observer test</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      expect(screen.getByTestId('observer-test')).toBeInTheDocument()
      expect(screen.getByText('Observer test')).toBeInTheDocument()
      
      // Verify IntersectionObserver was called
      expect(mockIntersectionObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalled()
    })

    it('should handle component mounting and unmounting', async () => {
      const { unmount } = render(
        <TestWrapper>
          <div data-testid="mount-test">
            <AnimatedSection animation="fadeInUp">
              <div>Mount test</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      expect(screen.getByTestId('mount-test')).toBeInTheDocument()
      expect(screen.getByText('Mount test')).toBeInTheDocument()

      // Should not cause errors when unmounting
      unmount()
      
      // Verify cleanup was called
      expect(mockDisconnect).toHaveBeenCalled()
    })

    it('should handle different animation types', async () => {
      const animationTypes: Array<'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'staggerChildren'> = [
        'fadeInUp', 'slideInLeft', 'slideInRight', 'scaleIn', 'staggerChildren'
      ]

      for (const animationType of animationTypes) {
        const { unmount } = render(
          <TestWrapper>
            <div data-testid={`animation-${animationType}`}>
              <AnimatedSection animation={animationType}>
                <div>{animationType} content</div>
              </AnimatedSection>
            </div>
          </TestWrapper>
        )

        expect(screen.getByTestId(`animation-${animationType}`)).toBeInTheDocument()
        expect(screen.getByText(`${animationType} content`)).toBeInTheDocument()
        
        unmount()
      }
    })
  })
})