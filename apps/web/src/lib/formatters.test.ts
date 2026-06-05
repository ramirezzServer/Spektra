import { describe, expect, it, vi } from 'vitest';
import { formatCompactNumber, formatDate, formatDateTime, formatRelativeTime } from './formatters';

describe('formatters', () => {
  it('handles invalid dates safely', () => {
    expect(formatDate('not-a-date')).toBe('');
    expect(formatDateTime('not-a-date')).toBe('');
    expect(formatRelativeTime('not-a-date')).toBe('');
  });

  it('formats recent timestamps without throwing', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-05T12:00:00Z'));

    expect(formatRelativeTime('2026-06-05T11:59:50Z')).toBe('baru saja');

    vi.useRealTimers();
  });

  it('formats compact numbers for dashboard counters', () => {
    expect(formatCompactNumber(1500)).toContain('1,5');
  });
});
