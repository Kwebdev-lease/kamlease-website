/**
 * Application Configuration Management
 * Centralized configuration for calendar booking integration
 */

export interface BusinessHoursConfig {
  timezone: string;
  workingDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  dailySchedule: {
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    slotDuration: number; // minutes
  };
}

export interface FeatureFlags {
  calendarBooking: boolean;
  appointmentConflicts: boolean;
  emailFallback: boolean;
}

export interface AppConfig {
  microsoftGraph: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
    scope: string;
  };
  business: {
    calendarEmail: string;
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
    appointmentDuration: number;
  };
  features: FeatureFlags;
}

export class ConfigurationError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Configuration Manager
 * Handles loading, validation, and access to application configuration
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig | null = null;
  private initialized = false;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Initialize configuration from environment variables
   * Should be called at application startup
   */
  public initialize(): AppConfig {
    if (this.initialized && this.config) {
      return this.config;
    }

    try {
      this.config = {
        microsoftGraph: {
          tenantId: this.getEnvVar('VITE_MICROSOFT_TENANT_ID'),
          clientId: this.getEnvVar('VITE_MICROSOFT_CLIENT_ID'),
          clientSecret: this.getEnvVar('VITE_MICROSOFT_CLIENT_SECRET'),
          scope: this.getEnvVar('VITE_MICROSOFT_SCOPE', 'https://graph.microsoft.com/.default')
        },
        business: {
          calendarEmail: this.getEnvVar('VITE_CALENDAR_EMAIL'),
          timezone: this.getEnvVar('VITE_BUSINESS_TIMEZONE', 'Europe/Paris'),
          workingHours: {
            start: this.getEnvVar('VITE_BUSINESS_START_TIME', '14:00'),
            end: this.getEnvVar('VITE_BUSINESS_END_TIME', '16:30')
          },
          appointmentDuration: parseInt(this.getEnvVar('VITE_APPOINTMENT_DURATION', '30'), 10)
        },
        features: {
          calendarBooking: this.getBooleanEnvVar('VITE_ENABLE_CALENDAR_BOOKING', true),
          appointmentConflicts: this.getBooleanEnvVar('VITE_ENABLE_APPOINTMENT_CONFLICTS', true),
          emailFallback: this.getBooleanEnvVar('VITE_ENABLE_EMAIL_FALLBACK', true)
        }
      };

      this.validateConfiguration(this.config);
      this.initialized = true;
      
      return this.config;
    } catch (error) {
      throw new ConfigurationError(
        `Failed to initialize configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INIT_FAILED'
      );
    }
  }

  /**
   * Get the current configuration
   * Throws if not initialized
   */
  public getConfig(): AppConfig {
    if (!this.initialized || !this.config) {
      throw new ConfigurationError(
        'Configuration not initialized. Call initialize() first.',
        'NOT_INITIALIZED'
      );
    }
    return this.config;
  }

  /**
   * Get business hours configuration
   */
  public getBusinessHours(): BusinessHoursConfig {
    const config = this.getConfig();
    
    return {
      timezone: config.business.timezone,
      workingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      dailySchedule: {
        startTime: config.business.workingHours.start,
        endTime: config.business.workingHours.end,
        slotDuration: config.business.appointmentDuration
      }
    };
  }

  /**
   * Get feature flags
   */
  public getFeatureFlags(): FeatureFlags {
    const config = this.getConfig();
    return config.features;
  }

  /**
   * Check if a specific feature is enabled
   */
  public isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    const flags = this.getFeatureFlags();
    return flags[feature];
  }

  /**
   * Check if configuration is properly initialized
   */
  public isInitialized(): boolean {
    return this.initialized && this.config !== null;
  }

  /**
   * Validate the entire configuration
   */
  private validateConfiguration(config: AppConfig): void {
    this.validateMicrosoftGraphConfig(config.microsoftGraph);
    this.validateBusinessConfig(config.business);
    this.validateFeatureFlags(config.features);
  }

  /**
   * Validate Microsoft Graph configuration
   */
  private validateMicrosoftGraphConfig(config: AppConfig['microsoftGraph']): void {
    const requiredFields: (keyof typeof config)[] = ['tenantId', 'clientId', 'clientSecret', 'scope'];
    
    for (const field of requiredFields) {
      if (!config[field] || config[field].trim() === '') {
        throw new ConfigurationError(
          `Microsoft Graph configuration: ${field} is required and cannot be empty`,
          'INVALID_GRAPH_CONFIG'
        );
      }
    }

    // Validate GUID format for tenant and client IDs
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!guidRegex.test(config.tenantId)) {
      throw new ConfigurationError(
        'Invalid tenant ID format. Expected GUID format.',
        'INVALID_TENANT_ID'
      );
    }

    if (!guidRegex.test(config.clientId)) {
      throw new ConfigurationError(
        'Invalid client ID format. Expected GUID format.',
        'INVALID_CLIENT_ID'
      );
    }

    // Validate scope format
    if (!config.scope.startsWith('https://graph.microsoft.com/')) {
      throw new ConfigurationError(
        'Invalid scope format. Must be a Microsoft Graph scope.',
        'INVALID_SCOPE'
      );
    }
  }

  /**
   * Validate business configuration
   */
  private validateBusinessConfig(config: AppConfig['business']): void {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.calendarEmail)) {
      throw new ConfigurationError(
        'Invalid calendar email format.',
        'INVALID_EMAIL'
      );
    }

    // Validate timezone
    try {
      Intl.DateTimeFormat(undefined, { timeZone: config.timezone });
    } catch {
      throw new ConfigurationError(
        `Invalid timezone: ${config.timezone}`,
        'INVALID_TIMEZONE'
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(config.workingHours.start)) {
      throw new ConfigurationError(
        `Invalid start time format: ${config.workingHours.start}. Expected HH:mm format.`,
        'INVALID_START_TIME'
      );
    }

    if (!timeRegex.test(config.workingHours.end)) {
      throw new ConfigurationError(
        `Invalid end time format: ${config.workingHours.end}. Expected HH:mm format.`,
        'INVALID_END_TIME'
      );
    }

    // Validate that start time is before end time
    const [startHour, startMin] = config.workingHours.start.split(':').map(Number);
    const [endHour, endMin] = config.workingHours.end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      throw new ConfigurationError(
        'Start time must be before end time.',
        'INVALID_TIME_RANGE'
      );
    }

    // Validate appointment duration
    if (config.appointmentDuration <= 0 || config.appointmentDuration > 480) {
      throw new ConfigurationError(
        'Appointment duration must be between 1 and 480 minutes.',
        'INVALID_DURATION'
      );
    }
  }

  /**
   * Validate feature flags
   */
  private validateFeatureFlags(flags: FeatureFlags): void {
    const requiredFlags: (keyof FeatureFlags)[] = ['calendarBooking', 'appointmentConflicts', 'emailFallback'];
    
    for (const flag of requiredFlags) {
      if (typeof flags[flag] !== 'boolean') {
        throw new ConfigurationError(
          `Feature flag ${flag} must be a boolean value.`,
          'INVALID_FEATURE_FLAG'
        );
      }
    }
  }

  /**
   * Get environment variable with optional default
   */
  private getEnvVar(name: string, defaultValue?: string): string {
    const value = import.meta.env[name];
    
    if (!value && defaultValue === undefined) {
      throw new ConfigurationError(
        `Missing required environment variable: ${name}`,
        'MISSING_ENV_VAR'
      );
    }
    
    return value || defaultValue!;
  }

  /**
   * Get boolean environment variable with default
   */
  private getBooleanEnvVar(name: string, defaultValue: boolean): boolean {
    const value = this.getEnvVar(name, defaultValue.toString());
    
    if (value.toLowerCase() === 'true' || value === '1') {
      return true;
    } else if (value.toLowerCase() === 'false' || value === '0') {
      return false;
    }
    
    throw new ConfigurationError(
      `Invalid boolean value for ${name}: ${value}. Expected 'true', 'false', '1', or '0'.`,
      'INVALID_BOOLEAN'
    );
  }

  /**
   * Reset configuration (useful for testing)
   */
  public reset(): void {
    this.config = null;
    this.initialized = false;
  }
}

// Export singleton instance
export const configManager = ConfigManager.getInstance();