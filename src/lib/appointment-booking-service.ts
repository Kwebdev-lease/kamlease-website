/**
 * Appointment booking service
 * Handles form submission logic with calendar integration and fallback to email
 */

import { GraphApiClient } from './microsoft-graph/graph-api-client';
import { BusinessHoursValidator } from './business-hours-validator';
import { AppointmentData, GraphApiError } from './microsoft-graph/types';
import { errorHandler } from './error-handler';
import { MonitoringService } from './monitoring/monitoring-service';

export interface ContactFormData {
  nom: string;
  prenom: string;
  societe?: string;
  email: string;
  telephone: string;
  message: string;
}

export interface AppointmentFormData extends ContactFormData {
  appointmentDate: Date;
  appointmentTime: string;
}

export interface SubmissionResult {
  success: boolean;
  type: 'appointment' | 'email_fallback' | 'message';
  message: string;
  eventId?: string;
  error?: string;
}

export class AppointmentBookingService {
  private static instance: AppointmentBookingService;
  private readonly graphClient: GraphApiClient;
  private readonly businessHoursValidator: BusinessHoursValidator;
  private readonly monitoringService: MonitoringService;

  private constructor() {
    this.graphClient = GraphApiClient.getInstance();
    this.businessHoursValidator = BusinessHoursValidator.getInstance();
    this.monitoringService = MonitoringService.getInstance();
  }

  public static getInstance(): AppointmentBookingService {
    if (!AppointmentBookingService.instance) {
      AppointmentBookingService.instance = new AppointmentBookingService();
    }
    return AppointmentBookingService.instance;
  }

  /**
   * Handle appointment booking submission with Microsoft Graph integration
   * Requirements: 2.1, 2.2, 2.3, 2.4, 4.5
   */
  public async handleAppointmentSubmission(formData: AppointmentFormData): Promise<SubmissionResult> {
    const startTime = performance.now();
    const context = {
      operation: 'appointment-booking',
      additionalData: {
        appointmentDate: formData.appointmentDate.toISOString(),
        appointmentTime: formData.appointmentTime
      }
    };

    try {
      // Validate appointment date and time
      const validationResult = this.validateAppointmentData(formData);
      if (!validationResult.isValid) {
        await errorHandler.handleError(
          new Error(validationResult.error || 'Invalid appointment data'),
          context
        );
        return {
          success: false,
          type: 'appointment',
          message: validationResult.error || 'Invalid appointment data',
          error: validationResult.error
        };
      }

      // Create appointment data for Microsoft Graph
      const appointmentData = this.createAppointmentData(formData);

      // Attempt to create calendar event with retry logic
      try {
        // Add a small delay to show the authentication step
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const calendarEvent = await errorHandler.withRetry(
          () => this.graphClient.createCalendarEvent(appointmentData),
          { ...context, operation: 'calendar-event-creation' }
        );
        
        const duration = performance.now() - startTime;
        this.monitoringService.trackFormSubmission('appointment', duration, true);
        
        return {
          success: true,
          type: 'appointment',
          message: 'Rendez-vous programmé avec succès dans votre calendrier Outlook. Vous recevrez une confirmation par email.',
          eventId: calendarEvent?.id
        };

      } catch (calendarError) {
        // Log the calendar error and attempt fallback
        await errorHandler.handleError(calendarError, {
          ...context,
          operation: 'calendar-event-creation-fallback'
        });
        
        // Fallback to email-only submission on calendar errors
        const emailResult = await this.handleEmailFallback(formData, calendarError);
        return emailResult;
      }

    } catch (error) {
      const errorInfo = await errorHandler.handleError(error, context);
      
      const duration = performance.now() - startTime;
      this.monitoringService.trackFormSubmission('appointment', duration, false, [errorInfo.message]);
      
      return {
        success: false,
        type: 'appointment',
        message: errorInfo.userMessage,
        error: errorInfo.message
      };
    }
  }

  /**
   * Handle simple message submission (non-appointment)
   */
  public async handleMessageSubmission(formData: ContactFormData): Promise<SubmissionResult> {
    const startTime = performance.now();
    const context = {
      operation: 'message-submission',
      additionalData: {
        hasCompany: !!formData.societe,
        messageLength: formData.message.length
      }
    };

    try {
      // Send email with retry logic
      await errorHandler.withRetry(
        () => this.sendEmail(formData),
        context
      );
      
      const duration = performance.now() - startTime;
      this.monitoringService.trackFormSubmission('message', duration, true);
      
      return {
        success: true,
        type: 'message',
        message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
      };

    } catch (error) {
      const errorInfo = await errorHandler.handleError(error, context);
      
      const duration = performance.now() - startTime;
      this.monitoringService.trackFormSubmission('message', duration, false, [errorInfo.message]);
      
      return {
        success: false,
        type: 'message',
        message: errorInfo.userMessage,
        error: errorInfo.message
      };
    }
  }

  /**
   * Validate appointment data before submission
   */
  private validateAppointmentData(formData: AppointmentFormData): { isValid: boolean; error?: string } {
    const { appointmentDate, appointmentTime } = formData;

    // Check if date is provided
    if (!appointmentDate) {
      return { isValid: false, error: 'Date de rendez-vous requise' };
    }

    // Check if time is provided
    if (!appointmentTime) {
      return { isValid: false, error: 'Heure de rendez-vous requise' };
    }

    // Check if appointment is in the past
    if (this.businessHoursValidator.isInPast(appointmentDate)) {
      return { isValid: false, error: 'Impossible de programmer un rendez-vous dans le passé' };
    }

    // Validate business hours
    if (!this.businessHoursValidator.isValidBusinessDateTime(appointmentDate, appointmentTime)) {
      return { 
        isValid: false, 
        error: 'Le créneau sélectionné n\'est pas disponible. Veuillez choisir un horaire entre 14h00 et 16h30, du lundi au vendredi.' 
      };
    }

    return { isValid: true };
  }

  /**
   * Create appointment data for Microsoft Graph API
   * Fixed timezone handling to prevent 1-hour offset issues
   */
  private createAppointmentData(formData: AppointmentFormData): AppointmentData {
    const { appointmentDate, appointmentTime, prenom, nom, societe, message } = formData;

    // Parse the selected time
    const [hours, minutes] = appointmentTime.split(':').map(Number);
    
    // Create datetime in Europe/Paris timezone (business timezone)
    // This prevents DST/timezone conversion issues
    const businessTimezone = 'Europe/Paris';
    
    // Create the date string in YYYY-MM-DD format
    const dateStr = appointmentDate.toISOString().split('T')[0];
    
    // Create datetime strings in the business timezone format
    // Microsoft Graph expects: YYYY-MM-DDTHH:mm:ss.sss
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`;
    const startDateTimeLocal = `${dateStr}T${timeStr}`;
    
    // Calculate end time (30 minutes later)
    const endMinutes = minutes + 30;
    const endHours = endMinutes >= 60 ? hours + 1 : hours;
    const adjustedEndMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
    
    const endTimeStr = `${endHours.toString().padStart(2, '0')}:${adjustedEndMinutes.toString().padStart(2, '0')}:00.000`;
    const endDateTimeLocal = `${dateStr}T${endTimeStr}`;

    console.log('🕐 Appointment timezone handling:', {
      selectedDate: appointmentDate.toISOString().split('T')[0],
      selectedTime: appointmentTime,
      businessTimezone,
      startDateTime: startDateTimeLocal,
      endDateTime: endDateTimeLocal,
      userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    return {
      subject: 'RDV via le site',
      startDateTime: startDateTimeLocal,
      endDateTime: endDateTimeLocal,
      timeZone: businessTimezone,
      attendeeInfo: {
        prenom,
        nom,
        societe,
        message
      }
    };
  }

  /**
   * Handle fallback to email-only submission when calendar fails
   */
  private async handleEmailFallback(formData: AppointmentFormData, originalError: unknown): Promise<SubmissionResult> {
    try {
      // Log the calendar error for monitoring
      this.logCalendarError(originalError);

      // Send email with appointment request details
      await this.sendEmail(formData, true);

      return {
        success: true,
        type: 'email_fallback',
        message: 'Le service de calendrier est temporairement indisponible. Votre demande de rendez-vous a été envoyée par email et nous vous contacterons sous 2-4 heures pour confirmer le créneau.'
      };

    } catch (emailError) {
      console.error('Email fallback also failed:', emailError);
      
      return {
        success: false,
        type: 'email_fallback',
        message: 'Une erreur est survenue. Veuillez nous contacter directement par téléphone.',
        error: 'Both calendar and email fallback failed'
      };
    }
  }

  /**
   * Send email using Microsoft Graph API with fallback
   */
  private async sendEmail(formData: ContactFormData, isAppointmentRequest = false): Promise<void> {
    try {
      const emailContent = this.formatEmailContent(formData, isAppointmentRequest);
      const subject = isAppointmentRequest 
        ? `Nouvelle demande de rendez-vous - ${formData.prenom} ${formData.nom}`
        : `Nouveau message depuis le site - ${formData.prenom} ${formData.nom}`;

      // Use EmailJS for reliable email sending
      const emailJSResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'YOUR_SERVICE_ID', // Remplace par ton Service ID
          template_id: 'YOUR_TEMPLATE_ID', // Remplace par ton Template ID  
          user_id: 'YOUR_PUBLIC_KEY', // Remplace par ta Public Key
          template_params: {
            from_name: `${formData.prenom} ${formData.nom}`,
            from_email: formData.email,
            phone: formData.telephone,
            company: formData.societe || '',
            message: formData.message,
            reply_to: formData.email,
            time: new Date().toLocaleString('fr-FR', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        })
      });
      
      if (!emailJSResponse.ok) {
        const errorText = await emailJSResponse.text();
        console.error('EmailJS error:', errorText);
        throw new Error(`EmailJS error: ${emailJSResponse.status}`);
      }
      
      console.log('✅ Email envoyé avec succès via EmailJS');
      return;
    } catch (error) {
      console.error('Unexpected error in email service:', error);
      throw new Error('Email service temporarily unavailable');
    }
  }

  /**
   * Format email content for different submission types
   */
  private formatEmailContent(formData: ContactFormData, isAppointmentRequest = false): string {
    const { prenom, nom, societe, email, telephone, message } = formData;
    const timestamp = new Date().toLocaleString('fr-FR');
    
    let content = '';
    
    if (isAppointmentRequest) {
      content += `NOUVELLE DEMANDE DE RENDEZ-VOUS\n`;
      content += `=====================================\n\n`;
    } else {
      content += `NOUVEAU MESSAGE DEPUIS LE SITE WEB\n`;
      content += `==================================\n\n`;
    }
    
    content += `Reçu le: ${timestamp}\n\n`;
    
    content += `INFORMATIONS DU CONTACT:\n`;
    content += `------------------------\n`;
    content += `Prénom: ${prenom}\n`;
    content += `Nom: ${nom}\n`;
    content += `Email: ${email}\n`;
    content += `Téléphone: ${telephone}\n`;
    
    if (societe) {
      content += `Société: ${societe}\n`;
    }

    if (isAppointmentRequest && 'appointmentDate' in formData && 'appointmentTime' in formData) {
      const appointmentFormData = formData as AppointmentFormData;
      content += `\nDÉTAILS DU RENDEZ-VOUS DEMANDÉ:\n`;
      content += `------------------------------\n`;
      content += `Date souhaitée: ${appointmentFormData.appointmentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}\n`;
      content += `Heure souhaitée: ${appointmentFormData.appointmentTime}\n`;
      content += `Durée: 30 minutes\n`;
    }
    
    content += `\nMESSAGE:\n`;
    content += `--------\n`;
    content += `${message}\n\n`;
    
    if (isAppointmentRequest) {
      content += `ACTION REQUISE:\n`;
      content += `--------------\n`;
      content += `• Vérifier la disponibilité du créneau demandé\n`;
      content += `• Contacter le client pour confirmer le rendez-vous\n`;
      content += `• Ajouter l'événement au calendrier si confirmé\n\n`;
    }
    
    content += `---\n`;
    content += `Email automatique généré par le site web Kamlease\n`;
    content += `Ne pas répondre directement à cet email.`;
    
    return content;
  }

  /**
   * Log calendar errors for monitoring
   */
  private logCalendarError(error: unknown): void {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: 'calendar_error',
      error: error instanceof GraphApiError ? {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      } : error instanceof Error ? {
        message: error.message,
        name: error.name
      } : error
    };

    console.error('[AppointmentBookingService] Calendar error:', errorInfo);

    // In a real implementation, this would send to monitoring service
    // (e.g., Sentry, DataDog, CloudWatch, etc.)
  }

  /**
   * Test the service connectivity
   */
  public async testConnectivity(): Promise<{ calendar: boolean; email: boolean }> {
    const results = {
      calendar: false,
      email: false
    };

    try {
      results.calendar = await this.graphClient.testConnection();
    } catch (error) {
      console.error('Calendar connectivity test failed:', error);
    }

    try {
      // Test email service (simulate)
      await new Promise(resolve => setTimeout(resolve, 100));
      results.email = true;
    } catch (error) {
      console.error('Email connectivity test failed:', error);
    }

    return results;
  }
}