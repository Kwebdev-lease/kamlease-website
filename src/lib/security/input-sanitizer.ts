/**
 * Input Sanitization Service
 * Provides comprehensive input sanitization for all form fields
 * to prevent XSS, injection attacks, and other security vulnerabilities
 */

import DOMPurify from 'isomorphic-dompurify'

export interface SanitizationOptions {
  allowHtml?: boolean
  maxLength?: number
  trimWhitespace?: boolean
  removeSpecialChars?: boolean
  allowedTags?: string[]
  allowedAttributes?: string[]
}

export interface SanitizedInput {
  value: string
  originalValue: string
  wasSanitized: boolean
  removedContent?: string[]
}

export class InputSanitizer {
  private static instance: InputSanitizer
  
  private constructor() {}
  
  public static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer()
    }
    return InputSanitizer.instance
  }

  /**
   * Sanitize a single input value
   */
  public sanitize(input: string, options: SanitizationOptions = {}): SanitizedInput {
    const originalValue = input
    let sanitizedValue = input
    const removedContent: string[] = []
    let wasSanitized = false

    // Trim whitespace if requested
    if (options.trimWhitespace !== false) {
      const trimmed = sanitizedValue.trim()
      if (trimmed !== sanitizedValue) {
        wasSanitized = true
        sanitizedValue = trimmed
      }
    }

    // Apply length limits
    if (options.maxLength && sanitizedValue.length > options.maxLength) {
      const truncated = sanitizedValue.substring(0, options.maxLength)
      if (truncated !== sanitizedValue) {
        wasSanitized = true
        removedContent.push(`Content truncated from ${sanitizedValue.length} to ${options.maxLength} characters`)
        sanitizedValue = truncated
      }
    }

    // Additional security checks first (before escaping)
    const beforeSecurity = sanitizedValue
    sanitizedValue = this.removeScriptTags(sanitizedValue)
    sanitizedValue = this.removeEventHandlers(sanitizedValue)
    sanitizedValue = this.removeJavaScriptUrls(sanitizedValue)
    
    if (sanitizedValue !== beforeSecurity) {
      wasSanitized = true
      removedContent.push('Security-related content removed')
    }

    // Remove special characters if requested (before HTML processing)
    if (options.removeSpecialChars) {
      const cleaned = sanitizedValue.replace(/[<>\"'&]/g, '')
      if (cleaned !== sanitizedValue) {
        wasSanitized = true
        removedContent.push('Special characters removed')
        sanitizedValue = cleaned
      }
    }

    // Remove or escape HTML content
    if (options.allowHtml) {
      // Use DOMPurify to clean HTML while preserving allowed tags
      const cleanHtml = DOMPurify.sanitize(sanitizedValue, {
        ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: options.allowedAttributes || []
      })
      if (cleanHtml !== sanitizedValue) {
        wasSanitized = true
        removedContent.push('Potentially dangerous HTML content removed')
        sanitizedValue = cleanHtml
      }
    } else {
      // Escape HTML entities
      const escapedHtml = this.escapeHtml(sanitizedValue)
      if (escapedHtml !== sanitizedValue) {
        wasSanitized = true
        removedContent.push('HTML entities escaped')
        sanitizedValue = escapedHtml
      }
    }



    return {
      value: sanitizedValue,
      originalValue,
      wasSanitized,
      removedContent: removedContent.length > 0 ? removedContent : undefined
    }
  }

  /**
   * Sanitize form data object
   */
  public sanitizeFormData<T extends Record<string, any>>(
    formData: T,
    fieldOptions: Record<keyof T, SanitizationOptions> = {}
  ): { sanitized: T; report: Record<keyof T, SanitizedInput> } {
    const sanitized = { ...formData }
    const report = {} as Record<keyof T, SanitizedInput>

    for (const [key, value] of Object.entries(formData)) {
      if (typeof value === 'string') {
        const options = fieldOptions[key as keyof T] || this.getDefaultOptionsForField(key)
        const result = this.sanitize(value, options)
        sanitized[key as keyof T] = result.value as T[keyof T]
        report[key as keyof T] = result
      }
    }

    return { sanitized, report }
  }

  /**
   * Get default sanitization options for common form fields
   */
  private getDefaultOptionsForField(fieldName: string): SanitizationOptions {
    const fieldDefaults: Record<string, SanitizationOptions> = {
      nom: { maxLength: 50, removeSpecialChars: true },
      prenom: { maxLength: 50, removeSpecialChars: true },
      firstName: { maxLength: 50, removeSpecialChars: true },
      lastName: { maxLength: 50, removeSpecialChars: true },
      societe: { maxLength: 100 },
      company: { maxLength: 100 },
      email: { maxLength: 254, removeSpecialChars: false },
      message: { maxLength: 1000, allowHtml: false },
      phone: { maxLength: 20, removeSpecialChars: true },
      address: { maxLength: 200 }
    }

    return fieldDefaults[fieldName] || { maxLength: 255 }
  }

  /**
   * Escape HTML entities
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, (m) => map[m])
  }

  /**
   * Remove script tags and their content
   */
  private removeScriptTags(text: string): string {
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }

  /**
   * Remove event handlers from text
   */
  private removeEventHandlers(text: string): string {
    return text.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  }

  /**
   * Remove javascript: URLs
   */
  private removeJavaScriptUrls(text: string): string {
    return text.replace(/javascript:/gi, '')
  }

  /**
   * Validate that sanitized input meets security requirements
   */
  public validateSanitizedInput(input: SanitizedInput, fieldName: string): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Check if content was heavily modified
    if (input.wasSanitized && input.removedContent && input.removedContent.length > 2) {
      errors.push(`Field ${fieldName} contained potentially malicious content`)
    }

    // Check for remaining suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /vbscript:/i,
      /data:text\/html/i,
      /<iframe/i,
      /<object/i,
      /<embed/i,
      /eval\s*\(/i,
      /expression\s*\(/i
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input.value)) {
        errors.push(`Field ${fieldName} contains suspicious content`)
        break
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}