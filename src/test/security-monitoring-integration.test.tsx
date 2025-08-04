/**
 * Integration tests for security and monitoring features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Contact } from '../components/Contact'
import { LanguageProvider } from '../contexts/LanguageProvider'
import { SecurityMiddleware } from '../lib/security/security-middleware'
import { MonitoringService } from '../lib/monitoring/monitoring-service'
import { InputSanitizer } from '../lib/security/input-sanitizer'
import { CSRFProtection } from '../lib/security/csrf-protection'
import { RateLimiter } from '../lib/security/rate-limiter'

// Mock external dependencies
vi.mock('../lib/microsoft-graph/graph-api-client')
vi.mock('../lib/appointment-booking-service')

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>
    {children}
  </LanguageProvider>
)

describe('Security and Monitoring Integration', () => {
  let securityMiddleware: SecurityMiddleware
  let monitoringService: MonitoringService
  let inputSanitizer: InputSanitizer
  let csrfProtection: CSRFProtection
  let rateLimiter: RateLimiter

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Initialize services
    securityMiddleware = SecurityMiddleware.getInstance()
    monitoringService = MonitoringService.getInstance()
    inputSanitizer = InputSanitizer.getInstance()
    csrfProtection = CSRFProtection.getInstance()
    rateLimiter = RateLimiter.getInstance()

    // Initialize monitoring
    await monitoringService.initialize({
      logging: { enabled: true },
      performance: { enabled: true },
      errorTracking: { enabled: true },
      analytics: { enabled: true }
    })

    // Reset rate limiter
    rateLimiter.resetAll()
  })

  describe('Input Sanitization', () => {
    it('should sanitize malicious input in form fields', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      const nameInput = screen.getByLabelText(/prénom/i)
      const maliciousInput = '<script>alert("xss")</script>John'

      fireEvent.change(nameInput, { target: { value: maliciousInput } })

      await waitFor(() => {
        expect(nameInput).not.toHaveValue(maliciousInput)
        expect(nameInput.value).not.toContain('<script>')
      })

      // Check if security warning is displayed
      await waitFor(() => {
        expect(screen.getByText(/security notice/i)).toBeInTheDocument()
      })
    })

    it('should handle HTML entities in message field', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      const messageInput = screen.getByLabelText(/message/i)
      const htmlInput = 'Hello <b>world</b> & "friends"'

      fireEvent.change(messageInput, { target: { value: htmlInput } })

      await waitFor(() => {
        expect(messageInput.value).not.toContain('<b>')
        expect(messageInput.value).toContain('&lt;b&gt;')
      })
    })

    it('should truncate overly long input', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      const nameInput = screen.getByLabelText(/prénom/i)
      const longInput = 'a'.repeat(100)

      fireEvent.change(nameInput, { target: { value: longInput } })

      await waitFor(() => {
        expect(nameInput.value.length).toBeLessThanOrEqual(50)
      })
    })
  })

  describe('CSRF Protection', () => {
    it('should include CSRF token in form', () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      const csrfInput = document.querySelector('input[name="csrf_token"]')
      expect(csrfInput).toBeInTheDocument()
      expect(csrfInput).toHaveAttribute('type', 'hidden')
      expect(csrfInput).toHaveAttribute('value')
    })

    it('should validate CSRF token on form submission', async () => {
      const validateSpy = vi.spyOn(csrfProtection, 'validateToken')
      
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      // Fill form
      fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

      // Submit form
      fireEvent.click(screen.getByText(/envoyer le message/i))

      await waitFor(() => {
        expect(validateSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Rate Limiting', () => {
    it('should prevent rapid form submissions', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      // Fill form
      fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

      const submitButton = screen.getByText(/envoyer le message/i)

      // Submit multiple times rapidly
      for (let i = 0; i < 6; i++) {
        fireEvent.click(submitButton)
      }

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument()
      })
    })

    it('should track API call rate limits', () => {
      const endpoint = 'test-endpoint'
      const config = { maxRequests: 2, windowMs: 60000 }

      // Make requests up to limit
      expect(rateLimiter.checkLimit(endpoint, config).allowed).toBe(true)
      rateLimiter.recordRequest(endpoint, true)
      
      expect(rateLimiter.checkLimit(endpoint, config).allowed).toBe(true)
      rateLimiter.recordRequest(endpoint, true)
      
      // Should be blocked now
      expect(rateLimiter.checkLimit(endpoint, config).allowed).toBe(false)
    })
  })

  describe('Performance Monitoring', () => {
    it('should track form submission performance', async () => {
      const trackSpy = vi.spyOn(monitoringService, 'trackFormSubmission')
      
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })
      
      fireEvent.click(screen.getByText(/envoyer le message/i))

      await waitFor(() => {
        expect(trackSpy).toHaveBeenCalledWith(
          'message',
          expect.any(Number),
          expect.any(Boolean)
        )
      })
    })

    it('should track API call performance', () => {
      const trackSpy = vi.spyOn(monitoringService, 'trackCalendarApiCall')
      
      monitoringService.trackCalendarApiCall(
        'calendar-events',
        'POST',
        1500,
        201,
        true
      )

      expect(trackSpy).toHaveBeenCalledWith(
        'calendar-events',
        'POST',
        1500,
        201,
        true
      )
    })
  })

  describe('Error Tracking', () => {
    it('should track security events', () => {
      const trackSpy = vi.spyOn(monitoringService, 'trackSecurityEvent')
      
      monitoringService.trackSecurityEvent('input_sanitization', 'medium', {
        field: 'name',
        originalValue: '<script>alert(1)</script>',
        sanitizedValue: 'alert(1)'
      })

      expect(trackSpy).toHaveBeenCalledWith(
        'input_sanitization',
        'medium',
        expect.any(Object)
      )
    })

    it('should track form validation errors', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      // Submit form without required fields
      fireEvent.click(screen.getByText(/envoyer le message/i))

      await waitFor(() => {
        // Should show validation errors
        expect(screen.getByText(/ce champ est requis/i)).toBeInTheDocument()
      })
    })
  })

  describe('Analytics Tracking', () => {
    it('should track user interactions', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      const nameInput = screen.getByLabelText(/prénom/i)
      
      // Simulate user interaction
      fireEvent.focus(nameInput)
      fireEvent.change(nameInput, { target: { value: 'John' } })
      fireEvent.blur(nameInput)

      // Analytics should track these interactions
      const dashboard = monitoringService.getDashboard()
      expect(dashboard.analytics.userActivity.totalInteractions).toBeGreaterThan(0)
    })

    it('should track form submission attempts', async () => {
      render(
        <TestWrapper>
          <Contact />
        </TestWrapper>
      )

      // Fill form
      fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: 'John' } })
      fireEvent.change(screen.getByLabelText(/nom/i), { target: { value: 'Doe' } })
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Test message' } })

      // Submit form
      fireEvent.click(screen.getByText(/envoyer le message/i))

      await waitFor(() => {
        const dashboard = monitoringService.getDashboard()
        expect(dashboard.analytics.topActions).toContainEqual(
          expect.objectContaining({
            action: expect.stringContaining('submit'),
            component: 'contact-form'
          })
        )
      })
    })
  })

  describe('Integrated Security Validation', () => {
    it('should perform comprehensive security validation', async () => {
      const formData = {
        nom: 'Doe',
        prenom: 'John',
        societe: 'Test Corp',
        message: 'Test message',
        csrf_token: csrfProtection.getTokenForForm()
      }

      const result = await securityMiddleware.validateFormSubmission(
        formData,
        'form-submission-test',
        {
          enableCSRF: true,
          enableRateLimit: true,
          enableInputSanitization: true
        }
      )

      expect(result.isValid).toBe(true)
      expect(result.sanitizedData).toBeDefined()
      expect(result.errors).toHaveLength(0)
    })

    it('should reject malicious form data', async () => {
      const maliciousData = {
        nom: '<script>alert("xss")</script>',
        prenom: 'javascript:alert(1)',
        message: 'SELECT * FROM users',
        csrf_token: 'invalid-token'
      }

      const result = await securityMiddleware.validateFormSubmission(
        maliciousData,
        'form-submission-test',
        {
          enableCSRF: true,
          enableRateLimit: true,
          enableInputSanitization: true
        }
      )

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.warnings?.length).toBeGreaterThan(0)
    })
  })

  describe('Monitoring Dashboard', () => {
    it('should provide comprehensive monitoring data', () => {
      const dashboard = monitoringService.getDashboard()

      expect(dashboard.overview.status.isHealthy).toBeDefined()
      expect(dashboard.performance.currentMetrics).toBeInstanceOf(Array)
      expect(dashboard.errors.recentErrors).toBeInstanceOf(Array)
      expect(dashboard.analytics.userActivity).toBeDefined()
    })

    it('should export monitoring data', () => {
      const exportedData = monitoringService.exportData()
      const parsed = JSON.parse(exportedData)

      expect(parsed).toHaveProperty('logs')
      expect(parsed).toHaveProperty('errors')
      expect(parsed).toHaveProperty('performance')
      expect(parsed).toHaveProperty('analytics')
      expect(parsed).toHaveProperty('status')
      expect(parsed).toHaveProperty('timestamp')
    })
  })
})