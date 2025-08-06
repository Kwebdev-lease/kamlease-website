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
   * Send a contact message via Cloudflare Function (avoids CORS issues)
   */
  async sendContactMessage(formData: EnhancedContactFormData): Promise<EmailResult> {
    try {
      // Check if we're in localhost development mode
      if (this.isLocalhostDevelopment()) {
        return this.simulateContactMessage(formData);
      }

      // Send via Cloudflare Function
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de l\'envoi');
      }

      return {
        success: true,
        message: result.message,
        type: 'message',
        emailId: `email_${Date.now()}`
      };

    } catch (error) {
      console.error('Error sending contact message:', error);

      return {
        success: false,
        message: 'Erreur lors de l\'envoi du message',
        type: 'message',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send an appointment request via Cloudflare Function (avoids CORS issues)
   */
  async sendAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult> {
    try {
      // Check if we're in localhost development mode
      if (this.isLocalhostDevelopment()) {
        return this.simulateAppointmentRequest(appointmentData);
      }

      // Send via Cloudflare Function
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Erreur lors de l\'envoi');
      }

      return {
        success: true,
        message: result.message,
        type: 'appointment',
        emailId: `email_${Date.now()}`
      };

    } catch (error) {
      console.error('Error sending appointment request:', error);

      return {
        success: false,
        message: 'Erreur lors de l\'envoi de la demande de rendez-vous',
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

  /**
   * Format appointment email content
   */
  private formatAppointmentEmail(appointmentData: AppointmentFormData): string {
    const appointmentDateTime = new Date(appointmentData.appointmentDate);
    const [hours, minutes] = appointmentData.appointmentTime.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Demande de rendez-vous</h2>
        
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #991b1b;">Détails du rendez-vous demandé</h3>
          <p><strong>Date :</strong> ${appointmentDateTime.toLocaleDateString('fr-FR')}</p>
          <p><strong>Heure :</strong> ${appointmentData.appointmentTime}</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Informations du contact</h3>
          <p><strong>Nom :</strong> ${appointmentData.nom}</p>
          <p><strong>Prénom :</strong> ${appointmentData.prenom}</p>
          ${appointmentData.societe ? `<p><strong>Société :</strong> ${appointmentData.societe}</p>` : ''}
          <p><strong>Email :</strong> <a href="mailto:${appointmentData.email}">${appointmentData.email}</a></p>
          <p><strong>Téléphone :</strong> <a href="tel:${appointmentData.telephone}">${appointmentData.telephone}</a></p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Message</h3>
          <p style="white-space: pre-wrap;">${appointmentData.message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p>Cette demande de rendez-vous a été envoyée depuis le site web Kamlease via Microsoft Graph.</p>
          <p>Date de la demande : ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `;
  }
}