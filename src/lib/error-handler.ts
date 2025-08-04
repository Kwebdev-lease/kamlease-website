/**
 * Comprehensive error handling service for appointment booking system
 * Provides error classification, retry logic, and user-friendly messaging
 */

import { GraphApiError } from './microsoft-graph/types';

export enum ErrorType {
  AUTHENTICATION = 'authentication',
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  BUSINESS_LOGIC = 'business_logic',
  UNKNOWN = 'unknown'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  operation: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  userAgent?: string;
  additionalData?: Record<string, any>;
}

export interface ErrorInfo {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  originalError?: Error;
  context: ErrorContext;
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorType[];
}

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableMonitoring: boolean;
  retryConfig: RetryConfig;
  userMessages: Record<string, string>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorLog: ErrorInfo[] = [];

  private constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = {
      enableLogging: true,
      enableMonitoring: process.env.NODE_ENV === 'production',
      retryConfig: {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        retryableErrors: [ErrorType.NETWORK, ErrorType.API]
      },
      userMessages: {
        [ErrorType.AUTHENTICATION]: 'Problème d\'authentification. Veuillez réessayer.',
        [ErrorType.API]: 'Service temporairement indisponible. Veuillez réessayer.',
        [ErrorType.VALIDATION]: 'Données invalides. Veuillez vérifier vos informations.',
        [ErrorType.NETWORK]: 'Problème de connexion. Veuillez vérifier votre connexion internet.',
        [ErrorType.BUSINESS_LOGIC]: 'Cette action n\'est pas autorisée.',
        [ErrorType.UNKNOWN]: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
      },
      ...config
    };
  }

  public static getInstance(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler(config);
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle and classify errors with retry logic
   */
  public async handleError(
    error: Error | unknown,
    context: Partial<ErrorContext>
  ): Promise<ErrorInfo> {
    const errorInfo = this.classifyError(error, context);
    
    // Log error
    if (this.config.enableLogging) {
      this.logError(errorInfo);
    }

    // Send to monitoring service
    if (this.config.enableMonitoring) {
      await this.sendToMonitoring(errorInfo);
    }

    // Store in local error log
    this.errorLog.push(errorInfo);

    return errorInfo;
  }

  /**
   * Execute operation with automatic retry logic
   */
  public async withRetry<T>(
    operation: () => Promise<T>,
    context: Partial<ErrorContext>,
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const retryConfig = { ...this.config.retryConfig, ...customRetryConfig };
    let lastError: ErrorInfo | null = null;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = await this.handleError(error, {
          ...context,
          additionalData: { attempt, maxRetries: retryConfig.maxRetries }
        });

        // Don't retry if error is not retryable or max retries reached
        if (!this.isRetryable(lastError, retryConfig) || attempt === retryConfig.maxRetries) {
          throw new Error(lastError.userMessage);
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, retryConfig);
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error(lastError?.userMessage || 'Operation failed after retries');
  }

  /**
   * Classify error into appropriate type and severity
   */
  private classifyError(error: Error | unknown, context: Partial<ErrorContext>): ErrorInfo {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    let type = ErrorType.UNKNOWN;
    let severity = ErrorSeverity.MEDIUM;
    let message = 'Unknown error';
    let retryable = false;

    if (error instanceof GraphApiError) {
      type = this.classifyGraphApiError(error);
      severity = this.getSeverityForGraphApiError(error);
      message = error.message;
      retryable = this.isGraphApiErrorRetryable(error);
    } else if (error instanceof Error) {
      const classification = this.classifyGenericError(error);
      type = classification.type;
      severity = classification.severity;
      message = error.message;
      retryable = classification.retryable;
    } else {
      message = String(error);
    }

    const userMessage = this.getUserMessage(type, error);

    return {
      id: errorId,
      type,
      severity,
      message,
      userMessage,
      originalError: error instanceof Error ? error : undefined,
      context: {
        operation: context.operation || 'unknown',
        userId: context.userId,
        sessionId: context.sessionId || this.generateSessionId(),
        timestamp,
        userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
        additionalData: context.additionalData
      },
      retryable,
      retryCount: 0,
      maxRetries: this.config.retryConfig.maxRetries
    };
  }

  /**
   * Classify Microsoft Graph API errors
   */
  private classifyGraphApiError(error: GraphApiError): ErrorType {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return ErrorType.AUTHENTICATION;
    }
    if (error.statusCode === 429) {
      return ErrorType.API; // Rate limiting
    }
    if (error.statusCode && error.statusCode >= 500) {
      return ErrorType.API; // Server errors
    }
    if (error.statusCode === 400) {
      return ErrorType.VALIDATION; // Bad request
    }
    return ErrorType.API;
  }

  /**
   * Get severity for Microsoft Graph API errors
   */
  private getSeverityForGraphApiError(error: GraphApiError): ErrorSeverity {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return ErrorSeverity.HIGH;
    }
    if (error.statusCode && error.statusCode >= 500) {
      return ErrorSeverity.CRITICAL;
    }
    if (error.statusCode === 429) {
      return ErrorSeverity.MEDIUM; // Rate limiting
    }
    return ErrorSeverity.LOW;
  }

  /**
   * Check if Microsoft Graph API error is retryable
   */
  private isGraphApiErrorRetryable(error: GraphApiError): boolean {
    // Retry on server errors and rate limiting
    return error.statusCode === 429 || (error.statusCode && error.statusCode >= 500);
  }

  /**
   * Classify generic errors
   */
  private classifyGenericError(error: Error): { type: ErrorType; severity: ErrorSeverity; retryable: boolean } {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return { type: ErrorType.NETWORK, severity: ErrorSeverity.MEDIUM, retryable: true };
    }

    // Validation errors
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return { type: ErrorType.VALIDATION, severity: ErrorSeverity.LOW, retryable: false };
    }

    // Authentication errors
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return { type: ErrorType.AUTHENTICATION, severity: ErrorSeverity.HIGH, retryable: false };
    }

    return { type: ErrorType.UNKNOWN, severity: ErrorSeverity.MEDIUM, retryable: false };
  }

  /**
   * Get user-friendly error message
   */
  private getUserMessage(type: ErrorType, error: Error | unknown): string {
    // Check for specific error patterns first
    if (error instanceof GraphApiError) {
      if (error.statusCode === 429) {
        return 'Trop de demandes simultanées. Veuillez patienter quelques instants.';
      }
      if (error.statusCode === 401 || error.statusCode === 403) {
        return 'Problème d\'autorisation. Le service de calendrier est temporairement indisponible.';
      }
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('business hours') || message.includes('horaire')) {
        return 'Le créneau sélectionné n\'est pas disponible. Veuillez choisir un horaire entre 14h00 et 16h30, du lundi au vendredi.';
      }
      if (message.includes('past') || message.includes('passé')) {
        return 'Impossible de programmer un rendez-vous dans le passé.';
      }
    }

    return this.config.userMessages[type] || this.config.userMessages[ErrorType.UNKNOWN];
  }

  /**
   * Check if error is retryable based on configuration
   */
  private isRetryable(errorInfo: ErrorInfo, retryConfig: RetryConfig): boolean {
    return errorInfo.retryable && retryConfig.retryableErrors.includes(errorInfo.type);
  }

  /**
   * Calculate delay for exponential backoff
   */
  private calculateDelay(attempt: number, retryConfig: RetryConfig): number {
    const delay = retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt);
    return Math.min(delay, retryConfig.maxDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log error information
   */
  private logError(errorInfo: ErrorInfo): void {
    const logLevel = this.getLogLevel(errorInfo.severity);
    const logMessage = `[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`;
    
    console[logLevel](logMessage, {
      errorId: errorInfo.id,
      context: errorInfo.context,
      severity: errorInfo.severity,
      retryable: errorInfo.retryable
    });
  }

  /**
   * Send error to monitoring service
   */
  private async sendToMonitoring(errorInfo: ErrorInfo): Promise<void> {
    try {
      // In a real implementation, this would send to services like:
      // - Sentry
      // - DataDog
      // - CloudWatch
      // - Custom monitoring endpoint
      
      const monitoringData = {
        errorId: errorInfo.id,
        type: errorInfo.type,
        severity: errorInfo.severity,
        message: errorInfo.message,
        context: errorInfo.context,
        timestamp: errorInfo.context.timestamp
      };

      // Simulate monitoring service call
      if (process.env.NODE_ENV === 'development') {
        console.log('[MONITORING]', monitoringData);
      }

      // Example: Send to custom monitoring endpoint
      // await fetch('/api/monitoring/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(monitoringData)
      // });

    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError);
    }
  }

  /**
   * Get appropriate log level for severity
   */
  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'error';
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    bySeverity: Record<ErrorSeverity, number>;
    recentErrors: ErrorInfo[];
  } {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<ErrorType, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recentErrors: this.errorLog.slice(-10) // Last 10 errors
    };

    // Initialize counters
    Object.values(ErrorType).forEach(type => {
      stats.byType[type] = 0;
    });
    Object.values(ErrorSeverity).forEach(severity => {
      stats.bySeverity[severity] = 0;
    });

    // Count errors
    this.errorLog.forEach(error => {
      stats.byType[error.type]++;
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }

  /**
   * Clear error log (useful for testing)
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();