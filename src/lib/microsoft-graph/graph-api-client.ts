import { TokenManager } from './token-manager';
import { CalendarEvent, AppointmentData, GraphApiError, EmailData } from './types';
import { RateLimiter } from '../security/rate-limiter';
import { SecurityMiddleware } from '../security/security-middleware';
import { GraphConfig } from './config';

/**
 * Microsoft Graph API client for calendar operations
 * Handles authentication, request/response processing, and error handling
 */
export class GraphApiClient {
  private static instance: GraphApiClient;
  private readonly tokenManager: TokenManager;
  private readonly rateLimiter: RateLimiter;
  private readonly securityMiddleware: SecurityMiddleware;
  private readonly baseUrl = 'https://graph.microsoft.com/v1.0';
  private readonly calendarEmail: string;

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
    this.rateLimiter = RateLimiter.getInstance();
    this.securityMiddleware = SecurityMiddleware.getInstance();
    this.calendarEmail = this.getCalendarEmail();
    
    // Initialize Microsoft Graph configuration
    try {
      const graphConfig = GraphConfig.getInstance();
      graphConfig.initialize();
    } catch (error) {
      console.warn('Microsoft Graph configuration not available:', error);
      // Continue without Graph API functionality
    }
  }

  public static getInstance(): GraphApiClient {
    if (!GraphApiClient.instance) {
      GraphApiClient.instance = new GraphApiClient();
    }
    return GraphApiClient.instance;
  }

  /**
   * Check if Microsoft Graph configuration is available
   */
  private isConfigurationAvailable(): boolean {
    try {
      const graphConfig = GraphConfig.getInstance();
      graphConfig.getConfig();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a calendar event in the specified calendar
   * Implements requirements 2.1, 2.2, 2.5
   */
  public async createCalendarEvent(appointmentData: AppointmentData): Promise<CalendarEvent> {
    if (!this.isConfigurationAvailable()) {
      throw new GraphApiError(
        'Microsoft Graph configuration not available. Please check your environment variables.',
        'CONFIG_NOT_AVAILABLE'
      );
    }

    try {
      this.logRequest('createCalendarEvent', appointmentData);
      
      // Get valid access token
      const accessToken = await this.tokenManager.getAccessToken();
      
      // Convert appointment data to calendar event format
      const calendarEvent = this.convertToCalendarEvent(appointmentData);
      
      // Make API request to create calendar event
      const url = `${this.baseUrl}/users/${this.calendarEmail}/calendar/events`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(calendarEvent)
      });

      if (!response.ok) {
        await this.handleApiError(response, 'createCalendarEvent');
      }

      const createdEvent: CalendarEvent = await response.json();
      
      this.logResponse('createCalendarEvent', createdEvent);
      return createdEvent;

    } catch (error) {
      this.logError('createCalendarEvent', error);
      throw this.handleError(error, 'Failed to create calendar event');
    }
  }

  /**
   * Get calendar events for a specific date range (for conflict detection)
   */
  public async getCalendarEvents(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    try {
      this.logRequest('getCalendarEvents', { startDate, endDate });
      
      const accessToken = await this.tokenManager.getAccessToken();
      
      const url = `${this.baseUrl}/users/${this.calendarEmail}/calendar/calendarView` +
        `?startDateTime=${encodeURIComponent(startDate)}&endDateTime=${encodeURIComponent(endDate)}`;
      
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        await this.handleApiError(response, 'getCalendarEvents');
      }

      const data = await response.json();
      const events: CalendarEvent[] = data.value || [];
      
      this.logResponse('getCalendarEvents', { count: events.length });
      return events;

    } catch (error) {
      this.logError('getCalendarEvents', error);
      throw this.handleError(error, 'Failed to retrieve calendar events');
    }
  }

  /**
   * Test API connectivity and authentication
   */
  public async testConnection(): Promise<boolean> {
    try {
      this.logRequest('testConnection', {});
      
      const accessToken = await this.tokenManager.getAccessToken();
      
      // Test with a simple calendar request
      const url = `${this.baseUrl}/users/${this.calendarEmail}/calendar`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      const isConnected = response?.ok || false;
      this.logResponse('testConnection', { connected: isConnected, status: response?.status });
      
      return isConnected;

    } catch (error) {
      this.logError('testConnection', error);
      return false;
    }
  }

  /**
   * Send email using Microsoft Graph API
   * Implements requirement 2.6: Email notifications
   */
  public async sendEmail(emailData: EmailData): Promise<{ id: string; success: boolean }> {
    if (!this.isConfigurationAvailable()) {
      throw new GraphApiError(
        'Microsoft Graph configuration not available. Please check your environment variables.',
        'CONFIG_NOT_AVAILABLE'
      );
    }

    try {
      this.logRequest('sendEmail', { to: emailData.to, subject: emailData.subject });
      
      // Get valid access token
      const accessToken = await this.tokenManager.getAccessToken();
      
      // Prepare email message
      const message = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: emailData.isHtml ? 'HTML' : 'Text',
            content: emailData.body
          },
          toRecipients: emailData.to.map(email => ({
            emailAddress: {
              address: email
            }
          }))
        }
      };
      
      // Send email via Microsoft Graph API
      const url = `${this.baseUrl}/users/${this.calendarEmail}/sendMail`;
      const response = await this.makeAuthenticatedRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        await this.handleApiError(response, 'sendEmail');
      }

      this.logResponse('sendEmail', response.status, 0);
      
      // Return a result object with an ID
      return {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        success: true
      };

    } catch (error) {
      this.logError('sendEmail', error);
      throw new GraphApiError(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EMAIL_SEND_FAILED',
        error instanceof GraphApiError ? error.statusCode : undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Convert appointment data to Microsoft Graph calendar event format
   */
  private convertToCalendarEvent(appointmentData: AppointmentData): Omit<CalendarEvent, 'id'> {
    const { subject, startDateTime, endDateTime, timeZone, attendeeInfo } = appointmentData;
    
    // Create event body with visitor information
    const eventBody = this.formatEventBody(attendeeInfo);
    
    return {
      subject,
      start: {
        dateTime: startDateTime,
        timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone
      },
      body: {
        contentType: 'Text',
        content: eventBody
      }
    };
  }

  /**
   * Format event body with visitor information
   */
  private formatEventBody(attendeeInfo: AppointmentData['attendeeInfo']): string {
    const { prenom, nom, societe, message } = attendeeInfo;
    
    let body = `Rendez-vous via le site web\n\n`;
    body += `Nom: ${nom}\n`;
    body += `Prénom: ${prenom}\n`;
    
    if (societe) {
      body += `Société: ${societe}\n`;
    }
    
    body += `\nMessage:\n${message}`;
    
    return body;
  }

  /**
   * Make authenticated HTTP request with retry logic and security measures
   */
  private async makeAuthenticatedRequest(url: string, options: RequestInit): Promise<Response> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    const endpoint = 'calendar-api';

    // Apply rate limiting
    const rateLimitResult = this.rateLimiter.checkLimit(endpoint);
    if (!rateLimitResult.allowed) {
      this.rateLimiter.recordRequest(endpoint, false);
      throw new GraphApiError(
        `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`,
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }

    // Apply security headers
    try {
      const securedOptions = await this.securityMiddleware.secureApiRequest(
        url,
        options,
        endpoint,
        { enableCSRF: false, enableRateLimit: false, enableInputSanitization: false }
      );
      options = securedOptions;
    } catch (error) {
      this.rateLimiter.recordRequest(endpoint, false);
      throw error;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Handle rate limiting from server
        if (response?.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            this.rateLimiter.recordRequest(endpoint, false);
            throw new GraphApiError(
              'Rate limit exceeded on server',
              'SERVER_RATE_LIMIT',
              429
            );
          }
        }
        
        // If token expired, try to refresh and retry once
        if (response?.status === 401 && attempt === 1) {
          this.tokenManager.clearToken();
          const newToken = await this.tokenManager.getAccessToken();
          
          // Update authorization header
          const headers = new Headers(options.headers);
          headers.set('Authorization', `Bearer ${newToken}`);
          
          const retryResponse = await fetch(url, { ...options, headers });
          
          // Record success/failure for rate limiting
          this.rateLimiter.recordRequest(endpoint, retryResponse.ok);
          return retryResponse;
        }
        
        // Record success/failure for rate limiting
        this.rateLimiter.recordRequest(endpoint, response.ok);
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown network error');
        
        if (attempt === maxRetries) {
          this.rateLimiter.recordRequest(endpoint, false);
          break;
        }
        
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new GraphApiError(
      `Request failed after ${maxRetries} attempts: ${lastError?.message}`,
      'REQUEST_FAILED',
      undefined,
      lastError || undefined
    );
  }

  /**
   * Handle API error responses
   */
  private async handleApiError(response: Response, operation: string): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // If we can't parse the error response, use status text
    }

    const errorMessage = errorData.error?.message || 
                        errorData.error_description || 
                        response.statusText || 
                        'Unknown API error';

    const errorCode = errorData.error?.code || 
                     errorData.error || 
                     `HTTP_${response.status}`;

    throw new GraphApiError(
      `${operation} failed: ${errorMessage}`,
      errorCode,
      response.status
    );
  }

  /**
   * Handle and standardize errors
   */
  private handleError(error: unknown, defaultMessage: string): GraphApiError {
    if (error instanceof GraphApiError) {
      return error;
    }

    if (error instanceof Error) {
      return new GraphApiError(
        `${defaultMessage}: ${error.message}`,
        'API_CLIENT_ERROR',
        undefined,
        error
      );
    }

    return new GraphApiError(defaultMessage, 'UNKNOWN_API_ERROR');
  }

  /**
   * Get calendar email from environment or default
   */
  private getCalendarEmail(): string {
    return import.meta.env.VITE_CALENDAR_EMAIL || 'contact@kamlease.com';
  }

  /**
   * Log API requests for monitoring
   */
  private logRequest(operation: string, data: any): void {
    if (this.isLoggingEnabled()) {
      console.log(`[GraphApiClient] ${operation} request:`, {
        timestamp: new Date().toISOString(),
        operation,
        data: this.sanitizeLogData(data)
      });
    }
  }

  /**
   * Log API responses for monitoring
   */
  private logResponse(operation: string, data: any): void {
    if (this.isLoggingEnabled()) {
      console.log(`[GraphApiClient] ${operation} response:`, {
        timestamp: new Date().toISOString(),
        operation,
        data: this.sanitizeLogData(data)
      });
    }
  }

  /**
   * Log errors for monitoring
   */
  private logError(operation: string, error: unknown): void {
    console.error(`[GraphApiClient] ${operation} error:`, {
      timestamp: new Date().toISOString(),
      operation,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
  }

  /**
   * Check if logging is enabled
   */
  private isLoggingEnabled(): boolean {
    return import.meta.env.DEV || 
           import.meta.env.VITE_ENABLE_API_LOGGING === 'true';
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeLogData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['access_token', 'client_secret', 'password', 'token'];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}