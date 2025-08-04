/**
 * Configuration Initialization
 * Handles application startup configuration validation and setup
 */

import { configManager, ConfigurationError } from './config';

export interface ConfigInitResult {
  success: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Initialize application configuration
 * Should be called at application startup before any other services
 */
export async function initializeConfiguration(): Promise<ConfigInitResult> {
  const warnings: string[] = [];
  
  try {
    // Initialize main configuration
    const config = configManager.initialize();
    
    // Validate feature flag combinations
    if (config.features.appointmentConflicts && !config.features.calendarBooking) {
      warnings.push('Appointment conflicts feature is enabled but calendar booking is disabled');
    }
    
    if (!config.features.emailFallback && !config.features.calendarBooking) {
      warnings.push('Both calendar booking and email fallback are disabled - users cannot submit appointments');
    }
    
    // Validate business hours make sense
    const businessHours = configManager.getBusinessHours();
    const startTime = businessHours.dailySchedule.startTime;
    const endTime = businessHours.dailySchedule.endTime;
    const duration = businessHours.dailySchedule.slotDuration;
    
    // Calculate total available minutes per day
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    
    if (totalMinutes < duration) {
      warnings.push(`Business hours window (${totalMinutes} minutes) is shorter than appointment duration (${duration} minutes)`);
    }
    
    // Check if any working days are enabled
    const workingDaysCount = Object.values(businessHours.workingDays).filter(Boolean).length;
    if (workingDaysCount === 0) {
      warnings.push('No working days are enabled - appointments cannot be scheduled');
    }
    
    // Log successful initialization
    console.log('✅ Configuration initialized successfully');
    if (warnings.length > 0) {
      console.warn('⚠️ Configuration warnings:', warnings);
    }
    
    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    const errorMessage = error instanceof ConfigurationError 
      ? `Configuration Error (${error.code}): ${error.message}`
      : `Unexpected error during configuration initialization: ${error instanceof Error ? error.message : 'Unknown error'}`;
    
    console.error('❌ Configuration initialization failed:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Validate configuration at runtime
 * Can be called periodically or on demand to check configuration health
 */
export function validateRuntimeConfiguration(): ConfigInitResult {
  try {
    if (!configManager.isInitialized()) {
      return {
        success: false,
        error: 'Configuration not initialized'
      };
    }
    
    const config = configManager.getConfig();
    const warnings: string[] = [];
    
    // Check if calendar booking is available
    if (config.features.calendarBooking) {
      // Validate Microsoft Graph credentials are present
      if (!config.microsoftGraph.tenantId || !config.microsoftGraph.clientId || !config.microsoftGraph.clientSecret) {
        warnings.push('Calendar booking is enabled but Microsoft Graph credentials are incomplete');
      }
    }
    
    // Check timezone validity at runtime (in case system timezone data changed)
    try {
      const now = new Date();
      new Intl.DateTimeFormat('en-US', { 
        timeZone: config.business.timezone,
        hour: '2-digit',
        minute: '2-digit'
      }).format(now);
    } catch {
      return {
        success: false,
        error: `Invalid timezone configuration: ${config.business.timezone}`
      };
    }
    
    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Get configuration summary for debugging
 */
export function getConfigurationSummary(): Record<string, any> {
  try {
    if (!configManager.isInitialized()) {
      return { status: 'not_initialized' };
    }
    
    const config = configManager.getConfig();
    const businessHours = configManager.getBusinessHours();
    
    return {
      status: 'initialized',
      features: config.features,
      business: {
        timezone: config.business.timezone,
        workingHours: config.business.workingHours,
        appointmentDuration: config.business.appointmentDuration,
        workingDays: Object.entries(businessHours.workingDays)
          .filter(([, enabled]) => enabled)
          .map(([day]) => day)
      },
      microsoftGraph: {
        configured: !!(config.microsoftGraph.tenantId && config.microsoftGraph.clientId),
        scope: config.microsoftGraph.scope
      }
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}