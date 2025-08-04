/**
 * Enhanced performance monitoring utilities with SEO optimizations
 */

export interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number
  fcp: number | null
  ttfb: number | null
  loadTime: number | null
  domContentLoaded: number | null
}

export interface PerformanceThresholds {
  lcp: { good: number; needsImprovement: number }
  fid: { good: number; needsImprovement: number }
  cls: { good: number; needsImprovement: number }
  fcp: { good: number; needsImprovement: number }
  ttfb: { good: number; needsImprovement: number }
}

export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, needsImprovement: 4000 },
  fid: { good: 100, needsImprovement: 300 },
  cls: { good: 0.1, needsImprovement: 0.25 },
  fcp: { good: 1800, needsImprovement: 3000 },
  ttfb: { good: 800, needsImprovement: 1800 }
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: 0,
    fcp: null,
    ttfb: null,
    loadTime: null,
    domContentLoaded: null
  }

  private observers: PerformanceObserver[] = []
  private callbacks: Array<(metrics: PerformanceMetrics) => void> = []
  private thresholds: PerformanceThresholds

  constructor(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds
    this.initializeMonitoring()
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      console.warn('Performance monitoring not supported')
      return
    }

    this.monitorLCP()
    this.monitorFID()
    this.monitorCLS()
    this.monitorFCP()
    this.monitorNavigationTiming()
  }

  private monitorLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number
          loadTime?: number
        }
        
        if (lastEntry) {
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || 0
          this.checkThreshold('lcp', this.metrics.lcp)
          this.notifyCallbacks()
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('LCP monitoring not supported:', error)
    }
  }

  private monitorFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime
          this.checkThreshold('fid', this.metrics.fid)
          this.notifyCallbacks()
        })
      })
      
      observer.observe({ entryTypes: ['first-input'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FID monitoring not supported:', error)
    }
  }

  private monitorCLS() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            this.metrics.cls += entry.value
          }
        })
        
        this.checkThreshold('cls', this.metrics.cls)
        this.notifyCallbacks()
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('CLS monitoring not supported:', error)
    }
  }

  private monitorFCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime
            this.checkThreshold('fcp', this.metrics.fcp)
            this.notifyCallbacks()
          }
        })
      })
      
      observer.observe({ entryTypes: ['paint'] })
      this.observers.push(observer)
    } catch (error) {
      console.warn('FCP monitoring not supported:', error)
    }
  }

  private monitorNavigationTiming() {
    // Monitor navigation timing for TTFB and load times
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      
      if (navigationEntries.length > 0) {
        const entry = navigationEntries[0]
        
        // Time to First Byte
        this.metrics.ttfb = entry.responseStart - entry.requestStart
        this.checkThreshold('ttfb', this.metrics.ttfb)
        
        // Load time
        this.metrics.loadTime = entry.loadEventEnd - entry.navigationStart
        
        // DOM Content Loaded
        this.metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.navigationStart
        
        this.notifyCallbacks()
      }
    }
  }

  private checkThreshold(metric: keyof PerformanceThresholds, value: number) {
    const threshold = this.thresholds[metric]
    
    if (value > threshold.needsImprovement) {
      console.warn(`${metric.toUpperCase()} is poor (${value.toFixed(2)}ms). Threshold: ${threshold.needsImprovement}ms`)
    } else if (value > threshold.good) {
      console.info(`${metric.toUpperCase()} needs improvement (${value.toFixed(2)}ms). Target: ${threshold.good}ms`)
    } else {
      console.log(`${metric.toUpperCase()} is good (${value.toFixed(2)}ms)`)
    }
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback({ ...this.metrics })
      } catch (error) {
        console.error('Performance callback error:', error)
      }
    })
  }

  public onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void) {
    this.callbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  public getScore(): { overall: number; scores: Record<string, number> } {
    const scores: Record<string, number> = {}
    let totalScore = 0
    let metricCount = 0

    // Calculate individual scores (0-100)
    Object.entries(this.metrics).forEach(([key, value]) => {
      if (value === null) return
      
      const threshold = this.thresholds[key as keyof PerformanceThresholds]
      if (!threshold) return

      let score = 100
      if (value > threshold.needsImprovement) {
        score = 0
      } else if (value > threshold.good) {
        score = 50
      }

      scores[key] = score
      totalScore += score
      metricCount++
    })

    const overall = metricCount > 0 ? Math.round(totalScore / metricCount) : 0

    return { overall, scores }
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.callbacks = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Initialize monitoring when module loads
export function initPerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Start monitoring immediately
    performanceMonitor
    
    // Log performance summary after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const metrics = performanceMonitor.getMetrics()
        const score = performanceMonitor.getScore()
        
        console.group('🚀 Performance Summary')
        console.log('Overall Score:', score.overall)
        console.log('Metrics:', metrics)
        console.log('Individual Scores:', score.scores)
        console.groupEnd()
      }, 1000)
    })
  }
}

// Utility to measure component render time
export function measureRenderTime(componentName: string) {
  if (typeof window === 'undefined') return { start: () => {}, end: () => {} }

  let startTime: number

  return {
    start: () => {
      startTime = performance.now()
    },
    end: () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      console.log(`${componentName} render time:`, renderTime.toFixed(2), 'ms')
      
      if (renderTime > 16) { // 60fps threshold
        console.warn(`${componentName} render time exceeds 16ms:`, renderTime.toFixed(2), 'ms')
      }
    }
  }
}

// Utility to debounce expensive operations
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Code splitting optimizer for dynamic imports
 */
export class CodeSplittingOptimizer {
  private chunkLoadTimes = new Map<string, number>()
  private preloadedChunks = new Set<string>()
  private criticalChunks = new Set<string>()

  /**
   * Optimize dynamic import with preloading and caching
   */
  async optimizedImport<T>(
    importFn: () => Promise<T>,
    chunkName: string,
    options: {
      preload?: boolean
      critical?: boolean
      timeout?: number
    } = {}
  ): Promise<T> {
    const { preload = false, critical = false, timeout = 10000 } = options
    const startTime = performance.now()

    try {
      // Mark as critical if specified
      if (critical) {
        this.criticalChunks.add(chunkName)
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Chunk ${chunkName} load timeout`)), timeout)
      })

      // Load the chunk with timeout
      const result = await Promise.race([importFn(), timeoutPromise])
      
      const loadTime = performance.now() - startTime
      this.chunkLoadTimes.set(chunkName, loadTime)

      // Log slow chunks in development
      if (process.env.NODE_ENV === 'development' && loadTime > 1000) {
        console.warn(`Slow chunk load: ${chunkName} took ${loadTime.toFixed(2)}ms`)
      }

      return result
    } catch (error) {
      console.error(`Failed to load chunk ${chunkName}:`, error)
      throw error
    }
  }

  /**
   * Preload critical chunks
   */
  async preloadCriticalChunks(chunks: Array<{ name: string; importFn: () => Promise<any> }>): Promise<void> {
    const preloadPromises = chunks.map(async ({ name, importFn }) => {
      if (this.preloadedChunks.has(name)) return

      try {
        await this.optimizedImport(importFn, name, { critical: true })
        this.preloadedChunks.add(name)
      } catch (error) {
        console.error(`Failed to preload chunk ${name}:`, error)
      }
    })

    await Promise.allSettled(preloadPromises)
  }

  /**
   * Get chunk loading performance metrics
   */
  getChunkMetrics(): {
    averageLoadTime: number
    slowestChunk: { name: string; time: number } | null
    totalChunks: number
    preloadedChunks: number
  } {
    const loadTimes = Array.from(this.chunkLoadTimes.values())
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0

    let slowestChunk: { name: string; time: number } | null = null
    for (const [name, time] of this.chunkLoadTimes.entries()) {
      if (!slowestChunk || time > slowestChunk.time) {
        slowestChunk = { name, time }
      }
    }

    return {
      averageLoadTime,
      slowestChunk,
      totalChunks: this.chunkLoadTimes.size,
      preloadedChunks: this.preloadedChunks.size
    }
  }

  /**
   * Get recommendations for chunk optimization
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = []
    const metrics = this.getChunkMetrics()

    if (metrics.averageLoadTime > 500) {
      recommendations.push('Consider reducing chunk sizes or implementing better code splitting')
    }

    if (metrics.slowestChunk && metrics.slowestChunk.time > 2000) {
      recommendations.push(`Chunk "${metrics.slowestChunk.name}" is very slow (${metrics.slowestChunk.time.toFixed(2)}ms). Consider splitting it further.`)
    }

    if (this.criticalChunks.size > 5) {
      recommendations.push('Too many critical chunks. Consider bundling some critical code together.')
    }

    if (metrics.preloadedChunks / metrics.totalChunks < 0.3) {
      recommendations.push('Consider preloading more critical chunks for better performance')
    }

    return recommendations
  }
}

// Global code splitting optimizer
export const codeSplittingOptimizer = new CodeSplittingOptimizer()

/**
 * Bundle size analyzer for runtime optimization
 */
export class RuntimeBundleAnalyzer {
  private bundleMetrics = {
    totalSize: 0,
    compressedSize: 0,
    chunkCount: 0,
    duplicateModules: new Set<string>()
  }

  /**
   * Analyze current bundle performance
   */
  analyzeBundlePerformance(): {
    score: number
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []
    let score = 100

    // Check bundle size
    if (this.bundleMetrics.totalSize > 1024 * 1024) { // > 1MB
      issues.push('Large bundle size detected')
      recommendations.push('Consider implementing more aggressive code splitting')
      score -= 20
    }

    // Check chunk count
    if (this.bundleMetrics.chunkCount > 20) {
      issues.push('Too many chunks may impact HTTP/2 performance')
      recommendations.push('Consider consolidating some smaller chunks')
      score -= 10
    }

    // Check for duplicate modules
    if (this.bundleMetrics.duplicateModules.size > 0) {
      issues.push(`${this.bundleMetrics.duplicateModules.size} duplicate modules detected`)
      recommendations.push('Implement shared chunks for common dependencies')
      score -= 15
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    }
  }

  /**
   * Update bundle metrics (called by build tools)
   */
  updateMetrics(metrics: Partial<typeof this.bundleMetrics>): void {
    Object.assign(this.bundleMetrics, metrics)
  }
}

// Global bundle analyzer
export const runtimeBundleAnalyzer = new RuntimeBundleAnalyzer()

// Utility to throttle expensive operations
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Lazy load images with intersection observer
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })
    
    observer.observe(img)
  } else {
    // Fallback for browsers without IntersectionObserver
    img.src = src
  }
}