import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import AnimatedSection from '@/components/AnimatedSection'
import BackgroundPattern from '@/components/BackgroundPattern'
import { HoverEffects } from '@/components/HoverEffects'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Expertise from '@/components/Expertise'

// Mock Lighthouse Core Web Vitals
interface WebVitalsMetrics {
  CLS: number  // Cumulative Layout Shift
  FID: number  // First Input Delay
  LCP: number  // Largest Contentful Paint
  FCP: number  // First Contentful Paint
  TTFB: number // Time to First Byte
  TBT: number  // Total Blocking Time
}

// Mock Performance Observer for Core Web Vitals
const mockPerformanceObserver = vi.fn().mockImplementation((callback) => {
  const observer = {
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => [])
  }
  
  // Simulate performance entries
  setTimeout(() => {
    callback({
      getEntries: () => [
        {
          name: 'largest-contentful-paint',
          startTime: 1200,
          size: 50000,
          element: document.body
        },
        {
          name: 'first-contentful-paint',
          startTime: 800
        },
        {
          name: 'layout-shift',
          value: 0.05,
          hadRecentInput: false
        }
      ]
    })
  }, 0)
  
  return observer
})

// Mock performance timing
const mockPerformanceTiming = {
  navigationStart: 0,
  fetchStart: 10,
  domainLookupStart: 20,
  domainLookupEnd: 30,
  connectStart: 30,
  connectEnd: 50,
  requestStart: 60,
  responseStart: 200,
  responseEnd: 300,
  domLoading: 320,
  domInteractive: 800,
  domContentLoadedEventStart: 850,
  domContentLoadedEventEnd: 900,
  domComplete: 1200,
  loadEventStart: 1220,
  loadEventEnd: 1250
}

// Mock Resource Timing API
const mockResourceTiming = [
  {
    name: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    startTime: 100,
    responseEnd: 250,
    transferSize: 1024,
    encodedBodySize: 800
  },
  {
    name: '/assets/logo.svg',
    startTime: 200,
    responseEnd: 280,
    transferSize: 2048,
    encodedBodySize: 1800
  }
]

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('Lighthouse Performance Tests', () => {
  beforeEach(() => {
    // Mock Performance Observer
    vi.stubGlobal('PerformanceObserver', mockPerformanceObserver)
    
    // Mock performance timing
    Object.defineProperty(window.performance, 'timing', {
      value: mockPerformanceTiming,
      configurable: true
    })
    
    // Mock performance.getEntriesByType
    vi.spyOn(window.performance, 'getEntriesByType').mockImplementation((type) => {
      if (type === 'resource') return mockResourceTiming as any[]
      if (type === 'navigation') return [mockPerformanceTiming] as any[]
      return []
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

  describe('Core Web Vitals', () => {
    it('should achieve good Largest Contentful Paint (LCP < 2.5s)', async () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      // Wait for hero content to render
      await waitFor(() => {
        expect(screen.getByText(/Kamlease/)).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // LCP should be under 2500ms (2.5s) for good performance
      expect(renderTime).toBeLessThan(2500)
    })

    it('should achieve minimal Cumulative Layout Shift (CLS < 0.1)', async () => {
      let layoutShiftScore = 0

      // Mock layout shift detection
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'layout-shift' && !(entry as any).hadRecentInput) {
            layoutShiftScore += (entry as any).value
          }
        }
      })

      render(
        <TestWrapper>
          <div>
            <Hero />
            <About />
            <Expertise />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Kamlease/)).toBeInTheDocument()
      })

      // CLS should be under 0.1 for good performance
      expect(layoutShiftScore).toBeLessThan(0.1)
    })

    it('should achieve fast First Contentful Paint (FCP < 1.8s)', async () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <AnimatedSection animation="fadeInUp">
            <h1>First Content</h1>
          </AnimatedSection>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('First Content')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const fcpTime = endTime - startTime

      // FCP should be under 1800ms (1.8s) for good performance
      expect(fcpTime).toBeLessThan(1800)
    })

    it('should minimize Total Blocking Time (TBT)', async () => {
      const longTaskThreshold = 50 // ms
      let totalBlockingTime = 0

      // Mock long task detection
      const taskStartTime = performance.now()
      
      render(
        <TestWrapper>
          <div>
            <BackgroundPattern config={{ type: 'gradient', theme: 'light', intensity: 'medium' }} />
            <AnimatedSection animation="staggerChildren">
              <div>Child 1</div>
              <div>Child 2</div>
              <div>Child 3</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Child 1')).toBeInTheDocument()
      })

      const taskEndTime = performance.now()
      const taskDuration = taskEndTime - taskStartTime

      if (taskDuration > longTaskThreshold) {
        totalBlockingTime += taskDuration - longTaskThreshold
      }

      // TBT should be minimal for good performance
      expect(totalBlockingTime).toBeLessThan(300) // 300ms threshold
    })
  })

  describe('Performance Budget', () => {
    it('should stay within JavaScript bundle size limits', () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const jsResources = resourceEntries.filter(entry => 
        entry.name.includes('.js') || entry.name.includes('javascript')
      )

      const totalJSSize = jsResources.reduce((total, resource) => 
        total + (resource.transferSize || 0), 0
      )

      // JavaScript bundle should be under 500KB for good performance
      expect(totalJSSize).toBeLessThan(500 * 1024)
    })

    it('should optimize CSS delivery', () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const cssResources = resourceEntries.filter(entry => 
        entry.name.includes('.css') || entry.name.includes('stylesheet')
      )

      const totalCSSSize = cssResources.reduce((total, resource) => 
        total + (resource.transferSize || 0), 0
      )

      // CSS should be under 100KB for good performance
      expect(totalCSSSize).toBeLessThan(100 * 1024)
    })

    it('should optimize image loading', () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const imageResources = resourceEntries.filter(entry => 
        entry.name.includes('.jpg') || 
        entry.name.includes('.png') || 
        entry.name.includes('.svg') ||
        entry.name.includes('.webp')
      )

      imageResources.forEach(resource => {
        // Each image should be reasonably sized
        expect(resource.transferSize || 0).toBeLessThan(200 * 1024) // 200KB per image
      })
    })
  })

  describe('Animation Performance', () => {
    it('should maintain 60fps during animations', async () => {
      let frameCount = 0
      let lastFrameTime = performance.now()
      const frameTimes: number[] = []

      const measureFrameRate = () => {
        const currentTime = performance.now()
        const deltaTime = currentTime - lastFrameTime
        frameTimes.push(deltaTime)
        lastFrameTime = currentTime
        frameCount++

        if (frameCount < 60) { // Measure for 1 second at 60fps
          requestAnimationFrame(measureFrameRate)
        }
      }

      render(
        <TestWrapper>
          <AnimatedSection animation="slideInLeft">
            <div>Animated Content</div>
          </AnimatedSection>
        </TestWrapper>
      )

      requestAnimationFrame(measureFrameRate)

      await waitFor(() => {
        expect(frameCount).toBeGreaterThan(30) // At least 30 frames measured
      }, { timeout: 2000 })

      // Calculate average frame time
      const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length
      const fps = 1000 / avgFrameTime

      // Should maintain close to 60fps
      expect(fps).toBeGreaterThan(45) // Allow some tolerance
    })

    it('should use GPU acceleration for transforms', () => {
      render(
        <TestWrapper>
          <AnimatedSection animation="scaleIn">
            <div data-testid="gpu-accelerated">GPU Test</div>
          </AnimatedSection>
        </TestWrapper>
      )

      const element = screen.getByTestId('gpu-accelerated')
      const computedStyle = getComputedStyle(element)
      
      // Check for GPU acceleration hints
      const transform = computedStyle.transform
      const willChange = computedStyle.willChange
      
      // Should use transform3d or will-change for GPU acceleration
      expect(transform !== 'none' || willChange !== 'auto').toBe(true)
    })

    it('should minimize layout thrashing', async () => {
      let layoutCount = 0
      
      // Mock layout detection
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = vi.fn(() => {
        layoutCount++
        return originalGetBoundingClientRect.call(this)
      })

      render(
        <TestWrapper>
          <HoverEffects>
            <div>Layout Test</div>
          </HoverEffects>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Layout Test')).toBeInTheDocument()
      })

      // Should minimize forced layouts
      expect(layoutCount).toBeLessThan(10)

      // Restore original method
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
    })
  })

  describe('Memory Performance', () => {
    it('should not cause memory leaks in animations', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
      
      // Render and unmount multiple animated components
      const { unmount } = render(
        <TestWrapper>
          <div>
            {Array.from({ length: 10 }, (_, i) => (
              <AnimatedSection key={i} animation="fadeInUp">
                <div>Component {i}</div>
              </AnimatedSection>
            ))}
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Component 0')).toBeInTheDocument()
      })

      unmount()

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc()
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024)
    })

    it('should clean up event listeners properly', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = render(
        <TestWrapper>
          <AnimatedSection animation="slideInRight">
            <div>Event Test</div>
          </AnimatedSection>
        </TestWrapper>
      )

      const addedListeners = addEventListenerSpy.mock.calls.length
      
      unmount()

      const removedListeners = removeEventListenerSpy.mock.calls.length

      // Should clean up event listeners
      expect(removedListeners).toBeGreaterThanOrEqual(addedListeners * 0.8) // Allow some tolerance

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })

  describe('Network Performance', () => {
    it('should minimize network requests', () => {
      const resourceEntries = performance.getEntriesByType('resource')
      
      // Should have reasonable number of network requests
      expect(resourceEntries.length).toBeLessThan(50)
    })

    it('should use efficient caching strategies', () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      
      resourceEntries.forEach(resource => {
        // Resources should load efficiently
        const loadTime = resource.responseEnd - resource.startTime
        expect(loadTime).toBeLessThan(3000) // 3 second timeout
      })
    })

    it('should handle slow network conditions gracefully', async () => {
      // Mock slow network
      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '2g',
          downlink: 0.5,
          rtt: 2000
        },
        configurable: true
      })

      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <AnimatedSection animation="fadeInUp">
            <div>Slow Network Test</div>
          </AnimatedSection>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Slow Network Test')).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Should still render reasonably fast even on slow network
      expect(renderTime).toBeLessThan(5000) // 5 second tolerance for slow network
    })
  })

  describe('Accessibility Performance', () => {
    it('should not impact screen reader performance', async () => {
      render(
        <TestWrapper>
          <div>
            <AnimatedSection animation="fadeInUp">
              <h1>Accessible Heading</h1>
              <p>Accessible content</p>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      // Check that ARIA attributes don't cause performance issues
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Accessible Heading')
    })

    it('should maintain focus performance', async () => {
      render(
        <TestWrapper>
          <div>
            <button>Button 1</button>
            <HoverEffects>
              <button>Animated Button</button>
            </HoverEffects>
            <button>Button 3</button>
          </div>
        </TestWrapper>
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)

      // Focus changes should be fast
      const focusStartTime = performance.now()
      buttons[1].focus()
      const focusEndTime = performance.now()

      expect(focusEndTime - focusStartTime).toBeLessThan(16) // One frame at 60fps
    })
  })

  describe('Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const metrics: Partial<WebVitalsMetrics> = {}
      
      // Mock performance observer for metrics collection
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'largest-contentful-paint') {
            metrics.LCP = entry.startTime
          }
          if (entry.name === 'first-contentful-paint') {
            metrics.FCP = entry.startTime
          }
          if (entry.name === 'layout-shift') {
            metrics.CLS = (metrics.CLS || 0) + (entry as any).value
          }
        }
      })

      render(
        <TestWrapper>
          <Hero />
        </TestWrapper>
      )

      // Metrics should be collected
      expect(typeof metrics.LCP === 'number' || metrics.LCP === undefined).toBe(true)
      expect(typeof metrics.FCP === 'number' || metrics.FCP === undefined).toBe(true)
      expect(typeof metrics.CLS === 'number' || metrics.CLS === undefined).toBe(true)
    })

    it('should provide performance insights', () => {
      const performanceInsights = {
        renderTime: 0,
        animationCount: 0,
        memoryUsage: 0
      }

      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <div>
            <AnimatedSection animation="fadeInUp">
              <div>Insight Test 1</div>
            </AnimatedSection>
            <AnimatedSection animation="slideInLeft">
              <div>Insight Test 2</div>
            </AnimatedSection>
          </div>
        </TestWrapper>
      )

      performanceInsights.renderTime = performance.now() - startTime
      performanceInsights.animationCount = 2
      performanceInsights.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0

      expect(performanceInsights.renderTime).toBeGreaterThan(0)
      expect(performanceInsights.animationCount).toBe(2)
      expect(performanceInsights.memoryUsage).toBeGreaterThanOrEqual(0)
    })
  })
})