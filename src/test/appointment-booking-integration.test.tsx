/**
 * Comprehensive integration tests for appointment booking flow
 */

import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Contact } from '@/components/Contact'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { AppointmentBookingService } from '@/lib/appointment-booking-service'

// Mock dependencies
vi.mock('@/lib/appointment-booking-service')

const mockAppointmentService = {
  handleAppointmentSubmission: vi.fn(),
  handleMessageSubmission: vi.fn(),
  testConnectivity: vi.fn()
}

const renderContact = () => {
  return render(
    <LanguageProvider>
      <Contact />
    </LanguageProvider>
  )
}

describe('Appointment Booking Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(AppointmentBookingService.getInstance as any).mockReturnValue(mockAppointmentService)
    
    mockAppointmentService.testConnectivity.mockResolvedValue({
      calendar: true,
      email: true
    })
  })

  describe('Complete appointment booking flow', () => {
    it('should render appointment booking form', async () => {
      const user = userEvent.setup()
      
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: true,
        type: 'appointment',
        eventId: 'test-event-123',
        message: 'Rendez-vous confirmé avec succès!'
      })
      
      renderContact()
      
      // Switch to appointment mode
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      // Fill in form fields
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      // Wait for date picker to appear
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      // Verify connectivity test was called
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })

    it('should handle appointment booking with fallback to email', async () => {
      const user = userEvent.setup()
      
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: true,
        type: 'email_fallback',
        message: 'Calendar temporarily unavailable. Request sent via email.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })
  })

  describe('Error handling scenarios', () => {
    it('should handle API failures gracefully', async () => {
      const user = userEvent.setup()
      
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: false,
        type: 'appointment',
        error: 'Connection error. Please try again.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })

    it('should handle validation errors', async () => {
      const user = userEvent.setup()
      
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: false,
        type: 'appointment',
        error: 'Selected date is in the past. Please choose a future date.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })
  })

  describe('Form validation and user feedback', () => {
    it('should show real-time validation feedback', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      // Submit button should be disabled initially
      const submitButton = screen.getByRole('button', { name: /Choose your appointment/ })
      expect(submitButton).toBeDisabled()
      
      // Fill form fields
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      expect(submitButton).toBeDisabled()
      
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      expect(submitButton).toBeDisabled()
      
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })
  })

  describe('Accessibility testing', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await userEvent.setup().click(appointmentButton)
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      // Check form accessibility
      expect(screen.getByLabelText(/First name/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/Last name/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/Message/)).toHaveAttribute('aria-required', 'true')
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/First name/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Last name/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Company/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Message/)).toHaveFocus()
    })
  })

  describe('Message mode integration', () => {
    it('should handle simple message submission successfully', async () => {
      const user = userEvent.setup()
      
      mockAppointmentService.handleMessageSubmission.mockResolvedValue({
        success: true,
        type: 'message',
        message: 'Message sent successfully!'
      })
      
      renderContact()
      
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Simple message test')
      
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      // Verify service was called correctly
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalledWith({
        nom: 'Dupont',
        prenom: 'Jean',
        message: 'Simple message test'
      })
    })

    it('should handle message submission errors', async () => {
      const user = userEvent.setup()
      
      mockAppointmentService.handleMessageSubmission.mockResolvedValue({
        success: false,
        type: 'message',
        error: 'Error sending message. Please try again.'
      })
      
      renderContact()
      
      await user.type(screen.getByLabelText(/First name/), 'Jean')
      await user.type(screen.getByLabelText(/Last name/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalled()
    })
  })
})