/**
 * CSRF Protection Service
 * Provides Cross-Site Request Forgery protection for form submissions
 */

export interface CSRFToken {
  token: string
  timestamp: number
  sessionId: string
}

export interface CSRFValidationResult {
  isValid: boolean
  error?: string
  newToken?: string
}

export class CSRFProtection {
  private static instance: CSRFProtection
  private readonly TOKEN_EXPIRY = 30 * 60 * 1000 // 30 minutes
  private readonly TOKEN_LENGTH = 32
  private currentToken: CSRFToken | null = null
  
  private constructor() {}
  
  public static getInstance(): CSRFProtection {
    if (!CSRFProtection.instance) {
      CSRFProtection.instance = new CSRFProtection()
    }
    return CSRFProtection.instance
  }

  /**
   * Generate a new CSRF token
   */
  public generateToken(): CSRFToken {
    const token = this.generateRandomToken()
    const sessionId = this.getOrCreateSessionId()
    
    this.currentToken = {
      token,
      timestamp: Date.now(),
      sessionId
    }

    // Store in sessionStorage for persistence across page reloads
    try {
      sessionStorage.setItem('csrf_token', JSON.stringify(this.currentToken))
    } catch (error) {
      console.warn('Failed to store CSRF token in sessionStorage:', error)
    }

    return this.currentToken
  }

  /**
   * Get current CSRF token, generating one if needed
   */
  public getCurrentToken(): CSRFToken {
    // Try to load from sessionStorage first
    if (!this.currentToken) {
      try {
        const stored = sessionStorage.getItem('csrf_token')
        if (stored) {
          const parsed = JSON.parse(stored) as CSRFToken
          if (this.isTokenValid(parsed)) {
            this.currentToken = parsed
          }
        }
      } catch (error) {
        console.warn('Failed to load CSRF token from sessionStorage:', error)
      }
    }

    // Generate new token if none exists or current is expired
    if (!this.currentToken || !this.isTokenValid(this.currentToken)) {
      return this.generateToken()
    }

    return this.currentToken
  }

  /**
   * Validate a CSRF token
   */
  public validateToken(submittedToken: string): CSRFValidationResult {
    const currentToken = this.getCurrentToken()

    // Check if token matches
    if (submittedToken !== currentToken.token) {
      return {
        isValid: false,
        error: 'Invalid CSRF token'
      }
    }

    // Check if token is expired
    if (!this.isTokenValid(currentToken)) {
      const newToken = this.generateToken()
      return {
        isValid: false,
        error: 'CSRF token expired',
        newToken: newToken.token
      }
    }

    // Check session consistency
    const currentSessionId = this.getOrCreateSessionId()
    if (currentToken.sessionId !== currentSessionId) {
      return {
        isValid: false,
        error: 'Session mismatch'
      }
    }

    return { isValid: true }
  }

  /**
   * Refresh the current token (useful for long-running sessions)
   */
  public refreshToken(): CSRFToken {
    return this.generateToken()
  }

  /**
   * Clear the current token (useful for logout)
   */
  public clearToken(): void {
    this.currentToken = null
    try {
      sessionStorage.removeItem('csrf_token')
    } catch (error) {
      console.warn('Failed to clear CSRF token from sessionStorage:', error)
    }
  }

  /**
   * Get token for form inclusion
   */
  public getTokenForForm(): string {
    return this.getCurrentToken().token
  }

  /**
   * Create CSRF meta tag for HTML head
   */
  public createMetaTag(): string {
    const token = this.getCurrentToken().token
    return `<meta name="csrf-token" content="${token}">`
  }

  /**
   * Get CSRF headers for API requests
   */
  public getHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': this.getCurrentToken().token,
      'X-Requested-With': 'XMLHttpRequest'
    }
  }

  /**
   * Check if a token is valid (not expired)
   */
  private isTokenValid(token: CSRFToken): boolean {
    const now = Date.now()
    return (now - token.timestamp) < this.TOKEN_EXPIRY
  }

  /**
   * Generate a cryptographically secure random token
   */
  private generateRandomToken(): string {
    const array = new Uint8Array(this.TOKEN_LENGTH)
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      // Browser environment with Web Crypto API
      window.crypto.getRandomValues(array)
    } else {
      // Fallback for environments without crypto API
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
    }

    // Convert to base64 string
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Get or create a session ID for this browser session
   */
  private getOrCreateSessionId(): string {
    let sessionId: string

    try {
      sessionId = sessionStorage.getItem('session_id') || ''
    } catch (error) {
      sessionId = ''
    }

    if (!sessionId) {
      sessionId = this.generateRandomToken()
      try {
        sessionStorage.setItem('session_id', sessionId)
      } catch (error) {
        console.warn('Failed to store session ID:', error)
      }
    }

    return sessionId
  }

  /**
   * Middleware function for validating CSRF tokens in form submissions
   */
  public createValidationMiddleware() {
    return (formData: FormData | Record<string, any>): CSRFValidationResult => {
      let token: string

      if (formData instanceof FormData) {
        token = formData.get('csrf_token') as string
      } else {
        token = formData.csrf_token as string
      }

      if (!token) {
        return {
          isValid: false,
          error: 'CSRF token missing'
        }
      }

      return this.validateToken(token)
    }
  }
}