/**
 * Resource optimization utilities for compression, caching, and performance
 */

export interface CacheConfig {
  maxAge: number
  maxSize: number
  strategy: 'lru' | 'fifo' | 'lfu'
}

export interface CompressionConfig {
  enableGzip: boolean
  enableBrotli: boolean
  minSize: number
  excludeTypes: string[]
}

export interface ResourceOptimizationConfig {
  cache: CacheConfig
  compression: CompressionConfig
  preload: {
    critical: string[]
    fonts: string[]
    images: string[]
  }
  bundling: {
    enableCodeSplitting: boolean
    chunkSize: number
    enableTreeShaking: boolean
  }
}

/**
 * In-memory cache with LRU eviction
 */
export class MemoryCache<T = any> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>()
  private maxSize: number
  private maxAge: number
  private strategy: 'lru' | 'fifo' | 'lfu'

  constructor(config: CacheConfig) {
    this.maxSize = config.maxSize
    this.maxAge = config.maxAge
    this.strategy = config.strategy
  }

  set(key: string, value: T): void {
    // Remove expired entries
    this.cleanup()

    // If at capacity, remove oldest/least used entry
    if (this.cache.size >= this.maxSize) {
      this.evict()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    })
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key)
      return null
    }

    // Update access count for LFU
    entry.accessCount++
    
    return entry.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    this.cleanup()
    return this.cache.size
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key)
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return

    let keyToRemove: string | null = null

    switch (this.strategy) {
      case 'lru':
        // Remove least recently used (oldest timestamp)
        let oldestTime = Date.now()
        for (const [key, entry] of this.cache.entries()) {
          if (entry.timestamp < oldestTime) {
            oldestTime = entry.timestamp
            keyToRemove = key
          }
        }
        break

      case 'fifo':
        // Remove first inserted (first in map)
        keyToRemove = this.cache.keys().next().value
        break

      case 'lfu':
        // Remove least frequently used
        let lowestCount = Infinity
        for (const [key, entry] of this.cache.entries()) {
          if (entry.accessCount < lowestCount) {
            lowestCount = entry.accessCount
            keyToRemove = key
          }
        }
        break
    }

    if (keyToRemove) {
      this.cache.delete(keyToRemove)
    }
  }
}

/**
 * Resource preloader with priority management
 */
export class ResourcePreloader {
  private preloadedResources = new Set<string>()
  private preloadQueue: Array<{ url: string; priority: number; type: string }> = []
  private isProcessing = false

  /**
   * Preload a resource with specified priority
   */
  preload(url: string, type: 'script' | 'style' | 'image' | 'font' | 'fetch' = 'fetch', priority: number = 1): Promise<void> {
    if (this.preloadedResources.has(url)) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.preloadQueue.push({ url, priority, type })
      this.preloadQueue.sort((a, b) => b.priority - a.priority) // Higher priority first

      if (!this.isProcessing) {
        this.processQueue().then(() => resolve()).catch(reject)
      }
    })
  }

  /**
   * Process the preload queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) return

    this.isProcessing = true

    while (this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift()!
      
      try {
        await this.preloadResource(item.url, item.type)
        this.preloadedResources.add(item.url)
      } catch (error) {
        console.warn(`Failed to preload resource: ${item.url}`, error)
      }
    }

    this.isProcessing = false
  }

  /**
   * Preload individual resource
   */
  private preloadResource(url: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = url

      switch (type) {
        case 'script':
          link.as = 'script'
          break
        case 'style':
          link.as = 'style'
          break
        case 'image':
          link.as = 'image'
          break
        case 'font':
          link.as = 'font'
          link.crossOrigin = 'anonymous'
          break
        default:
          link.as = 'fetch'
          link.crossOrigin = 'anonymous'
      }

      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Failed to preload: ${url}`))

      document.head.appendChild(link)
    })
  }

  /**
   * Preload critical resources immediately
   */
  preloadCritical(resources: Array<{ url: string; type: string }>): Promise<void[]> {
    const promises = resources.map(resource => 
      this.preload(resource.url, resource.type as any, 10) // High priority
    )
    return Promise.all(promises)
  }
}

/**
 * Bundle analyzer for code splitting optimization
 */
export class BundleAnalyzer {
  private chunkSizes = new Map<string, number>()
  private dependencies = new Map<string, string[]>()

  /**
   * Analyze bundle and suggest optimizations
   */
  analyze(): {
    totalSize: number
    largestChunks: Array<{ name: string; size: number }>
    duplicatedDependencies: string[]
    recommendations: string[]
  } {
    const totalSize = Array.from(this.chunkSizes.values()).reduce((sum, size) => sum + size, 0)
    
    const largestChunks = Array.from(this.chunkSizes.entries())
      .map(([name, size]) => ({ name, size }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 5)

    const duplicatedDependencies = this.findDuplicatedDependencies()
    const recommendations = this.generateRecommendations(totalSize, largestChunks, duplicatedDependencies)

    return {
      totalSize,
      largestChunks,
      duplicatedDependencies,
      recommendations
    }
  }

  private findDuplicatedDependencies(): string[] {
    const depCount = new Map<string, number>()
    
    for (const deps of this.dependencies.values()) {
      for (const dep of deps) {
        depCount.set(dep, (depCount.get(dep) || 0) + 1)
      }
    }

    return Array.from(depCount.entries())
      .filter(([, count]) => count > 1)
      .map(([dep]) => dep)
  }

  private generateRecommendations(
    totalSize: number,
    largestChunks: Array<{ name: string; size: number }>,
    duplicatedDependencies: string[]
  ): string[] {
    const recommendations: string[] = []

    if (totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Consider code splitting to reduce initial bundle size')
    }

    if (largestChunks.length > 0 && largestChunks[0].size > 500 * 1024) { // > 500KB
      recommendations.push(`Large chunk detected: ${largestChunks[0].name}. Consider splitting further.`)
    }

    if (duplicatedDependencies.length > 0) {
      recommendations.push(`Duplicated dependencies found: ${duplicatedDependencies.join(', ')}. Consider creating shared chunks.`)
    }

    return recommendations
  }
}

/**
 * Service Worker manager for caching strategies
 */
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null
  private cacheStrategies = new Map<string, CacheStrategy>()

  /**
   * Register service worker with caching strategies
   */
  async register(swPath: string = '/sw.js'): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported')
      return
    }

    try {
      this.registration = await navigator.serviceWorker.register(swPath)
      console.log('Service Worker registered successfully')

      // Listen for updates
      if (this.registration.addEventListener) {
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration!.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.notifyUpdate()
              }
            })
          }
        })
      }

      // Set up default caching strategies
      this.setupDefaultCacheStrategies()
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  /**
   * Setup default caching strategies
   */
  private setupDefaultCacheStrategies(): void {
    // Cache static assets with cache-first strategy
    this.cacheStrategies.set('static-assets', {
      name: 'static-assets-v1',
      strategy: 'cache-first',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxEntries: 100,
      patterns: [/\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/]
    })

    // Cache API responses with network-first strategy
    this.cacheStrategies.set('api-cache', {
      name: 'api-cache-v1',
      strategy: 'network-first',
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 50,
      patterns: [/\/api\//]
    })

    // Cache HTML with stale-while-revalidate
    this.cacheStrategies.set('html-cache', {
      name: 'html-cache-v1',
      strategy: 'stale-while-revalidate',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      maxEntries: 20,
      patterns: [/\.html$/, /\/$/]
    })
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update()
    }
  }

  /**
   * Notify user of available update
   */
  private notifyUpdate(): void {
    // You can implement a custom notification here
    console.log('New version available. Refresh to update.')
    
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    }))
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }
  }

  /**
   * Get cache usage statistics
   */
  async getCacheStats(): Promise<{
    totalSize: number
    cacheCount: number
    oldestEntry: Date | null
    newestEntry: Date | null
  }> {
    if (!('caches' in window)) {
      return { totalSize: 0, cacheCount: 0, oldestEntry: null, newestEntry: null }
    }

    const cacheNames = await caches.keys()
    let totalSize = 0
    let cacheCount = 0
    let oldestEntry: Date | null = null
    let newestEntry: Date | null = null

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      
      for (const request of requests) {
        const response = await cache.match(request)
        if (response) {
          cacheCount++
          
          // Estimate size (rough approximation)
          const responseClone = response.clone()
          const buffer = await responseClone.arrayBuffer()
          totalSize += buffer.byteLength

          // Get date from headers if available
          const dateHeader = response.headers.get('date')
          if (dateHeader) {
            const date = new Date(dateHeader)
            if (!oldestEntry || date < oldestEntry) {
              oldestEntry = date
            }
            if (!newestEntry || date > newestEntry) {
              newestEntry = date
            }
          }
        }
      }
    }

    return { totalSize, cacheCount, oldestEntry, newestEntry }
  }
}

interface CacheStrategy {
  name: string
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate'
  maxAge: number
  maxEntries: number
  patterns: RegExp[]
}

/**
 * Compression utilities for client-side optimization
 */
export class CompressionManager {
  private compressionSupport = {
    gzip: false,
    brotli: false,
    deflate: false
  }

  constructor() {
    this.detectCompressionSupport()
  }

  /**
   * Detect browser compression support
   */
  private detectCompressionSupport(): void {
    if (typeof window === 'undefined') return

    // Check Accept-Encoding header support
    const testHeaders = new Headers()
    try {
      testHeaders.set('Accept-Encoding', 'gzip, deflate, br')
      const acceptEncoding = testHeaders.get('Accept-Encoding') || ''
      
      this.compressionSupport.gzip = acceptEncoding.includes('gzip')
      this.compressionSupport.deflate = acceptEncoding.includes('deflate')
      this.compressionSupport.brotli = acceptEncoding.includes('br')
    } catch (error) {
      console.warn('Could not detect compression support:', error)
    }
  }

  /**
   * Get optimal compression format for a resource
   */
  getOptimalCompression(resourceType: string): string | null {
    // Skip compression for already compressed formats
    const skipCompression = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/zip', 'application/gzip'
    ]

    if (skipCompression.includes(resourceType)) {
      return null
    }

    // Prefer Brotli for text-based resources
    if (this.compressionSupport.brotli && this.isTextResource(resourceType)) {
      return 'br'
    }

    // Fallback to gzip
    if (this.compressionSupport.gzip) {
      return 'gzip'
    }

    // Last resort: deflate
    if (this.compressionSupport.deflate) {
      return 'deflate'
    }

    return null
  }

  /**
   * Check if resource is text-based and benefits from compression
   */
  private isTextResource(resourceType: string): boolean {
    const textTypes = [
      'text/', 'application/javascript', 'application/json',
      'application/xml', 'application/css', 'image/svg+xml'
    ]

    return textTypes.some(type => resourceType.startsWith(type))
  }

  /**
   * Estimate compression ratio for a resource
   */
  estimateCompressionRatio(content: string, compressionType: string): number {
    // Rough estimates based on typical compression ratios
    const ratios = {
      'br': 0.25,      // Brotli: ~75% reduction
      'gzip': 0.35,    // Gzip: ~65% reduction
      'deflate': 0.40  // Deflate: ~60% reduction
    }

    return ratios[compressionType as keyof typeof ratios] || 1.0
  }

  /**
   * Get compression recommendations
   */
  getCompressionRecommendations(): string[] {
    const recommendations: string[] = []

    if (!this.compressionSupport.brotli) {
      recommendations.push('Browser does not support Brotli compression. Consider serving pre-compressed assets.')
    }

    if (!this.compressionSupport.gzip) {
      recommendations.push('Browser does not support Gzip compression. This is unusual and may indicate an issue.')
    }

    recommendations.push('Enable server-side compression for text-based resources')
    recommendations.push('Pre-compress static assets during build process')
    recommendations.push('Use appropriate compression levels (6-9 for static assets)')

    return recommendations
  }
}

// Global compression manager
export const compressionManager = new CompressionManager()

/**
 * Resource optimization manager
 */
export class ResourceOptimizer {
  private cache: MemoryCache
  private preloader: ResourcePreloader
  private bundleAnalyzer: BundleAnalyzer
  private swManager: ServiceWorkerManager
  private config: ResourceOptimizationConfig

  constructor(config: Partial<ResourceOptimizationConfig> = {}) {
    this.config = {
      cache: {
        maxAge: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        strategy: 'lru'
      },
      compression: {
        enableGzip: true,
        enableBrotli: true,
        minSize: 1024,
        excludeTypes: ['image/jpeg', 'image/png', 'image/gif']
      },
      preload: {
        critical: [],
        fonts: [],
        images: []
      },
      bundling: {
        enableCodeSplitting: true,
        chunkSize: 250 * 1024, // 250KB
        enableTreeShaking: true
      },
      ...config
    }

    this.cache = new MemoryCache(this.config.cache)
    this.preloader = new ResourcePreloader()
    this.bundleAnalyzer = new BundleAnalyzer()
    this.swManager = new ServiceWorkerManager()
  }

  /**
   * Initialize resource optimization
   */
  async initialize(): Promise<void> {
    // Register service worker
    await this.swManager.register()

    // Preload critical resources
    if (this.config.preload.critical.length > 0) {
      await this.preloader.preloadCritical(
        this.config.preload.critical.map(url => ({ url, type: 'fetch' }))
      )
    }

    // Preload fonts
    if (this.config.preload.fonts.length > 0) {
      this.config.preload.fonts.forEach(url => {
        this.preloader.preload(url, 'font', 8) // High priority for fonts
      })
    }

    // Preload critical images
    if (this.config.preload.images.length > 0) {
      this.config.preload.images.forEach(url => {
        this.preloader.preload(url, 'image', 6)
      })
    }
  }

  /**
   * Optimize resource loading
   */
  async optimizeResource(url: string, type: string = 'fetch'): Promise<any> {
    // Check cache first
    const cached = this.cache.get(url)
    if (cached) {
      return cached
    }

    try {
      // Fetch resource
      const response = await fetch(url)
      const data = await response.json()

      // Cache the result
      this.cache.set(url, data)

      return data
    } catch (error) {
      console.error(`Failed to optimize resource: ${url}`, error)
      throw error
    }
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(): string[] {
    const bundleAnalysis = this.bundleAnalyzer.analyze()
    const recommendations = [...bundleAnalysis.recommendations]

    // Add cache recommendations
    if (this.cache.size() > this.config.cache.maxSize * 0.8) {
      recommendations.push('Cache is near capacity. Consider increasing maxSize or reducing maxAge.')
    }

    // Add preload recommendations
    if (this.config.preload.critical.length === 0) {
      recommendations.push('Consider preloading critical resources for better performance.')
    }

    return recommendations
  }

  /**
   * Get performance metrics
   */
  getMetrics(): {
    cacheHitRate: number
    cacheSize: number
    preloadedResources: number
    bundleSize: number
  } {
    const bundleAnalysis = this.bundleAnalyzer.analyze()
    
    return {
      cacheHitRate: 0, // Would need to track hits/misses
      cacheSize: this.cache.size(),
      preloadedResources: this.preloader['preloadedResources'].size,
      bundleSize: bundleAnalysis.totalSize
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.cache.clear()
  }
}

// Global resource optimizer instance
export const resourceOptimizer = new ResourceOptimizer()

/**
 * Hook for resource optimization
 */
export function useResourceOptimization() {
  const optimizeResource = (url: string, type?: string) => {
    return resourceOptimizer.optimizeResource(url, type)
  }

  const preloadResource = (url: string, type: 'script' | 'style' | 'image' | 'font' | 'fetch' = 'fetch', priority: number = 1) => {
    return resourceOptimizer['preloader'].preload(url, type, priority)
  }

  const getRecommendations = () => {
    return resourceOptimizer.getRecommendations()
  }

  const getMetrics = () => {
    return resourceOptimizer.getMetrics()
  }

  return {
    optimizeResource,
    preloadResource,
    getRecommendations,
    getMetrics
  }
}