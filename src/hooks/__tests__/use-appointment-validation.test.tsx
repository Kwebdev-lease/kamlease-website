/**
 * Tests for appointment validation hook
 */

import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAppointmentValidation } from '../use-appointment-validation'
import { BusinessHoursValidator } from '@/lib/business-hours-validator'

// Mock the BusinessHoursValidator
vi.mock('@/lib/business-hours-validator')

const mockValidator = {
  isInPast: vi.fn(),
  isValidBusinessDay: vi.fn(),
  isValidBusinessTime: vi.fn(),
  isValidBusinessDateTimeObject: vi.fn(),
  getConfig: vi.fn(() => ({
    timezone: 'Europe/Paris',
    workingDays: [1, 2, 3, 4, 5],
    startTime: '14:00',
    endTime: '16:30',
    slotDuration: 30
  }))
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(BusinessHoursValidator.getInstance as any).mockReturnValue(mockValidator)
})

describe('useAppointmentValidation', () => {
  it('should initialize with valid state', () => {
    const { result } = renderHook(() => useAppointmentValidation())
    
    expect(result.current.currentValidation.isValid).toBe(true)
    expect(result.current.currentValidation.errors).toHaveLength(0)
    expect(result.current.currentValidation.warnings).toHaveLength(0)
    expect(result.current.hasErrors).toBe(false)
    expect(result.current.hasWarnings).toBe(false)
  })

  describe('validateDate', () => {
    it('should return error for null date', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      const validation = result.current.validateDate(null)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('DATE_REQUIRED')
    })

    it('should return error for invalid date', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      const invalidDate = new Date('invalid')
      const validation = result.current.validateDate(invalidDate)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('INVALID_DATE')
    })

    it('should return error for past date', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isInPast.mockReturnValue(true)
      
      const pastDate = new Date('2020-01-01')
      const validation = result.current.validateDate(pastDate)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('DATE_IN_PAST')
    })

    it('should return error for non-business day', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isInPast.mockReturnValue(false)
      mockValidator.isValidBusinessDay.mockReturnValue(false)
      
      const weekend = new Date('2024-01-06') // Saturday
      const validation = result.current.validateDate(weekend)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('INVALID_BUSINESS_DAY')
    })

    it('should return valid for valid business day', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isInPast.mockReturnValue(false)
      mockValidator.isValidBusinessDay.mockReturnValue(true)
      
      const validDate = new Date('2024-01-08') // Monday
      const validation = result.current.validateDate(validDate)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should add warning for far future date', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isInPast.mockReturnValue(false)
      mockValidator.isValidBusinessDay.mockReturnValue(true)
      
      const farFutureDate = new Date()
      farFutureDate.setMonth(farFutureDate.getMonth() + 6)
      
      const validation = result.current.validateDate(farFutureDate)
      
      expect(validation.isValid).toBe(true)
      expect(validation.warnings).toHaveLength(1)
    })
  })

  describe('validateTime', () => {
    it('should return error for null time', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      const validation = result.current.validateTime(null)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('TIME_REQUIRED')
    })

    it('should return error for invalid time format', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      const validation = result.current.validateTime('25:00')
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('INVALID_TIME_FORMAT')
    })

    it('should return error for time outside business hours', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isValidBusinessTime.mockReturnValue(false)
      
      const validation = result.current.validateTime('10:00')
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0].code).toBe('INVALID_BUSINESS_TIME')
    })

    it('should return valid for valid business time', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isValidBusinessTime.mockReturnValue(true)
      
      const validation = result.current.validateTime('14:30')
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('validateDateTime', () => {
    it('should combine date and time validation errors', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      const validation = result.current.validateDateTime(null, null)
      
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toHaveLength(2) // DATE_REQUIRED + TIME_REQUIRED
    })

    it('should validate complete datetime object', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isInPast.mockReturnValue(false)
      mockValidator.isValidBusinessDay.mockReturnValue(true)
      mockValidator.isValidBusinessTime.mockReturnValue(true)
      mockValidator.isValidBusinessDateTimeObject.mockReturnValue(true)
      
      const validDate = new Date('2024-01-08')
      const validTime = '14:30'
      
      const validation = result.current.validateDateTime(validDate, validTime)
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should add warning for appointment too soon', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      mockValidator.isInPast.mockReturnValue(false)
      mockValidator.isValidBusinessDay.mockReturnValue(true)
      mockValidator.isValidBusinessTime.mockReturnValue(true)
      mockValidator.isValidBusinessDateTimeObject.mockReturnValue(true)
      
      // Create a valid business day (Monday) 1 hour from now
      const soonDate = new Date('2024-01-08T15:00:00') // Monday at 3 PM
      const soonTime = '15:00'
      
      const validation = result.current.validateDateTime(soonDate, soonTime)
      
      expect(validation.isValid).toBe(true)
      expect(validation.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('validateInRealTime', () => {
    it('should update current validation state', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      act(() => {
        result.current.validateInRealTime(null, null)
      })
      
      expect(result.current.hasErrors).toBe(true)
      expect(result.current.currentValidation.errors).toHaveLength(2)
    })
  })

  describe('clearValidation', () => {
    it('should reset validation state', () => {
      const { result } = renderHook(() => useAppointmentValidation())
      
      // First set some errors
      act(() => {
        result.current.validateInRealTime(null, null)
      })
      
      expect(result.current.hasErrors).toBe(true)
      
      // Then clear
      act(() => {
        result.current.clearValidation()
      })
      
      expect(result.current.hasErrors).toBe(false)
      expect(result.current.currentValidation.isValid).toBe(true)
      expect(result.current.currentValidation.errors).toHaveLength(0)
    })
  })
})