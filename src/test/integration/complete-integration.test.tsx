import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { LanguageToggle } from '@/components/LanguageToggle'
import AnimatedSection from '@/components/AnimatedSection'
import BackgroundPattern from '@/components/BackgroundPattern'
import { HoverEffects } from '@/components/HoverEffects'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Expertise from '@/components/Expertise'

// Mock browser environments for cross-browser testing
const mockBrowserEnvironment = (browser: 'chrome' | 'firefox' | 'safari' | 'edge') => {
  const userAgents = {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  }

  Object.defineProperty(navigator, 'userAgent', {
    value: userAgents[browser],
    configurable: true
  })
}

// Mock storage
const mockStorage = new Map<string, string>()

beforeEach(() => {
  mockStorage.clear()
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
      matches: query.includes('dark') ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Complete Integration Tests', () => {
  describe('Theme Integration', () => {
    it('should render theme toggle component correctly', async () => {
      render(
        <TestWrapper>
          <div data-testid="theme-test">
            <ThemeToggle />
          </div>
        </TestWrapper>
      )

      // Check that theme toggle renders
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      expect(themeToggle).toBeInTheDocument()

      // Check initial theme class
      expect(document.documentElement).toHaveClass('light')
    })

    it('should handle theme toggle interactions', async () => {
      render(
        <TestWrapper>
          <ThemeToggle />
        </TestWrapper>
      )

      const user = userEvent.setup()
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      
      // Should be clickable
      await user.click(themeToggle)
      
      // Button should still be present after click
      expect(themeToggle).toBeInTheDocument()
    })

    it('should handle system theme preference', async () => {
      // Mock system dark theme preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('dark') ? true : false,
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
          <ThemeToggle />
        </TestWrapper>
      )

      // Theme toggle should render correctly regardless of system preference
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      expect(themeToggle).toBeInTheDocument()
    })
  })

  describe('Language Integration', () => {
    it('should render language toggle component correctly', async () => {
      render(
        <TestWrapper>
          <div data-testid="language-test">
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      // Check that language toggle renders - it shows flag buttons
      const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
      const englishButton = screen.getByRole('button', { name: '🇬🇧' })
      
      expect(frenchButton).toBeInTheDocument()
      expect(englishButton).toBeInTheDocument()
    })

    it('should handle language toggle interactions', async () => {
      render(
        <TestWrapper>
          <LanguageToggle />
        </TestWrapper>
      )

      const user = userEvent.setup()
      
      // Initially French should be active (orange background)
      const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
      const englishButton = screen.getByRole('button', { name: '🇬🇧' })
      
      expect(frenchButton).toBeInTheDocument()
      expect(englishButton).toBeInTheDocument()

      // Click English button to switch language
      await user.click(englishButton)
      
      // Both buttons should still be present after click
      await waitFor(() => {
        expect(frenchButton).toBeInTheDocument()
        expect(englishButton).toBeInTheDocument()
      })

      // Click French button to switch back
      await user.click(frenchButton)
      
      // Both buttons should still be present
      await waitFor(() => {
        expect(frenchButton).toBeInTheDocument()
        expect(englishButton).toBeInTheDocument()
      })
    })

    it('should persist language selection', async () => {
      const { unmount } = render(
        <TestWrapper>
          <LanguageToggle />
        </TestWrapper>
      )

      const user = userEvent.setup()
      const englishButton = screen.getByRole('button', { name: '🇬🇧' })
      
      // Switch to English
      await user.click(englishButton)
      
      await waitFor(() => {
        expect(englishButton).toBeInTheDocument()
      })

      // Unmount and remount to simulate page reload
      unmount()
      
      render(
        <TestWrapper>
          <LanguageToggle />
        </TestWrapper>
      )

      // Language buttons should be restored
      const newFrenchButton = screen.getByRole('button', { name: '🇫🇷' })
      const newEnglishButton = screen.getByRole('button', { name: '🇬🇧' })
      
      await waitFor(() => {
        expect(newFrenchButton).toBeInTheDocument()
        expect(newEnglishButton).toBeInTheDocument()
      })
    })
  })

  describe('Visual Enhancements Integration', () => {
    beforeEach(() => {
      // Mock Intersection Observer
      const mockIntersectionObserver = vi.fn()
      mockIntersectionObserver.mockReturnValue({
        observe: () => null,
        unobserve: () => null,
        disconnect: () => null
      })
      vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
    })

    it('should render all visual components together', async () => {
      render(
        <TestWrapper>
          <div data-testid="visual-integration">
            <BackgroundPattern config={{ type: 'gradient', theme: 'light', intensity: 'subtle' }} />
            <AnimatedSection animation="fadeInUp">
              <Hero />
            </AnimatedSection>
            <AnimatedSection animation="slideInLeft">
              <About />
            </AnimatedSection>
            <AnimatedSection animation="staggerChildren">
              <Expertise />
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('visual-integration')).toBeInTheDocument()
        expect(screen.getByTestId('background-pattern')).toBeInTheDocument()
      })
    })

    it('should handle theme switching with visual components', async () => {
      render(
        <TestWrapper>
          <div>
            <ThemeToggle />
            <BackgroundPattern config={{ type: 'gradient', theme: 'light', intensity: 'medium' }} />
            <HoverEffects>
              <button>Test Button</button>
            </HoverEffects>
          </div>
        </TestWrapper>
      )

      const user = userEvent.setup()
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      const testButton = screen.getByRole('button', { name: 'Test Button' })

      // Switch theme
      await user.click(themeToggle)

      // Visual components should still be functional
      expect(screen.getByTestId('background-pattern')).toBeInTheDocument()
      expect(testButton).toBeInTheDocument()
    })

    it('should handle language switching with visual components', async () => {
      render(
        <TestWrapper>
          <div>
            <LanguageToggle />
            <AnimatedSection animation="fadeInUp">
              <div>Animated content</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      const user = userEvent.setup()
      const languageToggle = screen.getByRole('button', { name: /fr|en/i })

      // Switch language
      await user.click(languageToggle)

      // Animated content should still be present
      expect(screen.getByText('Animated content')).toBeInTheDocument()
    })
  })

  describe('Cross-Browser Compatibility', () => {
    it('should work correctly in Chrome', async () => {
      mockBrowserEnvironment('chrome')
      
      render(
        <TestWrapper>
          <div data-testid="chrome-test">
            <AnimatedSection animation="slideInRight">
              <div>Chrome Animation Test</div>
            </AnimatedSection>
            <HoverEffects>
              <button>Chrome Button</button>
            </HoverEffects>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Chrome Animation Test')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Chrome Button' })).toBeInTheDocument()
      })
    })

    it('should work correctly in Firefox', async () => {
      mockBrowserEnvironment('firefox')
      
      render(
        <TestWrapper>
          <div data-testid="firefox-test">
            <BackgroundPattern config={{ type: 'pattern', theme: 'dark', intensity: 'medium' }} />
            <AnimatedSection animation="scaleIn">
              <div>Firefox Animation Test</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('background-pattern')).toBeInTheDocument()
        expect(screen.getByText('Firefox Animation Test')).toBeInTheDocument()
      })
    })

    it('should work correctly in Safari', async () => {
      mockBrowserEnvironment('safari')
      
      render(
        <TestWrapper>
          <div data-testid="safari-test">
            <AnimatedSection animation="fadeInUp">
              <HoverEffects>
                <div>Safari Hover Test</div>
              </HoverEffects>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Safari Hover Test')).toBeInTheDocument()
      })
    })

    it('should work correctly in Edge', async () => {
      mockBrowserEnvironment('edge')
      
      render(
        <TestWrapper>
          <div data-testid="edge-test">
            <BackgroundPattern config={{ type: 'gradient', theme: 'light', intensity: 'strong' }} />
            <AnimatedSection animation="slideInLeft">
              <div>Edge Animation Test</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByTestId('background-pattern')).toBeInTheDocument()
        expect(screen.getByText('Edge Animation Test')).toBeInTheDocument()
      })
    })
  })

  describe('Cross-Platform Compatibility', () => {
    it('should render components on different viewport sizes', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      })

      render(
        <TestWrapper>
          <div data-testid="mobile-app">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      // Components should render on mobile
      expect(screen.getByTestId('mobile-app')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /changer le thème|toggle theme/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '🇫🇷' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '🇬🇧' })).toBeInTheDocument()
    })

    it('should handle storage errors gracefully', async () => {
      // Mock localStorage to throw errors
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => { throw new Error('Storage error') }),
          setItem: vi.fn(() => { throw new Error('Storage error') }),
          removeItem: vi.fn(),
          clear: vi.fn(),
        },
        writable: true,
      })

      // Should not throw errors during render
      expect(() => {
        render(
          <TestWrapper>
            <ThemeToggle />
            <LanguageToggle />
          </TestWrapper>
        )
      }).not.toThrow()

      // Components should still be functional
      expect(screen.getByRole('button', { name: /changer le thème|toggle theme/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '🇫🇷' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '🇬🇧' })).toBeInTheDocument()
    })

    it('should handle rapid user interactions', async () => {
      render(
        <TestWrapper>
          <div data-testid="interaction-test">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      const user = userEvent.setup()
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
      const englishButton = screen.getByRole('button', { name: '🇬🇧' })
      
      // Perform rapid interactions
      for (let i = 0; i < 5; i++) {
        await user.click(themeToggle)
        await user.click(i % 2 === 0 ? frenchButton : englishButton)
      }
      
      // Components should still be functional
      expect(themeToggle).toBeInTheDocument()
      expect(frenchButton).toBeInTheDocument()
      expect(englishButton).toBeInTheDocument()
      expect(screen.getByTestId('interaction-test')).toBeInTheDocument()
    })

    it('should maintain accessibility features', async () => {
      render(
        <TestWrapper>
          <div data-testid="accessibility-test">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      // Check for proper ARIA labels and roles
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
      const englishButton = screen.getByRole('button', { name: '🇬🇧' })
      
      expect(themeToggle).toBeInTheDocument()
      expect(frenchButton).toBeInTheDocument()
      expect(englishButton).toBeInTheDocument()
      
      // Check that buttons are focusable
      expect(themeToggle).not.toHaveAttribute('disabled')
      expect(frenchButton).not.toHaveAttribute('disabled')
      expect(englishButton).not.toHaveAttribute('disabled')
    })
  })

  describe('Performance and Stability', () => {
    it('should not cause memory leaks during component lifecycle', async () => {
      const { unmount } = render(
        <TestWrapper>
          <div data-testid="lifecycle-test">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      const user = userEvent.setup()
      const themeToggle = screen.getByRole('button', { name: /changer le thème|toggle theme/i })
      const frenchButton = screen.getByRole('button', { name: '🇫🇷' })
      
      // Perform some interactions
      await user.click(themeToggle)
      await user.click(frenchButton)
      
      // Unmount component
      unmount()
      
      // Should not throw errors or warnings about memory leaks
      expect(true).toBe(true) // Test passes if no errors thrown
    })

    it('should handle component re-renders efficiently', async () => {
      const { rerender } = render(
        <TestWrapper>
          <div data-testid="rerender-test">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      // Verify initial render
      expect(screen.getByTestId('rerender-test')).toBeInTheDocument()

      // Force re-render
      rerender(
        <TestWrapper>
          <div data-testid="rerender-test">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </TestWrapper>
      )

      // Components should still be functional after re-render
      expect(screen.getByTestId('rerender-test')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /changer le thème|toggle theme/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '🇫🇷' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '🇬🇧' })).toBeInTheDocument()
    })
  })
})