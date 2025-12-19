/**
 * Unit tests for time formatting utilities
 */

import { formatTime, minutesToMilliseconds } from '../../../src/utils/time';

describe('time utilities', () => {
  describe('formatTime', () => {
    it('should format milliseconds to MM:SS format', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(1000)).toBe('00:01');
      expect(formatTime(60000)).toBe('01:00');
      expect(formatTime(599000)).toBe('09:59');
      expect(formatTime(600000)).toBe('10:00');
      expect(formatTime(1500000)).toBe('25:00');
      expect(formatTime(3599000)).toBe('59:59');
    });

    it('should handle partial seconds correctly', () => {
      expect(formatTime(500)).toBe('00:00'); // 0.5 seconds -> 0
      expect(formatTime(1500)).toBe('00:01'); // 1.5 seconds -> 1
      expect(formatTime(59500)).toBe('00:59'); // 59.5 seconds -> 59
    });

    it('should handle large durations', () => {
      expect(formatTime(3600000)).toBe('60:00'); // 1 hour
      expect(formatTime(5400000)).toBe('90:00'); // 1.5 hours
    });

    it('should handle negative values gracefully', () => {
      expect(formatTime(-1000)).toBe('00:00');
      expect(formatTime(-60000)).toBe('00:00');
    });
  });

  describe('minutesToMilliseconds', () => {
    it('should convert minutes to milliseconds', () => {
      expect(minutesToMilliseconds(0)).toBe(0);
      expect(minutesToMilliseconds(1)).toBe(60000);
      expect(minutesToMilliseconds(5)).toBe(300000);
      expect(minutesToMilliseconds(25)).toBe(1500000);
      expect(minutesToMilliseconds(60)).toBe(3600000);
    });

    it('should handle decimal minutes', () => {
      expect(minutesToMilliseconds(0.5)).toBe(30000); // 30 seconds
      expect(minutesToMilliseconds(1.5)).toBe(90000); // 1 min 30 sec
      expect(minutesToMilliseconds(2.25)).toBe(135000); // 2 min 15 sec
    });

    it('should handle large values', () => {
      expect(minutesToMilliseconds(120)).toBe(7200000); // 2 hours
      expect(minutesToMilliseconds(1440)).toBe(86400000); // 24 hours
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain consistency between formatTime and minutesToMilliseconds', () => {
      const testMinutes = [1, 5, 10, 25, 30, 45, 60];
      
      testMinutes.forEach((minutes) => {
        const ms = minutesToMilliseconds(minutes);
        const formatted = formatTime(ms);
        const [mins, secs] = formatted.split(':').map(Number);
        expect(mins).toBe(minutes);
        expect(secs).toBe(0);
      });
    });
  });
});

