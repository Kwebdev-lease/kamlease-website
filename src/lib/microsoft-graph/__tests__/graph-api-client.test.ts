import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GraphApiClient } from '../graph-api-client';
import { TokenManager } from '../token-manager';
import { AppointmentData, CalendarEvent, GraphApiError } from '../types';

// Mock the TokenManager
vi.mock('../token-manager');

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_CALENDAR_EMAIL: 'test@example.com',
    DEV: true
  },
  writable: true
});

describe('GraphApiClient', () => {
  let client: GraphApiClient;
  let mockTokenManager: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock TokenManager instance
    mockTokenManager = {
      getAccessToken: vi.fn().mockResolvedValue('mock-access-token'),
      clearToken: vi.fn()
    };
    
    (TokenManager.getInstance as any).mockReturnValue(mockTokenManager);
    
    // Get fresh client instance
    client = GraphApiClient.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCalendarEvent', () => {
    const mockAppointmentData: AppointmentData = {
      subject: 'RDV via le site',
      startDateTime: '2024-01-15T14:00:00',
      endDateTime: '2024-01-15T14:30:00',
      timeZone: 'Europe/Paris',
      attendeeInfo: {
        prenom: 'John',
        nom: 'Doe',
        societe: 'Test Company',
        message: 'Test appointment message'
      }
    };

    const mockCalendarEvent: CalendarEvent = {
      id: 'event-123',
      subject: 'RDV via le site',
      start: {
        dateTime: '2024-01-15T14:00:00',
        timeZone: 'Europe/Paris'
      },
      end: {
        dateTime: '2024-01-15T14:30:00',
        timeZone: 'Europe/Paris'
      },
      body: {
        contentType: 'Text',
        content: 'Rendez-vous via le site web\n\nNom: Doe\nPrénom: John\nSociété: Test Company\n\nMessage:\nTest appointment message'
      }
    };

    it('should create calendar event successfully', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCalendarEvent)
      });

      const result = await client.createCalendarEvent(mockAppointmentData);

      expect(result).toEqual(mockCalendarEvent);
      expect(mockTokenManager.getAccessToken).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.microsoft.com/v1.0/users/contact@kamlease.com/calendar/events',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-access-token',
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"subject":"RDV via le site"')
        })
      );
    });

    it('should handle API errors properly', async () => {
      const errorResponse = {
        error: {
          code: 'InvalidRequest',
          message: 'Invalid calendar event data'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve(errorResponse)
      });

      await expect(client.createCalendarEvent(mockAppointmentData))
        .rejects.toThrow(GraphApiError);
    });

    it('should retry on token expiration', async () => {
      // First call returns 401 (token expired)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized'
        })
        // Second call (after token refresh) succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCalendarEvent)
        });

      const result = await client.createCalendarEvent(mockAppointmentData);

      expect(result).toEqual(mockCalendarEvent);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should format event body correctly without company', async () => {
      const appointmentWithoutCompany: AppointmentData = {
        ...mockAppointmentData,
        attendeeInfo: {
          ...mockAppointmentData.attendeeInfo,
          societe: undefined
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCalendarEvent)
      });

      await client.createCalendarEvent(appointmentWithoutCompany);

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.body.content).not.toContain('Société:');
      expect(requestBody.body.content).toContain('Nom: Doe');
      expect(requestBody.body.content).toContain('Prénom: John');
    });

    it('should handle network errors with retry logic', async () => {
      // Mock network error
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCalendarEvent)
        });

      const result = await client.createCalendarEvent(mockAppointmentData);

      expect(result).toEqual(mockCalendarEvent);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      // Mock persistent network error
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      await expect(client.createCalendarEvent(mockAppointmentData))
        .rejects.toThrow(GraphApiError);

      expect(mockFetch).toHaveBeenCalledTimes(3); // Max retries
    });
  });

  describe('getCalendarEvents', () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: 'event-1',
        subject: 'Existing Event',
        start: { dateTime: '2024-01-15T14:00:00', timeZone: 'Europe/Paris' },
        end: { dateTime: '2024-01-15T15:00:00', timeZone: 'Europe/Paris' },
        body: { contentType: 'Text', content: 'Event content' }
      }
    ];

    it('should retrieve calendar events successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: mockEvents })
      });

      const result = await client.getCalendarEvents(
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result).toEqual(mockEvents);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/calendarView'),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle empty calendar response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ value: [] })
      });

      const result = await client.getCalendarEvents(
        '2024-01-15T00:00:00',
        '2024-01-15T23:59:59'
      );

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({
          error: { code: 'Forbidden', message: 'Access denied' }
        })
      });

      await expect(client.getCalendarEvents('2024-01-15T00:00:00', '2024-01-15T23:59:59'))
        .rejects.toThrow(GraphApiError);
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'calendar-id' })
      });

      const result = await client.testConnection();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://graph.microsoft.com/v1.0/users/contact@kamlease.com/calendar',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should return false for failed connection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      const result = await client.testConnection();

      expect(result).toBe(false);
    });

    it('should return false for network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GraphApiClient.getInstance();
      const instance2 = GraphApiClient.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('advanced error scenarios', () => {
    it('should handle rate limiting with exponential backoff', async () => {
      const rateLimitResponse = {
        error: {
          code: 'TooManyRequests',
          message: 'Rate limit exceeded'
        }
      };

      // Mock rate limit responses followed by success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Map([['Retry-After', '2']]),
          json: () => Promise.resolve(rateLimitResponse)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: new Map([['Retry-After', '4']]),
          json: () => Promise.resolve(rateLimitResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCalendarEvent)
        });

      const result = await client.createCalendarEvent(mockAppointmentData);

      expect(result).toEqual(mockCalendarEvent);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle malformed API responses', async () => {
      const malformedResponses = [
        null,
        undefined,
        '',
        'invalid json',
        { incomplete: 'response' },
        { error: null }
      ];

      for (const response of malformedResponses) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response)
        });

        await expect(client.createCalendarEvent(mockAppointmentData))
          .rejects.toThrow(GraphApiError);
        
        // Reset for next iteration
        vi.clearAllMocks();
        mockTokenManager.getAccessToken.mockResolvedValue('mock-access-token');
      }
    });

    it('should handle concurrent API calls correctly', async () => {
      // Mock successful responses for all calls
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCalendarEvent)
      });

      const promises = Array.from({ length: 5 }, () => 
        client.createCalendarEvent(mockAppointmentData)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results.every(result => result.id === mockCalendarEvent.id)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should handle partial failures in concurrent calls', async () => {
      // Mock mixed success/failure responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCalendarEvent)
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: { message: 'Bad request' } })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCalendarEvent)
        });

      const promises = [
        client.createCalendarEvent(mockAppointmentData),
        client.createCalendarEvent(mockAppointmentData),
        client.createCalendarEvent(mockAppointmentData)
      ];

      const results = await Promise.allSettled(promises);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });

    it('should handle large event data correctly', async () => {
      const largeAppointmentData: AppointmentData = {
        ...mockAppointmentData,
        attendeeInfo: {
          ...mockAppointmentData.attendeeInfo,
          message: 'A'.repeat(10000) // Very long message
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCalendarEvent)
      });

      const result = await client.createCalendarEvent(largeAppointmentData);

      expect(result).toEqual(mockCalendarEvent);
      
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.body.content).toContain('A'.repeat(10000));
    });

    it('should handle special characters in event data', async () => {
      const specialCharData: AppointmentData = {
        ...mockAppointmentData,
        attendeeInfo: {
          prenom: 'José',
          nom: 'Müller',
          societe: 'Café & Co. <script>alert("test")</script>',
          message: 'Message with émojis 🎉 and special chars: àáâãäåæçèéêë'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockCalendarEvent)
      });

      const result = await client.createCalendarEvent(specialCharData);

      expect(result).toEqual(mockCalendarEvent);
      
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(requestBody.body.content).toContain('José');
      expect(requestBody.body.content).toContain('Müller');
      expect(requestBody.body.content).toContain('🎉');
    });
  });

  describe('calendar event validation', () => {
    it('should validate required appointment data fields', async () => {
      const invalidDataSets = [
        { ...mockAppointmentData, subject: '' },
        { ...mockAppointmentData, startDateTime: '' },
        { ...mockAppointmentData, endDateTime: '' },
        { ...mockAppointmentData, timeZone: '' },
        { ...mockAppointmentData, attendeeInfo: { ...mockAppointmentData.attendeeInfo, prenom: '' } },
        { ...mockAppointmentData, attendeeInfo: { ...mockAppointmentData.attendeeInfo, nom: '' } }
      ];

      for (const invalidData of invalidDataSets) {
        await expect(client.createCalendarEvent(invalidData))
          .rejects.toThrow(GraphApiError);
      }
    });

    it('should validate datetime formats', async () => {
      const invalidDateTimes = [
        'invalid-date',
        '2024-13-01T14:00:00', // Invalid month
        '2024-01-32T14:00:00', // Invalid day
        '2024-01-01T25:00:00', // Invalid hour
        '2024-01-01T14:60:00', // Invalid minute
        '2024-01-01 14:00:00', // Wrong format
        ''
      ];

      for (const invalidDateTime of invalidDateTimes) {
        const invalidData = {
          ...mockAppointmentData,
          startDateTime: invalidDateTime
        };

        await expect(client.createCalendarEvent(invalidData))
          .rejects.toThrow(GraphApiError);
      }
    });

    it('should validate timezone formats', async () => {
      const invalidTimezones = [
        'Invalid/Timezone',
        'UTC+1',
        'GMT+1',
        '',
        'Europe/InvalidCity'
      ];

      for (const invalidTimezone of invalidTimezones) {
        const invalidData = {
          ...mockAppointmentData,
          timeZone: invalidTimezone
        };

        await expect(client.createCalendarEvent(invalidData))
          .rejects.toThrow(GraphApiError);
      }
    });
  });

  describe('logging', () => {
    it('should log requests and responses in development', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'test-event' })
      });

      await client.createCalendarEvent({
        subject: 'Test',
        startDateTime: '2024-01-15T14:00:00',
        endDateTime: '2024-01-15T14:30:00',
        timeZone: 'Europe/Paris',
        attendeeInfo: {
          prenom: 'Test',
          nom: 'User',
          message: 'Test message'
        }
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GraphApiClient] createCalendarEvent request:'),
        expect.any(Object)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GraphApiClient] createCalendarEvent response:'),
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });

    it('should log errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      try {
        await client.createCalendarEvent({
          subject: 'Test',
          startDateTime: '2024-01-15T14:00:00',
          endDateTime: '2024-01-15T14:30:00',
          timeZone: 'Europe/Paris',
          attendeeInfo: {
            prenom: 'Test',
            nom: 'User',
            message: 'Test message'
          }
        });
      } catch {
        // Expected to throw
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GraphApiClient] createCalendarEvent error:'),
        expect.any(Object)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should not log in production environment', async () => {
      // Mock production environment
      const originalEnv = import.meta.env.DEV;
      import.meta.env.DEV = false;

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'test-event' })
      });

      await client.createCalendarEvent(mockAppointmentData);

      expect(consoleSpy).not.toHaveBeenCalled();

      // Restore environment
      import.meta.env.DEV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
});