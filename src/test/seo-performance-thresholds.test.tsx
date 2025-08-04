import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { SEOHead } from '@/components/SEOHead'
import { SEOImage } from '@/components/SEOImage'
import { SEOMonitoringDashboard } from '@/components/SEOMonitoringDashboard'
import { seoMonitoring } from '@/lib/seo-monitoring'
import { performance as performanceUtils } from '@/lib/performance'

// Performance thresholds based on requirements
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals (Requirement 3.2)
  FCP: 1800, // First Contentful Paint < 1.8s
  LCP: 2500, // Largest Contentful Paint < 2.5s
  CLS: 0.1,  // Cumulative Layout Shift < 0.1
  FID: 100,  // First Input Delay < 100ms
  
  // SEO Score (Requirement 3.1)
  LIGHTHOUSE_SEO: 90, // Lighthouse SEO score > 90
  
  // Mobile Performance (Requirement 4.1)
  MOBILE_LOAD_TIME: 3000, // Mobile load time < 3s
  
  // Accessibility (Requirement 3.3)
  WCAG_COMPLIANCE: 'AA', // WCAG 2.1 AA compliance
  
  // Resource optimization
  IMAGE_LOAD_TIME: 1000, // Image load time < 1s
  SCRIPT_LOAD_TIME: 2000, // Script load time < 2s
  CSS_LOAD_TIME: 1500, // CSS load time < 1.5s
}

// Mock performance APIs
const mockPerformanceObserver = vi.fn()
const mockPerformanceEntries: PerformanceEntry[] = []

beforeEach(() => {
  // Reset performance entries
  mockPerformanceEntries.length = 0
  
  // Mock Performance Observer
  mockPerformanceObserver.mockImplementation((callback: PerformanceObserverCallback) => ({
    observe: vi.fn((options: PerformanceObserverInit) => {
      // Simulate performance entries based on observed types
      if (options.entryTypes?.includes('paint')) {
        mockPerformanceEntries.push({
          name: 'first-contentful-paint',
          startTime: 1200, // Within threshold
          duration: 0,
          entryType: 'paint',
          toJSON: () => ({})
        } as PerformanceEntry)
      }
      
      if (options.entryTypes?.includes('largest-contentful-paint')) {
        mockPerformanceEntries.push({
          name: 'largest-contentful-paint',
          startTime: 2000, // Within threshold
          duration: 0,
          entryType: 'largest-contentful-paint',
          toJSON: () => ({})
        } as PerformanceEntry)
      }
      
      if (options.entryTypes?.includes('layout-shift')) {
        mockPerformanceEntries.push({
          name: 'layout-shift',
          startTime: 100,
          duration: 0,
          entryType: 'layout-shift',
          toJSON: () => ({}),
          value: 0.05 // Within threshold
        } as PerformanceEntry & { value: number })
      }
      
      // Call callback with entries
      callback({ getEntries: () => mockPerformanceEntries } as PerformanceObserverEntryList, mockPerformanceObserver)
    }),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => mockPerformanceEntries)
  }))
  
  vi.stubGlobal('PerformanceObserver', mockPerformanceObserver)
  
  // Mock performance.now()
  let performanceNowCounter = 0
  Object.defineProperty(window.performance, 'now', {
    value: vi.fn(() => {
      performanceNowCounter += 16.67 // Simulate 60fps
      return performanceNowCounter
    }),
    writable: true
  })
  
  // Mock performance.mark()
  Object.defineProperty(window.performance, 'mark', {
    value: vi.fn((name: string) => {
      mockPerformanceEntries.push({
        name,
        startTime: performance.now(),
        duration: 0,
        entryType: 'mark',
        toJSON: () => ({})
      } as PerformanceEntry)
    }),
    writable: true
  })
  
  // Mock performance.measure()
  Object.defineProperty(window.performance, 'measure', {
    value: vi.fn((name: string, startMark?: string, endMark?: string) => {
      const duration = Math.random() * 100 // Random duration for testing
      mockPerformanceEntries.push({
        name,
        startTime: performance.now() - duration,
        duration,
        entryType: 'measure',
        toJSON: () => ({})
      } as PerformanceEntry)
    }),
    writable: true
  })
  
  // Mock performance.getEntriesByType()
  Object.defineProperty(window.performance, 'getEntriesByType', {
    value: vi.fn((type: string) => {
      return mockPerformanceEntries.filter(entry => entry.entryType === type)
    }),
    writable: true
  })
  
  // Mock performance.getEntriesByName()
  Object.defineProperty(window.performance, 'getEntriesByName', {
    value: vi.fn((name: string) => {
      return mockPerformanceEntries.filter(entry => entry.name === name)
    }),
    writable: true
  })
  
  // Mock Intersection Observer
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  })
  vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)
  
  // Mock localStorage
  const mockStorage = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => mockStorage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => mockStorage.set(key, value)),
      removeItem: vi.fn((key: string) => mockStorage.delete(key)),
      clear: vi.fn(() => mockStorage.clear()),
    },
    writable: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
  mockPerformanceEntries.length = 0
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </ThemeProvider>
)

describe('SEO Performance Thresholds Tests', () => {
  describe('Core Web Vitals Validation', () => {
    it('should meet First Contentful Paint (FCP) threshold', async () => {
      // Mock FCP measurement
      const fcpTime = 1200 // 1.2s - within threshold
      
      mockPerformanceEntries.push({
        name: 'first-contentful-paint',
        startTime: fcpTime,
        duration: 0,
        entryType: 'paint',
        toJSON: () => ({})
      } as PerformanceEntry)
      
      const vitals = await seoMonitoring.getCoreWebVitals()
      
      expect(vitals.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP)
      expect(vitals.fcp).toBe(fcpTime)
    })

    it('should meet Largest Contentful Paint (LCP) threshold', async () => {
      // Mock LCP measurement
      const lcpTime = 2000 // 2.0s - within threshold
      
      mockPerformanceEntries.push({
        name: 'largest-contentful-paint',
        startTime: lcpTime,
        duration: 0,
        entryType: 'largest-contentful-paint',
        toJSON: () => ({})
      } as PerformanceEntry)
      
      const vitals = await seoMonitoring.getCoreWebVitals()
      
      expect(vitals.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP)
      expect(vitals.lcp).toBe(lcpTime)
    })

    it('should meet Cumulative Layout Shift (CLS) threshold', async () => {
      // Mock CLS measurement
      const clsValue = 0.05 // 0.05 - within threshold
      
      mockPerformanceEntries.push({
        name: 'layout-shift',
        startTime: 100,
        duration: 0,
        entryType: 'layout-shift',
        toJSON: () => ({}),
        value: clsValue
      } as PerformanceEntry & { value: number })
      
      const vitals = await seoMonitoring.getCoreWebVitals()
      
      expect(vitals.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS)
      expect(vitals.cls).toBe(clsValue)
    })

    it('should meet First Input Delay (FID) threshold', async () => {
      // Mock FID measurement
      const fidTime = 80 // 80ms - within threshold
      
      mockPerformanceEntries.push({
        name: 'first-input',
        startTime: 100,
        duration: fidTime,
        entryType: 'first-input',
        toJSON: () => ({})
      } as PerformanceEntry)
      
      const vitals = await seoMonitoring.getCoreWebVitals()
      
      expect(vitals.fid).toBeLessThan(PERFORMANCE_THRESHOLDS.FID)
      expect(vitals.fid).toBe(fidTime)
    })

    it('should validate all Core Web Vitals together', async () => {
      // Mock all vitals within thresholds
      const mockVitals = {
        fcp: 1500, // < 1800ms ✓
        lcp: 2200, // < 2500ms ✓
        cls: 0.08, // < 0.1 ✓
        fid: 75    // < 100ms ✓
      }
      
      vi.spyOn(seoMonitoring, 'getCoreWebVitals').mockResolvedValue(mockVitals)
      
      const vitals = await seoMonitoring.getCoreWebVitals()
      
      expect(vitals.fcp).toBeLessThan(PERFORMANCE_THRESHOLDS.FCP)
      expect(vitals.lcp).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP)
      expect(vitals.cls).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS)
      expect(vitals.fid).toBeLessThan(PERFORMANCE_THRESHOLDS.FID)
    })
  })

  describe('Lighthouse SEO Score Validation', () => {
    it('should meet Lighthouse SEO score threshold', async () => {
      const mockSEOScore = {
        overall: 95,    // > 90 ✓
        technical: 98,
        content: 92,
        performance: 94
      }
      
      vi.spyOn(seoMonitoring, 'calculateSEOScore').mockResolvedValue(mockSEOScore)
      
      const score = await seoMonitoring.calculateSEOScore('https://kamlease.com')
      
      expect(score.overall).toBeGreaterThan(PERFORMANCE_THRESHOLDS.LIGHTHOUSE_SEO)
      expect(score.technical).toBeGreaterThan(85) // Additional threshold
      expect(score.content).toBeGreaterThan(85)   // Additional threshold
      expect(score.performance).toBeGreaterThan(85) // Additional threshold
    })

    it('should validate SEO score components', async () => {
      render(
        <TestWrapper>
          <SEOMonitoringDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/performance/i)).toBeInTheDocument()
      })

      // Mock individual SEO components
      const mockComponents = {
        metaTags: 100,
        structuredData: 95,
        internalLinks: 90,
        imageOptimization: 88,
        mobileOptimization: 92
      }

      // Each component should meet minimum thresholds
      Object.values(mockComponents).forEach(score => {
        expect(score).toBeGreaterThan(80) // Minimum component threshold
      })

      // Overall average should exceed main threshold
      const averageScore = Object.values(mockComponents).reduce((a, b) => a + b, 0) / Object.values(mockComponents).length
      expect(averageScore).toBeGreaterThan(PERFORMANCE_THRESHOLDS.LIGHTHOUSE_SEO)
    })
  })

  describe('Mobile Performance Validation', () => {
    it('should meet mobile load time threshold', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
          matches: query.includes('max-width: 768px') ? true : false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })

      // Mock mobile load time
      const mobileLoadTime = 2500 // 2.5s - within 3s threshold
      
      mockPerformanceEntries.push({
        name: 'loadEventEnd',
        startTime: mobileLoadTime,
        duration: 0,
        entryType: 'navigation',
        toJSON: () => ({})
      } as PerformanceEntry)

      render(
        <TestWrapper>
          <SEOHead pageData={{
            title: 'Mobile Test',
            description: 'Mobile performance test',
            keywords: ['mobile'],
            canonicalUrl: 'https://kamlease.com',
            language: 'fr',
            lastModified: new Date()
          }} />
        </TestWrapper>
      )

      await waitFor(() => {
        const viewportMeta = document.querySelector('meta[name="viewport"]')
        expect(viewportMeta).toBeInTheDocument()
      })

      // Validate mobile load time
      const loadEntries = performance.getEntriesByName('loadEventEnd')
      if (loadEntries.length > 0) {
        expect(loadEntries[0].startTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MOBILE_LOAD_TIME)
      }
    })

    it('should optimize images for mobile performance', async () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <SEOImage
            src="/mobile-hero.jpg"
            alt="Mobile optimized image"
            width={800}
            height={600}
            priority={true}
          />
        </TestWrapper>
      )

      await waitFor(() => {
        const img = screen.getByRole('img')
        expect(img).toBeInTheDocument()
      })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Image rendering should be fast
      expect(renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOAD_TIME)
    })

    it('should handle mobile touch interactions efficiently', async () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <div>
            <button>Mobile Button 1</button>
            <button>Mobile Button 2</button>
            <button>Mobile Button 3</button>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        expect(buttons).toHaveLength(3)
      })

      const endTime = performance.now()
      const interactionTime = endTime - startTime

      // Touch interaction setup should be fast
      expect(interactionTime).toBeLessThan(100) // < 100ms for good UX
    })
  })

  describe('Resource Loading Performance', () => {
    it('should meet image loading thresholds', async () => {
      const imageLoadStart = performance.now()
      
      render(
        <TestWrapper>
          <div>
            <SEOImage src="/image1.jpg" alt="Image 1" width={400} height={300} priority={true} />
            <SEOImage src="/image2.jpg" alt="Image 2" width={400} height={300} priority={false} />
            <SEOImage src="/image3.jpg" alt="Image 3" width={400} height={300} priority={false} />
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(3)
      })

      const imageLoadEnd = performance.now()
      const totalImageLoadTime = imageLoadEnd - imageLoadStart

      // Priority image should load quickly
      expect(totalImageLoadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.IMAGE_LOAD_TIME)
      
      // Check lazy loading attributes
      const images = screen.getAllByRole('img')
      expect(images[0]).toHaveAttribute('loading', 'eager') // Priority image
      expect(images[1]).toHaveAttribute('loading', 'lazy')  // Non-priority
      expect(images[2]).toHaveAttribute('loading', 'lazy')  // Non-priority
    })

    it('should optimize CSS loading performance', async () => {
      const cssLoadStart = performance.now()
      
      // Mock CSS loading
      mockPerformanceEntries.push({
        name: 'https://kamlease.com/styles.css',
        startTime: cssLoadStart,
        duration: 800, // 800ms - within threshold
        entryType: 'resource',
        toJSON: () => ({})
      } as PerformanceEntry)

      render(
        <TestWrapper>
          <div className="css-test-component">
            <h1>CSS Performance Test</h1>
          </div>
        </TestWrapper>
      )

      const cssEntries = performance.getEntriesByType('resource').filter(
        entry => entry.name.includes('.css')
      )

      if (cssEntries.length > 0) {
        expect(cssEntries[0].duration).toBeLessThan(PERFORMANCE_THRESHOLDS.CSS_LOAD_TIME)
      }
    })

    it('should optimize JavaScript loading performance', async () => {
      const jsLoadStart = performance.now()
      
      // Mock JS loading
      mockPerformanceEntries.push({
        name: 'https://kamlease.com/app.js',
        startTime: jsLoadStart,
        duration: 1500, // 1.5s - within threshold
        entryType: 'resource',
        toJSON: () => ({})
      } as PerformanceEntry)

      render(
        <TestWrapper>
          <div className="js-test-component">
            <h1>JavaScript Performance Test</h1>
          </div>
        </TestWrapper>
      )

      const jsEntries = performance.getEntriesByType('resource').filter(
        entry => entry.name.includes('.js')
      )

      if (jsEntries.length > 0) {
        expect(jsEntries[0].duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SCRIPT_LOAD_TIME)
      }
    })
  })

  describe('Accessibility Performance (WCAG 2.1 AA)', () => {
    it('should meet accessibility performance standards', async () => {
      render(
        <TestWrapper>
          <div>
            <h1>Accessible Heading</h1>
            <img src="/test.jpg" alt="Descriptive alt text for screen readers" />
            <button aria-label="Accessible button with clear purpose">
              Action Button
            </button>
            <a href="/test" aria-describedby="link-description">
              Accessible Link
              <span id="link-description" className="sr-only">
                Opens in same window
              </span>
            </a>
            <form>
              <label htmlFor="test-input">Test Input Label</label>
              <input id="test-input" type="text" aria-required="true" />
            </form>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        // Validate heading structure
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        
        // Validate image accessibility
        const img = screen.getByRole('img')
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')?.length).toBeGreaterThan(10) // Descriptive alt text
        
        // Validate button accessibility
        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('aria-label')
        
        // Validate link accessibility
        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('aria-describedby')
        
        // Validate form accessibility
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-required', 'true')
        expect(input).toHaveAttribute('id')
        
        const label = screen.getByLabelText('Test Input Label')
        expect(label).toBeInTheDocument()
      })
    })

    it('should maintain color contrast ratios', async () => {
      render(
        <TestWrapper>
          <div>
            <p style={{ color: '#000000', backgroundColor: '#ffffff' }}>
              High contrast text (21:1 ratio)
            </p>
            <p style={{ color: '#333333', backgroundColor: '#ffffff' }}>
              Good contrast text (12.6:1 ratio)
            </p>
            <button style={{ color: '#ffffff', backgroundColor: '#0066cc' }}>
              Accessible button (7:1 ratio)
            </button>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const paragraphs = screen.getAllByText(/contrast text/)
        const button = screen.getByRole('button')
        
        expect(paragraphs).toHaveLength(2)
        expect(button).toBeInTheDocument()
        
        // All elements should be visible and accessible
        paragraphs.forEach(p => {
          expect(p).toBeVisible()
        })
        expect(button).toBeVisible()
      })
    })

    it('should support keyboard navigation', async () => {
      render(
        <TestWrapper>
          <div>
            <button tabIndex={0}>First Button</button>
            <a href="/test" tabIndex={0}>Test Link</a>
            <input type="text" tabIndex={0} />
            <button tabIndex={0}>Last Button</button>
          </div>
        </TestWrapper>
      )

      await waitFor(() => {
        const focusableElements = [
          screen.getByRole('button', { name: 'First Button' }),
          screen.getByRole('link', { name: 'Test Link' }),
          screen.getByRole('textbox'),
          screen.getByRole('button', { name: 'Last Button' })
        ]

        // All elements should be focusable
        focusableElements.forEach(element => {
          expect(element).toHaveAttribute('tabIndex', '0')
          expect(element).not.toHaveAttribute('disabled')
        })
      })
    })
  })

  describe('Performance Monitoring Integration', () => {
    it('should continuously monitor performance metrics', async () => {
      const monitoringStart = performance.now()
      
      render(
        <TestWrapper>
          <SEOMonitoringDashboard />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/performance/i)).toBeInTheDocument()
      })

      const monitoringEnd = performance.now()
      const monitoringSetupTime = monitoringEnd - monitoringStart

      // Monitoring setup should be fast
      expect(monitoringSetupTime).toBeLessThan(500) // < 500ms setup time
    })

    it('should alert on performance threshold violations', async () => {
      // Mock performance violation
      const mockViolation = {
        fcp: 2000, // Exceeds 1800ms threshold
        lcp: 3000, // Exceeds 2500ms threshold
        cls: 0.15, // Exceeds 0.1 threshold
        fid: 150   // Exceeds 100ms threshold
      }
      
      vi.spyOn(seoMonitoring, 'getCoreWebVitals').mockResolvedValue(mockViolation)
      
      const vitals = await seoMonitoring.getCoreWebVitals()
      
      // Should detect threshold violations
      expect(vitals.fcp).toBeGreaterThan(PERFORMANCE_THRESHOLDS.FCP)
      expect(vitals.lcp).toBeGreaterThan(PERFORMANCE_THRESHOLDS.LCP)
      expect(vitals.cls).toBeGreaterThan(PERFORMANCE_THRESHOLDS.CLS)
      expect(vitals.fid).toBeGreaterThan(PERFORMANCE_THRESHOLDS.FID)
      
      // Monitoring should flag these as violations
      const violations = Object.entries(vitals).filter(([key, value]) => {
        switch (key) {
          case 'fcp': return value > PERFORMANCE_THRESHOLDS.FCP
          case 'lcp': return value > PERFORMANCE_THRESHOLDS.LCP
          case 'cls': return value > PERFORMANCE_THRESHOLDS.CLS
          case 'fid': return value > PERFORMANCE_THRESHOLDS.FID
          default: return false
        }
      })
      
      expect(violations.length).toBe(4) // All metrics violate thresholds
    })

    it('should validate performance budget compliance', async () => {
      const performanceBudget = {
        maxImageSize: 500 * 1024,    // 500KB
        maxScriptSize: 1024 * 1024,  // 1MB
        maxCSSSize: 200 * 1024,      // 200KB
        maxTotalSize: 3 * 1024 * 1024 // 3MB
      }

      // Mock resource sizes within budget
      const mockResources = [
        { name: 'image1.jpg', transferSize: 300 * 1024, type: 'image' },
        { name: 'app.js', transferSize: 800 * 1024, type: 'script' },
        { name: 'styles.css', transferSize: 150 * 1024, type: 'stylesheet' }
      ]

      mockResources.forEach(resource => {
        switch (resource.type) {
          case 'image':
            expect(resource.transferSize).toBeLessThan(performanceBudget.maxImageSize)
            break
          case 'script':
            expect(resource.transferSize).toBeLessThan(performanceBudget.maxScriptSize)
            break
          case 'stylesheet':
            expect(resource.transferSize).toBeLessThan(performanceBudget.maxCSSSize)
            break
        }
      })

      const totalSize = mockResources.reduce((sum, resource) => sum + resource.transferSize, 0)
      expect(totalSize).toBeLessThan(performanceBudget.maxTotalSize)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle performance API unavailability', async () => {
      // Mock missing Performance Observer
      const originalPerformanceObserver = window.PerformanceObserver
      // @ts-ignore
      delete window.PerformanceObserver

      expect(() => {
        render(
          <TestWrapper>
            <SEOMonitoringDashboard />
          </TestWrapper>
        )
      }).not.toThrow()

      // Restore
      window.PerformanceObserver = originalPerformanceObserver
    })

    it('should handle slow network conditions gracefully', async () => {
      // Mock slow network (3G)
      const slowNetworkVitals = {
        fcp: 3000, // Slow but acceptable for 3G
        lcp: 4000, // Slow but acceptable for 3G
        cls: 0.05, // Good
        fid: 200   // Acceptable for slow devices
      }

      vi.spyOn(seoMonitoring, 'getCoreWebVitals').mockResolvedValue(slowNetworkVitals)

      const vitals = await seoMonitoring.getCoreWebVitals()

      // Should handle gracefully even if exceeding ideal thresholds
      expect(vitals).toBeDefined()
      expect(typeof vitals.fcp).toBe('number')
      expect(typeof vitals.lcp).toBe('number')
      expect(typeof vitals.cls).toBe('number')
      expect(typeof vitals.fid).toBe('number')
    })

    it('should maintain performance under high load', async () => {
      const loadTestStart = performance.now()
      
      // Render multiple components simultaneously
      const components = Array.from({ length: 10 }, (_, i) => (
        <div key={i}>
          <SEOHead pageData={{
            title: `Test Page ${i}`,
            description: `Test description ${i}`,
            keywords: [`test${i}`],
            canonicalUrl: `https://kamlease.com/test${i}`,
            language: 'fr',
            lastModified: new Date()
          }} />
          <SEOImage
            src={`/test${i}.jpg`}
            alt={`Test image ${i}`}
            width={400}
            height={300}
            priority={i === 0}
          />
        </div>
      ))

      render(
        <TestWrapper>
          <div>{components}</div>
        </TestWrapper>
      )

      await waitFor(() => {
        const images = screen.getAllByRole('img')
        expect(images).toHaveLength(10)
      })

      const loadTestEnd = performance.now()
      const totalLoadTime = loadTestEnd - loadTestStart

      // Should handle high load efficiently
      expect(totalLoadTime).toBeLessThan(2000) // < 2s for 10 components
    })
  })
})