/**
 * Tests for Input Sanitizer
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { InputSanitizer } from '../input-sanitizer'

describe('InputSanitizer', () => {
  let sanitizer: InputSanitizer

  beforeEach(() => {
    sanitizer = InputSanitizer.getInstance()
  })

  describe('sanitize', () => {
    it('should sanitize basic HTML content', () => {
      const result = sanitizer.sanitize('<script>alert("xss")</script>Hello')
      
      expect(result.value).not.toContain('<script>')
      expect(result.wasSanitized).toBe(true)
      expect(result.removedContent).toContain('HTML entities escaped')
    })

    it('should handle XSS attempts', () => {
      const maliciousInput = '<img src="x" onerror="alert(1)">'
      const result = sanitizer.sanitize(maliciousInput)
      
      expect(result.value).not.toContain('onerror')
      expect(result.value).not.toContain('alert')
      expect(result.wasSanitized).toBe(true)
    })

    it('should trim whitespace by default', () => {
      const result = sanitizer.sanitize('  hello world  ')
      
      expect(result.value).toBe('hello world')
      expect(result.wasSanitized).toBe(true)
    })

    it('should respect maxLength option', () => {
      const longText = 'a'.repeat(100)
      const result = sanitizer.sanitize(longText, { maxLength: 50 })
      
      expect(result.value).toHaveLength(50)
      expect(result.wasSanitized).toBe(true)
      expect(result.removedContent).toContain('Content truncated')
    })

    it('should remove special characters when requested', () => {
      const result = sanitizer.sanitize('hello<>&"\'world', { removeSpecialChars: true })
      
      expect(result.value).toBe('helloworld')
      expect(result.wasSanitized).toBe(true)
    })

    it('should allow HTML when configured', () => {
      const result = sanitizer.sanitize('<b>bold</b> text', { 
        allowHtml: true,
        allowedTags: ['b']
      })
      
      expect(result.value).toContain('<b>bold</b>')
    })

    it('should remove javascript: URLs', () => {
      const result = sanitizer.sanitize('javascript:alert(1)')
      
      expect(result.value).not.toContain('javascript:')
      expect(result.wasSanitized).toBe(true)
    })

    it('should remove event handlers', () => {
      const result = sanitizer.sanitize('onclick="alert(1)" hello')
      
      expect(result.value).not.toContain('onclick')
      expect(result.wasSanitized).toBe(true)
    })
  })

  describe('sanitizeFormData', () => {
    it('should sanitize all form fields', () => {
      const formData = {
        nom: '<script>alert("xss")</script>Doe',
        prenom: '  John  ',
        message: 'Hello <b>world</b>',
        societe: 'Test & Co'
      }

      const { sanitized, report } = sanitizer.sanitizeFormData(formData)

      expect(sanitized.nom).not.toContain('<script>')
      expect(sanitized.prenom).toBe('John')
      expect(sanitized.message).not.toContain('<b>')
      expect(report.nom.wasSanitized).toBe(true)
      expect(report.prenom.wasSanitized).toBe(true)
    })

    it('should apply field-specific options', () => {
      const formData = { nom: 'Very Long Name That Exceeds Limit' }
      const fieldOptions = { nom: { maxLength: 10 } }

      const { sanitized } = sanitizer.sanitizeFormData(formData, fieldOptions)

      expect(sanitized.nom).toHaveLength(10)
    })
  })

  describe('validateSanitizedInput', () => {
    it('should validate clean input', () => {
      const input = {
        value: 'clean input',
        originalValue: 'clean input',
        wasSanitized: false
      }

      const result = sanitizer.validateSanitizedInput(input, 'test')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect suspicious patterns', () => {
      const input = {
        value: 'javascript:alert(1)',
        originalValue: 'javascript:alert(1)',
        wasSanitized: false
      }

      const result = sanitizer.validateSanitizedInput(input, 'test')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field test contains suspicious content')
    })

    it('should flag heavily sanitized content', () => {
      const input = {
        value: 'clean',
        originalValue: 'original',
        wasSanitized: true,
        removedContent: ['item1', 'item2', 'item3']
      }

      const result = sanitizer.validateSanitizedInput(input, 'test')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Field test contained potentially malicious content')
    })
  })
})