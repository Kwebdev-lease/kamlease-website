/**
 * Tests for email sending functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GraphApiClient } from '../graph-api-client'
import { EmailData } from '../types'

// Mock the TokenManager
vi.mock('../token-manager', () => ({
  TokenManager: {
    getInstance: vi.fn(() => ({
      getAccessToken: vi.fn().mockResolvedValue('mock-access-token')
    }))
  }
}))

// Mock the security services
vi.mock('../../security/rate-limiter', () => ({
  RateLimiter: {
    getInstance: vi.fn(() => ({
      checkLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 10, resetTime: Date.now() + 60000 }),
      recordRequest: vi.fn()
    }))
  }
}))

vi.mock('../../security/security-middleware', () => ({
  SecurityMiddleware: {
    getInstance: vi.fn(() => ({
      secureApiRequest: vi.fn().mockResolvedValue({})
    }))
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('GraphApiClient Email Sending', () => {
  let graphClient: GraphApiClient
  let mockFetch: any

  beforeEach(() => {
    vi.clearAllMocks()
    graphClient = GraphApiClient.getInstance()
    mockFetch = global.fetch as any
  })

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: vi.fn().mockResolvedValue({})
      })

      const emailData: EmailData = {
        to: 'contact@kamlease.com',
        subject: 'Test Email',
        body: 'This is a test email',
        isHtml: false
      }

      const result = await graphClient.sendEmail(emailData)

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.microsoft.com/v1.0/users/contact@kamlease.com/sendMail',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-access-token',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('Test Email')
        })
      )
    })

    it('should handle email sending errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: vi.fn().mockResolvedValue({
          error: {
            code: 'InvalidRequest',
            message: 'Invalid email format'
          }
        })
      })

      const emailData: EmailData = {
        to: 'invalid-email',
        subject: 'Test Email',
        body: 'This is a test email'
      }

      await expect(graphClient.sendEmail(emailData)).rejects.toThrow('Failed to send email')
    })

    it('should format email message correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: vi.fn().mockResolvedValue({})
      })

      const emailData: EmailData = {
        to: 'contact@kamlease.com',
        subject: 'Contact Form Submission',
        body: 'Name: John Doe\nMessage: Hello world',
        isHtml: false
      }

      await graphClient.sendEmail(emailData)

      const callArgs = mockFetch.mock.calls[0][1]
      const requestBody = JSON.parse(callArgs.body)

      expect(requestBody.message.subject).toBe('Contact Form Submission')
      expect(requestBody.message.body.contentType).toBe('Text')
      expect(requestBody.message.body.content).toBe('Name: John Doe\nMessage: Hello world')
      expect(requestBody.message.toRecipients[0].emailAddress.address).toBe('contact@kamlease.com')
    })

    it('should handle HTML email format', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: vi.fn().mockResolvedValue({})
      })

      const emailData: EmailData = {
        to: 'contact@kamlease.com',
        subject: 'HTML Email',
        body: '<h1>Hello</h1><p>This is HTML content</p>',
        isHtml: true
      }

      await graphClient.sendEmail(emailData)

      const callArgs = mockFetch.mock.calls[0][1]
      const requestBody = JSON.parse(callArgs.body)

      expect(requestBody.message.body.contentType).toBe('HTML')
      expect(requestBody.message.body.content).toBe('<h1>Hello</h1><p>This is HTML content</p>')
    })
  })
})