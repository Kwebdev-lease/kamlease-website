/**
 * Business hours validation service with timezone support
 * Handles validation for Monday-Friday 14:00-16:30 Europe/Paris timezone
 */

export interface BusinessHoursConfig {
  timezone: string;
  workingDays: number[]; // 1-7 where 1=Monday, 7=Sunday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDuration: number; // minutes
}

export interface TimeSlot {
  time: string; // HH:mm format
  available: boolean;
  datetime: Date;
}

export class BusinessHoursValidator {
  private static instance: BusinessHoursValidator;
  private config: BusinessHoursConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): BusinessHoursValidator {
    if (!BusinessHoursValidator.instance) {
      BusinessHoursValidator.instance = new BusinessHoursValidator();
    }
    return BusinessHoursValidator.instance;
  }

  /**
   * Check if a given date falls on a valid business day
   * Requirements: 3.1 - Monday through Friday only
   */
  public isValidBusinessDay(date: Date): boolean {
    try {
      // Convert to Europe/Paris timezone for validation
      const parisDate = this.convertToTimezone(date, this.config.timezone);
      const dayOfWeek = parisDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      
      // Convert to our format (1=Monday, 7=Sunday)
      const businessDay = dayOfWeek === 0 ? 7 : dayOfWeek;
      
      return this.config.workingDays.includes(businessDay);
    } catch (error) {
      console.error('Error validating business day:', error);
      return false;
    }
  }

  /**
   * Check if a given time falls within valid business hours
   * Requirements: 3.2 - 14:00 to 16:30 only
   */
  public isValidBusinessTime(time: string): boolean {
    try {
      if (!this.isValidTimeFormat(time)) {
        return false;
      }

      const timeMinutes = this.timeToMinutes(time);
      const startMinutes = this.timeToMinutes(this.config.startTime);
      const endMinutes = this.timeToMinutes(this.config.endTime);

      return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
    } catch (error) {
      console.error('Error validating business time:', error);
      return false;
    }
  }

  /**
   * Validate both date and time for business hours
   * Requirements: 3.1, 3.2, 3.3 - Complete validation with timezone handling
   */
  public isValidBusinessDateTime(date: Date, time: string): boolean {
    return this.isValidBusinessDay(date) && this.isValidBusinessTime(time);
  }

  /**
   * Validate a complete datetime object
   */
  public isValidBusinessDateTimeObject(datetime: Date): boolean {
    try {
      // Convert to Europe/Paris timezone
      const parisDateTime = this.convertToTimezone(datetime, this.config.timezone);
      
      // Check if it's a valid business day
      if (!this.isValidBusinessDay(parisDateTime)) {
        return false;
      }

      // Extract time and validate
      const timeString = this.formatTime(parisDateTime.getHours(), parisDateTime.getMinutes());
      return this.isValidBusinessTime(timeString);
    } catch (error) {
      console.error('Error validating business datetime:', error);
      return false;
    }
  }

  /**
   * Get available time slots for a given date
   */
  public getAvailableTimeSlots(date: Date): TimeSlot[] {
    const slots: TimeSlot[] = [];

    if (!this.isValidBusinessDay(date)) {
      return slots;
    }

    try {
      const startMinutes = this.timeToMinutes(this.config.startTime);
      const endMinutes = this.timeToMinutes(this.config.endTime);
      
      for (let minutes = startMinutes; minutes <= endMinutes; minutes += this.config.slotDuration) {
        const timeString = this.minutesToTime(minutes);
        
        // Create datetime for this slot in the target timezone
        const slotDateTime = this.createDateTimeInTimezone(date, timeString, this.config.timezone);
        
        slots.push({
          time: timeString,
          available: true, // Basic implementation - could be enhanced with conflict checking
          datetime: slotDateTime
        });
      }
    } catch (error) {
      console.error('Error generating time slots:', error);
    }

    return slots;
  }

  /**
   * Get the next available business day from a given date
   */
  public getNextBusinessDay(fromDate: Date): Date | null {
    try {
      const maxDaysToCheck = 14; // Prevent infinite loops
      let currentDate = new Date(fromDate);
      
      for (let i = 0; i < maxDaysToCheck; i++) {
        currentDate.setDate(currentDate.getDate() + 1);
        
        if (this.isValidBusinessDay(currentDate)) {
          return new Date(currentDate);
        }
      }
      
      return null; // No business day found within reasonable range
    } catch (error) {
      console.error('Error finding next business day:', error);
      return null;
    }
  }

  /**
   * Check if a datetime is in the past (considering timezone)
   */
  public isInPast(datetime: Date): boolean {
    try {
      // Check if the input date is valid
      if (isNaN(datetime.getTime())) {
        return true; // Invalid dates are considered "in the past" for safety
      }

      const now = new Date();
      const parisNow = this.convertToTimezone(now, this.config.timezone);
      const parisDateTime = this.convertToTimezone(datetime, this.config.timezone);
      
      // Check if conversion resulted in invalid dates
      if (isNaN(parisNow.getTime()) || isNaN(parisDateTime.getTime())) {
        return true; // Err on the side of caution
      }
      
      return parisDateTime < parisNow;
    } catch (error) {
      console.error('Error checking if datetime is in past:', error);
      return true; // Err on the side of caution
    }
  }

  /**
   * Get business hours configuration
   */
  public getConfig(): BusinessHoursConfig {
    return { ...this.config };
  }

  /**
   * Update business hours configuration
   */
  public updateConfig(newConfig: Partial<BusinessHoursConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Convert date to specified timezone
   */
  private convertToTimezone(date: Date, timezone: string): Date {
    try {
      // Check if date is valid first
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
      }

      // Use Intl.DateTimeFormat to handle timezone conversion
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(date);
      const partsObj = parts.reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {} as Record<string, string>);

      return new Date(
        parseInt(partsObj.year),
        parseInt(partsObj.month) - 1, // Month is 0-indexed
        parseInt(partsObj.day),
        parseInt(partsObj.hour),
        parseInt(partsObj.minute),
        parseInt(partsObj.second)
      );
    } catch (error) {
      console.error('Error converting timezone:', error);
      return new Date(NaN); // Return invalid date to maintain error state
    }
  }

  /**
   * Create a datetime object in a specific timezone
   */
  private createDateTimeInTimezone(date: Date, time: string, timezone: string): Date {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create date in local time first
      const localDateTime = new Date(date);
      localDateTime.setHours(hours, minutes, 0, 0);
      
      // Convert to target timezone
      return this.convertToTimezone(localDateTime, timezone);
    } catch (error) {
      console.error('Error creating datetime in timezone:', error);
      return new Date(date);
    }
  }

  /**
   * Convert time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes since midnight to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return this.formatTime(hours, mins);
  }

  /**
   * Format hours and minutes to HH:mm string
   */
  private formatTime(hours: number, minutes: number): string {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Validate time format (HH:mm)
   */
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Get default business hours configuration
   */
  private getDefaultConfig(): BusinessHoursConfig {
    return {
      timezone: this.getTimezoneFromEnv(),
      workingDays: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: this.getStartTimeFromEnv(),
      endTime: this.getEndTimeFromEnv(),
      slotDuration: this.getSlotDurationFromEnv()
    };
  }

  /**
   * Get timezone from environment variables
   */
  private getTimezoneFromEnv(): string {
    return import.meta.env.VITE_BUSINESS_TIMEZONE || 'Europe/Paris';
  }

  /**
   * Get start time from environment variables
   */
  private getStartTimeFromEnv(): string {
    return import.meta.env.VITE_BUSINESS_START_TIME || '14:00';
  }

  /**
   * Get end time from environment variables
   */
  private getEndTimeFromEnv(): string {
    return import.meta.env.VITE_BUSINESS_END_TIME || '16:30';
  }

  /**
   * Get slot duration from environment variables
   */
  private getSlotDurationFromEnv(): number {
    const duration = import.meta.env.VITE_APPOINTMENT_DURATION || '30';
    return parseInt(duration, 10);
  }

  /**
   * Reset instance (useful for testing)
   */
  public static reset(): void {
    BusinessHoursValidator.instance = undefined as any;
  }
}