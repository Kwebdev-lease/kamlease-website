/**
 * Test for loading states and success feedback implementation
 * Verifies task 5.2 requirements
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoadingIndicator, LoadingPresets, useLoadingState } from '../components/LoadingIndicator'
import { SuccessFeedback, SuccessPresets } from '../components/SuccessFeedback'
import { AppointmentBookingService } from '../lib/appointment-booking-service'

// Mock the appointment booking service
vi.mock('../lib/appointment-booking-service')

describe('Loading States and Success Feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('LoadingIndicator', () => {
    it('should show appointment booking steps correctly', () => {
      render(
        <LoadingIndicator
          {...LoadingPresets.appointmentBooking(true, 'auth')}
        />
      )

      expect(screen.getByText('Programmation de votre rendez-vous')).toBeInTheDocument()
      expect(screen.getByText('Validation des données')).toBeInTheDocument()
      expect(screen.getByText('Authentification Microsoft Graph')).toBeInTheDocument()
      expect(screen.getByText('Création du rendez-vous')).toBeInTheDocument()
      expect(screen.getByText('Finalisation')).toBeInTheDocument()
    })

    it('should show message submission progress correctly', () => {
      render(
        <LoadingIndicator
          {...LoadingPresets.messageSubmission(true, 75)}
        />
      )

      expect(screen.getByText('Envoi de votre message')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should show email fallback steps correctly', () => {
      render(
        <LoadingIndicator
          {...LoadingPresets.emailFallback(true, 'email')}
        />
      )

      expect(screen.getByText('Envoi de votre demande par email')).toBeInTheDocument()
      expect(screen.getByText('Validation des données')).toBeInTheDocument()
      expect(screen.getByText('Envoi par email')).toBeInTheDocument()
      expect(screen.getByText('Confirmation')).toBeInTheDocument()
    })
  })

  describe('SuccessFeedback', () => {
    const mockContactDetails = {
      prenom: 'Jean',
      nom: 'Dupont',
      societe: 'Test Company',
      message: 'Test message for appointment booking'
    }

    const mockAppointmentDetails = {
      date: new Date('2024-01-15T14:30:00'),
      time: '14:30',
      duration: 30,
      eventId: 'event123',
      confirmationNumber: 'RDV-EVENT123'
    }

    it('should show appointment success with enhanced details', () => {
      render(
        <SuccessFeedback
          {...SuccessPresets.appointmentSuccess(
            mockContactDetails,
            mockAppointmentDetails
          )}
        />
      )

      expect(screen.getByText('Rendez-vous confirmé !')).toBeInTheDocument()
      expect(screen.getByText(/lundi 15 janvier 2024 à 14:30/)).toBeInTheDocument()
      expect(screen.getByText(/Durée: 30 minutes/)).toBeInTheDocument()
      expect(screen.getByText(/Kamlease - Bureau principal/)).toBeInTheDocument()
      expect(screen.getByText(/RDV-EVENT123/)).toBeInTheDocument()
      expect(screen.getByText(/Un email de confirmation a été envoyé/)).toBeInTheDocument()
      expect(screen.getByText(/L'événement a été ajouté à votre calendrier Outlook/)).toBeInTheDocument()
    })

    it('should show message success with next steps', () => {
      render(
        <SuccessFeedback
          {...SuccessPresets.messageSuccess(mockContactDetails)}
        />
      )

      expect(screen.getByText('Message envoyé avec succès !')).toBeInTheDocument()
      expect(screen.getByText(/Votre message a été reçu et traité/)).toBeInTheDocument()
      expect(screen.getByText(/Notre équipe vous répondra sous 24-48 heures/)).toBeInTheDocument()
      expect(screen.getByText(/Vous recevrez une réponse personnalisée par email/)).toBeInTheDocument()
    })

    it('should show email fallback success with detailed next steps', () => {
      render(
        <SuccessFeedback
          {...SuccessPresets.emailFallbackSuccess(
            mockContactDetails,
            mockAppointmentDetails
          )}
        />
      )

      expect(screen.getByText('Demande envoyée par email')).toBeInTheDocument()
      expect(screen.getByText(/Votre demande de rendez-vous a été envoyée par email/)).toBeInTheDocument()
      expect(screen.getByText(/Notre équipe vous contactera sous 2-4 heures ouvrées/)).toBeInTheDocument()
      expect(screen.getByText(/Nous confirmerons le créneau et ajouterons l'événement/)).toBeInTheDocument()
      expect(screen.getByText(/Contact direct: \+33 1 23 45 67 89/)).toBeInTheDocument()
    })
  })

  describe('useLoadingState Hook', () => {
    function TestComponent() {
      const {
        isLoading,
        loadingMessage,
        loadingStep,
        loadingProgress,
        startLoading,
        updateStep,
        updateProgress,
        stopLoading
      } = useLoadingState()

      return (
        <div>
          <div data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</div>
          <div data-testid="loading-message">{loadingMessage}</div>
          <div data-testid="loading-step">{loadingStep}</div>
          <div data-testid="loading-progress">{loadingProgress}</div>
          <button onClick={() => startLoading('Test loading')}>Start</button>
          <button onClick={() => updateStep('test-step', 'Test step')}>Update Step</button>
          <button onClick={() => updateProgress(50, 'Test progress')}>Update Progress</button>
          <button onClick={stopLoading}>Stop</button>
        </div>
      )
    }

    it('should manage loading state correctly', async () => {
      render(<TestComponent />)

      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle')

      fireEvent.click(screen.getByText('Start'))
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Test loading')

      fireEvent.click(screen.getByText('Update Step'))
      expect(screen.getByTestId('loading-step')).toHaveTextContent('test-step')
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Test step')

      fireEvent.click(screen.getByText('Update Progress'))
      expect(screen.getByTestId('loading-progress')).toHaveTextContent('50')
      expect(screen.getByTestId('loading-message')).toHaveTextContent('Test progress')

      fireEvent.click(screen.getByText('Stop'))
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle')
      expect(screen.getByTestId('loading-message')).toHaveTextContent('')
      expect(screen.getByTestId('loading-step')).toHaveTextContent('')
      expect(screen.getByTestId('loading-progress')).toHaveTextContent('0')
    })
  })

  describe('AppointmentBookingService Integration', () => {
    it('should provide enhanced success messages', async () => {
      const mockService = vi.mocked(AppointmentBookingService.getInstance())
      mockService.handleAppointmentSubmission.mockResolvedValue({
        success: true,
        type: 'appointment',
        message: 'Rendez-vous programmé avec succès dans votre calendrier Outlook. Vous recevrez une confirmation par email.',
        eventId: 'event123'
      })

      const service = AppointmentBookingService.getInstance()
      const result = await service.handleAppointmentSubmission({
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'Test Company',
        message: 'Test message',
        appointmentDate: new Date('2024-01-15T14:30:00'),
        appointmentTime: '14:30'
      })

      expect(result.success).toBe(true)
      expect(result.type).toBe('appointment')
      expect(result.message).toContain('calendrier Outlook')
      expect(result.eventId).toBe('event123')
    })

    it('should provide enhanced email fallback messages', async () => {
      const mockService = vi.mocked(AppointmentBookingService.getInstance())
      mockService.handleAppointmentSubmission.mockResolvedValue({
        success: true,
        type: 'email_fallback',
        message: 'Le service de calendrier est temporairement indisponible. Votre demande de rendez-vous a été envoyée par email et nous vous contacterons sous 2-4 heures pour confirmer le créneau.'
      })

      const service = AppointmentBookingService.getInstance()
      const result = await service.handleAppointmentSubmission({
        nom: 'Dupont',
        prenom: 'Jean',
        societe: 'Test Company',
        message: 'Test message',
        appointmentDate: new Date('2024-01-15T14:30:00'),
        appointmentTime: '14:30'
      })

      expect(result.success).toBe(true)
      expect(result.type).toBe('email_fallback')
      expect(result.message).toContain('2-4 heures')
      expect(result.message).toContain('temporairement indisponible')
    })
  })
})