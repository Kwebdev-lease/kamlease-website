/**
 * Rate Limiting Service
 * Provides client-side rate limiting for API calls and form submissions
 */

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  blockDurationMs?: number
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

export interface RequestRecord {
  timestamp: number
  success: boolean
  endpoint: string
}

export class RateLimiter {
  private static instance: RateLimiter
  private requestHistory: Map<string, RequestRecord[]> = new Map()
  private blockedUntil: Map<string, number> = new Map()
  
  // Default configurations for different endpoints
  private readonly defaultConfigs: Record<string, RateLimitConfig> = {
    'calendar-api': {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000, // 5 minutes
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    'form-submission': {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 2 * 60 * 1000, // 2 minutes
      skipSuccessfulRequests: true,
      skipFailedRequests: false
    },
    'auth-token': {
      maxRequests: 3,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 10 * 60 * 1000, // 10 minutes
      skipSuccessfulRequests: true,
      skipFailedRequests: false
    },
    'general': {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 60 * 1000, // 1 minute
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }
  }
  
  private constructor() {
    // Clean up old records periodically
    setInterval(() => this.cleanup(), 5 * 60 * 1000) // Every 5 minutes
  }
  
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter()
    }
    return RateLimiter.instance
  }

  /**
   * Check if a request is allowed
   */
  public checkLimit(endpoint: string, config?: RateLimitConfig): RateLimitResult {
    const effectiveConfig = config || this.defaultConfigs[endpoint] || this.defaultConfigs.general
    const now = Date.now()
    const key = this.getKey(endpoint)

    // Check if currently blocked
    const blockedUntil = this.blockedUntil.get(key)
    if (blockedUntil && now < blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockedUntil,
        retryAfter: Math.ceil((blockedUntil - now) / 1000)
      }
    }

    // Get request history for this endpoint
    const history = this.requestHistory.get(key) || []
    
    // Filter requests within the time window
    const windowStart = now - effectiveConfig.windowMs
    const recentRequests = history.filter(record => record.timestamp > windowStart)

    // Count relevant requests based on config
    let requestCount = 0
    for (const record of recentRequests) {
      const shouldCount = this.shouldCountRequest(record, effectiveConfig)
      if (shouldCount) {
        requestCount++
      }
    }

    const remaining = Math.max(0, effectiveConfig.maxRequests - requestCount)
    const resetTime = windowStart + effectiveConfig.windowMs

    if (requestCount >= effectiveConfig.maxRequests) {
      // Rate limit exceeded - block if configured
      if (effectiveConfig.blockDurationMs) {
        const blockUntil = now + effectiveConfig.blockDurationMs
        this.blockedUntil.set(key, blockUntil)
        
        return {
          allowed: false,
          remaining: 0,
          resetTime: blockUntil,
          retryAfter: Math.ceil(effectiveConfig.blockDurationMs / 1000)
        }
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      }
    }

    return {
      allowed: true,
      remaining,
      resetTime
    }
  }

  /**
   * Record a request attempt
   */
  public recordRequest(endpoint: string, success: boolean): void {
    const key = this.getKey(endpoint)
    const now = Date.now()

    const history = this.requestHistory.get(key) || []
    history.push({
      timestamp: now,
      success,
      endpoint
    })

    this.requestHistory.set(key, history)
  }

  /**
   * Create a rate-limited wrapper for async functions
   */
  public createRateLimitedFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    endpoint: string,
    config?: RateLimitConfig
  ): T {
    return (async (...args: any[]) => {
      const limitResult = this.checkLimit(endpoint, config)
      
      if (!limitResult.allowed) {
        const error = new Error(`Rate limit exceeded for ${endpoint}`)
        ;(error as any).rateLimitInfo = limitResult
        ;(error as any).code = 'RATE_LIMIT_EXCEEDED'
        throw error
      }

      try {
        const result = await fn(...args)
        this.recordRequest(endpoint, true)
        return result
      } catch (error) {
        this.recordRequest(endpoint, false)
        throw error
      }
    }) as T
  }

  /**
   * Get rate limit status for an endpoint
   */
  public getStatus(endpoint: string, config?: RateLimitConfig): RateLimitResult {
    return this.checkLimit(endpoint, config)
  }

  /**
   * Reset rate limit for an endpoint
   */
  public reset(endpoint: string): void {
    const key = this.getKey(endpoint)
    this.requestHistory.delete(key)
    this.blockedUntil.delete(key)
  }

  /**
   * Reset all rate limits
   */
  public resetAll(): void {
    this.requestHistory.clear()
    this.blockedUntil.clear()
  }

  /**
   * Get current request count for an endpoint
   */
  public getCurrentCount(endpoint: string, config?: RateLimitConfig): number {
    const effectiveConfig = config || this.defaultConfigs[endpoint] || this.defaultConfigs.general
    const key = this.getKey(endpoint)
    const history = this.requestHistory.get(key) || []
    const now = Date.now()
    const windowStart = now - effectiveConfig.windowMs

    return history
      .filter(record => record.timestamp > windowStart)
      .filter(record => this.shouldCountRequest(record, effectiveConfig))
      .length
  }

  /**
   * Add custom rate limit configuration
   */
  public addConfig(endpoint: string, config: RateLimitConfig): void {
    this.defaultConfigs[endpoint] = config
  }

  /**
   * Get all current rate limit statuses
   */
  public getAllStatuses(): Record<string, RateLimitResult> {
    const statuses: Record<string, RateLimitResult> = {}
    
    for (const [key, history] of this.requestHistory.entries()) {
      if (history.length > 0) {
        const endpoint = history[0].endpoint
        statuses[endpoint] = this.getStatus(endpoint)
      }
    }

    return statuses
  }

  /**
   * Generate a key for storing rate limit data
   */
  private getKey(endpoint: string): string {
    // In a real application, you might want to include user ID or IP
    return `ratelimit_${endpoint}`
  }

  /**
   * Determine if a request should be counted based on configuration
   */
  private shouldCountRequest(record: RequestRecord, config: RateLimitConfig): boolean {
    if (config.skipSuccessfulRequests && record.success) {
      return false
    }
    
    if (config.skipFailedRequests && !record.success) {
      return false
    }
    
    return true
  }

  /**
   * Clean up old request records
   */
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour

    // Clean up request history
    for (const [key, history] of this.requestHistory.entries()) {
      const filtered = history.filter(record => (now - record.timestamp) < maxAge)
      if (filtered.length === 0) {
        this.requestHistory.delete(key)
      } else {
        this.requestHistory.set(key, filtered)
      }
    }

    // Clean up expired blocks
    for (const [key, blockedUntil] of this.blockedUntil.entries()) {
      if (now >= blockedUntil) {
        this.blockedUntil.delete(key)
      }
    }
  }

  /**
   * Export rate limit data for debugging
   */
  public exportData(): {
    requestHistory: Record<string, RequestRecord[]>
    blockedUntil: Record<string, number>
    configs: Record<string, RateLimitConfig>
  } {
    return {
      requestHistory: Object.fromEntries(this.requestHistory),
      blockedUntil: Object.fromEntries(this.blockedUntil),
      configs: { ...this.defaultConfigs }
    }
  }
}