/**
 * Timezone utilities for debugging and testing
 * Helps identify and fix timezone-related issues
 */

export interface TimezoneDebugInfo {
  userTimezone: string;
  businessTimezone: string;
  currentTimeUser: string;
  currentTimeBusiness: string;
  isDSTActive: boolean;
  timezoneOffset: number;
  testAppointment: {
    selectedTime: string;
    userInterpretation: string;
    businessInterpretation: string;
    outlookWillShow: string;
  };
}

export class TimezoneUtils {
  private static readonly BUSINESS_TIMEZONE = 'Europe/Paris';

  /**
   * Get comprehensive timezone debugging information
   */
  public static getDebugInfo(testTime = '16:00'): TimezoneDebugInfo {
    const now = new Date();
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const businessTimezone = this.BUSINESS_TIMEZONE;

    // Check if DST is active in business timezone
    const isDSTActive = this.isDSTActive(now, businessTimezone);

    // Get timezone offset between user and business timezone
    const timezoneOffset = this.getTimezoneOffset(userTimezone, businessTimezone);

    // Test appointment scenario
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    const testAppointment = this.simulateAppointment(testDate, testTime);

    return {
      userTimezone,
      businessTimezone,
      currentTimeUser: now.toLocaleString('fr-FR', {
        timeZone: userTimezone,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        weekday: 'short'
      }),
      currentTimeBusiness: now.toLocaleString('fr-FR', {
        timeZone: businessTimezone,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        weekday: 'short'
      }),
      isDSTActive,
      timezoneOffset,
      testAppointment
    };
  }

  /**
   * Create a properly formatted appointment for Microsoft Graph
   */
  public static createAppointmentForGraph(date: Date, time: string): {
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
    debugInfo: any;
  } {
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create the appointment date in the business timezone
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Create start datetime
    const startDateTime = new Date();
    startDateTime.setFullYear(year, month, day);
    startDateTime.setHours(hours, minutes, 0, 0);
    
    // Create end datetime (30 minutes later)
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 30);
    
    // Format for Microsoft Graph
    const formatForGraph = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`;
    };

    const startFormatted = formatForGraph(startDateTime);
    const endFormatted = formatForGraph(endDateTime);

    return {
      startDateTime: startFormatted,
      endDateTime: endFormatted,
      timeZone: this.BUSINESS_TIMEZONE,
      debugInfo: {
        originalDate: date.toDateString(),
        originalTime: time,
        businessTimezone: this.BUSINESS_TIMEZONE,
        startDateTimeObject: startDateTime.toISOString(),
        endDateTimeObject: endDateTime.toISOString(),
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        parisTime: new Date().toLocaleString('fr-FR', { timeZone: this.BUSINESS_TIMEZONE }),
        whatOutlookWillShow: {
          start: startDateTime.toLocaleString('fr-FR', { timeZone: this.BUSINESS_TIMEZONE }),
          end: endDateTime.toLocaleString('fr-FR', { timeZone: this.BUSINESS_TIMEZONE })
        }
      }
    };
  }

  /**
   * Simulate an appointment booking to show timezone handling
   */
  private static simulateAppointment(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create the appointment as it would be created
    const appointmentData = this.createAppointmentForGraph(date, time);
    
    return {
      selectedTime: time,
      userInterpretation: `${time} (votre heure locale)`,
      businessInterpretation: `${time} (heure de Paris)`,
      outlookWillShow: appointmentData.debugInfo.whatOutlookWillShow.start
    };
  }

  /**
   * Check if DST is currently active in a timezone
   */
  private static isDSTActive(date: Date, timezone: string): boolean {
    const january = new Date(date.getFullYear(), 0, 1);
    const july = new Date(date.getFullYear(), 6, 1);
    
    const janOffset = this.getUTCOffset(january, timezone);
    const julOffset = this.getUTCOffset(july, timezone);
    const currentOffset = this.getUTCOffset(date, timezone);
    
    return currentOffset !== Math.max(janOffset, julOffset);
  }

  /**
   * Get UTC offset for a date in a specific timezone
   */
  private static getUTCOffset(date: Date, timezone: string): number {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (utc.getTime() - local.getTime()) / (1000 * 60);
  }

  /**
   * Get timezone offset between two timezones in minutes
   */
  private static getTimezoneOffset(fromTimezone: string, toTimezone: string): number {
    const now = new Date();
    const fromOffset = this.getUTCOffset(now, fromTimezone);
    const toOffset = this.getUTCOffset(now, toTimezone);
    return toOffset - fromOffset;
  }

  /**
   * Log timezone debug information to console
   */
  public static logDebugInfo(testTime = '16:00'): void {
    const debugInfo = this.getDebugInfo(testTime);
    
    console.group('🌍 Timezone Debug Information (FIXED)');
    console.log('User Timezone:', debugInfo.userTimezone);
    console.log('Business Timezone:', debugInfo.businessTimezone);
    console.log('Current Time (User):', debugInfo.currentTimeUser);
    console.log('Current Time (Business):', debugInfo.currentTimeBusiness);
    console.log('DST Active in Business TZ:', debugInfo.isDSTActive);
    console.log('Timezone Offset (minutes):', debugInfo.timezoneOffset);
    
    console.group('Test Appointment Simulation');
    console.log('Selected Time:', debugInfo.testAppointment.selectedTime);
    console.log('User Sees:', debugInfo.testAppointment.userInterpretation);
    console.log('Business TZ:', debugInfo.testAppointment.businessInterpretation);
    console.log('Outlook Shows:', debugInfo.testAppointment.outlookWillShow);
    console.groupEnd();
    
    // Test the actual appointment creation
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1);
    const appointmentTest = this.createAppointmentForGraph(testDate, testTime);
    
    console.group('Appointment Creation Test');
    console.log('Graph API Format:', {
      startDateTime: appointmentTest.startDateTime,
      endDateTime: appointmentTest.endDateTime,
      timeZone: appointmentTest.timeZone
    });
    console.log('Debug Info:', appointmentTest.debugInfo);
    console.groupEnd();
    
    console.groupEnd();
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).TimezoneUtils = TimezoneUtils;
}