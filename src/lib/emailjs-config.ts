/**
 * EmailJS Configuration
 * Handles secure configuration and validation for EmailJS service
 */

export interface EmailJSConfig {
  serviceId: string;
  contactTemplateId: string; // Template pour recevoir les messages (template_0r644sd)
  autoReplyTemplateId: string; // Template pour l'auto-réponse (template_u2efufb)
  userId: string;
  accessToken?: string;
}

export interface EmailJSEnvironment {
  VITE_EMAILJS_SERVICE_ID: string;
  VITE_EMAILJS_CONTACT_TEMPLATE_ID: string;
  VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID: string;
  VITE_EMAILJS_USER_ID: string;
  VITE_EMAILJS_ACCESS_TOKEN?: string;
}

/**
 * Validates EmailJS configuration
 */
export function validateEmailJSConfig(config: Partial<EmailJSConfig>): config is EmailJSConfig {
  const requiredFields: (keyof EmailJSConfig)[] = ['serviceId', 'contactTemplateId', 'autoReplyTemplateId', 'userId'];
  
  for (const field of requiredFields) {
    if (!config[field] || typeof config[field] !== 'string' || config[field]!.trim() === '') {
      console.error(`EmailJS configuration error: ${field} is required and must be a non-empty string`);
      return false;
    }
  }

  // Validate format patterns
  if (config.serviceId && !config.serviceId.startsWith('service_')) {
    console.error('EmailJS configuration error: serviceId should start with "service_"');
    return false;
  }

  if (config.contactTemplateId && !config.contactTemplateId.startsWith('template_')) {
    console.error('EmailJS configuration error: contactTemplateId should start with "template_"');
    return false;
  }

  if (config.autoReplyTemplateId && !config.autoReplyTemplateId.startsWith('template_')) {
    console.error('EmailJS configuration error: autoReplyTemplateId should start with "template_"');
    return false;
  }

  return true;
}

/**
 * Loads EmailJS configuration from environment variables
 */
export function loadEmailJSConfig(): EmailJSConfig {
  const env = import.meta.env as unknown as EmailJSEnvironment;
  
  const config: Partial<EmailJSConfig> = {
    serviceId: env.VITE_EMAILJS_SERVICE_ID,
    contactTemplateId: env.VITE_EMAILJS_CONTACT_TEMPLATE_ID,
    autoReplyTemplateId: env.VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID,
    userId: env.VITE_EMAILJS_USER_ID,
    accessToken: env.VITE_EMAILJS_ACCESS_TOKEN
  };

  if (!validateEmailJSConfig(config)) {
    throw new Error('Invalid EmailJS configuration. Please check your environment variables.');
  }

  return config;
}

/**
 * Gets EmailJS configuration with fallback values for development and production
 */
export function getEmailJSConfig(): EmailJSConfig {
  try {
    return loadEmailJSConfig();
  } catch (error) {
    // Provide fallback configuration for both development and production
    console.warn('EmailJS configuration not available, using fallback configuration');
    
    // Configuration EmailJS complète
    return {
      serviceId: 'website_automail', // Ton service ID
      contactTemplateId: 'template_0r644sd', // Template pour recevoir les messages
      autoReplyTemplateId: 'template_u2efufb', // Template pour l'auto-réponse
      userId: 'lwGUqh3EWS-EkkziA' // Ta clé publique
    };
  }
}

/**
 * Sanitizes configuration for logging (removes sensitive data)
 */
export function sanitizeConfigForLogging(config: EmailJSConfig): Partial<EmailJSConfig> {
  return {
    serviceId: config.serviceId,
    templateId: config.templateId,
    userId: config.userId ? `${config.userId.substring(0, 4)}***` : undefined
  };
}