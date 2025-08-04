import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BusinessHoursValidator, BusinessHoursConfig, TimeSlot } from '../business-hours-validator';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_BUSINESS_TIMEZONE: 'Europe/Paris',
    VITE_BUSINESS_START_TIME: '14:00',
    VITE_BUSINESS_END_TIME: '16:30',
    VITE_APPOINTMENT_DURATION: '30'
  },
  writable: true
});

describe('BusinessHoursValidator', () => {
  let validator: BusinessHoursValidator;

  beforeEach(() => {
    // Reset singleton instance before each test
    BusinessHoursValidator.reset();
    validator = BusinessHoursValidator.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BusinessHoursValidator.getInstance();
      const instance2 = BusinessHoursValidator.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('isValidBusinessDay', () => {
    it('should return true for Monday (weekday)', () => {
      // Monday, January 15, 2024
      const monday = new Date('2024-01-15T10:00:00Z');
      expect(validator.isValidBusinessDay(monday)).toBe(true);
    });

    it('should return true for Tuesday (weekday)', () => {
      // Tuesday, January 16, 2024
      const tuesday = new Date('2024-01-16T10:00:00Z');
      expect(validator.isValidBusinessDay(tuesday)).toBe(true);
    });

    it('should return true for Wednesday (weekday)', () => {
      // Wednesday, January 17, 2024
      const wednesday = new Date('2024-01-17T10:00:00Z');
      expect(validator.isValidBusinessDay(wednesday)).toBe(true);
    });

    it('should return true for Thursday (weekday)', () => {
      // Thursday, January 18, 2024
      const thursday = new Date('2024-01-18T10:00:00Z');
      expect(validator.isValidBusinessDay(thursday)).toBe(true);
    });

    it('should return true for Friday (weekday)', () => {
      // Friday, January 19, 2024
      const friday = new Date('2024-01-19T10:00:00Z');
      expect(validator.isValidBusinessDay(friday)).toBe(true);
    });

    it('should return false for Saturday (weekend)', () => {
      // Saturday, January 20, 2024
      const saturday = new Date('2024-01-20T10:00:00Z');
      expect(validator.isValidBusinessDay(saturday)).toBe(false);
    });

    it('should return false for Sunday (weekend)', () => {
      // Sunday, January 21, 2024
      const sunday = new Date('2024-01-21T10:00:00Z');
      expect(validator.isValidBusinessDay(sunday)).toBe(false);
    });

    it('should handle timezone conversion correctly', () => {
      // Test with a date that might be different day in different timezones
      // Late evening UTC might be next day in Paris
      const lateEvening = new Date('2024-01-19T23:00:00Z'); // Friday 23:00 UTC = Saturday 00:00 Paris
      const result = validator.isValidBusinessDay(lateEvening);
      // Should be false because it's Saturday in Paris timezone
      expect(result).toBe(false);
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      expect(validator.isValidBusinessDay(invalidDate)).toBe(false);
    });
  });

  describe('isValidBusinessTime', () => {
    it('should return true for start time (14:00)', () => {
      expect(validator.isValidBusinessTime('14:00')).toBe(true);
    });

    it('should return true for end time (16:30)', () => {
      expect(validator.isValidBusinessTime('16:30')).toBe(true);
    });

    it('should return true for time within business hours (15:00)', () => {
      expect(validator.isValidBusinessTime('15:00')).toBe(true);
    });

    it('should return true for time within business hours (16:00)', () => {
      expect(validator.isValidBusinessTime('16:00')).toBe(true);
    });

    it('should return false for time before business hours (13:59)', () => {
      expect(validator.isValidBusinessTime('13:59')).toBe(false);
    });

    it('should return false for time after business hours (16:31)', () => {
      expect(validator.isValidBusinessTime('16:31')).toBe(false);
    });

    it('should return false for morning time (09:00)', () => {
      expect(validator.isValidBusinessTime('09:00')).toBe(false);
    });

    it('should return false for evening time (18:00)', () => {
      expect(validator.isValidBusinessTime('18:00')).toBe(false);
    });

    it('should return false for invalid time format', () => {
      expect(validator.isValidBusinessTime('25:00')).toBe(false);
      expect(validator.isValidBusinessTime('14:60')).toBe(false);
      expect(validator.isValidBusinessTime('invalid')).toBe(false);
      expect(validator.isValidBusinessTime('14')).toBe(false);
      expect(validator.isValidBusinessTime('14:0')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validator.isValidBusinessTime('00:00')).toBe(false);
      expect(validator.isValidBusinessTime('23:59')).toBe(false);
      expect(validator.isValidBusinessTime('')).toBe(false);
    });
  });

  describe('isValidBusinessDateTime', () => {
    it('should return true for valid business day and time', () => {
      const monday = new Date('2024-01-15T10:00:00Z');
      expect(validator.isValidBusinessDateTime(monday, '15:00')).toBe(true);
    });

    it('should return false for valid business day but invalid time', () => {
      const monday = new Date('2024-01-15T10:00:00Z');
      expect(validator.isValidBusinessDateTime(monday, '09:00')).toBe(false);
    });

    it('should return false for invalid business day but valid time', () => {
      const saturday = new Date('2024-01-20T10:00:00Z');
      expect(validator.isValidBusinessDateTime(saturday, '15:00')).toBe(false);
    });

    it('should return false for invalid business day and invalid time', () => {
      const saturday = new Date('2024-01-20T10:00:00Z');
      expect(validator.isValidBusinessDateTime(saturday, '09:00')).toBe(false);
    });
  });

  describe('isValidBusinessDateTimeObject', () => {
    it('should return true for valid business datetime', () => {
      // Monday 15:00 Paris time
      const validDateTime = new Date('2024-01-15T15:00:00+01:00');
      expect(validator.isValidBusinessDateTimeObject(validDateTime)).toBe(true);
    });

    it('should return false for weekend datetime', () => {
      // Saturday 15:00 Paris time
      const weekendDateTime = new Date('2024-01-20T15:00:00+01:00');
      expect(validator.isValidBusinessDateTimeObject(weekendDateTime)).toBe(false);
    });

    it('should return false for outside business hours', () => {
      // Monday 09:00 Paris time
      const earlyDateTime = new Date('2024-01-15T09:00:00+01:00');
      expect(validator.isValidBusinessDateTimeObject(earlyDateTime)).toBe(false);
    });

    it('should handle timezone conversion correctly', () => {
      // Monday 14:00 UTC = Monday 15:00 Paris (valid)
      const utcDateTime = new Date('2024-01-15T14:00:00Z');
      expect(validator.isValidBusinessDateTimeObject(utcDateTime)).toBe(true);
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('should return empty array for weekend', () => {
      const saturday = new Date('2024-01-20T10:00:00Z');
      const slots = validator.getAvailableTimeSlots(saturday);
      expect(slots).toEqual([]);
    });

    it('should return time slots for valid business day', () => {
      const monday = new Date('2024-01-15T10:00:00Z');
      const slots = validator.getAvailableTimeSlots(monday);
      
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].time).toBe('14:00');
      expect(slots[slots.length - 1].time).toBe('16:30');
      
      // Check that all slots are 30 minutes apart
      for (let i = 1; i < slots.length; i++) {
        const prevTime = slots[i - 1].time;
        const currentTime = slots[i].time;
        const prevMinutes = validator['timeToMinutes'](prevTime);
        const currentMinutes = validator['timeToMinutes'](currentTime);
        expect(currentMinutes - prevMinutes).toBe(30);
      }
    });

    it('should mark all slots as available by default', () => {
      const monday = new Date('2024-01-15T10:00:00Z');
      const slots = validator.getAvailableTimeSlots(monday);
      
      slots.forEach(slot => {
        expect(slot.available).toBe(true);
        expect(slot.datetime).toBeInstanceOf(Date);
      });
    });

    it('should generate correct number of slots', () => {
      const monday = new Date('2024-01-15T10:00:00Z');
      const slots = validator.getAvailableTimeSlots(monday);
      
      // From 14:00 to 16:30 with 30-minute slots = 6 slots (14:00, 14:30, 15:00, 15:30, 16:00, 16:30)
      expect(slots.length).toBe(6);
    });
  });

  describe('getNextBusinessDay', () => {
    it('should return next Monday when given Friday', () => {
      const friday = new Date('2024-01-19T10:00:00Z');
      const nextBusinessDay = validator.getNextBusinessDay(friday);
      
      expect(nextBusinessDay).not.toBeNull();
      expect(nextBusinessDay!.getDay()).toBe(1); // Monday
    });

    it('should return Monday when given Saturday', () => {
      const saturday = new Date('2024-01-20T10:00:00Z');
      const nextBusinessDay = validator.getNextBusinessDay(saturday);
      
      expect(nextBusinessDay).not.toBeNull();
      expect(nextBusinessDay!.getDay()).toBe(1); // Monday
    });

    it('should return Monday when given Sunday', () => {
      const sunday = new Date('2024-01-21T10:00:00Z');
      const nextBusinessDay = validator.getNextBusinessDay(sunday);
      
      expect(nextBusinessDay).not.toBeNull();
      expect(nextBusinessDay!.getDay()).toBe(1); // Monday
    });

    it('should return next day when given Monday', () => {
      const monday = new Date('2024-01-15T10:00:00Z');
      const nextBusinessDay = validator.getNextBusinessDay(monday);
      
      expect(nextBusinessDay).not.toBeNull();
      expect(nextBusinessDay!.getDay()).toBe(2); // Tuesday
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      const nextBusinessDay = validator.getNextBusinessDay(invalidDate);
      expect(nextBusinessDay).toBeNull();
    });
  });

  describe('isInPast', () => {
    it('should return true for past datetime', () => {
      const pastDate = new Date('2020-01-01T15:00:00Z');
      expect(validator.isInPast(pastDate)).toBe(true);
    });

    it('should return false for future datetime', () => {
      const futureDate = new Date('2030-01-01T15:00:00Z');
      expect(validator.isInPast(futureDate)).toBe(false);
    });

    it('should handle timezone correctly', () => {
      // Create a date that's very close to now
      const now = new Date();
      const almostNow = new Date(now.getTime() - 1000); // 1 second ago
      expect(validator.isInPast(almostNow)).toBe(true);
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      expect(validator.isInPast(invalidDate)).toBe(true); // Should err on side of caution
    });
  });

  describe('configuration management', () => {
    it('should return default configuration', () => {
      const config = validator.getConfig();
      
      expect(config.timezone).toBe('Europe/Paris');
      expect(config.workingDays).toEqual([1, 2, 3, 4, 5]);
      expect(config.startTime).toBe('14:00');
      expect(config.endTime).toBe('16:30');
      expect(config.slotDuration).toBe(30);
    });

    it('should allow configuration updates', () => {
      const newConfig = {
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 60
      };
      
      validator.updateConfig(newConfig);
      const updatedConfig = validator.getConfig();
      
      expect(updatedConfig.startTime).toBe('09:00');
      expect(updatedConfig.endTime).toBe('17:00');
      expect(updatedConfig.slotDuration).toBe(60);
      expect(updatedConfig.timezone).toBe('Europe/Paris'); // Should keep original
    });

    it('should validate business time with updated configuration', () => {
      validator.updateConfig({ startTime: '09:00', endTime: '17:00' });
      
      expect(validator.isValidBusinessTime('09:00')).toBe(true);
      expect(validator.isValidBusinessTime('17:00')).toBe(true);
      expect(validator.isValidBusinessTime('14:00')).toBe(true);
      expect(validator.isValidBusinessTime('08:59')).toBe(false);
      expect(validator.isValidBusinessTime('17:01')).toBe(false);
    });
  });

  describe('timezone conversion and edge cases', () => {
    it('should handle daylight saving time transitions correctly', () => {
      // DST starts on March 31, 2024 in Europe/Paris (spring forward)
      const beforeDST = new Date('2024-03-30T13:00:00Z'); // Saturday 14:00 Paris (CET)
      const afterDST = new Date('2024-03-31T12:00:00Z'); // Sunday 14:00 Paris (CEST)
      
      expect(validator.isValidBusinessDay(beforeDST)).toBe(false); // Saturday
      expect(validator.isValidBusinessDay(afterDST)).toBe(false); // Sunday
      
      // Test business hours during DST transition
      const mondayBeforeDST = new Date('2024-03-25T13:00:00Z'); // Monday 14:00 CET
      const mondayAfterDST = new Date('2024-04-01T12:00:00Z'); // Monday 14:00 CEST
      
      expect(validator.isValidBusinessDateTimeObject(mondayBeforeDST)).toBe(true);
      expect(validator.isValidBusinessDateTimeObject(mondayAfterDST)).toBe(true);
    });

    it('should handle DST end transition correctly', () => {
      // DST ends on October 27, 2024 in Europe/Paris (fall back)
      const beforeDSTEnd = new Date('2024-10-26T12:00:00Z'); // Saturday 14:00 CEST
      const afterDSTEnd = new Date('2024-10-27T13:00:00Z'); // Sunday 14:00 CET
      
      expect(validator.isValidBusinessDay(beforeDSTEnd)).toBe(false); // Saturday
      expect(validator.isValidBusinessDay(afterDSTEnd)).toBe(false); // Sunday
    });

    it('should handle timezone edge cases at midnight', () => {
      // Test dates that cross day boundaries in different timezones
      const utcMidnight = new Date('2024-01-15T00:00:00Z'); // Monday 01:00 Paris
      const utcLateEvening = new Date('2024-01-14T23:00:00Z'); // Monday 00:00 Paris
      
      expect(validator.isValidBusinessDay(utcMidnight)).toBe(true); // Monday in Paris
      expect(validator.isValidBusinessDay(utcLateEvening)).toBe(true); // Monday in Paris
    });

    it('should handle different timezone inputs correctly', () => {
      // Same moment in different timezone representations
      const utcTime = new Date('2024-01-15T14:00:00Z');
      const parisTime = new Date('2024-01-15T15:00:00+01:00');
      const newYorkTime = new Date('2024-01-15T09:00:00-05:00');
      
      // All represent the same moment, should have same business day validation
      expect(validator.isValidBusinessDay(utcTime)).toBe(validator.isValidBusinessDay(parisTime));
      expect(validator.isValidBusinessDay(utcTime)).toBe(validator.isValidBusinessDay(newYorkTime));
    });

    it('should handle leap year dates correctly', () => {
      const leapYearDate = new Date('2024-02-29T15:00:00Z'); // Leap year day (Thursday)
      const nonLeapYearDate = new Date('2023-02-28T15:00:00Z'); // Non-leap year last day of Feb (Tuesday)
      
      expect(validator.isValidBusinessDay(leapYearDate)).toBe(true); // Thursday
      expect(validator.isValidBusinessDay(nonLeapYearDate)).toBe(true); // Tuesday
    });

    it('should handle year boundaries correctly', () => {
      const newYearEve2023 = new Date('2023-12-31T15:00:00Z'); // Sunday
      const newYear2024 = new Date('2024-01-01T15:00:00Z'); // Monday
      const newYearEve2024 = new Date('2024-12-31T15:00:00Z'); // Tuesday
      
      expect(validator.isValidBusinessDay(newYearEve2023)).toBe(false); // Sunday
      expect(validator.isValidBusinessDay(newYear2024)).toBe(true); // Monday
      expect(validator.isValidBusinessDay(newYearEve2024)).toBe(true); // Tuesday
    });

    it('should handle extreme dates without crashing', () => {
      const veryOldDate = new Date('1900-01-01T15:00:00Z');
      const veryFutureDate = new Date('2100-01-01T15:00:00Z');
      const epochDate = new Date('1970-01-01T00:00:00Z');
      
      expect(() => validator.isValidBusinessDay(veryOldDate)).not.toThrow();
      expect(() => validator.isValidBusinessDay(veryFutureDate)).not.toThrow();
      expect(() => validator.isValidBusinessDay(epochDate)).not.toThrow();
    });

    it('should handle invalid dates gracefully', () => {
      const invalidDates = [
        new Date('invalid-date'),
        new Date(NaN),
        new Date('2024-13-01'), // Invalid month
        new Date('2024-02-30'), // Invalid day for February
        new Date('2024-04-31')  // Invalid day for April
      ];

      invalidDates.forEach(date => {
        expect(() => validator.isValidBusinessDay(date)).not.toThrow();
        expect(validator.isValidBusinessDay(date)).toBe(false);
      });
    });

    it('should handle time precision correctly', () => {
      // Test with millisecond precision
      const preciseTime1 = new Date('2024-01-15T14:00:00.000Z');
      const preciseTime2 = new Date('2024-01-15T14:00:00.999Z');
      
      expect(validator.isValidBusinessDateTimeObject(preciseTime1)).toBe(true);
      expect(validator.isValidBusinessDateTimeObject(preciseTime2)).toBe(true);
    });

    it('should handle business hours boundary conditions', () => {
      // Test exact boundary times in Paris timezone
      const startTime = new Date('2024-01-15T13:00:00Z'); // 14:00 Paris
      const endTime = new Date('2024-01-15T15:30:00Z'); // 16:30 Paris
      const justBefore = new Date('2024-01-15T12:59:59Z'); // 13:59:59 Paris
      const justAfter = new Date('2024-01-15T15:30:01Z'); // 16:30:01 Paris
      
      expect(validator.isValidBusinessDateTimeObject(startTime)).toBe(true);
      expect(validator.isValidBusinessDateTimeObject(endTime)).toBe(true);
      expect(validator.isValidBusinessDateTimeObject(justBefore)).toBe(false);
      expect(validator.isValidBusinessDateTimeObject(justAfter)).toBe(false);
    });

    it('should handle concurrent date validations', () => {
      const dates = Array.from({ length: 100 }, (_, i) => 
        new Date(`2024-01-${(i % 31) + 1}T15:00:00Z`)
      );

      // Should handle multiple concurrent validations without issues
      const results = dates.map(date => validator.isValidBusinessDay(date));
      expect(results).toHaveLength(100);
      expect(results.every(result => typeof result === 'boolean')).toBe(true);
    });

    it('should maintain consistency across multiple calls', () => {
      const testDate = new Date('2024-01-15T15:00:00Z');
      const results = Array.from({ length: 10 }, () => validator.isValidBusinessDay(testDate));
      
      // All results should be identical
      expect(results.every(result => result === results[0])).toBe(true);
    });
  });

  describe('private method testing', () => {
    it('should convert time to minutes correctly', () => {
      expect(validator['timeToMinutes']('00:00')).toBe(0);
      expect(validator['timeToMinutes']('01:00')).toBe(60);
      expect(validator['timeToMinutes']('14:30')).toBe(870);
      expect(validator['timeToMinutes']('23:59')).toBe(1439);
    });

    it('should convert minutes to time correctly', () => {
      expect(validator['minutesToTime'](0)).toBe('00:00');
      expect(validator['minutesToTime'](60)).toBe('01:00');
      expect(validator['minutesToTime'](870)).toBe('14:30');
      expect(validator['minutesToTime'](1439)).toBe('23:59');
    });

    it('should format time correctly', () => {
      expect(validator['formatTime'](0, 0)).toBe('00:00');
      expect(validator['formatTime'](9, 5)).toBe('09:05');
      expect(validator['formatTime'](14, 30)).toBe('14:30');
      expect(validator['formatTime'](23, 59)).toBe('23:59');
    });

    it('should validate time format correctly', () => {
      expect(validator['isValidTimeFormat']('00:00')).toBe(true);
      expect(validator['isValidTimeFormat']('14:30')).toBe(true);
      expect(validator['isValidTimeFormat']('23:59')).toBe(true);
      expect(validator['isValidTimeFormat']('9:05')).toBe(true);
      
      expect(validator['isValidTimeFormat']('24:00')).toBe(false);
      expect(validator['isValidTimeFormat']('14:60')).toBe(false);
      expect(validator['isValidTimeFormat']('invalid')).toBe(false);
      expect(validator['isValidTimeFormat']('14')).toBe(false);
      expect(validator['isValidTimeFormat']('14:0')).toBe(false);
    });
  });
});