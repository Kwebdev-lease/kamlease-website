/**
 * Tests for appointment booking service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AppointmentBookingService } from '../appointment-booking-service'
import { GraphApiClient } from '../microsoft-graph/graph-api-client'
import { BusinessHoursValidator } from '../business-hours-validator'

// Mock dependencies
vi.mock('../microsoft-graph/graph-api-client')
vi.mock('../business-hours-validator')

const mockGraphClient = {
  createCalendarEvent: vi.fn(),
  testConnection: vi.fn()
}

const mockValidator = {
  isInPast: vi.fn(),
  isValidBusinessDay: vi.fn(),
  isValidBusinessTime: vi.fn(),
  isValidBusinessDateTime: vi.fn()
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(GraphApiClient.getInstance as any).mockReturnValue(mockGraphClient)
  ;(BusinessHoursValidator.getInstance as any).mockReturnValue(mockValidator)
})

describe('AppointmentBookingService', () => {
  it('should handle successful appointment submission', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock successful validation
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    // Mock successful calendar event creation
    mockGraphClient.createCalendarEvent.mockResolvedValue({
      id: 'test-event-id',
      subject: 'RDV via le site'
    })
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      societe: 'Test Corp',
      message: 'Test message',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '14:30'
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(true)
    expect(result.type).toBe('appointment')
    expect(result.eventId).toBe('test-event-id')
    expect(mockGraphClient.createCalendarEvent).toHaveBeenCalled()
  })

  it('should handle validation errors for past dates', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock validation failure
    mockValidator.isInPast.mockReturnValue(true)
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2020-01-01'), // Past date
      appointmentTime: '14:30'
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(false)
    expect(result.type).toBe('appointment')
    expect(result.error).toContain('passé')
    expect(mockGraphClient.createCalendarEvent).not.toHaveBeenCalled()
  })

  it('should handle validation errors for invalid business hours', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock validation failure for business hours
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(false)
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '09:00' // Outside business hours
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(false)
    expect(result.type).toBe('appointment')
    expect(result.error).toContain('heures d\'ouverture')
    expect(mockGraphClient.createCalendarEvent).not.toHaveBeenCalled()
  })

  it('should handle validation errors for weekend dates', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock validation failure for weekend
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDay.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(false)
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2024-02-17'), // Saturday
      appointmentTime: '14:30'
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(false)
    expect(result.type).toBe('appointment')
    expect(result.error).toContain('jour ouvrable')
    expect(mockGraphClient.createCalendarEvent).not.toHaveBeenCalled()
  })

  it('should handle missing required fields', async () => {
    const service = AppointmentBookingService.getInstance()
    
    const invalidFormDataSets = [
      { prenom: 'Jean', message: 'Test', appointmentDate: new Date(), appointmentTime: '14:30' }, // Missing nom
      { nom: 'Dupont', message: 'Test', appointmentDate: new Date(), appointmentTime: '14:30' }, // Missing prenom
      { nom: 'Dupont', prenom: 'Jean', appointmentDate: new Date(), appointmentTime: '14:30' }, // Missing message
      { nom: 'Dupont', prenom: 'Jean', message: 'Test', appointmentTime: '14:30' }, // Missing date
      { nom: 'Dupont', prenom: 'Jean', message: 'Test', appointmentDate: new Date() } // Missing time
    ]
    
    for (const formData of invalidFormDataSets) {
      const result = await service.handleAppointmentSubmission(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('requis')
    }
  })

  it('should fallback to email when calendar fails', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock successful validation
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    // Mock calendar failure
    mockGraphClient.createCalendarEvent.mockRejectedValue(new Error('Calendar API error'))
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '14:30'
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(true)
    expect(result.type).toBe('email_fallback')
    expect(result.message).toContain('email')
  })

  it('should handle authentication errors with proper fallback', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock successful validation
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    // Mock authentication error
    const authError = new Error('Authentication failed')
    authError.name = 'AuthenticationError'
    mockGraphClient.createCalendarEvent.mockRejectedValue(authError)
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '14:30'
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(true)
    expect(result.type).toBe('email_fallback')
    expect(result.message).toContain('authentification')
  })

  it('should handle rate limiting errors', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock successful validation
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    // Mock rate limiting error
    const rateLimitError = new Error('Rate limit exceeded')
    rateLimitError.name = 'RateLimitError'
    mockGraphClient.createCalendarEvent.mockRejectedValue(rateLimitError)
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '14:30'
    }
    
    const result = await service.handleAppointmentSubmission(formData)
    
    expect(result.success).toBe(true)
    expect(result.type).toBe('email_fallback')
    expect(result.message).toContain('temporairement indisponible')
  })

  it('should handle simple message submission', async () => {
    const service = AppointmentBookingService.getInstance()
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Simple message'
    }
    
    const result = await service.handleMessageSubmission(formData)
    
    expect(result.success).toBe(true)
    expect(result.type).toBe('message')
    expect(result.message).toContain('envoyé avec succès')
  })

  it('should handle message submission with optional company field', async () => {
    const service = AppointmentBookingService.getInstance()
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      societe: 'Test Company',
      message: 'Message with company'
    }
    
    const result = await service.handleMessageSubmission(formData)
    
    expect(result.success).toBe(true)
    expect(result.type).toBe('message')
    expect(result.message).toContain('envoyé avec succès')
  })

  it('should handle message submission validation errors', async () => {
    const service = AppointmentBookingService.getInstance()
    
    const invalidMessageData = [
      { prenom: 'Jean', message: 'Test' }, // Missing nom
      { nom: 'Dupont', message: 'Test' }, // Missing prenom
      { nom: 'Dupont', prenom: 'Jean' }, // Missing message
      { nom: '', prenom: 'Jean', message: 'Test' }, // Empty nom
      { nom: 'Dupont', prenom: '', message: 'Test' }, // Empty prenom
      { nom: 'Dupont', prenom: 'Jean', message: '' } // Empty message
    ]
    
    for (const formData of invalidMessageData) {
      const result = await service.handleMessageSubmission(formData)
      expect(result.success).toBe(false)
      expect(result.error).toContain('requis')
    }
  })

  it('should test connectivity successfully', async () => {
    const service = AppointmentBookingService.getInstance()
    
    mockGraphClient.testConnection.mockResolvedValue(true)
    
    const result = await service.testConnectivity()
    
    expect(result.calendar).toBe(true)
    expect(result.email).toBe(true)
  })

  it('should handle calendar connectivity failure', async () => {
    const service = AppointmentBookingService.getInstance()
    
    mockGraphClient.testConnection.mockResolvedValue(false)
    
    const result = await service.testConnectivity()
    
    expect(result.calendar).toBe(false)
    expect(result.email).toBe(true) // Email should still work
  })

  it('should handle connectivity test errors', async () => {
    const service = AppointmentBookingService.getInstance()
    
    mockGraphClient.testConnection.mockRejectedValue(new Error('Connection test failed'))
    
    const result = await service.testConnectivity()
    
    expect(result.calendar).toBe(false)
    expect(result.email).toBe(true)
  })

  it('should format appointment data correctly for calendar API', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock successful validation
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    // Mock successful calendar event creation
    mockGraphClient.createCalendarEvent.mockResolvedValue({
      id: 'test-event-id',
      subject: 'RDV via le site'
    })
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      societe: 'Test Corp',
      message: 'Test message with special chars: àáâãäåæçèéêë',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '14:30'
    }
    
    await service.handleAppointmentSubmission(formData)
    
    expect(mockGraphClient.createCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'RDV via le site',
        timeZone: 'Europe/Paris',
        attendeeInfo: expect.objectContaining({
          nom: 'Dupont',
          prenom: 'Jean',
          societe: 'Test Corp',
          message: 'Test message with special chars: àáâãäåæçèéêë'
        })
      })
    )
  })

  it('should handle concurrent appointment submissions', async () => {
    const service = AppointmentBookingService.getInstance()
    
    // Mock successful validation for all
    mockValidator.isInPast.mockReturnValue(false)
    mockValidator.isValidBusinessDateTime.mockReturnValue(true)
    
    // Mock successful calendar event creation
    mockGraphClient.createCalendarEvent.mockResolvedValue({
      id: 'test-event-id',
      subject: 'RDV via le site'
    })
    
    const formData = {
      nom: 'Dupont',
      prenom: 'Jean',
      message: 'Test message',
      appointmentDate: new Date('2024-02-15'),
      appointmentTime: '14:30'
    }
    
    const promises = Array.from({ length: 3 }, () => 
      service.handleAppointmentSubmission(formData)
    )
    
    const results = await Promise.all(promises)
    
    expect(results).toHaveLength(3)
    expect(results.every(result => result.success)).toBe(true)
    expect(mockGraphClient.createCalendarEvent).toHaveBeenCalledTimes(3)
  })

  it('should maintain singleton pattern', () => {
    const instance1 = AppointmentBookingService.getInstance()
    const instance2 = AppointmentBookingService.getInstance()
    
    expect(instance1).toBe(instance2)
  })
})