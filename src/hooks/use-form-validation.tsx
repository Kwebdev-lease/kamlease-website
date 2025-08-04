import { useState, useCallback } from 'react'

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
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

export function useFormValidation(rules: ValidationRules): FormValidationReturn {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name]
    if (!rule) return null

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return 'Ce champ est requis'
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return null
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `Minimum ${rule.minLength} caractères requis`
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Maximum ${rule.maxLength} caractères autorisés`
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Format invalide'
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value)
    }

    return null
  }, [rules])

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