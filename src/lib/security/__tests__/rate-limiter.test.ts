/**
 * Tests for Rate Limiter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from '../rate-limiter'

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter

  beforeEach(() => {
    vi.useFakeTimers()
    rateLimiter = RateLimiter.getInstance()
    rateLimiter.resetAll()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('checkLimit', () => {
    it('should allow requests within limit', () => {
      const config = { maxRequests: 5, windowMs: 60000 }
      
      // Make 3 requests
      for (let i = 0; i < 3; i++) {
        const result = rateLimiter.checkLimit('test-endpoint', config)
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(5 - i - 1)
        rateLimiter.recordRequest('test-endpoint', true)
      }
    })

    it('should block requests exceeding limit', () => {
      const config = { maxRequests: 2, windowMs: 60000 }
      
      // Make requests up to limit
      for (let i = 0; i < 2; i++) {
        rateLimiter.checkLimit('test-endpoint', config)
        rateLimiter.recordRequest('test-endpoint', true)
      }
      
      // Next request should be blocked
      const result = rateLimiter.checkLimit('test-endpoint', config)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should reset after time window', () => {
      const config = { maxRequests: 2, windowMs: 60000 }
      
      // Exhaust limit
      for (let i = 0; i < 2; i++) {
        rateLimiter.checkLimit('test-endpoint', config)
        rateLimiter.recordRequest('test-endpoint', true)
      }
      
      // Should be blocked
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(false)
      
      // Advance time past window
      vi.advanceTimersByTime(61000)
      
      // Should be allowed again
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(true)
    })

    it('should handle blocking duration', () => {
      const config = { 
        maxRequests: 1, 
        windowMs: 60000,
        blockDurationMs: 120000 
      }
      
      // Exhaust limit
      rateLimiter.checkLimit('test-endpoint', config)
      rateLimiter.recordRequest('test-endpoint', true)
      
      // Should be blocked with retry after
      const result = rateLimiter.checkLimit('test-endpoint', config)
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBe(120)
      
      // Should still be blocked after window but within block duration
      vi.advanceTimersByTime(61000)
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(false)
      
      // Should be allowed after block duration
      vi.advanceTimersByTime(120000)
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(true)
    })

    it('should skip successful requests when configured', () => {
      const config = { 
        maxRequests: 2, 
        windowMs: 60000,
        skipSuccessfulRequests: true
      }
      
      // Make successful requests - should not count
      for (let i = 0; i < 3; i++) {
        rateLimiter.checkLimit('test-endpoint', config)
        rateLimiter.recordRequest('test-endpoint', true)
      }
      
      // Should still be allowed
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(true)
      
      // Make failed requests - should count
      for (let i = 0; i < 2; i++) {
        rateLimiter.checkLimit('test-endpoint', config)
        rateLimiter.recordRequest('test-endpoint', false)
      }
      
      // Should now be blocked
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(false)
    })
  })

  describe('createRateLimitedFunction', () => {
    it('should allow function execution within limits', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const config = { maxRequests: 2, windowMs: 60000 }
      
      const rateLimitedFn = rateLimiter.createRateLimitedFunction(
        mockFn,
        'test-endpoint',
        config
      )
      
      const result = await rateLimitedFn('arg1', 'arg2')
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should throw error when rate limited', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      const config = { maxRequests: 1, windowMs: 60000 }
      
      const rateLimitedFn = rateLimiter.createRateLimitedFunction(
        mockFn,
        'test-endpoint',
        config
      )
      
      // First call should succeed
      await rateLimitedFn()
      
      // Second call should be rate limited
      await expect(rateLimitedFn()).rejects.toThrow('Rate limit exceeded')
    })

    it('should record successful and failed requests', async () => {
      const mockFn = vi.fn()
        .mockResolvedValueOnce('success')
        .mockRejectedValueOnce(new Error('failure'))
      
      const config = { maxRequests: 5, windowMs: 60000 }
      
      const rateLimitedFn = rateLimiter.createRateLimitedFunction(
        mockFn,
        'test-endpoint',
        config
      )
      
      // Successful request
      await rateLimitedFn()
      expect(rateLimiter.getCurrentCount('test-endpoint', config)).toBe(1)
      
      // Failed request
      await expect(rateLimitedFn()).rejects.toThrow('failure')
      expect(rateLimiter.getCurrentCount('test-endpoint', config)).toBe(2)
    })
  })

  describe('getCurrentCount', () => {
    it('should return current request count', () => {
      const config = { maxRequests: 5, windowMs: 60000 }
      
      expect(rateLimiter.getCurrentCount('test-endpoint', config)).toBe(0)
      
      rateLimiter.recordRequest('test-endpoint', true)
      expect(rateLimiter.getCurrentCount('test-endpoint', config)).toBe(1)
      
      rateLimiter.recordRequest('test-endpoint', false)
      expect(rateLimiter.getCurrentCount('test-endpoint', config)).toBe(2)
    })

    it('should exclude requests outside time window', () => {
      const config = { maxRequests: 5, windowMs: 60000 }
      
      // Record old request
      rateLimiter.recordRequest('test-endpoint', true)
      
      // Advance time past window
      vi.advanceTimersByTime(61000)
      
      // Record new request
      rateLimiter.recordRequest('test-endpoint', true)
      
      // Should only count the new request
      expect(rateLimiter.getCurrentCount('test-endpoint', config)).toBe(1)
    })
  })

  describe('reset', () => {
    it('should reset specific endpoint', () => {
      const config = { maxRequests: 1, windowMs: 60000 }
      
      // Exhaust limit
      rateLimiter.checkLimit('test-endpoint', config)
      rateLimiter.recordRequest('test-endpoint', true)
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(false)
      
      // Reset
      rateLimiter.reset('test-endpoint')
      expect(rateLimiter.checkLimit('test-endpoint', config).allowed).toBe(true)
    })
  })

  describe('addConfig', () => {
    it('should add custom configuration', () => {
      const customConfig = { maxRequests: 10, windowMs: 30000 }
      rateLimiter.addConfig('custom-endpoint', customConfig)
      
      // Should use custom config
      const result = rateLimiter.checkLimit('custom-endpoint')
      expect(result.remaining).toBe(10)
    })
  })
})