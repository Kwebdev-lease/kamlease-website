import { GraphApiClient } from './graph-api-client';
import { GraphConfig } from './config';
import { GraphApiError } from './types';
import { EmailResult, EnhancedContactFormData, AppointmentFormData } from '../form-types';

/**
 * Microsoft Graph Email Service
 * Handles email sending and appointment creation via Microsoft Graph API
 */
export class EmailService {
  private graphClient: GraphApiClient;
  private config: GraphConfig;

  constructor() {
    this.config = GraphConfig.getInstance();
    this.graphClient = new GraphApiClient();
  }

  /**
   * Send a contact message via Cloudflare Function (with better error handling)
   */
  async sendContactMessage(formData: EnhancedContactFormData): Promise<EmailResult> {
    try {
      // Check if we're in localhost development mode
      if (this.isLocalhostDevelopment()) {
        return this.simulateContactMessage(formData);
      }

      console.log('Attempting to send via Cloudflare Function...');
      
      // Try Cloudflare Function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Cloudflare Function succeeded');
            return {
              success: true,
              message: result.message,
              type: 'message',
              emailId: `cf_${Date.now()}`
            };
          }
        }
        
        console.log('❌ Cloudflare Function failed:', response.status, response.statusText);
        throw new Error(`Cloudflare function failed: ${response.status}`);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log('❌ Cloudflare Function error:', fetchError);
        throw fetchError;
      }

    } catch (error) {
      console.error('Error sending contact message:', error);

      return {
        success: false,
        message: 'Erreur lors de l\'envoi du message. Veuillez réessayer.',
        type: 'message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send an appointment request via Cloudflare Function (with better error handling)
   */
  async sendAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult> {
    try {
      // Check if we're in localhost development mode
      if (this.isLocalhostDevelopment()) {
        return this.simulateAppointmentRequest(appointmentData);
      }

      console.log('Attempting to send appointment via Cloudflare Function...');
      
      // Try Cloudflare Function with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(appointmentData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('✅ Cloudflare Function succeeded for appointment');
            return {
              success: true,
              message: result.message,
              type: 'appointment',
              emailId: `cf_${Date.now()}`
            };
          }
        }
        
        console.log('❌ Cloudflare Function failed for appointment:', response.status, response.statusText);
        throw new Error(`Cloudflare function failed: ${response.status}`);
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.log('❌ Cloudflare Function error for appointment:', fetchError);
        throw fetchError;
      }

    } catch (error) {
      console.error('Error sending appointment request:', error);

      return {
        success: false,
        message: 'Erreur lors de l\'envoi de la demande de rendez-vous. Veuillez réessayer.',
        type: 'appointment',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if we're in localhost development mode
   */
  private isLocalhostDevelopment(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('local'));
  }

  /**
   * Simulate contact message for localhost development
   */
  private async simulateContactMessage(formData: EnhancedContactFormData): Promise<EmailResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📧 SIMULATION - Contact message would be sent:', {
      to: 'contact@kamlease.com',
      from: `${formData.prenom} ${formData.nom} <${formData.email}>`,
      subject: `Nouveau message de contact - ${formData.prenom} ${formData.nom}`,
      content: formData.message,
      phone: formData.telephone,
      company: formData.societe
    });
    
    return {
      success: true,
      message: 'Message simulé avec succès (mode développement)',
      type: 'message'
    };
  }

  /**
   * Simulate appointment request for localhost development
   */
  private async simulateAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('📅 SIMULATION - Appointment request would be sent:', {
      to: 'contact@kamlease.com',
      from: `${appointmentData.prenom} ${appointmentData.nom} <${appointmentData.email}>`,
      subject: `Demande de rendez-vous - ${appointmentData.prenom} ${appointmentData.nom}`,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      message: appointmentData.message,
      phone: appointmentData.telephone,
      company: appointmentData.societe
    });
    
    return {
      success: true,
      message: 'Demande de rendez-vous simulée avec succès (mode développement)',
      type: 'appointment'
    };
  }

  /**
   * Format contact email content
   */
  private formatContactEmail(formData: EnhancedContactFormData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Nouveau message de contact</h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Informations du contact</h3>
          <p><strong>Nom :</strong> ${formData.nom}</p>
          <p><strong>Prénom :</strong> ${formData.prenom}</p>
          ${formData.societe ? `<p><strong>Société :</strong> ${formData.societe}</p>` : ''}
          <p><strong>Email :</strong> <a href="mailto:${formData.email}">${formData.email}</a></p>
          <p><strong>Téléphone :</strong> <a href="tel:${formData.telephone}">${formData.telephone}</a></p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Message</h3>
          <p style="white-space: pre-wrap;">${formData.message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p>Ce message a été envoyé depuis le site web Kamlease via Microsoft Graph.</p>
          <p>Date : ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `;
  }


}