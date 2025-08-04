import { GraphConfig } from './config';
import { TokenResponse, TokenInfo, GraphApiError } from './types';

/**
 * OAuth token management service for Microsoft Graph authentication
 * Handles token acquisition, refresh, and validation with error handling
 */
export class TokenManager {
  private static instance: TokenManager;
  private tokenInfo: TokenInfo | null = null;
  private refreshPromise: Promise<string> | null = null;
  private readonly config: GraphConfig;

  private constructor() {
    this.config = GraphConfig.getInstance();
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  public async getAccessToken(): Promise<string> {
    try {
      // If we have a valid token, return it
      if (this.tokenInfo && this.isTokenValid()) {
        return this.tokenInfo.accessToken;
      }

      // If a refresh is already in progress, wait for it
      if (this.refreshPromise) {
        return await this.refreshPromise;
      }

      // Start token refresh
      this.refreshPromise = this.refreshToken();
      const token = await this.refreshPromise;
      this.refreshPromise = null;
      
      return token;
    } catch (error) {
      this.refreshPromise = null;
      throw this.handleTokenError(error);
    }
  }

  /**
   * Refresh the access token using client credentials flow
   */
  public async refreshToken(): Promise<string> {
    try {
      const graphConfig = this.config.getConfig();
      const tokenUrl = `https://login.microsoftonline.com/${graphConfig.tenantId}/oauth2/v2.0/token`;

      const params = new URLSearchParams({
        client_id: graphConfig.clientId,
        client_secret: graphConfig.clientSecret,
        scope: graphConfig.scope,
        grant_type: 'client_credentials'
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new GraphApiError(
          `Token request failed: ${errorData.error_description || response.statusText}`,
          errorData.error || 'TOKEN_REQUEST_FAILED',
          response.status
        );
      }

      const tokenResponse: TokenResponse = await response.json();
      
      // Calculate expiration time (subtract 5 minutes for safety margin)
      const expiresAt = Date.now() + (tokenResponse.expires_in - 300) * 1000;
      
      this.tokenInfo = {
        accessToken: tokenResponse.access_token,
        expiresAt,
        isValid: true
      };

      return tokenResponse.access_token;
    } catch (error) {
      // Clear invalid token info
      this.tokenInfo = null;
      throw this.handleTokenError(error);
    }
  }

  /**
   * Check if the current token is valid and not expired
   */
  public isTokenValid(): boolean {
    if (!this.tokenInfo) {
      return false;
    }

    // Check if token is expired (with 1 minute buffer)
    const isExpired = Date.now() >= (this.tokenInfo.expiresAt - 60000);
    
    return this.tokenInfo.isValid && !isExpired;
  }

  /**
   * Get token info for debugging/monitoring
   */
  public getTokenInfo(): TokenInfo | null {
    return this.tokenInfo ? { ...this.tokenInfo } : null;
  }

  /**
   * Clear stored token (useful for logout or error recovery)
   */
  public clearToken(): void {
    this.tokenInfo = null;
    this.refreshPromise = null;
  }

  /**
   * Test token validity by making a simple Graph API call
   */
  public async validateToken(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      
      // Make a simple call to validate the token
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // For client credentials flow, /me endpoint will return 403
      // But 403 means the token is valid, just not authorized for /me
      // 401 would mean invalid token
      return response.status !== 401;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Handle and standardize token-related errors
   */
  private handleTokenError(error: unknown): GraphApiError {
    if (error instanceof GraphApiError) {
      return error;
    }

    if (error instanceof Error) {
      // Network or fetch errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return new GraphApiError(
          'Network error during token request. Please check your internet connection.',
          'NETWORK_ERROR',
          undefined,
          error
        );
      }

      return new GraphApiError(
        `Token management error: ${error.message}`,
        'TOKEN_ERROR',
        undefined,
        error
      );
    }

    return new GraphApiError(
      'Unknown error during token management',
      'UNKNOWN_TOKEN_ERROR'
    );
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  public getTimeUntilExpiry(): number {
    if (!this.tokenInfo) {
      return 0;
    }
    
    return Math.max(0, this.tokenInfo.expiresAt - Date.now());
  }

  /**
   * Check if token will expire soon (within specified minutes)
   */
  public willExpireSoon(minutes: number = 5): boolean {
    if (!this.tokenInfo) {
      return true;
    }
    
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return timeUntilExpiry <= (minutes * 60 * 1000);
  }
}