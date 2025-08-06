/**
 * Enhanced EmailJS Service
 * Handles email sending via EmailJS with improved error handling and type safety
 */

import { getEmailJSConfig, sanitizeConfigForLogging, type EmailJSConfig } from './emailjs-config';
import { EnhancedContactFormData } from './form-types';
import { emailTemplateFormatter, type ExtendedEmailTemplateParams } from './emailjs-template-formatter';

// EmailJS API response interface
export interface EmailJSResponse {
  status: number;
  text: string;
}

// Email sending result
export interface EmailResult {
  success: boolean;
  message: string;
  type: 'message' | 'appointment' | 'email_fallback';
  error?: string;
  emailId?: string;
}

// Template parameters for EmailJS
export interface EmailTemplateParams {
  from_name: string;
  from_email: string;
  phone: string;
  company: string;
  message: string;
  to_email: string;
  reply_to: string;
  date: string;
  appointment_date?: string;
  appointment_time?: string;
}

// Appointment form data interface
export interface AppointmentFormData extends EnhancedContactFormData {
  appointmentDate: Date;
  appointmentTime: string;
}

// EmailJS error codes
export enum EmailJSErrorCodes {
  INVALID_SERVICE = 400,
  INVALID_TEMPLATE = 404,
  RATE_LIMITED = 429,
  SERVER_ERROR = 500,
  NETWORK_ERROR = 0
}

/**
 * Enhanced EmailJS Service Class
 */
export class EmailJSService {
  private config: EmailJSConfig;
  private readonly apiUrl = 'https://api.emailjs.com/api/v1.0/email/send';

  constructor(config?: EmailJSConfig) {
    try {
      this.config = config || getEmailJSConfig();
    } catch (error) {
      console.warn('EmailJS service initialized with fallback config');
      this.config = {
        serviceId: 'website_automail',
        contactTemplateId: 'template_0r644sd',
        autoReplyTemplateId: 'template_u2efufb',
        userId: 'lwGUqh3EWS-EkkziA'
      };
    }
  }

  /**
   * Sends a simple contact message (envoie 2 emails : un à toi et un auto-reply à l'utilisateur)
   */
  async sendContactMessage(formData: EnhancedContactFormData): Promise<EmailResult> {
    try {
      // 1. Envoyer le message à contact@kamlease.com
      const contactParams = emailTemplateFormatter.formatContactMessage(formData);
      const contactResponse = await this.sendEmail(contactParams, 'contact');
      
      // 2. Envoyer l'auto-réponse à l'utilisateur
      const autoReplyParams = emailTemplateFormatter.formatAutoReply(formData);
      const autoReplyResponse = await this.sendEmail(autoReplyParams, 'autoReply');
      
      // Vérifier que les deux emails ont été envoyés
      const contactResult = this.validateEmailJSResponse(contactResponse, 'message');
      const autoReplyResult = this.validateEmailJSResponse(autoReplyResponse, 'message');
      
      if (contactResult.success && autoReplyResult.success) {
        return {
          success: true,
          message: 'Message envoyé avec succès. Vous recevrez une confirmation par email.',
          type: 'message',
          emailId: `${contactResult.emailId}, ${autoReplyResult.emailId}`
        };
      } else {
        // Si l'un des deux échoue, on retourne l'erreur
        const failedResult = !contactResult.success ? contactResult : autoReplyResult;
        return failedResult;
      }
    } catch (error) {
      console.error('EmailJS contact message error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: this.getErrorMessage(EmailJSErrorCodes.NETWORK_ERROR),
        type: 'message',
        error: `EMAILJS_NETWORK_ERROR: ${errorMessage}`
      };
    }
  }

  /**
   * Sends an appointment request
   */
  async sendAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult> {
    try {
      const templateParams = emailTemplateFormatter.formatAppointmentRequest(appointmentData);
      const response = await this.sendEmail(templateParams);
      
      return this.validateEmailJSResponse(response, 'appointment');
    } catch (error) {
      console.error('EmailJS appointment request error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: this.getErrorMessage(EmailJSErrorCodes.NETWORK_ERROR),
        type: 'appointment',
        error: `EMAILJS_NETWORK_ERROR: ${errorMessage}`
      };
    }
  }

  /**
   * Sends email via EmailJS API
   */
  private async sendEmail(templateParams: EmailTemplateParams | ExtendedEmailTemplateParams, type: 'contact' | 'autoReply' = 'contact'): Promise<EmailJSResponse> {
    const templateId = type === 'contact' ? this.config.contactTemplateId : this.config.autoReplyTemplateId;
    
    const payload = {
      service_id: this.config.serviceId,
      template_id: templateId,
      user_id: this.config.userId,
      accessToken: this.config.accessToken,
      template_params: templateParams
    };

    // Log sanitized configuration for debugging
    console.log('EmailJS config:', sanitizeConfigForLogging(this.config));

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      
      return {
        status: response.status,
        text: responseText
      };
    } catch (networkError) {
      console.error('Network error during EmailJS request:', networkError);
      return {
        status: EmailJSErrorCodes.NETWORK_ERROR,
        text: networkError instanceof Error ? networkError.message : 'Network error'
      };
    }
  }

  /**
   * Validates EmailJS response and returns formatted result
   */
  private validateEmailJSResponse(response: EmailJSResponse, type: 'message' | 'appointment'): EmailResult {
    if (response.status === 200) {
      return {
        success: true,
        message: `${type === 'appointment' ? 'Appointment request' : 'Message'} sent successfully`,
        type,
        emailId: response.text
      };
    }

    const errorMessage = this.getErrorMessage(response.status);
    
    return {
      success: false,
      message: errorMessage,
      type,
      error: `${errorMessage}: ${response.text}`
    };
  }



  /**
   * Gets user-friendly error message based on status code
   * Returns error codes that can be translated by the UI
   */
  private getErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case EmailJSErrorCodes.INVALID_SERVICE:
        return 'EMAILJS_INVALID_SERVICE';
      case EmailJSErrorCodes.INVALID_TEMPLATE:
        return 'EMAILJS_INVALID_TEMPLATE';
      case EmailJSErrorCodes.RATE_LIMITED:
        return 'EMAILJS_RATE_LIMITED';
      case EmailJSErrorCodes.SERVER_ERROR:
        return 'EMAILJS_SERVER_ERROR';
      case EmailJSErrorCodes.NETWORK_ERROR:
        return 'EMAILJS_NETWORK_ERROR';
      default:
        return 'EMAILJS_SEND_FAILED';
    }
  }

  /**
   * Tests EmailJS configuration
   */
  async testConfiguration(): Promise<EmailResult> {
    const testData: EnhancedContactFormData = {
      nom: 'Test',
      prenom: 'User',
      email: 'test@example.com',
      telephone: '+33123456789',
      societe: 'Test Company',
      message: 'Test message from EmailJS service'
    };

    return this.sendContactMessage(testData);
  }

  /**
   * Gets formatted template parameters for preview/debugging
   */
  getFormattedParams(formData: EnhancedContactFormData): ExtendedEmailTemplateParams {
    return emailTemplateFormatter.formatContactMessage(formData);
  }

  /**
   * Gets formatted appointment parameters for preview/debugging
   */
  getFormattedAppointmentParams(appointmentData: AppointmentFormData): ExtendedEmailTemplateParams {
    return emailTemplateFormatter.formatAppointmentRequest(appointmentData);
  }
}

// Export singleton instance with lazy initialization
let _emailJSServiceInstance: EmailJSService | null = null;

export const emailJSService = {
  get instance(): EmailJSService {
    if (!_emailJSServiceInstance) {
      _emailJSServiceInstance = new EmailJSService();
    }
    return _emailJSServiceInstance;
  },
  
  // Proxy methods to the actual service
  async sendContactMessage(formData: EnhancedContactFormData): Promise<EmailResult> {
    return this.instance.sendContactMessage(formData);
  },
  
  async sendAppointmentRequest(appointmentData: AppointmentFormData): Promise<EmailResult> {
    return this.instance.sendAppointmentRequest(appointmentData);
  },
  
  async testConfiguration(): Promise<EmailResult> {
    return this.instance.testConfiguration();
  },
  
  getFormattedParams(formData: EnhancedContactFormData) {
    return this.instance.getFormattedParams(formData);
  },
  
  getFormattedAppointmentParams(appointmentData: AppointmentFormData) {
    return this.instance.getFormattedAppointmentParams(appointmentData);
  }
};

// Export factory function for custom configuration
export function createEmailJSService(config: EmailJSConfig): EmailJSService {
  return new EmailJSService(config);
}