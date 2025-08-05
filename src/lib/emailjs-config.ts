/**
 * EmailJS Configuration
 * Handles secure configuration and validation for EmailJS service
 */

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  userId: string;
  accessToken?: string;
}

export interface EmailJSEnvironment {
  VITE_EMAILJS_SERVICE_ID: string;
  VITE_EMAILJS_TEMPLATE_ID: string;
  VITE_EMAILJS_USER_ID: string;
  VITE_EMAILJS_ACCESS_TOKEN?: string;
}

/**
 * Validates EmailJS configuration
 */
export function validateEmailJSConfig(config: Partial<EmailJSConfig>): config is EmailJSConfig {
  const requiredFields: (keyof EmailJSConfig)[] = ['serviceId', 'templateId', 'userId'];
  
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

  if (config.templateId && !config.templateId.startsWith('template_')) {
    console.error('EmailJS configuration error: templateId should start with "template_"');
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
    templateId: env.VITE_EMAILJS_TEMPLATE_ID,
    userId: env.VITE_EMAILJS_USER_ID,
    accessToken: env.VITE_EMAILJS_ACCESS_TOKEN
  };

  if (!validateEmailJSConfig(config)) {
    throw new Error('Invalid EmailJS configuration. Please check your environment variables.');
  }

  return config;
}

/**
 * Gets EmailJS configuration with fallback values for development
 */
export function getEmailJSConfig(): EmailJSConfig {
  try {
    return loadEmailJSConfig();
  } catch (error) {
    // In development, provide fallback configuration
    if (import.meta.env.DEV) {
      console.warn('Using fallback EmailJS configuration for development');
      return {
        serviceId: 'service_kamlease',
        templateId: 'template_contact',
        userId: 'dev_user_id'
      };
    }
    throw error;
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