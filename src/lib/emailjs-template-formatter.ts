/**
 * EmailJS Template Parameter Formatter
 * Handles formatting of form data into EmailJS template parameters
 */

import { EnhancedContactFormData } from './form-types';
import { AppointmentFormData, EmailTemplateParams } from './emailjs-service';

/**
 * Extended template parameters with additional formatting options
 */
export interface ExtendedEmailTemplateParams extends EmailTemplateParams {
  // Contact information with emojis for better readability
  contact_info_formatted: string;
  // Full message with structured formatting
  message_formatted: string;
  // Appointment info (if applicable)
  appointment_info_formatted?: string;
  // Timestamp in multiple formats
  timestamp_iso: string;
  timestamp_readable: string;
  // User agent and metadata
  user_metadata?: string;
}

/**
 * Template formatting options
 */
export interface TemplateFormattingOptions {
  includeEmojis: boolean;
  includeMetadata: boolean;
  dateFormat: 'fr-FR' | 'en-US';
  timezone: string;
}

/**
 * Default formatting options
 */
const DEFAULT_OPTIONS: TemplateFormattingOptions = {
  includeEmojis: true,
  includeMetadata: false,
  dateFormat: 'fr-FR',
  timezone: 'Europe/Paris'
};

/**
 * EmailJS Template Formatter Class
 */
export class EmailJSTemplateFormatter {
  private options: TemplateFormattingOptions;

  constructor(options: Partial<TemplateFormattingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Formats contact form data into EmailJS template parameters
   */
  formatContactMessage(formData: EnhancedContactFormData): ExtendedEmailTemplateParams {
    const baseParams = this.createBaseParams(formData);
    const contactInfo = this.formatContactInfo(formData);
    const messageFormatted = this.formatMessage(formData.message);

    return {
      ...baseParams,
      contact_info_formatted: contactInfo,
      message_formatted: messageFormatted,
      timestamp_iso: new Date().toISOString(),
      timestamp_readable: this.formatTimestamp(new Date())
    };
  }

  /**
   * Formats appointment request data into EmailJS template parameters
   */
  formatAppointmentRequest(appointmentData: AppointmentFormData): ExtendedEmailTemplateParams {
    const baseParams = this.createBaseParams(appointmentData);
    const contactInfo = this.formatContactInfo(appointmentData);
    const appointmentInfo = this.formatAppointmentInfo(appointmentData);
    const messageFormatted = this.formatAppointmentMessage(appointmentData);

    return {
      ...baseParams,
      contact_info_formatted: contactInfo,
      message_formatted: messageFormatted,
      appointment_info_formatted: appointmentInfo,
      appointment_date: appointmentData.appointmentDate.toLocaleDateString(this.options.dateFormat),
      appointment_time: appointmentData.appointmentTime,
      timestamp_iso: new Date().toISOString(),
      timestamp_readable: this.formatTimestamp(new Date())
    };
  }

  /**
   * Formats auto-reply email parameters (envoyé à l'utilisateur)
   */
  formatAutoReply(formData: EnhancedContactFormData): ExtendedEmailTemplateParams {
    const baseParams = this.createBaseParams(formData);
    
    // Pour l'auto-reply, on inverse les destinataires
    const autoReplyParams = {
      ...baseParams,
      to_email: formData.email, // Envoyer à l'utilisateur
      reply_to: 'contact@kamlease.com', // Répondre à Kamlease
      from_name: 'Kamlease', // Expéditeur : Kamlease
      from_email: 'contact@kamlease.com',
      contact_info_formatted: this.formatContactInfo(formData),
      message_formatted: `Bonjour ${formData.prenom},\n\nNous avons bien reçu votre message et vous remercions de votre intérêt pour nos services.\n\nNotre équipe vous répondra dans les plus brefs délais.\n\nCordialement,\nL'équipe Kamlease`,
      timestamp_iso: new Date().toISOString(),
      timestamp_readable: this.formatTimestamp(new Date())
    };

    return autoReplyParams;
  }

  /**
   * Creates base template parameters
   */
  private createBaseParams(formData: EnhancedContactFormData): EmailTemplateParams {
    return {
      from_name: `${formData.prenom} ${formData.nom}`,
      from_email: formData.email,
      phone: this.formatPhoneNumber(formData.telephone),
      company: formData.societe || '',
      message: formData.message,
      to_email: 'contact@kamlease.com',
      reply_to: formData.email,
      date: this.formatTimestamp(new Date())
    };
  }

  /**
   * Formats contact information with emojis
   */
  private formatContactInfo(formData: EnhancedContactFormData): string {
    const { includeEmojis } = this.options;
    const emoji = (symbol: string) => includeEmojis ? `${symbol} ` : '';

    let contactInfo = `${emoji('👤')}${formData.prenom} ${formData.nom}\n`;
    contactInfo += `${emoji('📧')}${formData.email}\n`;
    contactInfo += `${emoji('📞')}${this.formatPhoneNumber(formData.telephone)}`;
    
    if (formData.societe) {
      contactInfo += `\n${emoji('🏢')}${formData.societe}`;
    }

    return contactInfo;
  }

  /**
   * Formats appointment information
   */
  private formatAppointmentInfo(appointmentData: AppointmentFormData): string {
    const { includeEmojis } = this.options;
    const emoji = (symbol: string) => includeEmojis ? `${symbol} ` : '';

    return `${emoji('📅')}${appointmentData.appointmentDate.toLocaleDateString(this.options.dateFormat)} à ${appointmentData.appointmentTime}`;
  }

  /**
   * Formats regular message
   */
  private formatMessage(message: string): string {
    // Add basic formatting and structure
    return message.trim();
  }

  /**
   * Formats appointment message with additional context
   */
  private formatAppointmentMessage(appointmentData: AppointmentFormData): string {
    const { includeEmojis } = this.options;
    const emoji = (symbol: string) => includeEmojis ? `${symbol} ` : '';

    let formatted = `${appointmentData.message.trim()}\n\n`;
    formatted += `${emoji('📋')}--- DEMANDE DE RENDEZ-VOUS ---\n`;
    formatted += `${emoji('📅')}Date souhaitée: ${appointmentData.appointmentDate.toLocaleDateString(this.options.dateFormat)}\n`;
    formatted += `${emoji('🕐')}Heure souhaitée: ${appointmentData.appointmentTime}`;

    return formatted;
  }

  /**
   * Formats phone number for display
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Format French numbers
    if (cleaned.startsWith('+33')) {
      const number = cleaned.substring(3);
      if (number.length === 9) {
        return `+33 ${number.substring(0, 1)} ${number.substring(1, 3)} ${number.substring(3, 5)} ${number.substring(5, 7)} ${number.substring(7, 9)}`;
      }
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
    }

    return phone; // Return original if no formatting rule matches
  }

  /**
   * Formats timestamp according to options
   */
  private formatTimestamp(date: Date): string {
    return date.toLocaleString(this.options.dateFormat, {
      timeZone: this.options.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Updates formatting options
   */
  updateOptions(newOptions: Partial<TemplateFormattingOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Gets current formatting options
   */
  getOptions(): TemplateFormattingOptions {
    return { ...this.options };
  }
}

// Export singleton instance with default options
export const emailTemplateFormatter = new EmailJSTemplateFormatter();

// Export factory function for custom options
export function createEmailTemplateFormatter(options: Partial<TemplateFormattingOptions>): EmailJSTemplateFormatter {
  return new EmailJSTemplateFormatter(options);
}

/**
 * Utility function to format contact data quickly
 */
export function formatContactForEmail(formData: EnhancedContactFormData): ExtendedEmailTemplateParams {
  return emailTemplateFormatter.formatContactMessage(formData);
}

/**
 * Utility function to format appointment data quickly
 */
export function formatAppointmentForEmail(appointmentData: AppointmentFormData): ExtendedEmailTemplateParams {
  return emailTemplateFormatter.formatAppointmentRequest(appointmentData);
}