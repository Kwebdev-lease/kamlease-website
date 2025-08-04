/**
 * Tests for CSRF Protection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CSRFProtection } from '../csrf-protection'

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('CSRFProtection', () => {
  let csrfProtection: CSRFProtection

  beforeEach(() => {
    vi.clearAllMocks()
    csrfProtection = CSRFProtection.getInstance()
  })

  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const token = csrfProtection.generateToken()

      expect(token.token).toBeDefined()
      expect(token.token).toHaveLength(44) // Base64 encoded 32 bytes
      expect(token.timestamp).toBeTypeOf('number')
      expect(token.sessionId).toBeDefined()
    })

    it('should store token in sessionStorage', () => {
      csrfProtection.generateToken()

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'csrf_token',
        expect.stringContaining('"token"')
      )
    })
  })

  describe('getCurrentToken', () => {
    it('should return existing valid token', () => {
      const originalToken = csrfProtection.generateToken()
      const currentToken = csrfProtection.getCurrentToken()

      expect(currentToken.token).toBe(originalToken.token)
    })

    it('should generate new token if none exists', () => {
      mockSessionStorage.getItem.mockReturnValue(null)
      
      const token = csrfProtection.getCurrentToken()

      expect(token.token).toBeDefined()
      expect(token.timestamp).toBeTypeOf('number')
    })

    it('should generate new token if stored token is expired', () => {
      const expiredToken = {
        token: 'expired-token',
        timestamp: Date.now() - (31 * 60 * 1000), // 31 minutes ago
        sessionId: 'session-id'
      }
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredToken))
      
      const token = csrfProtection.getCurrentToken()

      expect(token.token).not.toBe('expired-token')
    })
  })

  describe('validateToken', () => {
    it('should validate correct token', () => {
      const token = csrfProtection.generateToken()
      const result = csrfProtection.validateToken(token.token)

      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject invalid token', () => {
      csrfProtection.generateToken()
      const result = csrfProtection.validateToken('invalid-token')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Invalid CSRF token')
    })

    it('should reject expired token', () => {
      // Mock an expired token
      const expiredToken = {
        token: 'test-token',
        timestamp: Date.now() - (31 * 60 * 1000), // 31 minutes ago
        sessionId: 'session-id'
      }
      
      mockSessionStorage.getItem.mockReturnValue(JSON.stringify(expiredToken))
      
      const result = csrfProtection.validateToken('test-token')

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('CSRF token expired')
      expect(result.newToken).toBeDefined()
    })
  })

  describe('getHeaders', () => {
    it('should return CSRF headers', () => {
      const token = csrfProtection.generateToken()
      const headers = csrfProtection.getHeaders()

      expect(headers['X-CSRF-Token']).toBe(token.token)
      expect(headers['X-Requested-With']).toBe('XMLHttpRequest')
    })
  })

  describe('clearToken', () => {
    it('should clear stored token', () => {
      csrfProtection.generateToken()
      csrfProtection.clearToken()

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('csrf_token')
    })
  })

  describe('createValidationMiddleware', () => {
    it('should validate FormData', () => {
      const token = csrfProtection.generateToken()
      const middleware = csrfProtection.createValidationMiddleware()
      
      const formData = new FormData()
      formData.append('csrf_token', token.token)
      
      const result = middleware(formData)

      expect(result.isValid).toBe(true)
    })

    it('should validate object data', () => {
      const token = csrfProtection.generateToken()
      const middleware = csrfProtection.createValidationMiddleware()
      
      const data = { csrf_token: token.token }
      
      const result = middleware(data)

      expect(result.isValid).toBe(true)
    })

    it('should reject missing token', () => {
      const middleware = csrfProtection.createValidationMiddleware()
      const result = middleware({})

      expect(result.isValid).toBe(false)
      expect(result.error).toBe('CSRF token missing')
    })
  })
})