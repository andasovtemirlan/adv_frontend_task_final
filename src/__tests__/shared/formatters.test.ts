import { describe, expect, it, vi, beforeAll, afterAll } from 'vitest';
import {
  formatRelativeTime,
  formatDisplayDate,
  formatPercentage,
  truncateText,
  getInitials,
  getAvatarColor,
} from '@/shared/utils/formatters';

const fixedNow = new Date('2026-02-05T12:00:00Z');

describe('formatters', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('formats relative time', () => {
    const twoHoursAgo = new Date(fixedNow.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(twoHoursAgo);
    expect(result.toLowerCase()).toContain('ago');
  });

  it('formats display date', () => {
    expect(formatDisplayDate('2026-02-01')).toBe('Feb 01, 2026');
  });

  it('formats percentage and truncates text', () => {
    expect(formatPercentage(42.2)).toBe('42%');
    expect(truncateText('short', 10)).toBe('short');
    expect(truncateText('longer than five', 5)).toBe('longe...');
  });

  it('derives initials and avatar color deterministically', () => {
    expect(getInitials('Jane Doe')).toBe('JD');
    expect(getInitials('Madonna')).toBe('MA');
    expect(getAvatarColor(3)).toBe('#f57c00');
    expect(getAvatarColor(11)).toBe('#c2185b');
  });
});
