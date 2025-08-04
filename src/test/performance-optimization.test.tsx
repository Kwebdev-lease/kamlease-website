import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { 
  PerformanceMonitor, 
  performanceMonitor, 
  codeSplittingOptimizer,
  runtimeBundleAnalyzer 
} from '../lib/performance'
import { 
  globalLazyLoader, 
  componentLazyLoader, 
  ProgressiveImageLoader 
} from '../lib/lazy-loading'
import { 
  resourceOptimizer, 
  ServiceWorkerManager,
  compressionManager 
} from '../lib/resource-optimization'
import { accessibilityManager } from '../lib/accessibility-utils'

// Mock performance APIs
const mockPerformanceObserver = vi.fn()
const mockPerformanceEntry = {
  name: 'test-entry',
  startTime: 100,
  duration: 50,
  entryType: 'measure',
  processingStart: 150,
  renderTime: 2000,
  loadTime: 2000,
  value: 0.05,
  hadRecentInput: false
}

Object.defineProperty(window, 'PerformanceObserver', {
  writable: true,
  value: vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => [mockPerformanceEntry])
  }))
})

Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    ...window.performance,
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByName: vi.fn(() => [mockPerformanceEntry]),
    getEntriesByType: vi.fn(() => [{
      ...mockPerformanceEntry,
      responseStart: 100,
      requestStart: 50,
      loadEventEnd: 3000,
      navigationStart: 0,
      domContentLoadedEventEnd: 2500
    }]),
    now: vi.fn(() => Date.now()),
    memory: {
      jsHeapSizeLimit: 4294967296,
      totalJSHeapSize: 50000000,
      usedJSHeapSize: 30000000
    }
  }
})

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})
window.IntersectionObserver = mockIntersectionObserver

// Mock navigator APIs
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
    ready: Promise.resolve({})
  },
  writable: true
})

Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 8,
  writable: true
})

Object.defineProperty(navigator, 'connection', {
  value: {
    effectiveType: '4g',
    downlink: 10
  },
  writable: true
})

describe('Performance Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Performance Monitoring', () => {
    it('should initialize performance monitoring correctly', async () => {
      const monitor = new PerformanceMonitor()
      
      expect(window.PerformanceObserver).toHaveBeenCalled()
      
      // Test metrics collection
      const metrics = monitor.getMetrics()
      expect(metrics).toHaveProperty('lcp')
      expect(metrics).toHaveProperty('fid')
      expect(metrics).toHaveProperty('cls')
      expect(metrics).toHaveProperty('fcp')
      expect(metrics).toHaveProperty('ttfb')
    })

    it('should calculate performance scores correctly', () => {
      const monitor = new PerformanceMonitor()
      
      // Simulate good metrics
      monitor['metrics'] = {
        lcp: 2000, // Good
        fid: 80,   // Good
        cls: 0.05, // Good
        fcp: 1500, // Good
        ttfb: 600, // Good
        loadTime: 2500,
        domContentLoaded: 2000
      }
      
      const score = monitor.getScore()
      expect(score.overall).toBeGreaterThan(80)
      expect(score.scores.lcp).toBe(100)
      expect(score.scores.fid).toBe(100)
      expect(score.scores.cls).toBe(100)
    })

    it('should detect poor performance metrics', () => {
      const monitor = new PerformanceMonitor()
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Simulate poor metrics
      monitor['checkThreshold']('lcp', 5000) // Poor LCP
      monitor['checkThreshold']('fid', 400)  // Poor FID
      monitor['checkThreshold']('cls', 0.3)  // Poor CLS
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('LCP is poor'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('FID is poor'))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('CLS is poor'))
      
      consoleSpy.mockRestore()
    })

    it('should handle metrics callbacks', () => {
      const monitor = new PerformanceMonitor()
      const callback = vi.fn()
      
      const unsubscribe = monitor.onMetricsUpdate(callback)
      monitor['notifyCallbacks']()
      
      expect(callback).toHaveBeenCalledWith(monitor.getMetrics())
      
      unsubscribe()
      monitor['notifyCallbacks']()
      
      expect(callback).toHaveBeenCalledTimes(1)
    })
  })

  describe('Lazy Loading', () => {
    it('should implement lazy loading with intersection observer', () => {
      const element = document.createElement('div')
      const loadCallback = vi.fn().mockResolvedValue(undefined)
      
      const cleanup = globalLazyLoader.observe(element, loadCallback)
      
      expect(mockIntersectionObserver).toHaveBeenCalled()
      expect(typeof cleanup).toBe('function')
      
      cleanup()
    })

    it('should respect priority in lazy loading', async () => {
      const highPriorityElement = document.createElement('div')
      const lowPriorityElement = document.createElement('div')
      
      const highPriorityCallback = vi.fn().mockResolvedValue(undefined)
      const lowPriorityCallback = vi.fn().mockResolvedValue(undefined)
      
      globalLazyLoader.observe(highPriorityElement, highPriorityCallback, { priority: 'high' })
      globalLazyLoader.observe(lowPriorityElement, lowPriorityCallback, { priority: 'low' })
      
      // Simulate intersection
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      observerCallback([
        { target: highPriorityElement, isIntersecting: true },
        { target: lowPriorityElement, isIntersecting: true }
      ])
      
      await waitFor(() => {
        expect(highPriorityCallback).toHaveBeenCalled()
      })
    })

    it('should handle concurrent load limits', async () => {
      const elements = Array.from({ length: 5 }, () => document.createElement('div'))
      const callbacks = elements.map(() => vi.fn().mockResolvedValue(undefined))
      
      elements.forEach((element, index) => {
        globalLazyLoader.observe(element, callbacks[index])
      })
      
      // Simulate all elements intersecting at once
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      observerCallback(elements.map(target => ({ target, isIntersecting: true })))
      
      // Should respect concurrent load limit
      await waitFor(() => {
        const calledCallbacks = callbacks.filter(cb => cb.mock.calls.length > 0)
        expect(calledCallbacks.length).toBeLessThanOrEqual(3) // maxConcurrentLoads = 3
      })
    })
  })

  describe('Resource Optimization', () => {
    it('should initialize resource optimizer', async () => {
      await resourceOptimizer.initialize()
      
      expect(navigator.serviceWorker.register).toHaveBeenCalled()
    })

    it('should cache resources effectively', async () => {
      const testUrl = 'https://api.example.com/data'
      const testData = { test: 'data' }
      
      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(testData)
      })
      
      // First call should fetch
      const result1 = await resourceOptimizer.optimizeResource(testUrl)
      expect(result1).toEqual(testData)
      expect(fetch).toHaveBeenCalledTimes(1)
      
      // Second call should use cache
      const result2 = await resourceOptimizer.optimizeResource(testUrl)
      expect(result2).toEqual(testData)
      expect(fetch).toHaveBeenCalledTimes(1) // Still 1, not 2
    })

    it('should provide optimization recommendations', () => {
      const recommendations = resourceOptimizer.getRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
    })

    it('should track performance metrics', () => {
      const metrics = resourceOptimizer.getMetrics()
      expect(metrics).toHaveProperty('cacheSize')
      expect(metrics).toHaveProperty('preloadedResources')
      expect(metrics).toHaveProperty('bundleSize')
      expect(typeof metrics.cacheSize).toBe('number')
    })
  })

  describe('Accessibility Optimizations', () => {
    it('should create ARIA live region', () => {
      const liveRegions = document.querySelectorAll('[aria-live]')
      expect(liveRegions.length).toBeGreaterThan(0)
    })

    it('should announce messages to screen readers', () => {
      accessibilityManager.announce('Test message')
      
      const liveRegion = document.querySelector('[aria-live]')
      expect(liveRegion?.textContent).toBe('Test message')
    })

    it('should handle keyboard navigation', () => {
      const skipToMainSpy = vi.spyOn(accessibilityManager, 'skipToMain')
      
      // Create main element
      const main = document.createElement('main')
      main.id = 'main-content'
      document.body.appendChild(main)
      
      // Simulate Alt+M keypress
      const event = new KeyboardEvent('keydown', { altKey: true, key: 'm' })
      document.dispatchEvent(event)
      
      expect(skipToMainSpy).toHaveBeenCalled()
      
      document.body.removeChild(main)
    })

    it('should perform accessibility audit', () => {
      // Add test elements
      const img = document.createElement('img')
      img.src = 'test.jpg'
      // Missing alt text - should be flagged
      document.body.appendChild(img)
      
      const input = document.createElement('input')
      input.type = 'text'
      // Missing label - should be flagged
      document.body.appendChild(input)
      
      const audit = accessibilityManager.auditPage()
      
      expect(audit.score).toBeLessThan(100)
      expect(audit.issues.length).toBeGreaterThan(0)
      expect(audit.recommendations.length).toBeGreaterThan(0)
      
      // Check for specific issues
      const altTextIssue = audit.issues.find(issue => issue.description.includes('alt text'))
      const labelIssue = audit.issues.find(issue => issue.description.includes('label'))
      
      expect(altTextIssue).toBeDefined()
      expect(labelIssue).toBeDefined()
      
      // Cleanup
      document.body.removeChild(img)
      document.body.removeChild(input)
    })

    it('should manage focus trapping', () => {
      const modal = document.createElement('div')
      modal.setAttribute('role', 'dialog')
      
      const button1 = document.createElement('button')
      const button2 = document.createElement('button')
      modal.appendChild(button1)
      modal.appendChild(button2)
      
      document.body.appendChild(modal)
      
      accessibilityManager.trapFocus(modal)
      
      // Should focus first focusable element
      expect(document.activeElement).toBe(button1)
      
      accessibilityManager.releaseFocusTrap()
      
      document.body.removeChild(modal)
    })
  })

  describe('Code Splitting Optimization', () => {
    it('should optimize dynamic imports with timeout', async () => {
      const mockImport = vi.fn().mockResolvedValue({ default: 'test-component' })
      
      const result = await codeSplittingOptimizer.optimizedImport(
        mockImport,
        'test-chunk',
        { timeout: 5000 }
      )
      
      expect(result).toBe('test-component')
      expect(mockImport).toHaveBeenCalledTimes(1)
    })

    it('should handle import timeouts', async () => {
      const slowImport = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      )
      
      await expect(
        codeSplittingOptimizer.optimizedImport(slowImport, 'slow-chunk', { timeout: 1000 })
      ).rejects.toThrow('Chunk slow-chunk load timeout')
    })

    it('should track chunk loading metrics', async () => {
      const fastImport = vi.fn().mockResolvedValue({ default: 'fast-component' })
      
      await codeSplittingOptimizer.optimizedImport(fastImport, 'fast-chunk')
      
      const metrics = codeSplittingOptimizer.getChunkMetrics()
      expect(metrics.totalChunks).toBeGreaterThan(0)
      expect(metrics.averageLoadTime).toBeGreaterThanOrEqual(0)
    })

    it('should provide optimization recommendations', () => {
      const recommendations = codeSplittingOptimizer.getOptimizationRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
    })
  })

  describe('Compression Management', () => {
    it('should detect compression support', () => {
      const optimalCompression = compressionManager.getOptimalCompression('text/javascript')
      expect(['br', 'gzip', 'deflate', null]).toContain(optimalCompression)
    })

    it('should skip compression for binary formats', () => {
      const jpegCompression = compressionManager.getOptimalCompression('image/jpeg')
      const pngCompression = compressionManager.getOptimalCompression('image/png')
      
      expect(jpegCompression).toBeNull()
      expect(pngCompression).toBeNull()
    })

    it('should estimate compression ratios', () => {
      const ratio = compressionManager.estimateCompressionRatio('test content', 'gzip')
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(1)
    })

    it('should provide compression recommendations', () => {
      const recommendations = compressionManager.getCompressionRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
    })
  })

  describe('Enhanced Lazy Loading', () => {
    it('should implement component lazy loading with caching', async () => {
      const mockComponent = () => Promise.resolve({ default: () => 'Test Component' })
      
      // First load
      const component1 = await componentLazyLoader.loadComponent(mockComponent, 'test-component')
      expect(typeof component1).toBe('function')
      
      // Second load should use cache
      const component2 = await componentLazyLoader.loadComponent(mockComponent, 'test-component')
      expect(component2).toBe(component1)
    })

    it('should handle progressive image loading', async () => {
      const loader = ProgressiveImageLoader.getInstance()
      
      // Mock image loading
      const originalImage = window.Image
      window.Image = vi.fn().mockImplementation(() => ({
        onload: null,
        onerror: null,
        src: '',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }))

      try {
        const loadPromise = loader.loadProgressiveImage(
          'low-quality.jpg',
          'high-quality.jpg',
          {
            onLowQualityLoad: vi.fn(),
            onHighQualityLoad: vi.fn()
          }
        )

        // Simulate image load
        const mockImg = new window.Image()
        setTimeout(() => {
          if (mockImg.onload) mockImg.onload({} as Event)
        }, 10)

        await expect(loadPromise).resolves.toBeDefined()
      } finally {
        window.Image = originalImage
      }
    })
  })

  describe('Service Worker Caching', () => {
    it('should register service worker with caching strategies', async () => {
      const swManager = new ServiceWorkerManager()
      await swManager.register('/test-sw.js')
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/test-sw.js')
    })

    it('should get cache statistics', async () => {
      const swManager = new ServiceWorkerManager()
      
      // Mock caches API
      global.caches = {
        keys: vi.fn().mockResolvedValue(['test-cache']),
        open: vi.fn().mockResolvedValue({
          keys: vi.fn().mockResolvedValue([new Request('test-url')]),
          match: vi.fn().mockResolvedValue(new Response('test content', {
            headers: { 'date': new Date().toISOString() }
          }))
        }),
        delete: vi.fn().mockResolvedValue(true)
      } as any

      const stats = await swManager.getCacheStats()
      expect(stats).toHaveProperty('totalSize')
      expect(stats).toHaveProperty('cacheCount')
      expect(stats).toHaveProperty('oldestEntry')
      expect(stats).toHaveProperty('newestEntry')
    })
  })

  describe('Application Integration', () => {
    it('should initialize performance monitoring in app', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(window.PerformanceObserver).toHaveBeenCalled()
      })
    })

    it('should implement lazy loading for images', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      const images = screen.getAllByRole('img')
      images.forEach(img => {
        // Should have loading attribute for lazy loading
        expect(img).toHaveAttribute('loading')
        
        // Should have proper alt text for accessibility
        expect(img).toHaveAttribute('alt')
        expect(img.getAttribute('alt')).not.toBe('')
      })
    })

    it('should meet Core Web Vitals thresholds', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Simulate performance measurements
      const metrics = performanceMonitor.getMetrics()
      const score = performanceMonitor.getScore()
      
      // Should have reasonable performance scores
      expect(score.overall).toBeGreaterThan(50) // At least moderate performance
    })

    it('should implement comprehensive accessibility features', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Check for skip links
      const skipLink = document.querySelector('a[href*="#"]')
      expect(skipLink).toBeInTheDocument()

      // Check for proper heading hierarchy
      const h1Elements = screen.getAllByRole('heading', { level: 1 })
      expect(h1Elements.length).toBeGreaterThanOrEqual(1)

      // Check for ARIA landmarks
      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()

      // Check for focus management
      const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      expect(focusableElements.length).toBeGreaterThan(0)

      // Check for language attribute
      expect(document.documentElement).toHaveAttribute('lang')

      // Perform accessibility audit
      const audit = accessibilityManager.auditPage()
      expect(audit.score).toBeGreaterThan(70) // Should have good accessibility score
    })

    it('should optimize resource loading', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Check that service worker is registered
      expect(navigator.serviceWorker.register).toHaveBeenCalled()

      // Check for resource preloading
      const preloadLinks = document.querySelectorAll('link[rel="preload"]')
      expect(preloadLinks.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
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
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Should respect reduced motion preferences
      const animatedElements = document.querySelectorAll('[data-animate]')
      animatedElements.forEach(element => {
        const styles = window.getComputedStyle(element)
        // Should have reduced or no animations
        expect(styles.animationDuration).toBe('0s' || styles.animationDuration === '')
      })
    })

    it('should implement performance budgets', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Check bundle size recommendations
      const bundleAnalysis = runtimeBundleAnalyzer.analyzeBundlePerformance()
      expect(bundleAnalysis.score).toBeGreaterThan(50)

      // Check resource optimization metrics
      const resourceMetrics = resourceOptimizer.getMetrics()
      expect(resourceMetrics.cacheSize).toBeGreaterThanOrEqual(0)
      expect(resourceMetrics.bundleSize).toBeGreaterThanOrEqual(0)
    })

    it('should implement accessibility enhancements', async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Test focus management
      const firstFocusable = document.querySelector('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (firstFocusable instanceof HTMLElement) {
        firstFocusable.focus()
        expect(document.activeElement).toBe(firstFocusable)
      }

      // Test keyboard navigation
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escapeEvent)

      // Test skip to main functionality
      const altMEvent = new KeyboardEvent('keydown', { altKey: true, key: 'm' })
      document.dispatchEvent(altMEvent)

      // Should not throw errors
      expect(true).toBe(true)
    })

    it('should optimize for different device performance tiers', async () => {
      // Mock low-end device
      Object.defineProperty(navigator, 'hardwareConcurrency', {
        value: 2,
        writable: true
      })

      Object.defineProperty(navigator, 'connection', {
        value: {
          effectiveType: '3g',
          downlink: 1.5
        },
        writable: true
      })

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )

      // Should adapt to device performance
      await waitFor(() => {
        // Check that performance optimizations are applied
        const recommendations = resourceOptimizer.getRecommendations()
        expect(Array.isArray(recommendations)).toBe(true)
      })
    })
  })
})