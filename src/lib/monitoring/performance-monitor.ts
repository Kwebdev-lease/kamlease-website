/**
 * Performance Monitoring Service
 * Tracks and analyzes performance metrics for the appointment booking flow
 */

import { Logger } from './logger'

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percentage'
  timestamp: number
  category: string
  metadata?: any
}

export interface PerformanceThreshold {
  name: string
  warning: number
  critical: number
  unit: string
}

export interface PerformanceReport {
  period: {
    start: number
    end: number
  }
  metrics: PerformanceMetric[]
  violations: {
    warnings: PerformanceMetric[]
    critical: PerformanceMetric[]
  }
  summary: {
    totalOperations: number
    averageResponseTime: number
    errorRate: number
    slowestOperations: PerformanceMetric[]
  }
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private logger: Logger
  private metrics: PerformanceMetric[] = []
  private activeTimers: Map<string, number> = new Map()
  private thresholds: Map<string, PerformanceThreshold> = new Map()
  private observer: PerformanceObserver | null = null

  private constructor() {
    this.logger = Logger.getInstance()
    this.setupDefaultThresholds()
    this.setupPerformanceObserver()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  /**
   * Start timing an operation
   */
  public startTimer(operationName: string, metadata?: any): string {
    const timerId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.activeTimers.set(timerId, performance.now())
    
    this.logger.debug('performance', `Started timer for ${operationName}`, {
      timerId,
      operationName,
      metadata
    })
    
    return timerId
  }

  /**
   * End timing an operation
   */
  public endTimer(timerId: string, category: string = 'general', metadata?: any): number {
    const startTime = this.activeTimers.get(timerId)
    if (!startTime) {
      this.logger.warn('performance', `Timer ${timerId} not found`)
      return 0
    }

    const duration = performance.now() - startTime
    this.activeTimers.delete(timerId)

    // Extract operation name from timer ID
    const operationName = timerId.split('_')[0]
    
    this.recordMetric(operationName, duration, 'ms', category, metadata)
    
    return duration
  }

  /**
   * Record a performance metric
   */
  public recordMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percentage',
    category: string,
    metadata?: any
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      category,
      metadata
    }

    this.metrics.push(metric)
    
    // Keep only recent metrics (last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Check thresholds
    this.checkThresholds(metric)

    // Log the metric
    this.logger.logPerformance(name, value, { unit, category, metadata })
  }

  /**
   * Record API call performance
   */
  public recordApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    size?: number
  ): void {
    this.recordMetric(`api_${method.toLowerCase()}_${endpoint}`, duration, 'ms', 'api', {
      endpoint,
      method,
      status,
      size
    })

    if (size) {
      this.recordMetric(`api_response_size_${endpoint}`, size, 'bytes', 'api', {
        endpoint,
        method,
        status
      })
    }
  }

  /**
   * Record form submission performance
   */
  public recordFormSubmission(
    type: 'message' | 'appointment',
    duration: number,
    success: boolean,
    steps?: string[]
  ): void {
    this.recordMetric(`form_submission_${type}`, duration, 'ms', 'form', {
      type,
      success,
      steps
    })

    // Record success rate
    this.recordMetric(`form_success_rate_${type}`, success ? 1 : 0, 'count', 'form', {
      type
    })
  }

  /**
   * Record user interaction performance
   */
  public recordUserInteraction(
    action: string,
    component: string,
    duration: number,
    metadata?: any
  ): void {
    this.recordMetric(`interaction_${action}_${component}`, duration, 'ms', 'ui', {
      action,
      component,
      metadata
    })
  }

  /**
   * Record memory usage
   */
  public recordMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory
      
      this.recordMetric('memory_used', memory.usedJSHeapSize, 'bytes', 'system')
      this.recordMetric('memory_total', memory.totalJSHeapSize, 'bytes', 'system')
      this.recordMetric('memory_limit', memory.jsHeapSizeLimit, 'bytes', 'system')
      
      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      this.recordMetric('memory_usage_percentage', usagePercentage, 'percentage', 'system')
    }
  }

  /**
   * Record page load performance
   */
  public recordPageLoad(): void {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        this.recordMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart, 'ms', 'page')
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms', 'page')
        this.recordMetric('first_paint', navigation.responseEnd - navigation.fetchStart, 'ms', 'page')
      }
    }
  }

  /**
   * Get performance report for a time period
   */
  public getPerformanceReport(startTime?: number, endTime?: number): PerformanceReport {
    const start = startTime || (Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    const end = endTime || Date.now()

    const periodMetrics = this.metrics.filter(
      metric => metric.timestamp >= start && metric.timestamp <= end
    )

    const warnings: PerformanceMetric[] = []
    const critical: PerformanceMetric[] = []

    periodMetrics.forEach(metric => {
      const threshold = this.thresholds.get(metric.name)
      if (threshold) {
        if (metric.value >= threshold.critical) {
          critical.push(metric)
        } else if (metric.value >= threshold.warning) {
          warnings.push(metric)
        }
      }
    })

    // Calculate summary statistics
    const apiMetrics = periodMetrics.filter(m => m.category === 'api')
    const totalOperations = apiMetrics.length
    const averageResponseTime = totalOperations > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / totalOperations 
      : 0

    const errorMetrics = periodMetrics.filter(m => 
      m.name.includes('error') || (m.metadata && m.metadata.status >= 400)
    )
    const errorRate = totalOperations > 0 ? (errorMetrics.length / totalOperations) * 100 : 0

    const slowestOperations = periodMetrics
      .filter(m => m.unit === 'ms')
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)

    return {
      period: { start, end },
      metrics: periodMetrics,
      violations: { warnings, critical },
      summary: {
        totalOperations,
        averageResponseTime,
        errorRate,
        slowestOperations
      }
    }
  }

  /**
   * Get metrics by category
   */
  public getMetricsByCategory(category: string, limit: number = 100): PerformanceMetric[] {
    return this.metrics
      .filter(metric => metric.category === category)
      .slice(-limit)
  }

  /**
   * Get average metric value
   */
  public getAverageMetric(name: string, timeWindow: number = 60000): number {
    const cutoff = Date.now() - timeWindow
    const recentMetrics = this.metrics.filter(
      metric => metric.name === name && metric.timestamp >= cutoff
    )

    if (recentMetrics.length === 0) {
      return 0
    }

    return recentMetrics.reduce((sum, metric) => sum + metric.value, 0) / recentMetrics.length
  }

  /**
   * Set performance threshold
   */
  public setThreshold(name: string, warning: number, critical: number, unit: string): void {
    this.thresholds.set(name, { name, warning, critical, unit })
  }

  /**
   * Clear all metrics
   */
  public clearMetrics(): void {
    this.metrics = []
    this.activeTimers.clear()
  }

  /**
   * Export metrics for analysis
   */
  public exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      thresholds: Object.fromEntries(this.thresholds),
      timestamp: Date.now()
    }, null, 2)
  }

  /**
   * Setup default performance thresholds
   */
  private setupDefaultThresholds(): void {
    // API call thresholds
    this.setThreshold('api_post_calendar-api', 2000, 5000, 'ms')
    this.setThreshold('api_get_calendar-api', 1000, 3000, 'ms')
    
    // Form submission thresholds
    this.setThreshold('form_submission_appointment', 5000, 10000, 'ms')
    this.setThreshold('form_submission_message', 2000, 5000, 'ms')
    
    // UI interaction thresholds
    this.setThreshold('interaction_click_button', 100, 300, 'ms')
    this.setThreshold('interaction_input_field', 50, 150, 'ms')
    
    // Memory thresholds
    this.setThreshold('memory_usage_percentage', 70, 90, 'percentage')
    
    // Page load thresholds
    this.setThreshold('page_load_time', 3000, 6000, 'ms')
    this.setThreshold('dom_content_loaded', 2000, 4000, 'ms')
  }

  /**
   * Check if metric violates thresholds
   */
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name)
    if (!threshold) {
      return
    }

    if (metric.value >= threshold.critical) {
      this.logger.critical('performance', 
        `Critical performance threshold exceeded: ${metric.name} = ${metric.value}${metric.unit}`,
        undefined,
        { metric, threshold }
      )
    } else if (metric.value >= threshold.warning) {
      this.logger.warn('performance', 
        `Performance threshold warning: ${metric.name} = ${metric.value}${metric.unit}`,
        { metric, threshold }
      )
    }
  }

  /**
   * Setup Performance Observer for automatic metrics collection
   */
  private setupPerformanceObserver(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          
          entries.forEach(entry => {
            if (entry.entryType === 'measure') {
              this.recordMetric(entry.name, entry.duration, 'ms', 'browser')
            } else if (entry.entryType === 'navigation') {
              const nav = entry as PerformanceNavigationTiming
              this.recordMetric('navigation_duration', nav.duration, 'ms', 'browser')
            }
          })
        })

        this.observer.observe({ entryTypes: ['measure', 'navigation'] })
      } catch (error) {
        this.logger.warn('performance', 'Failed to setup PerformanceObserver', { error })
      }
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    this.clearMetrics()
  }
}