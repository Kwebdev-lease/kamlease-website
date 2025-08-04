/**
 * Enhanced lazy loading utilities for performance optimization
 */

export interface LazyLoadOptions {
  rootMargin?: string
  threshold?: number | number[]
  priority?: 'high' | 'medium' | 'low'
  enablePreload?: boolean
  fallbackDelay?: number
}

export interface LazyComponentOptions extends LazyLoadOptions {
  placeholder?: React.ComponentType
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>
  retryAttempts?: number
  retryDelay?: number
}

/**
 * Enhanced intersection observer for lazy loading with performance optimizations
 */
export class PerformanceLazyLoader {
  private observers = new Map<string, IntersectionObserver>()
  private loadQueue = new Map<string, () => Promise<void>>()
  private loadingElements = new Set<string>()
  private maxConcurrentLoads = 3
  private currentLoads = 0

  constructor(private defaultOptions: LazyLoadOptions = {}) {
    this.defaultOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      priority: 'medium',
      enablePreload: true,
      fallbackDelay: 5000,
      ...defaultOptions
    }
  }

  /**
   * Observe an element for lazy loading
   */
  observe(
    element: Element,
    loadCallback: () => Promise<void>,
    options: LazyLoadOptions = {}
  ): () => void {
    const mergedOptions = { ...this.defaultOptions, ...options }
    const elementId = this.generateElementId(element)
    
    // Create observer if it doesn't exist for this configuration
    const observerKey = this.getObserverKey(mergedOptions)
    if (!this.observers.has(observerKey)) {
      this.createObserver(observerKey, mergedOptions)
    }

    const observer = this.observers.get(observerKey)!
    this.loadQueue.set(elementId, loadCallback)

    // Add element to observer
    observer.observe(element)

    // Fallback timeout for browsers without IntersectionObserver
    let fallbackTimeout: NodeJS.Timeout | null = null
    if (mergedOptions.fallbackDelay && mergedOptions.fallbackDelay > 0) {
      fallbackTimeout = setTimeout(() => {
        this.handleIntersection(element, elementId)
      }, mergedOptions.fallbackDelay)
    }

    // Return cleanup function
    return () => {
      observer.unobserve(element)
      this.loadQueue.delete(elementId)
      this.loadingElements.delete(elementId)
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout)
      }
    }
  }

  /**
   * Create intersection observer with specific options
   */
  private createObserver(key: string, options: LazyLoadOptions) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elementId = this.generateElementId(entry.target)
            this.handleIntersection(entry.target, elementId)
          }
        })
      },
      {
        rootMargin: options.rootMargin,
        threshold: options.threshold
      }
    )

    this.observers.set(key, observer)
  }

  /**
   * Handle element intersection
   */
  private async handleIntersection(element: Element, elementId: string) {
    if (this.loadingElements.has(elementId)) return

    const loadCallback = this.loadQueue.get(elementId)
    if (!loadCallback) return

    // Check if we can start loading (respect concurrent load limit)
    if (this.currentLoads >= this.maxConcurrentLoads) {
      // Queue for later
      setTimeout(() => this.handleIntersection(element, elementId), 100)
      return
    }

    this.loadingElements.add(elementId)
    this.currentLoads++

    try {
      await loadCallback()
      
      // Remove from all observers
      this.observers.forEach(observer => observer.unobserve(element))
      this.loadQueue.delete(elementId)
    } catch (error) {
      console.error('Lazy loading failed:', error)
    } finally {
      this.loadingElements.delete(elementId)
      this.currentLoads--
    }
  }

  /**
   * Generate unique element ID
   */
  private generateElementId(element: Element): string {
    return `lazy-${element.tagName.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate observer key based on options
   */
  private getObserverKey(options: LazyLoadOptions): string {
    return `${options.rootMargin}-${options.threshold}-${options.priority}`
  }

  /**
   * Preload critical resources
   */
  preloadCritical(urls: string[], type: 'image' | 'script' | 'style' = 'image') {
    urls.forEach(url => {
      if (type === 'image') {
        const img = new Image()
        img.src = url
      } else if (type === 'script') {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'script'
        link.href = url
        document.head.appendChild(link)
      } else if (type === 'style') {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'style'
        link.href = url
        document.head.appendChild(link)
      }
    })
  }

  /**
   * Clean up all observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    this.loadQueue.clear()
    this.loadingElements.clear()
  }
}

// Global lazy loader instance
export const globalLazyLoader = new PerformanceLazyLoader()

/**
 * Hook for lazy loading with performance optimizations
 */
export function useLazyLoading(options: LazyLoadOptions = {}) {
  const observe = (
    element: Element | null,
    loadCallback: () => Promise<void>
  ) => {
    if (!element) return () => {}
    return globalLazyLoader.observe(element, loadCallback, options)
  }

  return { observe }
}

/**
 * Enhanced React component lazy loading with Suspense integration
 */
export class ComponentLazyLoader {
  private componentCache = new Map<string, React.ComponentType<any>>()
  private loadingComponents = new Set<string>()

  /**
   * Lazy load a React component with caching
   */
  async loadComponent<T = any>(
    importFn: () => Promise<{ default: React.ComponentType<T> }>,
    componentId: string
  ): Promise<React.ComponentType<T>> {
    // Return cached component if available
    if (this.componentCache.has(componentId)) {
      return this.componentCache.get(componentId)!
    }

    // Prevent duplicate loading
    if (this.loadingComponents.has(componentId)) {
      // Wait for existing load to complete
      while (this.loadingComponents.has(componentId)) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      return this.componentCache.get(componentId)!
    }

    this.loadingComponents.add(componentId)

    try {
      const module = await importFn()
      const Component = module.default
      
      this.componentCache.set(componentId, Component)
      return Component
    } catch (error) {
      console.error(`Failed to load component ${componentId}:`, error)
      throw error
    } finally {
      this.loadingComponents.delete(componentId)
    }
  }

  /**
   * Preload components for better performance
   */
  preloadComponent(
    importFn: () => Promise<{ default: React.ComponentType<any> }>,
    componentId: string
  ): Promise<void> {
    return this.loadComponent(importFn, componentId).then(() => {})
  }

  /**
   * Clear component cache
   */
  clearCache(): void {
    this.componentCache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.componentCache.size
  }
}

// Global component lazy loader
export const componentLazyLoader = new ComponentLazyLoader()

/**
 * Enhanced lazy loading for images with progressive loading
 */
export class ProgressiveImageLoader {
  private static instance: ProgressiveImageLoader
  private imageCache = new Map<string, HTMLImageElement>()
  private loadingImages = new Set<string>()

  static getInstance(): ProgressiveImageLoader {
    if (!this.instance) {
      this.instance = new ProgressiveImageLoader()
    }
    return this.instance
  }

  /**
   * Load image with progressive enhancement
   */
  async loadProgressiveImage(
    lowQualitySrc: string,
    highQualitySrc: string,
    options: {
      placeholder?: string
      onLowQualityLoad?: (img: HTMLImageElement) => void
      onHighQualityLoad?: (img: HTMLImageElement) => void
      priority?: boolean
    } = {}
  ): Promise<{ lowQuality: HTMLImageElement; highQuality: HTMLImageElement }> {
    const { placeholder, onLowQualityLoad, onHighQualityLoad, priority = false } = options

    // Load placeholder first if provided
    if (placeholder) {
      await this.loadSingleImage(placeholder)
    }

    // Load low quality image
    const lowQualityImg = await this.loadSingleImage(lowQualitySrc)
    onLowQualityLoad?.(lowQualityImg)

    // Load high quality image
    const highQualityPromise = this.loadSingleImage(highQualitySrc)
    
    if (priority) {
      const highQualityImg = await highQualityPromise
      onHighQualityLoad?.(highQualityImg)
      return { lowQuality: lowQualityImg, highQuality: highQualityImg }
    } else {
      // Load high quality in background
      highQualityPromise.then(onHighQualityLoad).catch(console.error)
      return { lowQuality: lowQualityImg, highQuality: lowQualityImg }
    }
  }

  /**
   * Load single image with caching
   */
  private async loadSingleImage(src: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!.cloneNode() as HTMLImageElement
    }

    // Prevent duplicate loading
    if (this.loadingImages.has(src)) {
      while (this.loadingImages.has(src)) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      return this.imageCache.get(src)!.cloneNode() as HTMLImageElement
    }

    this.loadingImages.add(src)

    try {
      const img = new Image()
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
        img.src = src
      })

      this.imageCache.set(src, img)
      return img.cloneNode() as HTMLImageElement
    } finally {
      this.loadingImages.delete(src)
    }
  }

  /**
   * Preload images
   */
  preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
    return Promise.all(srcs.map(src => this.loadSingleImage(src)))
  }

  /**
   * Clear image cache
   */
  clearCache(): void {
    this.imageCache.clear()
  }
}

// Global progressive image loader
export const progressiveImageLoader = ProgressiveImageLoader.getInstance()

/**
 * Lazy load images with WebP support and responsive sizing
 */
export class LazyImageLoader {
  private static webpSupported: boolean | null = null

  static async checkWebPSupport(): Promise<boolean> {
    if (this.webpSupported !== null) return this.webpSupported

    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        this.webpSupported = webP.height === 2
        resolve(this.webpSupported)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  static async loadImage(
    src: string,
    options: {
      webpSrc?: string
      placeholder?: string
      sizes?: string
      priority?: boolean
    } = {}
  ): Promise<HTMLImageElement> {
    const { webpSrc, placeholder, priority = false } = options

    // Check WebP support
    const supportsWebP = await this.checkWebPSupport()
    const finalSrc = supportsWebP && webpSrc ? webpSrc : src

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Set loading attribute based on priority
      if ('loading' in img) {
        img.loading = priority ? 'eager' : 'lazy'
      }

      // Set sizes for responsive images
      if (options.sizes) {
        img.sizes = options.sizes
      }

      img.onload = () => resolve(img)
      img.onerror = () => {
        // Try fallback if WebP fails
        if (supportsWebP && webpSrc && finalSrc === webpSrc) {
          const fallbackImg = new Image()
          fallbackImg.onload = () => resolve(fallbackImg)
          fallbackImg.onerror = () => reject(new Error(`Failed to load image: ${src}`))
          fallbackImg.src = src
        } else {
          reject(new Error(`Failed to load image: ${finalSrc}`))
        }
      }

      // Show placeholder while loading
      if (placeholder) {
        img.style.backgroundImage = `url(${placeholder})`
        img.style.backgroundSize = 'cover'
        img.style.backgroundPosition = 'center'
      }

      img.src = finalSrc
    })
  }
}

/**
 * Batch loader for multiple resources
 */
export class BatchResourceLoader {
  private queue: Array<() => Promise<any>> = []
  private batchSize = 3
  private batchDelay = 100

  add<T>(loader: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await loader()
          resolve(result)
          return result
        } catch (error) {
          reject(error)
          throw error
        }
      })

      // Process queue if it's the first item or we've reached batch size
      if (this.queue.length === 1) {
        setTimeout(() => this.processBatch(), this.batchDelay)
      }
    })
  }

  private async processBatch() {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.batchSize)
    
    try {
      await Promise.allSettled(batch.map(loader => loader()))
    } catch (error) {
      console.error('Batch loading error:', error)
    }

    // Process next batch if there are more items
    if (this.queue.length > 0) {
      setTimeout(() => this.processBatch(), this.batchDelay)
    }
  }
}

// Global batch loader instance
export const globalBatchLoader = new BatchResourceLoader()