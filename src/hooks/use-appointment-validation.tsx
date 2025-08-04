/**
 * Custom hook for real-time appointment validation
 * Implements requirements 1.4, 3.5, 4.1, 4.2
 */

import { useState, useEffect, useCallback } from 'react'
import { BusinessHoursValidator } from '@/lib/business-hours-validator'
import { useLanguage } from '@/contexts/LanguageProvider'

export interface AppointmentValidationError {
  field: 'date' | 'time' | 'datetime' | 'general'
  message: string
  code: string
}

export interface AppointmentValidationResult {
  isValid: boolean
  errors: AppointmentValidationError[]
  warnings: string[]
}

export interface UseAppointmentValidationReturn {
  validateDate: (date: Date | null) => AppointmentValidationResult
  validateTime: (time: string | null) => AppointmentValidationResult
  validateDateTime: (date: Date | null, time: string | null) => AppointmentValidationResult
  validateInRealTime: (date: Date | null, time: string | null) => AppointmentValidationResult
  clearValidation: () => void
  currentValidation: AppointmentValidationResult
  hasErrors: boolean
  hasWarnings: boolean
}

export function useAppointmentValidation(): UseAppointmentValidationReturn {
  const [currentValidation, setCurrentValidation] = useState<AppointmentValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  })

  const [validator] = useState(() => BusinessHoursValidator.getInstance())

  // Clear validation state
  const clearValidation = useCallback(() => {
    setCurrentValidation({
      isValid: true,
      errors: [],
      warnings: []
    })
  }, [])

  // Validate date selection
  const validateDate = useCallback((date: Date | null): AppointmentValidationResult => {
    const errors: AppointmentValidationError[] = []
    const warnings: string[] = []

    if (!date) {
      errors.push({
        field: 'date',
        message: 'Veuillez sélectionner une date pour votre rendez-vous',
        code: 'DATE_REQUIRED'
      })
      return { isValid: false, errors, warnings }
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'date',
        message: 'La date sélectionnée n\'est pas valide',
        code: 'INVALID_DATE'
      })
      return { isValid: false, errors, warnings }
    }

    // Check if date is in the past
    if (validator.isInPast(date)) {
      errors.push({
        field: 'date',
        message: 'Impossible de programmer un rendez-vous dans le passé',
        code: 'DATE_IN_PAST'
      })
      return { isValid: false, errors, warnings }
    }

    // Check if date is a business day
    if (!validator.isValidBusinessDay(date)) {
      errors.push({
        field: 'date',
        message: 'Les rendez-vous ne sont disponibles que du lundi au vendredi',
        code: 'INVALID_BUSINESS_DAY'
      })
      return { isValid: false, errors, warnings }
    }

    // Check if date is too far in the future (optional warning)
    const maxFutureDate = new Date()
    maxFutureDate.setMonth(maxFutureDate.getMonth() + 3) // 3 months ahead
    if (date > maxFutureDate) {
      warnings.push('La date sélectionnée est assez éloignée. Nous vous contacterons pour confirmer la disponibilité.')
    }

    // Check if date is very soon (warning)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    if (date < tomorrow) {
      warnings.push('Rendez-vous pour aujourd\'hui - nous confirmerons la disponibilité rapidement.')
    }

    return { isValid: true, errors, warnings }
  }, [validator])

  // Validate time selection
  const validateTime = useCallback((time: string | null): AppointmentValidationResult => {
    const errors: AppointmentValidationError[] = []
    const warnings: string[] = []

    if (!time) {
      errors.push({
        field: 'time',
        message: 'Veuillez sélectionner une heure pour votre rendez-vous',
        code: 'TIME_REQUIRED'
      })
      return { isValid: false, errors, warnings }
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      errors.push({
        field: 'time',
        message: 'Format d\'heure invalide. Utilisez le format HH:MM',
        code: 'INVALID_TIME_FORMAT'
      })
      return { isValid: false, errors, warnings }
    }

    // Check if time is within business hours
    if (!validator.isValidBusinessTime(time)) {
      const config = validator.getConfig()
      errors.push({
        field: 'time',
        message: `Les rendez-vous sont disponibles de ${config.startTime} à ${config.endTime}`,
        code: 'INVALID_BUSINESS_TIME'
      })
      return { isValid: false, errors, warnings }
    }

    return { isValid: true, errors, warnings }
  }, [validator])

  // Validate complete date/time combination with enhanced timezone handling
  const validateDateTime = useCallback((date: Date | null, time: string | null): AppointmentValidationResult => {
    const errors: AppointmentValidationError[] = []
    const warnings: string[] = []

    // First validate individual components
    const dateValidation = validateDate(date)
    const timeValidation = validateTime(time)

    errors.push(...dateValidation.errors, ...timeValidation.errors)
    warnings.push(...dateValidation.warnings, ...timeValidation.warnings)

    // If individual validations failed, return early
    if (!dateValidation.isValid || !timeValidation.isValid) {
      return { isValid: false, errors, warnings }
    }

    // Additional combined validations
    if (date && time) {
      try {
        // Create full datetime for validation
        const [hours, minutes] = time.split(':').map(Number)
        const appointmentDateTime = new Date(date)
        appointmentDateTime.setHours(hours, minutes, 0, 0)

        // Validate the datetime is not invalid
        if (isNaN(appointmentDateTime.getTime())) {
          errors.push({
            field: 'datetime',
            message: 'La combinaison date/heure n\'est pas valide',
            code: 'INVALID_DATETIME_COMBINATION'
          })
          return { isValid: false, errors, warnings }
        }

        // Check if the complete datetime is valid using business hours validator
        if (!validator.isValidBusinessDateTimeObject(appointmentDateTime)) {
          errors.push({
            field: 'datetime',
            message: 'La date et l\'heure sélectionnées ne correspondent pas aux heures d\'ouverture',
            code: 'INVALID_BUSINESS_DATETIME'
          })
          return { isValid: false, errors, warnings }
        }

        // Check if appointment is too soon (less than 2 hours from now)
        const now = new Date()
        const timeDiff = appointmentDateTime.getTime() - now.getTime()
        const hoursUntilAppointment = timeDiff / (1000 * 60 * 60)

        if (hoursUntilAppointment < 2 && hoursUntilAppointment > 0) {
          warnings.push('Rendez-vous dans moins de 2 heures - nous confirmerons la disponibilité rapidement.')
        }

        // Check if appointment is same day
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const appointmentDate = new Date(appointmentDateTime)
        appointmentDate.setHours(0, 0, 0, 0)
        
        if (appointmentDate.getTime() === today.getTime()) {
          warnings.push('Rendez-vous pour aujourd\'hui - nous confirmerons la disponibilité rapidement.')
        }

        // Enhanced timezone considerations
        const config = validator.getConfig()
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        
        if (config.timezone !== userTimezone) {
          // Calculate time difference for user awareness
          const userTime = new Date().toLocaleString('fr-FR', { 
            timeZone: userTimezone,
            hour: '2-digit',
            minute: '2-digit'
          })
          const businessTime = new Date().toLocaleString('fr-FR', { 
            timeZone: config.timezone,
            hour: '2-digit',
            minute: '2-digit'
          })
          
          warnings.push(`Horaires en ${config.timezone} (actuellement ${businessTime}). Votre heure locale: ${userTime}`)
        }

        // Check for weekend edge cases (in case business days config changes)
        const dayOfWeek = appointmentDateTime.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          errors.push({
            field: 'datetime',
            message: 'Les rendez-vous ne sont pas disponibles le weekend',
            code: 'WEEKEND_NOT_ALLOWED'
          })
          return { isValid: false, errors, warnings }
        }

      } catch (error) {
        console.error('Error validating datetime combination:', error)
        errors.push({
          field: 'general',
          message: 'Erreur lors de la validation de la date et heure',
          code: 'VALIDATION_ERROR'
        })
        return { isValid: false, errors, warnings }
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }, [validateDate, validateTime, validator])

  // Real-time validation with debouncing
  const validateInRealTime = useCallback((date: Date | null, time: string | null): AppointmentValidationResult => {
    const result = validateDateTime(date, time)
    setCurrentValidation(result)
    return result
  }, [validateDateTime])

  // Computed properties
  const hasErrors = currentValidation.errors.length > 0
  const hasWarnings = currentValidation.warnings.length > 0

  return {
    validateDate,
    validateTime,
    validateDateTime,
    validateInRealTime,
    clearValidation,
    currentValidation,
    hasErrors,
    hasWarnings
  }
}

// Helper function to get user-friendly error messages with timezone awareness
export function getValidationErrorMessage(error: AppointmentValidationError, t: (key: string, params?: Record<string, string>) => string): string {
  const validator = BusinessHoursValidator.getInstance()
  const config = validator.getConfig()
  
  const errorMessageKeys: Record<string, string> = {
    'DATE_REQUIRED': 'contact.form.appointment.errors.dateRequired',
    'TIME_REQUIRED': 'contact.form.appointment.errors.timeRequired',
    'INVALID_DATE': 'contact.form.appointment.errors.invalidDate',
    'INVALID_TIME_FORMAT': 'contact.form.appointment.errors.invalidTimeFormat',
    'DATE_IN_PAST': 'contact.form.appointment.errors.dateInPast',
    'INVALID_BUSINESS_DAY': 'contact.form.appointment.errors.invalidBusinessDay',
    'INVALID_BUSINESS_TIME': 'contact.form.appointment.errors.invalidBusinessTime',
    'INVALID_BUSINESS_DATETIME': 'contact.form.appointment.errors.invalidBusinessDateTime',
    'INVALID_DATETIME_COMBINATION': 'contact.form.appointment.errors.invalidDateTimeCombo',
    'WEEKEND_NOT_ALLOWED': 'contact.form.appointment.errors.weekendNotAllowed',
    'VALIDATION_ERROR': 'contact.form.appointment.errors.validationError'
  }

  const messageKey = errorMessageKeys[error.code]
  if (!messageKey) {
    return error.message
  }

  // Handle messages that need parameter substitution
  if (error.code === 'INVALID_BUSINESS_TIME' || error.code === 'INVALID_BUSINESS_DATETIME') {
    return t(messageKey, {
      startTime: config.startTime,
      endTime: config.endTime,
      timezone: config.timezone
    })
  }

  return t(messageKey)
}

// Helper function to get validation summary
export function getValidationSummary(validation: AppointmentValidationResult, t: (key: string, params?: Record<string, string>) => string): string {
  if (validation.isValid && validation.warnings.length === 0) {
    return t('contact.form.appointment.errors.validSlot')
  }

  if (!validation.isValid) {
    const count = validation.errors.length
    return t('contact.form.appointment.errors.errorsFound', {
      count: count.toString(),
      plural: count > 1 ? 's' : ''
    })
  }

  if (validation.warnings.length > 0) {
    const count = validation.warnings.length
    return t('contact.form.appointment.errors.validWithWarnings', {
      count: count.toString(),
      plural: count > 1 ? 's' : ''
    })
  }

  return t('contact.form.appointment.errors.unknownState')
}