import { useState, useCallback } from 'react'
import { validateFormField, FormValidationContext } from '../lib/form-validation-utils'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  emailFormat?: boolean
  phoneFormat?: boolean
  custom?: (value: string) => string | null
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

export interface ValidationErrors {
  [key: string]: string | null
}

export interface FormValidationReturn {
  errors: ValidationErrors
  isValid: boolean
  validateField: (name: string, value: string) => string | null
  validateForm: (data: Record<string, string>) => boolean
  clearError: (name: string) => void
  clearAllErrors: () => void
}

export function useFormValidation(rules: ValidationRules, language: 'fr' | 'en' = 'fr'): FormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name]
    if (!rule) return null

    // Use enhanced validation for email and phone fields
    if (rule.emailFormat || rule.phoneFormat || name === 'email' || name === 'telephone') {
      const context: FormValidationContext = {
        fieldName: name,
        value,
        language,
        isRequired: rule.required || false
      }
      
      const result = validateFormField(context)
      return result.error || null
    }

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return language === 'fr' ? 'Ce champ est requis' : 'This field is required'
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return null
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return language === 'fr' 
        ? `Minimum ${rule.minLength} caractères requis`
        : `Minimum ${rule.minLength} characters required`
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return language === 'fr'
        ? `Maximum ${rule.maxLength} caractères autorisés`
        : `Maximum ${rule.maxLength} characters allowed`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return language === 'fr' ? 'Format invalide' : 'Invalid format'
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }, [rules, language])

  const validateForm = useCallback((data: Record<string, string>): boolean => {
    const newErrors: ValidationErrors = {}
    let isFormValid = true

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName] || '')
      if (error) {
        newErrors[fieldName] = error
        isFormValid = false
      }
    })

    setErrors(newErrors)
    return isFormValid
  }, [rules, validateField])

  const clearError = useCallback((name: string) => {
    setErrors(prev => ({ ...prev, [name]: null }))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const isValid = Object.values(errors).every(error => !error)

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearError,
    clearAllErrors
  }
}