/**
 * Monitoring Service
 * Integrates all monitoring components and provides a unified interface
 */

import { Logger, LogLevel } from './logger'
import { PerformanceMonitor } from './performance-monitor'
import { ErrorTracker } from './error-tracker'
import { Analytics } from './analytics'

export interface MonitoringConfig {
  logging: {
    enabled: boolean
    level: LogLevel
    enableConsole: boolean
    enableStorage: boolean
    enableRemote: boolean
    remoteEndpoint?: string
  }
  performance: {
    enabled: boolean
    enableAutoCollection: boolean
    thresholds: Record<string, { warning: number; critical: number }>
  }
  errorTracking: {
    enabled: boolean
    enableGlobalHandlers: boolean
    alertThresholds: Record<string, number>
  }
  analytics: {
    enabled: boolean
    enableUserTracking: boolean
    enableFormTracking: boolean
  }
}

export interface MonitoringStatus {
  isHealthy: boolean
  services: {
    logging: { status: 'active' | 'inactive' | 'error'; lastActivity?: number }
    performance: { status: 'active' | 'inactive' | 'error'; lastActivity?: number }
    errorTracking: { status: 'active' | 'inactive' | 'error'; lastActivity?: number }
    analytics: { status: 'active' | 'inactive' | 'error'; lastActivity?: number }
  }
  metrics: {
    totalLogs: number
    totalErrors: number
    totalInteractions: number
    averagePerformance: number
  }
}

export interface MonitoringDashboard {
  overview: {
    status: MonitoringStatus
    recentActivity: Array<{
      timestamp: number
      service: string
      type: string
      message: string
      severity: string
    }>
  }
  performance: {
    currentMetrics: Array<{
      name: string
      value: number
      unit: string
      status: 'good' | 'warning' | 'critical'
    }>
    trends: Array<{
      name: string
      data: Array<{ timestamp: number; value: number }>
    }>
  }
  errors: {
    recentErrors: Array<{
      timestamp: number
      type: string
      message: string
      severity: string
      resolved: boolean
    }>
    errorRate: number
    topErrorSources: Array<{
      source: string
      count: number
      percentage: number
    }>
  }
  analytics: {
    userActivity: {
      activeSessions: number
      totalInteractions: number
      conversionRate: number
    }
    topActions: Array<{
      action: string
      component: string
      count: number
    }>
  }
}

export class MonitoringService {
  private static instance: MonitoringService
  private logger: Logger
  private performanceMonitor: PerformanceMonitor
  private errorTracker: ErrorTracker
  private analytics: Analytics
  private config: MonitoringConfig
  private initialized = false

  private constructor() {
    this.logger = Logger.getInstance()
    this.performanceMonitor = PerformanceMonitor.getInstance()
    this.errorTracker = ErrorTracker.getInstance()
    this.analytics = Analytics.getInstance()
    this.config = this.getDefaultConfig()
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  /**
   * Initialize monitoring service with configuration
   */
  public async initialize(config?: Partial<MonitoringConfig>): Promise<void> {
    if (this.initialized) {
      return
    }

    // Merge configuration
    if (config) {
      this.config = this.mergeConfig(this.config, config)
    }

    try {
      // Configure logger
      if (this.config.logging.enabled) {
        this.logger.configure({
          minLevel: this.config.logging.level,
          enableConsole: this.config.logging.enableConsole,
          enableStorage: this.config.logging.enableStorage,
          enableRemote: this.config.logging.enableRemote,
          remoteEndpoint: this.config.logging.remoteEndpoint,
          maxStorageEntries: 1000,
          sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization']
        })
      }

      // Configure performance monitoring
      if (this.config.performance.enabled) {
        Object.entries(this.config.performance.thresholds).forEach(([name, threshold]) => {
          this.performanceMonitor.setThreshold(name, threshold.warning, threshold.critical, 'ms')
        })
      }

      // Configure analytics
      this.analytics.setTrackingEnabled(this.config.analytics.enabled)

      this.initialized = true
      this.logger.info('monitoring', 'Monitoring service initialized', { config: this.config })

    } catch (error) {
      this.logger.error('monitoring', 'Failed to initialize monitoring service', error as Error)
      throw error
    }
  }

  /**
   * Get monitoring status
   */
  public getStatus(): MonitoringStatus {
    const now = Date.now()
    
    // Check service health
    const recentLogs = this.logger.getRecentLogs(10)
    const recentErrors = this.errorTracker.getRecentErrors(10)
    const currentSession = this.analytics.getCurrentSession()
    const recentMetrics = this.performanceMonitor.getMetricsByCategory('api', 10)

    const services = {
      logging: {
        status: recentLogs.length > 0 ? 'active' as const : 'inactive' as const,
        lastActivity: recentLogs.length > 0 ? recentLogs[recentLogs.length - 1].timestamp : undefined
      },
      performance: {
        status: recentMetrics.length > 0 ? 'active' as const : 'inactive' as const,
        lastActivity: recentMetrics.length > 0 ? recentMetrics[recentMetrics.length - 1].timestamp : undefined
      },
      errorTracking: {
        status: 'active' as const,
        lastActivity: recentErrors.length > 0 ? recentErrors[recentErrors.length - 1].timestamp : undefined
      },
      analytics: {
        status: currentSession ? 'active' as const : 'inactive' as const,
        lastActivity: currentSession?.startTime
      }
    }

    const isHealthy = Object.values(services).every(service => service.status !== 'error')

    return {
      isHealthy,
      services,
      metrics: {
        totalLogs: recentLogs.length,
        totalErrors: recentErrors.filter(e => !e.resolved).length,
        totalInteractions: currentSession?.interactions.length || 0,
        averagePerformance: this.performanceMonitor.getAverageMetric('api_response_time', 300000)
      }
    }
  }

  /**
   * Get comprehensive monitoring dashboard data
   */
  public getDashboard(): MonitoringDashboard {
    const status = this.getStatus()
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // Recent activity
    const recentLogs = this.logger.getRecentLogs(20)
    const recentErrors = this.errorTracker.getRecentErrors(10)
    const recentActivity = [
      ...recentLogs.map(log => ({
        timestamp: new Date(log.timestamp).getTime(),
        service: 'logging',
        type: log.category,
        message: log.message,
        severity: LogLevel[log.level].toLowerCase()
      })),
      ...recentErrors.map(error => ({
        timestamp: error.timestamp,
        service: 'error-tracking',
        type: error.type,
        message: error.message,
        severity: error.severity
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)

    // Performance metrics
    const performanceReport = this.performanceMonitor.getPerformanceReport(oneHourAgo, now)
    const currentMetrics = [
      {
        name: 'API Response Time',
        value: this.performanceMonitor.getAverageMetric('api_response_time', 300000),
        unit: 'ms',
        status: this.getMetricStatus('api_response_time', this.performanceMonitor.getAverageMetric('api_response_time', 300000))
      },
      {
        name: 'Form Submission Time',
        value: this.performanceMonitor.getAverageMetric('form_submission_time', 300000),
        unit: 'ms',
        status: this.getMetricStatus('form_submission_time', this.performanceMonitor.getAverageMetric('form_submission_time', 300000))
      },
      {
        name: 'Memory Usage',
        value: this.performanceMonitor.getAverageMetric('memory_usage_percentage', 300000),
        unit: '%',
        status: this.getMetricStatus('memory_usage_percentage', this.performanceMonitor.getAverageMetric('memory_usage_percentage', 300000))
      }
    ]

    // Error analysis
    const errorSummary = this.errorTracker.getErrorSummary(oneHourAgo, now)
    const recentErrorsForDashboard = this.errorTracker.getRecentErrors(20).map(error => ({
      timestamp: error.timestamp,
      type: error.type,
      message: error.message,
      severity: error.severity,
      resolved: error.resolved
    }))

    const topErrorSources = Object.entries(errorSummary.errorsByType).map(([source, count]) => ({
      source,
      count,
      percentage: errorSummary.totalErrors > 0 ? (count / errorSummary.totalErrors) * 100 : 0
    })).sort((a, b) => b.count - a.count).slice(0, 5)

    // Analytics data
    const analyticsReport = this.analytics.getAnalyticsReport(oneHourAgo, now)
    const currentSession = this.analytics.getCurrentSession()
    
    const topActions = analyticsReport.interactions.mostCommon.slice(0, 5)

    return {
      overview: {
        status,
        recentActivity
      },
      performance: {
        currentMetrics,
        trends: [] // TODO: Implement trend data collection
      },
      errors: {
        recentErrors: recentErrorsForDashboard,
        errorRate: errorSummary.totalErrors,
        topErrorSources
      },
      analytics: {
        userActivity: {
          activeSessions: currentSession ? 1 : 0,
          totalInteractions: analyticsReport.interactions.total,
          conversionRate: analyticsReport.forms.successRate
        },
        topActions
      }
    }
  }

  /**
   * Track calendar API interaction
   */
  public trackCalendarApiCall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    success: boolean,
    error?: Error
  ): void {
    // Performance tracking
    this.performanceMonitor.recordApiCall(endpoint, method, duration, status)

    // Error tracking
    if (!success && error) {
      this.errorTracker.trackApiError(endpoint, method, status, error)
    }

    // Analytics tracking
    this.analytics.trackCustomEvent('calendar-api', `${method.toLowerCase()}_${endpoint}`, {
      status,
      duration
    }, duration, success)

    // Logging
    this.logger.logApiResponse(endpoint, method, status, duration, undefined)
  }

  /**
   * Track form submission
   */
  public trackFormSubmission(
    type: 'message' | 'appointment',
    duration: number,
    success: boolean,
    errors?: string[]
  ): void {
    // Performance tracking
    this.performanceMonitor.recordFormSubmission(type, duration, success)

    // Error tracking
    if (!success && errors) {
      errors.forEach(error => {
        this.errorTracker.trackValidationError('form', type, error, 'contact-form')
      })
    }

    // Analytics tracking
    this.analytics.trackFormSubmission(type, success, duration, errors)

    // Logging
    this.logger.info('form-submission', `Form submission ${type}: ${success ? 'success' : 'failed'}`, {
      type,
      duration,
      success,
      errors
    })
  }

  /**
   * Track security event
   */
  public trackSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: any
  ): void {
    // Error tracking
    this.errorTracker.trackSecurityError(event, details, 'security-middleware')

    // Analytics tracking
    this.analytics.trackCustomEvent('security', event, details)

    // Logging
    this.logger.logSecurityEvent(event, severity, details)
  }

  /**
   * Export all monitoring data
   */
  public exportData(): string {
    return JSON.stringify({
      logs: this.logger.getRecentLogs(1000),
      errors: this.errorTracker.getRecentErrors(500),
      performance: this.performanceMonitor.exportMetrics(),
      analytics: this.analytics.exportData(),
      status: this.getStatus(),
      timestamp: Date.now()
    }, null, 2)
  }

  /**
   * Clear all monitoring data
   */
  public clearData(): void {
    this.logger.clearLogs()
    this.errorTracker.clearErrors()
    this.performanceMonitor.clearMetrics()
    this.analytics.clearData()
    
    this.logger.info('monitoring', 'All monitoring data cleared')
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): MonitoringConfig {
    return {
      logging: {
        enabled: true,
        level: LogLevel.INFO,
        enableConsole: true,
        enableStorage: true,
        enableRemote: false
      },
      performance: {
        enabled: true,
        enableAutoCollection: true,
        thresholds: {
          'api_response_time': { warning: 2000, critical: 5000 },
          'form_submission_time': { warning: 3000, critical: 8000 },
          'memory_usage_percentage': { warning: 70, critical: 90 }
        }
      },
      errorTracking: {
        enabled: true,
        enableGlobalHandlers: true,
        alertThresholds: {
          'high_error_rate': 5,
          'api_failures': 3,
          'security_incidents': 1
        }
      },
      analytics: {
        enabled: true,
        enableUserTracking: true,
        enableFormTracking: true
      }
    }
  }

  /**
   * Merge configuration objects
   */
  private mergeConfig(base: MonitoringConfig, override: Partial<MonitoringConfig>): MonitoringConfig {
    return {
      logging: { ...base.logging, ...override.logging },
      performance: { ...base.performance, ...override.performance },
      errorTracking: { ...base.errorTracking, ...override.errorTracking },
      analytics: { ...base.analytics, ...override.analytics }
    }
  }

  /**
   * Get metric status based on thresholds
   */
  private getMetricStatus(metricName: string, value: number): 'good' | 'warning' | 'critical' {
    const threshold = this.config.performance.thresholds[metricName]
    if (!threshold) {
      return 'good'
    }

    if (value >= threshold.critical) {
      return 'critical'
    } else if (value >= threshold.warning) {
      return 'warning'
    } else {
      return 'good'
    }
  }
}