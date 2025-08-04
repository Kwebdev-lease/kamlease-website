import { GraphApiConfig, GraphApiError } from './types';

/**
 * Microsoft Graph API configuration management
 * Handles secure credential storage using environment variables
 */
export class GraphConfig {
  private static instance: GraphConfig;
  private config: GraphApiConfig | null = null;

  private constructor() {}

  public static getInstance(): GraphConfig {
    if (!GraphConfig.instance) {
      GraphConfig.instance = new GraphConfig();
    }
    return GraphConfig.instance;
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
   * Initialize configuration from environment variables
   * Validates all required credentials are present
   */
  public initialize(): GraphApiConfig {
    if (this.config) {
      return this.config;
    }

    // In localhost development, throw a specific error to trigger simulation mode
    if (this.isLocalhostDevelopment()) {
      throw new GraphApiError(
        'Microsoft Graph API cannot be used from localhost due to CORS restrictions. Using simulation mode.',
        'LOCALHOST_NOT_SUPPORTED'
      );
    }

    const tenantId = this.getEnvVar('VITE_MICROSOFT_TENANT_ID');
    const clientId = this.getEnvVar('VITE_MICROSOFT_CLIENT_ID');
    const clientSecret = this.getEnvVar('VITE_MICROSOFT_CLIENT_SECRET');
    const scope = this.getEnvVar('VITE_MICROSOFT_SCOPE', 'https://graph.microsoft.com/.default');

    // Also check for development placeholder values
    if (tenantId.includes('localhost') || tenantId.includes('development') || 
        clientId.includes('localhost') || clientId.includes('development')) {
      throw new GraphApiError(
        'Development placeholder values detected. Using simulation mode.',
        'DEVELOPMENT_MODE'
      );
    }

    this.config = {
      tenantId,
      clientId,
      clientSecret,
      scope
    };

    this.validateConfig(this.config);
    return this.config;
  }

  /**
   * Get configuration (throws if not initialized)
   */
  public getConfig(): GraphApiConfig {
    if (!this.config) {
      throw new GraphApiError('Graph API configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Check if configuration is available
   */
  public isConfigured(): boolean {
    try {
      this.initialize();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get environment variable with optional default
   */
  private getEnvVar(name: string, defaultValue?: string): string {
    const value = import.meta.env[name];
    
    if (!value && !defaultValue) {
      throw new GraphApiError(
        `Missing required environment variable: ${name}`,
        'MISSING_ENV_VAR'
      );
    }
    
    return value || defaultValue!;
  }

  /**
   * Validate configuration completeness
   */
  private validateConfig(config: GraphApiConfig): void {
    const requiredFields: (keyof GraphApiConfig)[] = ['tenantId', 'clientId', 'clientSecret', 'scope'];
    
    for (const field of requiredFields) {
      if (!config[field] || config[field].trim() === '') {
        throw new GraphApiError(
          `Invalid configuration: ${field} is required and cannot be empty`,
          'INVALID_CONFIG'
        );
      }
    }

    // Validate tenant ID format (should be a GUID)
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(config.tenantId)) {
      throw new GraphApiError(
        'Invalid tenant ID format. Expected GUID format.',
        'INVALID_TENANT_ID'
      );
    }

    // Validate client ID format (should be a GUID)
    if (!guidRegex.test(config.clientId)) {
      throw new GraphApiError(
        'Invalid client ID format. Expected GUID format.',
        'INVALID_CLIENT_ID'
      );
    }

    // Validate scope format
    if (!config.scope.startsWith('https://graph.microsoft.com/')) {
      throw new GraphApiError(
        'Invalid scope format. Must be a Microsoft Graph scope.',
        'INVALID_SCOPE'
      );
    }
  }

  /**
   * Reset configuration (useful for testing)
   */
  public reset(): void {
    this.config = null;
  }
}