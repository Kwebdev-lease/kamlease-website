/**
 * Tests for SuccessFeedback component
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { SuccessFeedback, SuccessPresets, AppointmentDetails, ContactDetails } from '../SuccessFeedback'

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'EEEE d MMMM yyyy') {
      return 'lundi 15 janvier 2024'
    }
    return '15/01/2024'
  })
}))

vi.mock('date-fns/locale', () => ({
  fr: {}
}))

describe('SuccessFeedback', () => {
  const mockContactDetails: ContactDetails = {
    prenom: 'Jean',
    nom: 'Dupont',
    societe: 'Test Company',
    message: 'This is a test message for the appointment booking system.'
  }

  const mockAppointmentDetails: AppointmentDetails = {
    date: new Date('2024-01-15T14:30:00'),
    time: '14:30',
    duration: 30,
    eventId: 'event123',
    confirmationNumber: 'RDV-EVENT123'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  describe('Message Success', () => {
    it('should render message success feedback correctly', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Message sent successfully"
          contactDetails={mockContactDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText('Message envoyé avec succès !')).toBeInTheDocument()
      expect(screen.getByText('Message sent successfully')).toBeInTheDocument()
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.getByText('Test Company')).toBeInTheDocument()
    })

    it('should show truncated message when message is long', () => {
      const longMessage = 'This is a very long message that should be truncated when displayed in the success feedback component because it exceeds the maximum length limit.'
      const contactWithLongMessage = {
        ...mockContactDetails,
        message: longMessage
      }

      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Message sent"
          contactDetails={contactWithLongMessage}
          autoClose={false}
        />
      )

      expect(screen.getByText(/This is a very long message that should be truncated when displayed in the success feedback componen\.\.\./)).toBeInTheDocument()
    })
  })

  describe('Appointment Success', () => {
    it('should render appointment success feedback with details', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="appointment"
          message="Appointment booked successfully"
          contactDetails={mockContactDetails}
          appointmentDetails={mockAppointmentDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText('Rendez-vous confirmé !')).toBeInTheDocument()
      expect(screen.getByText('Appointment booked successfully')).toBeInTheDocument()
      expect(screen.getByText('Détails du rendez-vous')).toBeInTheDocument()
      expect(screen.getByText(/lundi 15 janvier 2024 à 14:30/)).toBeInTheDocument()
      expect(screen.getByText(/Durée: 30 minutes \(jusqu'à 15:00\)/)).toBeInTheDocument()
      expect(screen.getByText(/Référence:/)).toBeInTheDocument()
      expect(screen.getByText('RDV-EVENT123')).toBeInTheDocument()
    })

    it('should show appointment details without confirmation number when not provided', () => {
      const appointmentWithoutConfirmation = {
        ...mockAppointmentDetails,
        confirmationNumber: undefined
      }

      render(
        <SuccessFeedback
          isVisible={true}
          type="appointment"
          message="Appointment booked"
          contactDetails={mockContactDetails}
          appointmentDetails={appointmentWithoutConfirmation}
          autoClose={false}
        />
      )

      expect(screen.queryByText(/Numéro de confirmation/)).not.toBeInTheDocument()
    })
  })

  describe('Email Fallback Success', () => {
    it('should render email fallback success feedback', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="email_fallback"
          message="Request sent by email"
          contactDetails={mockContactDetails}
          appointmentDetails={mockAppointmentDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText('Demande envoyée par email')).toBeInTheDocument()
      expect(screen.getByText('Request sent by email')).toBeInTheDocument()
      expect(screen.getByText(/Votre demande de rendez-vous a été envoyée par email/)).toBeInTheDocument()
    })
  })

  describe('Contact Details Display', () => {
    it('should display contact details without company when not provided', () => {
      const contactWithoutCompany = {
        ...mockContactDetails,
        societe: undefined
      }

      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={contactWithoutCompany}
          autoClose={false}
        />
      )

      expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
      expect(screen.queryByText('Test Company')).not.toBeInTheDocument()
    })

    it('should display message preview correctly', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText(/"This is a test message for the appointment booking system."/)).toBeInTheDocument()
    })
  })

  describe('Next Steps', () => {
    it('should show appropriate next steps for appointment', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="appointment"
          message="Appointment confirmed"
          contactDetails={mockContactDetails}
          appointmentDetails={mockAppointmentDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText('Prochaines étapes')).toBeInTheDocument()
      expect(screen.getByText(/Un email de confirmation a été envoyé avec tous les détails/)).toBeInTheDocument()
      expect(screen.getByText(/L'événement a été ajouté à votre calendrier Outlook/)).toBeInTheDocument()
      expect(screen.getByText(/Un rappel automatique vous sera envoyé 24h avant/)).toBeInTheDocument()
      expect(screen.getByText(/Pour modifier ou annuler: \+33 1 23 45 67 89/)).toBeInTheDocument()
    })

    it('should show appropriate next steps for message', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Message sent"
          contactDetails={mockContactDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText(/Votre message a été reçu et traité/)).toBeInTheDocument()
      expect(screen.getByText(/Notre équipe vous répondra sous 24-48 heures/)).toBeInTheDocument()
      expect(screen.getByText(/Vous recevrez une réponse personnalisée par email/)).toBeInTheDocument()
    })

    it('should show appropriate next steps for email fallback', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="email_fallback"
          message="Request sent by email"
          contactDetails={mockContactDetails}
          appointmentDetails={mockAppointmentDetails}
          autoClose={false}
        />
      )

      expect(screen.getByText(/Votre demande de rendez-vous a été envoyée par email/)).toBeInTheDocument()
      expect(screen.getByText(/Notre équipe vous contactera sous 2-4 heures ouvrées/)).toBeInTheDocument()
      expect(screen.getByText(/Nous confirmerons le créneau et ajouterons l'événement/)).toBeInTheDocument()
      expect(screen.getByText(/Contact direct: \+33 1 23 45 67 89/)).toBeInTheDocument()
    })
  })

  describe('Auto Close Functionality', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should auto close after specified delay', async () => {
      const onClose = vi.fn()

      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
          onClose={onClose}
          autoClose={true}
          autoCloseDelay={5000}
        />
      )

      expect(onClose).not.toHaveBeenCalled()

      vi.advanceTimersByTime(5000)

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not auto close when autoClose is false', () => {
      const onClose = vi.fn()

      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
          onClose={onClose}
          autoClose={false}
          autoCloseDelay={1000}
        />
      )

      vi.advanceTimersByTime(2000)

      expect(onClose).not.toHaveBeenCalled()
    })

    it('should show auto-close progress bar', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
          autoClose={true}
          autoCloseDelay={5000}
        />
      )

      expect(screen.getByText(/Cette notification se fermera automatiquement dans 5 secondes/)).toBeInTheDocument()
    })
  })

  describe('Close Button', () => {
    it('should render close button when onClose is provided', () => {
      const onClose = vi.fn()

      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
          onClose={onClose}
          autoClose={false}
        />
      )

      const closeButton = screen.getByLabelText('Fermer')
      expect(closeButton).toBeInTheDocument()

      fireEvent.click(closeButton)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('should not render close button when onClose is not provided', () => {
      render(
        <SuccessFeedback
          isVisible={true}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
          autoClose={false}
        />
      )

      expect(screen.queryByLabelText('Fermer')).not.toBeInTheDocument()
    })
  })

  describe('Visibility', () => {
    it('should not render when not visible', () => {
      render(
        <SuccessFeedback
          isVisible={false}
          type="message"
          message="Test message"
          contactDetails={mockContactDetails}
        />
      )

      expect(screen.queryByText('Message envoyé avec succès !')).not.toBeInTheDocument()
    })
  })

  describe('SuccessPresets', () => {
    it('should create appointment success preset correctly', () => {
      const onClose = vi.fn()
      const preset = SuccessPresets.appointmentSuccess(
        mockContactDetails,
        mockAppointmentDetails,
        onClose
      )

      expect(preset.isVisible).toBe(true)
      expect(preset.type).toBe('appointment')
      expect(preset.contactDetails).toBe(mockContactDetails)
      expect(preset.appointmentDetails).toBe(mockAppointmentDetails)
      expect(preset.onClose).toBe(onClose)
      expect(preset.autoClose).toBe(true)
      expect(preset.autoCloseDelay).toBe(10000)
    })

    it('should create message success preset correctly', () => {
      const onClose = vi.fn()
      const preset = SuccessPresets.messageSuccess(mockContactDetails, onClose)

      expect(preset.isVisible).toBe(true)
      expect(preset.type).toBe('message')
      expect(preset.contactDetails).toBe(mockContactDetails)
      expect(preset.appointmentDetails).toBeUndefined()
      expect(preset.onClose).toBe(onClose)
      expect(preset.autoCloseDelay).toBe(6000)
    })

    it('should create email fallback success preset correctly', () => {
      const onClose = vi.fn()
      const preset = SuccessPresets.emailFallbackSuccess(
        mockContactDetails,
        mockAppointmentDetails,
        onClose
      )

      expect(preset.isVisible).toBe(true)
      expect(preset.type).toBe('email_fallback')
      expect(preset.contactDetails).toBe(mockContactDetails)
      expect(preset.appointmentDetails).toBe(mockAppointmentDetails)
      expect(preset.autoCloseDelay).toBe(8000)
    })
  })
})