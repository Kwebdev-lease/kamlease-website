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
   * Send a contact message via Microsoft Graph (direct integration)
   */
  async sendContactMessage(formData: EnhancedContactFormData): Promise<EmailResult> {
    try {
      // Check if we're in localhost development mode
      if (this.isLocalhostDevelopment()) {
        return this.simulateContactMessage(formData);
      }

      // Send directly via Microsoft Graph
      await this.sendEmailViaMicrosoftGraph(formData, false);
      
      // Send confirmation email to user
      await this.sendConfirmationEmail(formData, false);

      return {
        success: true,
        message: 'Message envoyé avec succès',
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
   * Send an appointment request via Microsoft Graph (direct integration)
   */
  async sendAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult> {
    try {
      // Check if we're in localhost development mode
      if (this.isLocalhostDevelopment()) {
        return this.simulateAppointmentRequest(appointmentData);
      }

      // Send directly via Microsoft Graph
      await this.sendEmailViaMicrosoftGraph(appointmentData, true);
      
      // Send confirmation email to user
      await this.sendConfirmationEmail(appointmentData, true);

      return {
        success: true,
        message: 'Demande de rendez-vous envoyée avec succès',
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
   * Send email directly via Microsoft Graph API
   */
  private async sendEmailViaMicrosoftGraph(formData: EnhancedContactFormData | AppointmentFormData, isAppointment: boolean): Promise<void> {
    // Get access token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
        client_secret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Prepare email content
    const emailContent = this.formatNotificationEmail(formData, isAppointment);
    
    // Prepare message
    const message = {
      message: {
        subject: isAppointment 
          ? `Demande de rendez-vous - ${formData.prenom} ${formData.nom}`
          : `Nouveau message de contact - ${formData.prenom} ${formData.nom}`,
        body: {
          contentType: 'HTML',
          content: emailContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: 'contact@kamlease.com'
            }
          }
        ]
      }
    };

    // Send email
    const emailResponse = await fetch(`https://graph.microsoft.com/v1.0/users/contact@kamlease.com/sendMail`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    if (!emailResponse.ok) {
      throw new Error('Failed to send notification email');
    }
  }

  /**
   * Send confirmation email to user
   */
  private async sendConfirmationEmail(formData: EnhancedContactFormData | AppointmentFormData, isAppointment: boolean): Promise<void> {
    try {
      // Get access token (reuse the same method)
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${import.meta.env.VITE_MICROSOFT_TENANT_ID}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID,
          client_secret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials'
        })
      });

      if (!tokenResponse.ok) {
        console.error('Failed to get access token for confirmation email');
        return; // Don't fail the main process if confirmation fails
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Prepare confirmation email content
      const confirmationContent = this.formatConfirmationEmail(formData, isAppointment);
      
      // Prepare confirmation message
      const confirmationMessage = {
        message: {
          subject: `Confirmation de réception - ${isAppointment ? 'Demande de rendez-vous' : 'Message de contact'}`,
          body: {
            contentType: 'HTML',
            content: confirmationContent
          },
          toRecipients: [
            {
              emailAddress: {
                address: formData.email,
                name: `${formData.prenom} ${formData.nom}`
              }
            }
          ]
        }
      };

      // Send confirmation email
      const confirmationResponse = await fetch(`https://graph.microsoft.com/v1.0/users/contact@kamlease.com/sendMail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(confirmationMessage)
      });

      if (!confirmationResponse.ok) {
        console.error('Failed to send confirmation email');
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Don't fail the main process if confirmation fails
    }
  }

  /**
   * Format notification email (for admin)
   */
  private formatNotificationEmail(formData: EnhancedContactFormData | AppointmentFormData, isAppointment: boolean): string {
    const logoUrl = 'https://kamlease.com/kamlease-logo.svg';
    
    let content = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header avec logo -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="${logoUrl}" alt="Kamlease" style="max-height: 60px; margin-bottom: 15px;" />
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">
            ${isAppointment ? '📅 Nouvelle demande de rendez-vous' : '✉️ Nouveau message de contact'}
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Reçu le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
          </p>
          <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0 0; font-size: 12px;">
            ✅ Nouvelle intégration Microsoft Graph active
          </p>
        </div>

        <!-- Contenu principal -->
        <div style="padding: 30px; background-color: #ffffff;">
    `;

    if (isAppointment && 'appointmentDate' in formData) {
      const appointmentDate = new Date(formData.appointmentDate);
      content += `
          <!-- Détails du rendez-vous -->
          <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 25px; border-radius: 12px; margin-bottom: 25px; color: white;">
            <h2 style="margin: 0 0 15px 0; font-size: 22px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">🗓️</span> Rendez-vous demandé
            </h2>
            <div style="display: flex; gap: 30px; flex-wrap: wrap;">
              <div>
                <strong>📅 Date :</strong> ${appointmentDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div>
                <strong>🕐 Heure :</strong> ${formData.appointmentTime}
              </div>
            </div>
          </div>
      `;
    }

    content += `
          <!-- Informations du contact -->
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #3b82f6;">
            <h2 style="margin: 0 0 20px 0; color: #1e40af; font-size: 20px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">👤</span> Informations du contact
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <div><strong>👤 Prénom :</strong> ${formData.prenom}</div>
              <div><strong>👤 Nom :</strong> ${formData.nom}</div>
              ${formData.societe ? `<div><strong>🏢 Société :</strong> ${formData.societe}</div>` : ''}
              <div><strong>📧 Email :</strong> <a href="mailto:${formData.email}" style="color: #3b82f6; text-decoration: none;">${formData.email}</a></div>
              <div><strong>📞 Téléphone :</strong> <a href="tel:${formData.telephone}" style="color: #3b82f6; text-decoration: none;">${formData.telephone}</a></div>
            </div>
          </div>
          
          <!-- Message -->
          <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #06b6d4;">
            <h2 style="margin: 0 0 15px 0; color: #0891b2; font-size: 20px; display: flex; align-items: center;">
              <span style="margin-right: 10px;">💬</span> Message
            </h2>
            <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e0f2fe;">
              <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; color: #374151;">${formData.message}</p>
            </div>
          </div>

          <!-- Actions rapides -->
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; text-align: center;">
            <h3 style="color: white; margin: 0 0 15px 0;">Actions rapides</h3>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <a href="mailto:${formData.email}" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                📧 Répondre par email
              </a>
              <a href="tel:${formData.telephone}" style="background-color: rgba(255,255,255,0.2); color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                📞 Appeler
              </a>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            📧 Email automatique généré par le site web <strong>Kamlease</strong><br>
            🌐 <a href="https://kamlease.com" style="color: #3b82f6; text-decoration: none;">kamlease.com</a>
          </p>
        </div>
      </div>
    `;

    return content;
  }

  /**
   * Format confirmation email (for user)
   */
  private formatConfirmationEmail(formData: EnhancedContactFormData | AppointmentFormData, isAppointment: boolean): string {
    const logoUrl = 'https://kamlease.com/kamlease-logo.svg';
    
    let content = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header avec logo -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <img src="${logoUrl}" alt="Kamlease" style="max-height: 60px; margin-bottom: 15px;" />
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">
            ✅ Message bien reçu !
          </h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Merci ${formData.prenom} pour votre ${isAppointment ? 'demande de rendez-vous' : 'message'}
          </p>
        </div>

        <!-- Contenu principal -->
        <div style="padding: 30px; background-color: #ffffff;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 25px; border-radius: 12px; margin-bottom: 25px; color: white; text-align: center;">
            <h2 style="margin: 0 0 15px 0; font-size: 24px;">
              🎉 Nous avons bien reçu votre ${isAppointment ? 'demande de rendez-vous' : 'message'} !
            </h2>
            <p style="margin: 0; font-size: 16px; opacity: 0.9;">
              Notre équipe vous répondra dans les plus brefs délais.
            </p>
          </div>

          ${isAppointment && 'appointmentDate' in formData ? `
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 12px; margin-bottom: 25px; border-left: 5px solid #f59e0b;">
            <h3 style="margin: 0 0 15px 0; color: #92400e; display: flex; align-items: center;">
              <span style="margin-right: 10px;">📅</span> Votre demande de rendez-vous
            </h3>
            <p style="margin: 0; color: #92400e;">
              <strong>Date souhaitée :</strong> ${new Date(formData.appointmentDate).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}<br>
              <strong>Heure souhaitée :</strong> ${formData.appointmentTime}
            </p>
          </div>
          ` : ''}

          <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">📞 Nos coordonnées</h3>
            <div style="color: #374151; line-height: 1.8;">
              <p style="margin: 5px 0;"><strong>📧 Email :</strong> <a href="mailto:contact@kamlease.com" style="color: #3b82f6;">contact@kamlease.com</a></p>
              <p style="margin: 5px 0;"><strong>🌐 Site web :</strong> <a href="https://kamlease.com" style="color: #3b82f6;">kamlease.com</a></p>
              <p style="margin: 5px 0;"><strong>🕐 Horaires :</strong> Lundi au Vendredi, 14h00 - 16h30</p>
            </div>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #374151; font-size: 16px;">
              💡 <strong>Besoin d'aide ?</strong>
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              N'hésitez pas à nous contacter si vous avez des questions supplémentaires.
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Merci de votre confiance ! 🙏<br>
            <strong>L'équipe Kamlease</strong><br>
            <a href="https://kamlease.com" style="color: #3b82f6; text-decoration: none;">kamlease.com</a>
          </p>
        </div>
      </div>
    `;

    return content;
  }
}