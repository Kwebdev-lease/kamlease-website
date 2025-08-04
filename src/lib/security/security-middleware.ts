/**
 * Security Middleware
 * Integrates all security measures for form submissions and API calls
 */

import { InputSanitizer, SanitizationOptions } from './input-sanitizer'
import { CSRFProtection, CSRFValidationResult } from './csrf-protection'
import { CredentialManager } from './credential-manager'
import { RateLimiter, RateLimitConfig } from './rate-limiter'

export interface SecurityConfig {
  enableCSRF: boolean
  enableRateLimit: boolean
  enableInputSanitization: boolean
  rateLimitConfig?: RateLimitConfig
  sanitizationOptions?: Record<string, SanitizationOptions>
}

export interface SecurityValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  sanitizedData?: any
  csrfToken?: string
  rateLimitInfo?: {
    remaining: number
    resetTime: number
    retryAfter?: number
  }
}

export interface SecureFormData {
  originalData: any
  sanitizedData: any
  csrfToken: string
  timestamp: number
  fingerprint: string
}

export class SecurityMiddleware {
  private static instance: SecurityMiddleware
  private inputSanitizer: InputSanitizer
  private csrfProtection: CSRFProtection
  private credentialManager: CredentialManager
  private rateLimiter: RateLimiter
  private initialized = false

  private constructor() {
    this.inputSanitizer = InputSanitizer.getInstance()
    this.csrfProtection = CSRFProtection.getInstance()
    this.credentialManager = CredentialManager.getInstance()
    this.rateLimiter = RateLimiter.getInstance()
  }

  public static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware()
    }
    return SecurityMiddleware.instance
  }

  /**
   * Initialize the security middleware
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      await this.credentialManager.initialize()
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize security middleware:', error)
      throw error
    }
  }

  /**
   * Validate and secure form data before submission
   */
  public async validateFormSubmission(
    formData: any,
    endpoint: string,
    config: SecurityConfig = this.getDefaultConfig()
  ): Promise<SecurityValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    let sanitizedData = formData
    let csrfToken: string | undefined
    let rateLimitInfo: any

    try {
      // Rate limiting check
      if (config.enableRateLimit) {
        const limitResult = this.rateLimiter.checkLimit(endpoint, config.rateLimitConfig)
        if (!limitResult.allowed) {
          errors.push(`Rate limit exceeded. Try again in ${limitResult.retryAfter} seconds.`)
          rateLimitInfo = {
            remaining: limitResult.remaining,
            resetTime: limitResult.resetTime,
            retryAfter: limitResult.retryAfter
          }
        } else {
          rateLimitInfo = {
            remaining: limitResult.remaining,
            resetTime: limitResult.resetTime
          }
        }
      }

      // Input sanitization
      if (config.enableInputSanitization) {
        const sanitizationResult = this.inputSanitizer.sanitizeFormData(
          formData,
          config.sanitizationOptions || {}
        )
        
        sanitizedData = sanitizationResult.sanitized

        // Check for security issues in sanitized data
        for (const [field, result] of Object.entries(sanitizationResult.report)) {
          const validation = this.inputSanitizer.validateSanitizedInput(result, field)
          if (!validation.isValid) {
            errors.push(...validation.errors)
          }
          if (result.wasSanitized && result.removedContent) {
            warnings.push(`Field ${field} was sanitized: ${result.removedContent.join(', ')}`)
          }
        }
      }

      // CSRF protection
      if (config.enableCSRF) {
        const token = formData.csrf_token || formData.csrfToken
        if (token) {
          const csrfResult = this.csrfProtection.validateToken(token)
          if (!csrfResult.isValid) {
            errors.push(`CSRF validation failed: ${csrfResult.error}`)
            if (csrfResult.newToken) {
              csrfToken = csrfResult.newToken
            }
          }
        } else {
          errors.push('CSRF token is required')
          csrfToken = this.csrfProtection.getTokenForForm()
        }
      }

      // Additional security checks
      const securityChecks = this.performAdditionalSecurityChecks(sanitizedData)
      errors.push(...securityChecks.errors)
      warnings.push(...securityChecks.warnings)

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedData,
        csrfToken,
        rateLimitInfo
      }

    } catch (error) {
      console.error('Security validation error:', error)
      return {
        isValid: false,
        errors: ['Security validation failed'],
        warnings: []
      }
    }
  }

  /**
   * Secure API request with all security measures
   */
  public async secureApiRequest(
    url: string,
    options: RequestInit = {},
    endpoint: string,
    config: SecurityConfig = this.getDefaultConfig()
  ): Promise<RequestInit> {
    const securedOptions = { ...options }
    const headers = new Headers(securedOptions.headers)

    // Add CSRF headers
    if (config.enableCSRF) {
      const csrfHeaders = this.csrfProtection.getHeaders()
      Object.entries(csrfHeaders).forEach(([key, value]) => {
        headers.set(key, value)
      })
    }

    // Add security headers
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'DENY')
    headers.set('X-XSS-Protection', '1; mode=block')

    // Rate limiting
    if (config.enableRateLimit) {
      const limitResult = this.rateLimiter.checkLimit(endpoint, config.rateLimitConfig)
      if (!limitResult.allowed) {
        throw new Error(`Rate limit exceeded for ${endpoint}. Retry after ${limitResult.retryAfter} seconds.`)
      }
    }

    securedOptions.headers = headers
    return securedOptions
  }

  /**
   * Create a secure form data object
   */
  public createSecureFormData(data: any): SecureFormData {
    const sanitizationResult = this.inputSanitizer.sanitizeFormData(data)
    const csrfToken = this.csrfProtection.getTokenForForm()
    const fingerprint = this.generateFingerprint(data)

    return {
      originalData: data,
      sanitizedData: sanitizationResult.sanitized,
      csrfToken,
      timestamp: Date.now(),
      fingerprint
    }
  }

  /**
   * Validate secure form data
   */
  public validateSecureFormData(secureData: SecureFormData): SecurityValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check timestamp (prevent replay attacks)
    const maxAge = 30 * 60 * 1000 // 30 minutes
    if (Date.now() - secureData.timestamp > maxAge) {
      errors.push('Form data has expired')
    }

    // Validate CSRF token
    const csrfResult = this.csrfProtection.validateToken(secureData.csrfToken)
    if (!csrfResult.isValid) {
      errors.push(`CSRF validation failed: ${csrfResult.error}`)
    }

    // Validate fingerprint
    const currentFingerprint = this.generateFingerprint(secureData.originalData)
    if (currentFingerprint !== secureData.fingerprint) {
      errors.push('Form data integrity check failed')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedData: secureData.sanitizedData
    }
  }

  /**
   * Get security headers for API responses
   */
  public getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    }
  }

  /**
   * Record successful/failed request for rate limiting
   */
  public recordRequest(endpoint: string, success: boolean): void {
    this.rateLimiter.recordRequest(endpoint, success)
  }

  /**
   * Get current security status
   */
  public getSecurityStatus(): {
    csrf: { hasToken: boolean; tokenAge: number }
    rateLimit: Record<string, any>
    credentials: { hasEncryption: boolean }
  } {
    const csrfToken = this.csrfProtection.getCurrentToken()
    
    return {
      csrf: {
        hasToken: !!csrfToken,
        tokenAge: csrfToken ? Date.now() - csrfToken.timestamp : 0
      },
      rateLimit: this.rateLimiter.getAllStatuses(),
      credentials: {
        hasEncryption: typeof window !== 'undefined' && !!window.crypto?.subtle
      }
    }
  }

  /**
   * Clear all security data (useful for logout)
   */
  public clearSecurityData(): void {
    this.csrfProtection.clearToken()
    this.credentialManager.clearAllCredentials()
    this.rateLimiter.resetAll()
  }

  /**
   * Get default security configuration
   */
  private getDefaultConfig(): SecurityConfig {
    return {
      enableCSRF: true,
      enableRateLimit: true,
      enableInputSanitization: true,
      rateLimitConfig: {
        maxRequests: 5,
        windowMs: 60 * 1000,
        blockDurationMs: 2 * 60 * 1000
      }
    }
  }

  /**
   * Perform additional security checks
   */
  private performAdditionalSecurityChecks(data: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\b(union|select|insert|delete|drop|create|alter)\b/i,
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i
    ]

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            warnings.push(`Suspicious content detected in field ${key}`)
            break
          }
        }

        // Check for excessive length
        if (value.length > 10000) {
          warnings.push(`Field ${key} contains unusually long content`)
        }

        // Check for binary content
        if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) {
          errors.push(`Field ${key} contains binary or control characters`)
        }
      }
    }

    return { errors, warnings }
  }

  /**
   * Generate a fingerprint for form data integrity
   */
  private generateFingerprint(data: any): string {
    const serialized = JSON.stringify(data, Object.keys(data).sort())
    
    // Simple hash function (in production, use a proper crypto hash)
    let hash = 0
    for (let i = 0; i < serialized.length; i++) {
      const char = serialized.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return hash.toString(36)
  }
}