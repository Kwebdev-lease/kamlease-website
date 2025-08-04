/**
 * Error Tracking and Alerting Service
 * Tracks, categorizes, and alerts on API failures and application errors
 */

import { Logger } from './logger'

export interface ErrorEvent {
  id: string
  timestamp: number
  type: 'api' | 'validation' | 'security' | 'performance' | 'user' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
  context: {
    url?: string
    userAgent?: string
    userId?: string
    sessionId?: string
    component?: string
    operation?: string
    requestId?: string
  }
  metadata?: any
  resolved: boolean
  resolvedAt?: number
  resolvedBy?: string
}

export interface ErrorPattern {
  id: string
  pattern: RegExp
  type: ErrorEvent['type']
  severity: ErrorEvent['severity']
  description: string
  alertThreshold: number
  timeWindow: number // in milliseconds
}

export interface AlertRule {
  id: string
  name: string
  condition: (events: ErrorEvent[]) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  cooldown: number // in milliseconds
  lastTriggered?: number
}

export interface ErrorSummary {
  period: {
    start: number
    end: number
  }
  totalErrors: number
  errorsByType: Record<string, number>
  errorsBySeverity: Record<string, number>
  topErrors: Array<{
    message: string
    count: number
    lastOccurrence: number
  }>
  trends: {
    increasing: ErrorEvent[]
    decreasing: ErrorEvent[]
  }
}

export class ErrorTracker {
  private static instance: ErrorTracker
  private logger: Logger
  private errors: ErrorEvent[] = []
  private patterns: ErrorPattern[] = []
  private alertRules: AlertRule[] = []
  private maxStoredErrors = 1000

  private constructor() {
    this.logger = Logger.getInstance()
    this.setupDefaultPatterns()
    this.setupDefaultAlertRules()
    this.setupGlobalErrorHandlers()
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  /**
   * Track an error event
   */
  public trackError(
    type: ErrorEvent['type'],
    message: string,
    error?: Error,
    context?: Partial<ErrorEvent['context']>,
    metadata?: any
  ): string {
    const errorEvent: ErrorEvent = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      type,
      severity: this.determineSeverity(type, message, error),
      message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : undefined,
      context: {
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        sessionId: this.getSessionId(),
        ...context
      },
      metadata,
      resolved: false
    }

    // Apply pattern matching
    this.applyPatterns(errorEvent)

    // Store the error
    this.errors.push(errorEvent)
    
    // Maintain storage limit
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(-this.maxStoredErrors)
    }

    // Log the error
    this.logger.error('error-tracker', `${type} error: ${message}`, error, {
      errorId: errorEvent.id,
      severity: errorEvent.severity,
      context: errorEvent.context,
      metadata
    })

    // Check alert rules
    this.checkAlertRules()

    return errorEvent.id
  }

  /**
   * Track API error
   */
  public trackApiError(
    endpoint: string,
    method: string,
    status: number,
    error: Error,
    requestId?: string,
    requestData?: any
  ): string {
    return this.trackError('api', `API ${method} ${endpoint} failed with status ${status}`, error, {
      component: 'api-client',
      operation: `${method} ${endpoint}`,
      requestId
    }, {
      endpoint,
      method,
      status,
      requestData: this.sanitizeRequestData(requestData)
    })
  }

  /**
   * Track validation error
   */
  public trackValidationError(
    field: string,
    value: any,
    rule: string,
    component?: string
  ): string {
    return this.trackError('validation', `Validation failed for field ${field}: ${rule}`, undefined, {
      component,
      operation: 'validation'
    }, {
      field,
      value: typeof value === 'string' ? value.substring(0, 100) : value,
      rule
    })
  }

  /**
   * Track security error
   */
  public trackSecurityError(
    event: string,
    details: any,
    component?: string
  ): string {
    return this.trackError('security', `Security event: ${event}`, undefined, {
      component,
      operation: 'security-check'
    }, details)
  }

  /**
   * Track performance error
   */
  public trackPerformanceError(
    operation: string,
    duration: number,
    threshold: number,
    component?: string
  ): string {
    return this.trackError('performance', 
      `Performance threshold exceeded: ${operation} took ${duration}ms (threshold: ${threshold}ms)`,
      undefined,
      { component, operation },
      { duration, threshold }
    )
  }

  /**
   * Track user error
   */
  public trackUserError(
    action: string,
    error: Error,
    component?: string,
    userContext?: any
  ): string {
    return this.trackError('user', `User action failed: ${action}`, error, {
      component,
      operation: action
    }, userContext)
  }

  /**
   * Mark error as resolved
   */
  public resolveError(errorId: string, resolvedBy?: string): boolean {
    const error = this.errors.find(e => e.id === errorId)
    if (!error) {
      return false
    }

    error.resolved = true
    error.resolvedAt = Date.now()
    error.resolvedBy = resolvedBy

    this.logger.info('error-tracker', `Error ${errorId} marked as resolved`, {
      errorId,
      resolvedBy,
      originalError: error.message
    })

    return true
  }

  /**
   * Get error by ID
   */
  public getError(errorId: string): ErrorEvent | undefined {
    return this.errors.find(e => e.id === errorId)
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(count: number = 50, unresolved: boolean = false): ErrorEvent[] {
    let filteredErrors = this.errors
    
    if (unresolved) {
      filteredErrors = this.errors.filter(e => !e.resolved)
    }

    return filteredErrors.slice(-count)
  }

  /**
   * Get errors by type
   */
  public getErrorsByType(type: ErrorEvent['type'], count: number = 50): ErrorEvent[] {
    return this.errors
      .filter(e => e.type === type)
      .slice(-count)
  }

  /**
   * Get errors by severity
   */
  public getErrorsBySeverity(severity: ErrorEvent['severity'], count: number = 50): ErrorEvent[] {
    return this.errors
      .filter(e => e.severity === severity)
      .slice(-count)
  }

  /**
   * Get error summary for a time period
   */
  public getErrorSummary(startTime?: number, endTime?: number): ErrorSummary {
    const start = startTime || (Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    const end = endTime || Date.now()

    const periodErrors = this.errors.filter(
      error => error.timestamp >= start && error.timestamp <= end
    )

    // Count by type
    const errorsByType: Record<string, number> = {}
    periodErrors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1
    })

    // Count by severity
    const errorsBySeverity: Record<string, number> = {}
    periodErrors.forEach(error => {
      errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1
    })

    // Top errors by frequency
    const errorCounts = new Map<string, { count: number; lastOccurrence: number }>()
    periodErrors.forEach(error => {
      const key = error.message
      const existing = errorCounts.get(key)
      if (existing) {
        existing.count++
        existing.lastOccurrence = Math.max(existing.lastOccurrence, error.timestamp)
      } else {
        errorCounts.set(key, { count: 1, lastOccurrence: error.timestamp })
      }
    })

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      period: { start, end },
      totalErrors: periodErrors.length,
      errorsByType,
      errorsBySeverity,
      topErrors,
      trends: {
        increasing: [], // TODO: Implement trend analysis
        decreasing: []
      }
    }
  }

  /**
   * Add custom error pattern
   */
  public addPattern(pattern: ErrorPattern): void {
    this.patterns.push(pattern)
  }

  /**
   * Add custom alert rule
   */
  public addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
  }

  /**
   * Export error data
   */
  public exportErrors(): string {
    return JSON.stringify({
      errors: this.errors,
      patterns: this.patterns,
      alertRules: this.alertRules,
      timestamp: Date.now()
    }, null, 2)
  }

  /**
   * Clear all errors
   */
  public clearErrors(): void {
    this.errors = []
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Determine error severity based on type and content
   */
  private determineSeverity(
    type: ErrorEvent['type'],
    message: string,
    error?: Error
  ): ErrorEvent['severity'] {
    // Critical patterns
    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical'
    }

    // Type-based severity
    switch (type) {
      case 'security':
        return 'high'
      case 'api':
        if (error && (error as any).code === 'RATE_LIMIT_EXCEEDED') {
          return 'medium'
        }
        return 'high'
      case 'validation':
        return 'low'
      case 'performance':
        return 'medium'
      case 'user':
        return 'low'
      case 'system':
        return 'high'
      default:
        return 'medium'
    }
  }

  /**
   * Apply pattern matching to categorize errors
   */
  private applyPatterns(errorEvent: ErrorEvent): void {
    for (const pattern of this.patterns) {
      if (pattern.pattern.test(errorEvent.message)) {
        errorEvent.type = pattern.type
        errorEvent.severity = pattern.severity
        break
      }
    }
  }

  /**
   * Check alert rules and trigger alerts
   */
  private checkAlertRules(): void {
    const now = Date.now()
    
    for (const rule of this.alertRules) {
      // Check cooldown
      if (rule.lastTriggered && (now - rule.lastTriggered) < rule.cooldown) {
        continue
      }

      // Check condition
      if (rule.condition(this.errors)) {
        this.triggerAlert(rule)
        rule.lastTriggered = now
      }
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule): void {
    this.logger.critical('error-tracker', `Alert triggered: ${rule.name}`, undefined, {
      alertRule: rule.id,
      severity: rule.severity
    })

    // In a real application, you might send notifications here
    // e.g., email, Slack, webhook, etc.
  }

  /**
   * Setup default error patterns
   */
  private setupDefaultPatterns(): void {
    this.patterns = [
      {
        id: 'rate-limit',
        pattern: /rate limit|too many requests/i,
        type: 'api',
        severity: 'medium',
        description: 'Rate limiting errors',
        alertThreshold: 5,
        timeWindow: 60000
      },
      {
        id: 'auth-failure',
        pattern: /unauthorized|authentication|invalid token/i,
        type: 'security',
        severity: 'high',
        description: 'Authentication failures',
        alertThreshold: 3,
        timeWindow: 300000
      },
      {
        id: 'validation-error',
        pattern: /validation|invalid input|required field/i,
        type: 'validation',
        severity: 'low',
        description: 'Input validation errors',
        alertThreshold: 10,
        timeWindow: 300000
      }
    ]
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (errors) => {
          const recentErrors = errors.filter(e => 
            Date.now() - e.timestamp < 300000 && // Last 5 minutes
            e.severity === 'high' || e.severity === 'critical'
          )
          return recentErrors.length >= 5
        },
        severity: 'critical',
        cooldown: 600000 // 10 minutes
      },
      {
        id: 'api-failures',
        name: 'Multiple API Failures',
        condition: (errors) => {
          const apiErrors = errors.filter(e => 
            Date.now() - e.timestamp < 180000 && // Last 3 minutes
            e.type === 'api'
          )
          return apiErrors.length >= 3
        },
        severity: 'high',
        cooldown: 300000 // 5 minutes
      },
      {
        id: 'security-incidents',
        name: 'Security Incidents',
        condition: (errors) => {
          const securityErrors = errors.filter(e => 
            Date.now() - e.timestamp < 600000 && // Last 10 minutes
            e.type === 'security'
          )
          return securityErrors.length >= 1
        },
        severity: 'critical',
        cooldown: 1800000 // 30 minutes
      }
    ]
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled JavaScript errors
      window.addEventListener('error', (event) => {
        this.trackError('system', 'Unhandled JavaScript error', event.error, {
          component: 'global-handler',
          operation: 'error-event'
        }, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        })
      })

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError('system', 'Unhandled promise rejection', 
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          {
            component: 'global-handler',
            operation: 'promise-rejection'
          }
        )
      })
    }
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    try {
      return sessionStorage.getItem('session_id') || 'unknown'
    } catch {
      return 'unknown'
    }
  }

  /**
   * Sanitize request data for logging
   */
  private sanitizeRequestData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = { ...data }
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }

    return sanitized
  }
}