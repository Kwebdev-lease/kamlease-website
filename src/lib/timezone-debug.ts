/**
 * Timezone debugging utilities
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

export class TimezoneDebugger {
  private static readonly BUSINESS_TIMEZONE = 'Europe/Paris';

  /**
   * Get comprehensive timezone debugging information
   */
  public static getDebugInfo(testTime = '14:00'): TimezoneDebugInfo {
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
   * Simulate an appointment booking to show timezone handling
   */
  private static simulateAppointment(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    
    // How user sees it (local time)
    const userDate = new Date(date);
    userDate.setHours(hours, minutes, 0, 0);
    
    // How business timezone interprets it
    const businessDate = new Date(date);
    businessDate.setHours(hours, minutes, 0, 0);
    
    // How it should appear in Outlook (business timezone)
    const outlookDate = new Date(date);
    outlookDate.setHours(hours, minutes, 0, 0);

    return {
      selectedTime: time,
      userInterpretation: userDate.toLocaleString('fr-FR', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        weekday: 'short'
      }),
      businessInterpretation: businessDate.toLocaleString('fr-FR', {
        timeZone: this.BUSINESS_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        weekday: 'short'
      }),
      outlookWillShow: outlookDate.toLocaleString('fr-FR', {
        timeZone: this.BUSINESS_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        weekday: 'short'
      })
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
  public static logDebugInfo(testTime = '14:00'): void {
    const debugInfo = this.getDebugInfo(testTime);
    
    console.group('🌍 Timezone Debug Information');
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
    
    console.groupEnd();
  }

  /**
   * Create a test appointment with proper timezone handling
   */
  public static createTestAppointment(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    
    // Create date string in YYYY-MM-DD format
    const dateStr = date.toISOString().split('T')[0];
    
    // Create time string with proper formatting
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00.000`;
    
    // Combine date and time in business timezone format
    const startDateTime = `${dateStr}T${timeStr}`;
    
    // Calculate end time (30 minutes later)
    const endMinutes = minutes + 30;
    const endHours = endMinutes >= 60 ? hours + 1 : hours;
    const adjustedEndMinutes = endMinutes >= 60 ? endMinutes - 60 : endMinutes;
    
    const endTimeStr = `${endHours.toString().padStart(2, '0')}:${adjustedEndMinutes.toString().padStart(2, '0')}:00.000`;
    const endDateTime = `${dateStr}T${endTimeStr}`;

    return {
      startDateTime,
      endDateTime,
      timeZone: this.BUSINESS_TIMEZONE,
      debugInfo: {
        originalDate: date.toISOString(),
        originalTime: time,
        businessTimezone: this.BUSINESS_TIMEZONE,
        formattedStart: startDateTime,
        formattedEnd: endDateTime
      }
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  (window as any).TimezoneDebugger = TimezoneDebugger;
}