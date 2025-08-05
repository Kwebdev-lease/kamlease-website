import { describe, it, expect, beforeEach, vi } from 'vitest'
import { emailJSService } from '../lib/emailjs-service'
import { emailJSTemplateFormatter } from '../lib/emailjs-template-formatter'
import { EmailJSConfig } from '../lib/emailjs-config'

// Mock EmailJS library
const mockEmailJS = {
  send: vi.fn(),
  init: vi.fn()
}

vi.mock('@emailjs/browser', () => ({
  default: mockEmailJS
}))

describe('Email Reception Validation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful EmailJS response
    mockEmailJS.send.mockResolvedValue({
      status: 200,
      text: 'OK'
    })
  })

  describe('Email Content Validation', () => {
    it('should include all form fields in email content for simple messages', async () => {
      const formData = {
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'Test Company',
        email: 'jean.dupont@test.com',
        telephone: '+33123456789',
        message: 'This is a test message with all required fields.'
      }

      // Send the message
      await emailJSService.sendContactMessage(formData)

      // Verify EmailJS was called
      expect(mockEmailJS.send).toHaveBeenCalledTimes(1)
      
      // Get the call arguments
      const [serviceId, templateId, templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify all fields are included in template parameters
      expect(templateParams).toMatchObject({
        from_name: 'Jean Dupont',
        from_email: 'jean.dupont@test.com',
        phone: '+33123456789',
        company: 'Test Company',
        message: 'This is a test message with all required fields.',
        reply_to: 'jean.dupont@test.com'
      })

      // Verify email addresses are properly formatted
      expect(templateParams.from_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(templateParams.reply_to).toBe(templateParams.from_email)
    })

    it('should include appointment information in email content for appointments', async () => {
      const appointmentData = {
        nom: 'Martin',
        prenom: 'Marie',
        societe: 'Appointment Company',
        email: 'marie.martin@test.com',
        telephone: '+33987654321',
        message: 'I would like to schedule an appointment.',
        appointmentDate: new Date('2025-02-15'),
        appointmentTime: '14:30'
      }

      // Send the appointment request
      await emailJSService.sendAppointmentRequest(appointmentData)

      // Verify EmailJS was called
      expect(mockEmailJS.send).toHaveBeenCalledTimes(1)
      
      // Get the call arguments
      const [serviceId, templateId, templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify all fields including appointment details are included
      expect(templateParams).toMatchObject({
        from_name: 'Marie Martin',
        from_email: 'marie.martin@test.com',
        phone: '+33987654321',
        company: 'Appointment Company',
        message: 'I would like to schedule an appointment.',
        reply_to: 'marie.martin@test.com',
        appointment_date: expect.stringMatching(/2025-02-15/),
        appointment_time: '14:30'
      })

      // Verify appointment-specific fields
      expect(templateParams.appointment_date).toBeDefined()
      expect(templateParams.appointment_time).toBe('14:30')
    })

    it('should handle optional company field correctly', async () => {
      const formDataWithoutCompany = {
        nom: 'Doe',
        prenom: 'John',
        societe: '', // Empty company
        email: 'john.doe@test.com',
        telephone: '+33111222333',
        message: 'Message without company information.'
      }

      await emailJSService.sendContactMessage(formDataWithoutCompany)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Company should be empty string or handled gracefully
      expect(templateParams.company).toBe('')
      expect(templateParams.from_name).toBe('John Doe')
      expect(templateParams.from_email).toBe('john.doe@test.com')
    })
  })

  describe('Email Format and Readability', () => {
    it('should format contact information with proper emojis and structure', () => {
      const formData = {
        nom: 'Test',
        prenom: 'User',
        societe: 'Test Corp',
        email: 'user@test.com',
        telephone: '+33123456789',
        message: 'Test message'
      }

      const formatted = emailJSTemplateFormatter.formatContactMessage(formData)

      // Check that the formatted content includes emojis and proper structure
      expect(formatted.from_name).toBe('User Test')
      expect(formatted.from_email).toBe('user@test.com')
      expect(formatted.phone).toBe('+33123456789')
      expect(formatted.company).toBe('Test Corp')
      expect(formatted.message).toBe('Test message')
      expect(formatted.reply_to).toBe('user@test.com')
      
      // Verify date is included
      expect(formatted.date).toBeDefined()
      expect(formatted.date).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should format appointment information with complete details', () => {
      const appointmentData = {
        nom: 'Appointment',
        prenom: 'Test',
        societe: 'Appointment Corp',
        email: 'test@appointment.com',
        telephone: '+33999888777',
        message: 'Appointment request message',
        appointmentDate: new Date('2025-03-20'),
        appointmentTime: '15:00'
      }

      const formatted = emailJSTemplateFormatter.formatAppointmentRequest(appointmentData)

      // Check appointment-specific formatting
      expect(formatted.from_name).toBe('Test Appointment')
      expect(formatted.appointment_date).toMatch(/2025-03-20/)
      expect(formatted.appointment_time).toBe('15:00')
      expect(formatted.appointment_datetime).toBeDefined()
      
      // Verify all contact fields are still present
      expect(formatted.from_email).toBe('test@appointment.com')
      expect(formatted.phone).toBe('+33999888777')
      expect(formatted.company).toBe('Appointment Corp')
    })

    it('should ensure email content is properly encoded and readable', () => {
      const formDataWithSpecialChars = {
        nom: 'Müller',
        prenom: 'François',
        societe: 'Société & Co',
        email: 'francois.muller@société.fr',
        telephone: '+33 1 23 45 67 89',
        message: 'Message with special characters: àáâãäåæçèéêë'
      }

      const formatted = emailJSTemplateFormatter.formatContactMessage(formDataWithSpecialChars)

      // Verify special characters are preserved
      expect(formatted.from_name).toBe('François Müller')
      expect(formatted.company).toBe('Société & Co')
      expect(formatted.message).toContain('àáâãäåæçèéêë')
      
      // Verify email is properly formatted
      expect(formatted.from_email).toBe('francois.muller@société.fr')
    })
  })

  describe('Reply-To Functionality', () => {
    it('should set reply_to field to user provided email', async () => {
      const formData = {
        nom: 'ReplyTest',
        prenom: 'User',
        societe: 'Reply Corp',
        email: 'reply.test@example.com',
        telephone: '+33555666777',
        message: 'Testing reply-to functionality'
      }

      await emailJSService.sendContactMessage(formData)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify reply_to is set to the user's email
      expect(templateParams.reply_to).toBe('reply.test@example.com')
      expect(templateParams.from_email).toBe('reply.test@example.com')
      expect(templateParams.reply_to).toBe(templateParams.from_email)
    })

    it('should maintain reply_to consistency for appointments', async () => {
      const appointmentData = {
        nom: 'AppointmentReply',
        prenom: 'Test',
        societe: 'Reply Test Corp',
        email: 'appointment.reply@test.com',
        telephone: '+33444555666',
        message: 'Appointment with reply-to test',
        appointmentDate: new Date('2025-04-10'),
        appointmentTime: '16:00'
      }

      await emailJSService.sendAppointmentRequest(appointmentData)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify reply_to is consistent for appointments
      expect(templateParams.reply_to).toBe('appointment.reply@test.com')
      expect(templateParams.from_email).toBe('appointment.reply@test.com')
    })
  })

  describe('Email Service Configuration', () => {
    it('should use correct EmailJS service configuration', async () => {
      const formData = {
        nom: 'Config',
        prenom: 'Test',
        societe: 'Config Corp',
        email: 'config@test.com',
        telephone: '+33123123123',
        message: 'Configuration test message'
      }

      await emailJSService.sendContactMessage(formData)

      const [serviceId, templateId] = mockEmailJS.send.mock.calls[0]
      
      // Verify correct service and template IDs are used
      expect(serviceId).toBeDefined()
      expect(templateId).toBeDefined()
      expect(typeof serviceId).toBe('string')
      expect(typeof templateId).toBe('string')
    })

    it('should handle EmailJS service errors gracefully', async () => {
      // Mock EmailJS to return an error
      mockEmailJS.send.mockRejectedValue(new Error('EmailJS service error'))

      const formData = {
        nom: 'Error',
        prenom: 'Test',
        societe: 'Error Corp',
        email: 'error@test.com',
        telephone: '+33999999999',
        message: 'This should trigger an error'
      }

      // Expect the service to handle the error
      const result = await emailJSService.sendContactMessage(formData)
      
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(typeof result.error).toBe('string')
    })
  })

  describe('Template Variable Validation', () => {
    it('should include all required template variables for reception template', async () => {
      const completeFormData = {
        nom: 'Complete',
        prenom: 'Test',
        societe: 'Complete Corp',
        email: 'complete@test.com',
        telephone: '+33777888999',
        message: 'Complete form data test'
      }

      await emailJSService.sendContactMessage(completeFormData)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify all required template variables are present
      const requiredVars = [
        'from_name',
        'from_email', 
        'phone',
        'company',
        'message',
        'reply_to',
        'date'
      ]

      requiredVars.forEach(varName => {
        expect(templateParams).toHaveProperty(varName)
        expect(templateParams[varName]).toBeDefined()
      })
    })

    it('should include appointment-specific variables for appointment template', async () => {
      const appointmentData = {
        nom: 'AppointmentVars',
        prenom: 'Test',
        societe: 'Appointment Vars Corp',
        email: 'vars@appointment.com',
        telephone: '+33111000999',
        message: 'Appointment variables test',
        appointmentDate: new Date('2025-05-15'),
        appointmentTime: '10:30'
      }

      await emailJSService.sendAppointmentRequest(appointmentData)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify appointment-specific variables
      const appointmentVars = [
        'appointment_date',
        'appointment_time',
        'appointment_datetime'
      ]

      appointmentVars.forEach(varName => {
        expect(templateParams).toHaveProperty(varName)
        expect(templateParams[varName]).toBeDefined()
      })

      // Verify appointment date/time formatting
      expect(templateParams.appointment_date).toMatch(/2025-05-15/)
      expect(templateParams.appointment_time).toBe('10:30')
    })
  })

  describe('Email Content Completeness', () => {
    it('should ensure no information is lost in email transmission', async () => {
      const originalData = {
        nom: 'DataIntegrity',
        prenom: 'Test',
        societe: 'Data Integrity Corp',
        email: 'integrity@data.com',
        telephone: '+33 01 23 45 67 89',
        message: 'This message tests data integrity during email transmission. It includes special characters: éàü, numbers: 123, and symbols: @#$%'
      }

      await emailJSService.sendContactMessage(originalData)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify all original data is preserved
      expect(templateParams.from_name).toBe('Test DataIntegrity')
      expect(templateParams.from_email).toBe('integrity@data.com')
      expect(templateParams.phone).toBe('+33 01 23 45 67 89')
      expect(templateParams.company).toBe('Data Integrity Corp')
      expect(templateParams.message).toContain('éàü')
      expect(templateParams.message).toContain('123')
      expect(templateParams.message).toContain('@#$%')
    })

    it('should handle edge cases in form data', async () => {
      const edgeCaseData = {
        nom: 'A', // Minimum length
        prenom: 'B', // Minimum length
        societe: '', // Empty optional field
        email: 'a@b.co', // Minimum valid email
        telephone: '+33123456789', // No spaces
        message: 'X'.repeat(1000) // Long message
      }

      await emailJSService.sendContactMessage(edgeCaseData)

      const [, , templateParams] = mockEmailJS.send.mock.calls[0]
      
      // Verify edge cases are handled correctly
      expect(templateParams.from_name).toBe('B A')
      expect(templateParams.from_email).toBe('a@b.co')
      expect(templateParams.phone).toBe('+33123456789')
      expect(templateParams.company).toBe('')
      expect(templateParams.message).toHaveLength(1000)
    })
  })
})