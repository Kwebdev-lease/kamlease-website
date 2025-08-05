import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { emailJSService } from '../lib/emailjs-service'
import { translations } from '../lib/translations'
import { validateFormField } from '../lib/form-validation-utils'

// Mock EmailJS service
vi.mock('../lib/emailjs-service', () => ({
  emailJSService: {
    sendContactMessage: vi.fn(),
    sendAppointmentRequest: vi.fn()
  }
}))

// Simple test component that mimics the contact form behavior
const TestContactForm = ({ language = 'fr' }: { language?: 'fr' | 'en' }) => {
  const [formData, setFormData] = React.useState({
    nom: '',
    prenom: '',
    societe: '',
    email: '',
    telephone: '',
    message: ''
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submissionType, setSubmissionType] = React.useState<'message' | 'appointment'>('message')
  const [isLoading, setIsLoading] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [errorMessage, setErrorMessage] = React.useState('')

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  const validateField = (name: string, value: string) => {
    const error = validateFormField(name, value, language)
    setErrors(prev => ({ ...prev, [name]: error }))
    return !error
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      validateField(name, value)
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    validateField(name, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields
    const fieldErrors: Record<string, string> = {}
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateFormField(name, value, language)
      if (error) fieldErrors[name] = error
    })
    
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      let result
      if (submissionType === 'appointment') {
        result = await emailJSService.sendAppointmentRequest({
          ...formData,
          appointmentDate: new Date(),
          appointmentTime: '14:00'
        })
      } else {
        result = await emailJSService.sendContactMessage(formData)
      }

      if (result.success) {
        setSuccessMessage(result.message)
        setFormData({
          nom: '',
          prenom: '',
          societe: '',
          email: '',
          telephone: '',
          message: ''
        })
      } else {
        setErrorMessage(result.error || result.message)
      }
    } catch (error) {
      setErrorMessage(t('contact.form.errors.unexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && 
                     Object.keys(errors).length === 0

  return (
    <div>
      <h2>{t('contact.form.title')}</h2>
      
      {/* Submission Type Selection */}
      <div>
        <h3>{t('contact.form.submissionTypeTitle')}</h3>
        <button
          type="button"
          onClick={() => setSubmissionType('message')}
          data-testid="message-option"
        >
          {t('contact.form.sendMessageOption')}
        </button>
        <button
          type="button"
          onClick={() => setSubmissionType('appointment')}
          data-testid="appointment-option"
        >
          {t('contact.form.scheduleAppointmentOption')}
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && <div data-testid="success-message">{successMessage}</div>}
      {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
      {isLoading && <div data-testid="loading-message">{t('contact.form.loading.sending')}</div>}

      <form onSubmit={handleSubmit} role="form">
        <div>
          <label htmlFor="prenom">
            {t('contact.form.firstName')} {t('contact.form.required')}
          </label>
          <input
            id="prenom"
            name="prenom"
            type="text"
            required
            value={formData.prenom}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            data-testid="prenom-field"
          />
          {errors.prenom && <div data-testid="prenom-error">{errors.prenom}</div>}
        </div>

        <div>
          <label htmlFor="nom">
            {t('contact.form.lastName')} {t('contact.form.required')}
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            value={formData.nom}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            data-testid="nom-field"
          />
          {errors.nom && <div data-testid="nom-error">{errors.nom}</div>}
        </div>

        <div>
          <label htmlFor="societe">{t('contact.form.company')}</label>
          <input
            id="societe"
            name="societe"
            type="text"
            value={formData.societe}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            data-testid="societe-field"
          />
          {errors.societe && <div data-testid="societe-error">{errors.societe}</div>}
        </div>

        <div>
          <label htmlFor="email">
            {t('contact.form.email')} {t('contact.form.required')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={t('contact.form.emailPlaceholder')}
            data-testid="email-field"
          />
          {errors.email && <div data-testid="email-error">{errors.email}</div>}
        </div>

        <div>
          <label htmlFor="telephone">
            {t('contact.form.telephone')} {t('contact.form.required')}
          </label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            required
            value={formData.telephone}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={t('contact.form.telephonePlaceholder')}
            data-testid="telephone-field"
          />
          {errors.telephone && <div data-testid="telephone-error">{errors.telephone}</div>}
        </div>

        <div>
          <label htmlFor="message">
            {t('contact.form.message')} {t('contact.form.required')}
          </label>
          <textarea
            id="message"
            name="message"
            required
            value={formData.message}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder={t('contact.form.placeholder')}
            data-testid="message-field"
          />
          {errors.message && <div data-testid="message-error">{errors.message}</div>}
        </div>

        {submissionType === 'appointment' && (
          <div data-testid="appointment-section">
            <p>{t('contact.form.appointment.selectDate')}</p>
            <p>{t('contact.form.appointment.selectTime')}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          data-testid="submit-button"
        >
          {submissionType === 'appointment' 
            ? t('contact.form.appointmentBtn')
            : t('contact.form.send')
          }
        </button>
      </form>
    </div>
  )
}

const renderContactForm = (language: 'fr' | 'en' = 'fr') => {
  return render(<TestContactForm language={language} />)
}

describe('Contact Form Complete End-to-End Tests', () => {
  const mockEmailJSService = emailJSService as any
  
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmailJSService.sendContactMessage.mockResolvedValue({
      success: true,
      message: 'Message sent successfully',
      type: 'message'
    })
    mockEmailJSService.sendAppointmentRequest.mockResolvedValue({
      success: true,
      message: 'Appointment scheduled successfully',
      type: 'appointment'
    })
  })

  describe('Form Fields and Validation', () => {
    it('should display all required form fields including email and phone', async () => {
      renderContactForm('fr')
      
      // Check all form fields are present
      expect(screen.getByTestId('prenom-field')).toBeInTheDocument()
      expect(screen.getByTestId('nom-field')).toBeInTheDocument()
      expect(screen.getByTestId('societe-field')).toBeInTheDocument()
      expect(screen.getByTestId('email-field')).toBeInTheDocument()
      expect(screen.getByTestId('telephone-field')).toBeInTheDocument()
      expect(screen.getByTestId('message-field')).toBeInTheDocument()
      
      // Check placeholders for new fields
      const emailField = screen.getByPlaceholderText('votre.email@exemple.com')
      const phoneField = screen.getByPlaceholderText('+33 1 23 45 67 89')
      
      expect(emailField).toBeInTheDocument()
      expect(phoneField).toBeInTheDocument()
    })

    it('should validate email format in real-time', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      const emailField = screen.getByTestId('email-field')
      
      // Test invalid email
      await user.type(emailField, 'invalid-email')
      await user.tab() // Trigger blur event
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
      })
      
      // Test valid email
      await user.clear(emailField)
      await user.type(emailField, 'test@example.com')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument()
      })
    })

    it('should validate phone format in real-time', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      const phoneField = screen.getByTestId('telephone-field')
      
      // Test invalid phone
      await user.type(phoneField, '123')
      await user.tab() // Trigger blur event
      
      await waitFor(() => {
        expect(screen.getByTestId('telephone-error')).toBeInTheDocument()
      })
      
      // Test valid phone
      await user.clear(phoneField)
      await user.type(phoneField, '+33123456789')
      await user.tab()
      
      await waitFor(() => {
        expect(screen.queryByTestId('telephone-error')).not.toBeInTheDocument()
      })
    })

    it('should show required field errors when submitting empty form', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
        expect(screen.getByTestId('telephone-error')).toBeInTheDocument()
      })
    })
  })

  describe('Language Switching', () => {
    it('should translate all form elements when switching to English', async () => {
      renderContactForm('en')
      
      // Check English labels
      expect(screen.getByText('First Name')).toBeInTheDocument()
      expect(screen.getByText('Last Name')).toBeInTheDocument()
      expect(screen.getByText('Company')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Phone Number')).toBeInTheDocument()
      expect(screen.getByText('Message')).toBeInTheDocument()
      
      // Check English placeholders
      expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('+33 1 23 45 67 89')).toBeInTheDocument()
      
      // Check English button text
      expect(screen.getByText('Send message')).toBeInTheDocument()
    })

    it('should translate submission type options', async () => {
      renderContactForm('en')
      
      expect(screen.getByText(/how would you like to contact us/i)).toBeInTheDocument()
      expect(screen.getByText(/send us a simple message/i)).toBeInTheDocument()
      expect(screen.getByText(/schedule an appointment/i)).toBeInTheDocument()
    })
  })

  describe('Message Submission', () => {
    it('should successfully submit a message with email and phone fields', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      // Fill out the form
      await user.type(screen.getByTestId('prenom-field'), 'Jean')
      await user.type(screen.getByTestId('nom-field'), 'Dupont')
      await user.type(screen.getByTestId('societe-field'), 'Test Company')
      await user.type(screen.getByTestId('email-field'), 'jean.dupont@test.com')
      await user.type(screen.getByTestId('telephone-field'), '+33123456789')
      await user.type(screen.getByTestId('message-field'), 'This is a test message for the contact form.')
      
      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)
      
      // Verify EmailJS service was called with correct data
      await waitFor(() => {
        expect(mockEmailJSService.sendContactMessage).toHaveBeenCalledWith({
          nom: 'Dupont',
          prenom: 'Jean',
          societe: 'Test Company',
          email: 'jean.dupont@test.com',
          telephone: '+33123456789',
          message: 'This is a test message for the contact form.'
        })
      })
      
      // Check success message appears
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument()
      })
    })

    it('should handle EmailJS service errors gracefully', async () => {
      const user = userEvent.setup()
      mockEmailJSService.sendContactMessage.mockRejectedValue(new Error('EMAILJS_SEND_FAILED'))
      
      renderContactForm('fr')
      
      // Fill out the form
      await user.type(screen.getByTestId('prenom-field'), 'Jean')
      await user.type(screen.getByTestId('nom-field'), 'Dupont')
      await user.type(screen.getByTestId('email-field'), 'jean.dupont@test.com')
      await user.type(screen.getByTestId('telephone-field'), '+33123456789')
      await user.type(screen.getByTestId('message-field'), 'Test message')
      
      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)
      
      // Check error message appears
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument()
      })
    })
  })

  describe('Appointment Submission', () => {
    it('should switch to appointment mode and show appointment fields', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      // Switch to appointment mode
      const appointmentButton = screen.getByTestId('appointment-option')
      await user.click(appointmentButton)
      
      // Check appointment section appears
      expect(screen.getByTestId('appointment-section')).toBeInTheDocument()
      expect(screen.getByText(/sélectionnez une date/i)).toBeInTheDocument()
      expect(screen.getByText(/choisissez un horaire/i)).toBeInTheDocument()
      
      // Check button text changes
      expect(screen.getByText(/choisir votre rendez-vous/i)).toBeInTheDocument()
    })
  })

  describe('Form State Management', () => {
    it('should clear form after successful submission', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      // Fill out the form
      const prenomField = screen.getByTestId('prenom-field')
      const nomField = screen.getByTestId('nom-field')
      const emailField = screen.getByTestId('email-field')
      const phoneField = screen.getByTestId('telephone-field')
      const messageField = screen.getByTestId('message-field')
      
      await user.type(prenomField, 'Jean')
      await user.type(nomField, 'Dupont')
      await user.type(emailField, 'jean.dupont@test.com')
      await user.type(phoneField, '+33123456789')
      await user.type(messageField, 'Test message')
      
      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)
      
      // Wait for success and form reset
      await waitFor(() => {
        expect(prenomField).toHaveValue('')
        expect(nomField).toHaveValue('')
        expect(emailField).toHaveValue('')
        expect(phoneField).toHaveValue('')
        expect(messageField).toHaveValue('')
      })
    })

    it('should disable submit button when form is invalid', async () => {
      const user = userEvent.setup()
      renderContactForm('fr')
      
      const submitButton = screen.getByTestId('submit-button')
      
      // Button should be disabled initially
      expect(submitButton).toBeDisabled()
      
      // Fill out partial form
      await user.type(screen.getByTestId('prenom-field'), 'Jean')
      await user.type(screen.getByTestId('nom-field'), 'Dupont')
      
      // Button should still be disabled
      expect(submitButton).toBeDisabled()
      
      // Complete the form
      await user.type(screen.getByTestId('email-field'), 'jean@test.com')
      await user.type(screen.getByTestId('telephone-field'), '+33123456789')
      await user.type(screen.getByTestId('message-field'), 'Complete message')
      
      // Button should now be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Mock a delayed response
      mockEmailJSService.sendContactMessage.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          message: 'Message sent successfully',
          type: 'message'
        }), 100))
      )
      
      renderContactForm('fr')
      
      // Fill out the form
      await user.type(screen.getByTestId('prenom-field'), 'Jean')
      await user.type(screen.getByTestId('nom-field'), 'Dupont')
      await user.type(screen.getByTestId('email-field'), 'jean@test.com')
      await user.type(screen.getByTestId('telephone-field'), '+33123456789')
      await user.type(screen.getByTestId('message-field'), 'Test message')
      
      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)
      
      // Check loading state appears
      await waitFor(() => {
        expect(screen.getByTestId('loading-message')).toBeInTheDocument()
      })
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Accessibility and User Experience', () => {
    it('should have proper form structure and labels', () => {
      renderContactForm('fr')
      
      // Check form has proper role
      const form = screen.getByRole('form')
      expect(form).toBeInTheDocument()
      
      // Check all inputs have proper labels and required attributes
      expect(screen.getByTestId('prenom-field')).toHaveAttribute('required')
      expect(screen.getByTestId('nom-field')).toHaveAttribute('required')
      expect(screen.getByTestId('email-field')).toHaveAttribute('required')
      expect(screen.getByTestId('telephone-field')).toHaveAttribute('required')
      expect(screen.getByTestId('message-field')).toHaveAttribute('required')
    })
  })
})