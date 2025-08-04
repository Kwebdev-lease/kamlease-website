/**
 * Structured Logging Service
 * Provides comprehensive logging for calendar API interactions and user activities
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: any
  userId?: string
  sessionId?: string
  requestId?: string
  userAgent?: string
  url?: string
  duration?: number
  error?: {
    name: string
    message: string
    stack?: string
    code?: string
  }
}

export interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableStorage: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  maxStorageEntries: number
  sensitiveFields: string[]
}

export class Logger {
  private static instance: Logger
  private config: LoggerConfig
  private sessionId: string
  private logBuffer: LogEntry[] = []
  private flushTimer: NodeJS.Timeout | null = null

  private constructor() {
    this.config = this.getDefaultConfig()
    this.sessionId = this.generateSessionId()
    this.setupPeriodicFlush()
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Configure the logger
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Log debug message
   */
  public debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data)
  }

  /**
   * Log info message
   */
  public info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data)
  }

  /**
   * Log warning message
   */
  public warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data)
  }

  /**
   * Log error message
   */
  public error(category: string, message: string, error?: Error, data?: any): void {
    const logData = {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : undefined
    }
    this.log(LogLevel.ERROR, category, message, logData)
  }

  /**
   * Log critical message
   */
  public critical(category: string, message: string, error?: Error, data?: any): void {
    const logData = {
      ...data,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: (error as any).code
      } : undefined
    }
    this.log(LogLevel.CRITICAL, category, message, logData)
  }

  /**
   * Log API request
   */
  public logApiRequest(
    endpoint: string,
    method: string,
    url: string,
    requestData?: any,
    requestId?: string
  ): void {
    this.info('api-request', `${method} ${endpoint}`, {
      url,
      method,
      endpoint,
      requestId,
      requestData: this.sanitizeData(requestData)
    })
  }

  /**
   * Log API response
   */
  public logApiResponse(
    endpoint: string,
    method: string,
    status: number,
    duration: number,
    responseData?: any,
    requestId?: string
  ): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.log(level, 'api-response', `${method} ${endpoint} - ${status}`, {
      endpoint,
      method,
      status,
      duration,
      requestId,
      responseData: this.sanitizeData(responseData)
    })
  }

  /**
   * Log user interaction
   */
  public logUserInteraction(
    action: string,
    component: string,
    data?: any
  ): void {
    this.info('user-interaction', `${action} on ${component}`, {
      action,
      component,
      data: this.sanitizeData(data)
    })
  }

  /**
   * Log performance metric
   */
  public logPerformance(
    operation: string,
    duration: number,
    metadata?: any
  ): void {
    this.info('performance', `${operation} completed in ${duration}ms`, {
      operation,
      duration,
      metadata: this.sanitizeData(metadata)
    })
  }

  /**
   * Log security event
   */
  public logSecurityEvent(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: any
  ): void {
    const level = severity === 'critical' ? LogLevel.CRITICAL : 
                 severity === 'high' ? LogLevel.ERROR :
                 severity === 'medium' ? LogLevel.WARN : LogLevel.INFO

    this.log(level, 'security', `Security event: ${event}`, {
      event,
      severity,
      details: this.sanitizeData(details)
    })
  }

  /**
   * Create a timer for measuring operation duration
   */
  public startTimer(operation: string): () => void {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      this.logPerformance(operation, duration)
    }
  }

  /**
   * Get recent log entries
   */
  public getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count)
  }

  /**
   * Get logs by category
   */
  public getLogsByCategory(category: string, count: number = 50): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.category === category)
      .slice(-count)
  }

  /**
   * Get error logs
   */
  public getErrorLogs(count: number = 50): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level >= LogLevel.ERROR)
      .slice(-count)
  }

  /**
   * Export logs for debugging
   */
  public exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2)
  }

  /**
   * Clear log buffer
   */
  public clearLogs(): void {
    this.logBuffer = []
    this.clearStoredLogs()
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, category: string, message: string, data?: any): void {
    if (level < this.config.minLevel) {
      return
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: this.sanitizeData(data),
      sessionId: this.sessionId,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    }

    // Add to buffer
    this.logBuffer.push(entry)
    
    // Maintain buffer size
    if (this.logBuffer.length > this.config.maxStorageEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxStorageEntries)
    }

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry)
    }

    // Store locally if enabled
    if (this.config.enableStorage) {
      this.storeLocally(entry)
    }

    // Send to remote endpoint if enabled and critical
    if (this.config.enableRemote && level >= LogLevel.ERROR) {
      this.sendToRemote(entry)
    }
  }

  /**
   * Output log entry to console
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${LogLevel[entry.level]}] [${entry.category}]`
    const message = `${prefix} ${entry.message}`

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data)
        break
      case LogLevel.INFO:
        console.info(message, entry.data)
        break
      case LogLevel.WARN:
        console.warn(message, entry.data)
        break
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(message, entry.data)
        break
    }
  }

  /**
   * Store log entry locally
   */
  private storeLocally(entry: LogEntry): void {
    try {
      const stored = localStorage.getItem('app_logs') || '[]'
      const logs = JSON.parse(stored) as LogEntry[]
      logs.push(entry)
      
      // Keep only recent entries
      const recentLogs = logs.slice(-this.config.maxStorageEntries)
      localStorage.setItem('app_logs', JSON.stringify(recentLogs))
    } catch (error) {
      console.warn('Failed to store log entry:', error)
    }
  }

  /**
   * Send log entry to remote endpoint
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return
    }

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      })
    } catch (error) {
      console.warn('Failed to send log to remote endpoint:', error)
    }
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data
    }

    const sanitized = { ...data }
    
    for (const field of this.config.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]'
      }
    }

    // Recursively sanitize nested objects
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value)
      }
    }

    return sanitized
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Setup periodic log flushing
   */
  private setupPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushLogs()
    }, 30000) // Flush every 30 seconds
  }

  /**
   * Flush logs to storage/remote
   */
  private flushLogs(): void {
    if (this.config.enableRemote && this.logBuffer.length > 0) {
      // Send batch of logs to remote endpoint
      const logsToSend = this.logBuffer.slice()
      this.sendBatchToRemote(logsToSend)
    }
  }

  /**
   * Send batch of logs to remote endpoint
   */
  private async sendBatchToRemote(logs: LogEntry[]): Promise<void> {
    if (!this.config.remoteEndpoint) {
      return
    }

    try {
      await fetch(`${this.config.remoteEndpoint}/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs })
      })
    } catch (error) {
      console.warn('Failed to send log batch to remote endpoint:', error)
    }
  }

  /**
   * Clear stored logs
   */
  private clearStoredLogs(): void {
    try {
      localStorage.removeItem('app_logs')
    } catch (error) {
      console.warn('Failed to clear stored logs:', error)
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): LoggerConfig {
    return {
      minLevel: LogLevel.INFO,
      enableConsole: true,
      enableStorage: true,
      enableRemote: false,
      maxStorageEntries: 1000,
      sensitiveFields: [
        'password',
        'token',
        'secret',
        'key',
        'authorization',
        'csrf_token',
        'access_token',
        'refresh_token',
        'client_secret'
      ]
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    this.flushLogs()
  }
}