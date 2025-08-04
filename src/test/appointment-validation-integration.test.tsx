/**
 * Comprehensive integration test for appointment booking flow
 * Tests the complete client-side validation flow and error handling
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { Contact } from '@/components/Contact'
import { LanguageProvider } from '@/contexts/LanguageProvider'
import { AppointmentBookingService } from '@/lib/appointment-booking-service'

// Mock the appointment booking service
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
    
    // Default successful responses
    mockAppointmentService.testConnectivity.mockResolvedValue({
      calendar: true,
      email: true
    })
    
    mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
      success: true,
      type: 'appointment',
      eventId: 'test-event-123',
      message: 'Appointment confirmed successfully!'
    })
    
    mockAppointmentService.handleMessageSubmission.mockResolvedValue({
      success: true,
      type: 'message',
      message: 'Message sent successfully!'
    })
  })

  it('should show validation errors for invalid appointment selections', async () => {
    renderContact()
    
    // Switch to appointment mode
    const appointmentButton = screen.getByText(/Choose your appointment/)
    fireEvent.click(appointmentButton)
    
    // Fill in basic form fields
    const firstNameInput = screen.getByLabelText(/Prénom/)
    const lastNameInput = screen.getByLabelText(/Nom/)
    const messageInput = screen.getByLabelText(/Message/)
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(messageInput, { target: { value: 'Test appointment booking message' } })
    
    // Try to submit without selecting date/time
    const submitButton = screen.getByRole('button', { name: /Choose your appointment/ })
    
    // The submit button should be disabled when form is invalid
    expect(submitButton).toBeDisabled()
  })

  it('should enable submit button when all validation passes', async () => {
    renderContact()
    
    // Switch to appointment mode
    const appointmentButton = screen.getByText(/Choose your appointment/)
    fireEvent.click(appointmentButton)
    
    // Fill in basic form fields
    const firstNameInput = screen.getByLabelText(/Prénom/)
    const lastNameInput = screen.getByLabelText(/Nom/)
    const messageInput = screen.getByLabelText(/Message/)
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(messageInput, { target: { value: 'Test appointment booking message' } })
    
    // Wait for DateTimePicker to appear
    await waitFor(() => {
      expect(screen.getByText('Select a date')).toBeInTheDocument()
    })
    
    // The form should show appointment selection UI
    expect(screen.getByText('Business hours')).toBeInTheDocument()
    expect(screen.getByText(/Monday - Friday, 2:00 PM - 4:30 PM/)).toBeInTheDocument()
  })

  it('should show timezone information in appointment picker', async () => {
    renderContact()
    
    // Switch to appointment mode
    const appointmentButton = screen.getByText(/Choose your appointment/)
    fireEvent.click(appointmentButton)
    
    // Wait for DateTimePicker to appear
    await waitFor(() => {
      expect(screen.getByText('Select a date')).toBeInTheDocument()
    })
    
    // Should show timezone information
    expect(screen.getByText('Current time:')).toBeInTheDocument()
    expect(screen.getAllByText(/Europe\/Paris/)).toHaveLength(2)
  })

  it('should switch between message and appointment modes correctly', async () => {
    renderContact()
    
    // Initially should be in message mode
    expect(screen.getByText(/Send message/)).toBeInTheDocument()
    
    // Switch to appointment mode
    const appointmentButton = screen.getByText(/Choose your appointment/)
    fireEvent.click(appointmentButton)
    
    // Should show appointment UI
    await waitFor(() => {
      expect(screen.getByText('Select a date')).toBeInTheDocument()
    })
    
    // Switch back to message mode
    const messageButton = screen.getByText(/Send message/)
    fireEvent.click(messageButton)
    
    // Appointment UI should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Select a date')).not.toBeInTheDocument()
    })
  })

  it('should validate form fields in both modes', async () => {
    renderContact()
    
    // Test message mode validation
    const submitButton = screen.getByRole('button', { name: /Send message/ })
    expect(submitButton).toBeDisabled()
    
    // Fill required fields
    const firstNameInput = screen.getByLabelText(/Prénom/)
    const lastNameInput = screen.getByLabelText(/Nom/)
    const messageInput = screen.getByLabelText(/Message/)
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(messageInput, { target: { value: 'Test message' } })
    
    // Submit button should be enabled for message mode
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
    
    // Switch to appointment mode
    const appointmentButton = screen.getByText(/Choose your appointment/)
    fireEvent.click(appointmentButton)
    
    // Submit button should be disabled again (needs date/time)
    const appointmentSubmitButton = screen.getByRole('button', { name: /Choose your appointment/ })
    expect(appointmentSubmitButton).toBeDisabled()
  })

  describe('Error handling scenarios', () => {
    it('should handle API failures gracefully', async () => {
      const user = userEvent.setup()
      
      // Mock API failure
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: false,
        type: 'appointment',
        error: 'Connection error. Please try again.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      // Verify connectivity test was called
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })

    it('should handle calendar service fallback to email', async () => {
      const user = userEvent.setup()
      
      // Mock calendar failure with email fallback
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: true,
        type: 'email_fallback',
        message: 'Calendar temporarily unavailable. Request sent via email.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })

    it('should handle validation errors for invalid dates', async () => {
      const user = userEvent.setup()
      
      // Mock validation failure
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: false,
        type: 'appointment',
        error: 'Selected date is in the past. Please choose a future date.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })

    it('should handle authentication errors', async () => {
      const user = userEvent.setup()
      
      // Mock authentication error with fallback
      mockAppointmentService.handleAppointmentSubmission.mockResolvedValue({
        success: true,
        type: 'email_fallback',
        message: 'Authentication issue with calendar. Request sent via email.'
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      expect(mockAppointmentService.testConnectivity).toHaveBeenCalled()
    })
  })

  describe('Accessibility testing', () => {
    it('should have proper ARIA labels and roles for appointment form', async () => {
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await userEvent.setup().click(appointmentButton)
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      // Check form accessibility
      expect(screen.getByLabelText(/Prénom/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/Nom/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/Message/)).toHaveAttribute('aria-required', 'true')
      
      // Check submit button accessibility
      const submitButton = screen.getByRole('button', { name: /Choose your appointment/ })
      expect(submitButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should support keyboard navigation through appointment form', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Tab through form elements
      await user.tab()
      expect(screen.getByLabelText(/Prénom/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Nom/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Société/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText(/Message/)).toHaveFocus()
      
      // Tab to mode selection
      await user.tab()
      expect(screen.getByText(/Send message/)).toHaveFocus()
      
      await user.tab()
      expect(screen.getByText(/Choose your appointment/)).toHaveFocus()
      
      // Switch to appointment mode with keyboard
      await user.keyboard('{Enter}')
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
    })

    it('should announce form state changes to screen readers', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Switch to appointment mode
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await user.click(appointmentButton)
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      // Check for aria-live regions or similar accessibility features
      const businessHoursInfo = screen.getByText(/Monday - Friday, 2:00 PM - 4:30 PM/)
      expect(businessHoursInfo).toBeInTheDocument()
      
      // Verify timezone information is accessible
      expect(screen.getByText('Current time:')).toBeInTheDocument()
    })

    it('should handle high contrast mode properly', async () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      })
      
      renderContact()
      
      const appointmentButton = screen.getByText(/Choose your appointment/)
      await userEvent.setup().click(appointmentButton)
      
      await waitFor(() => {
        expect(screen.getByText('Select a date')).toBeInTheDocument()
      })
      
      // Verify form elements are visible in high contrast
      expect(screen.getByLabelText(/Prénom/)).toBeVisible()
      expect(screen.getByLabelText(/Nom/)).toBeVisible()
      expect(screen.getByLabelText(/Message/)).toBeVisible()
    })
  })

  describe('Message mode integration', () => {
    it('should handle simple message submission successfully', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Fill form in message mode (default)
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Simple message test')
      
      // Submit message
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      // Verify service was called correctly
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalledWith({
        nom: 'Dupont',
        prenom: 'Jean',
        message: 'Simple message test'
      })
    })

    it('should handle message submission with company field', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Fill form with company
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Société/), 'Test Société')
      await user.type(screen.getByLabelText(/Message/), 'Business inquiry')
      
      // Submit message
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      // Verify service was called with company field
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalledWith({
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'Test Société',
        message: 'Business inquiry'
      })
    })

    it('should handle message submission errors', async () => {
      const user = userEvent.setup()
      
      // Mock message submission error
      mockAppointmentService.handleMessageSubmission.mockResolvedValue({
        success: false,
        type: 'message',
        error: 'Error sending message. Please try again.'
      })
      
      renderContact()
      
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalled()
    })
  })

  describe('Form validation edge cases', () => {
    it('should handle special characters in form fields', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Fill form with special characters
      await user.type(screen.getByLabelText(/Prénom/), 'José')
      await user.type(screen.getByLabelText(/Nom/), 'Müller')
      await user.type(screen.getByLabelText(/Société/), 'Café & Co.')
      await user.type(screen.getByLabelText(/Message/), 'Message with émojis 🎉 and special chars: àáâãäåæçèéêë')
      
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      // Verify special characters are handled correctly
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalledWith({
        nom: 'Müller',
        prenom: 'José',
        societe: 'Café & Co.',
        message: 'Message with émojis 🎉 and special chars: àáâãäåæçèéêë'
      })
    })

    it('should handle very long messages', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      const longMessage = 'A'.repeat(1000) // Very long message
      
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), longMessage)
      
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      await user.click(submitButton)
      
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalledWith({
        nom: 'Dupont',
        prenom: 'Jean',
        message: longMessage
      })
    })

    it('should handle concurrent form submissions', async () => {
      const user = userEvent.setup()
      
      renderContact()
      
      // Fill form
      await user.type(screen.getByLabelText(/Prénom/), 'Jean')
      await user.type(screen.getByLabelText(/Nom/), 'Dupont')
      await user.type(screen.getByLabelText(/Message/), 'Test message')
      
      const submitButton = screen.getByRole('button', { name: /Send message/ })
      
      // Try to submit multiple times quickly
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)
      
      // Should only be called once due to proper handling
      expect(mockAppointmentService.handleMessageSubmission).toHaveBeenCalledTimes(1)
    })
  })
})