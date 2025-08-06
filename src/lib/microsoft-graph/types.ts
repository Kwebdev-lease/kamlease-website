/**
 * Microsoft Graph API integration types
 */

export interface GraphApiConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  scope: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface TokenInfo {
  accessToken: string;
  expiresAt: number;
  isValid: boolean;
}

export interface EmailData {
  to: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface CalendarEvent {
  id?: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  body: {
    contentType: 'Text' | 'HTML';
    content: string;
  };
  attendees?: Array<{
    emailAddress: {
      address: string;
      name?: string;
    };
  }>;
}

export interface AppointmentData {
  subject: string;
  startDateTime: string;
  endDateTime: string;
  timeZone: string;
  attendeeInfo: {
    prenom: string;
    nom: string;
    societe?: string;
    message: string;
  };
}

export class GraphApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'GraphApiError';
  }
}