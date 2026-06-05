import { describe, expect, it } from 'vitest';
import { safeUrl } from './safeUrl';

describe('safeUrl', () => {
  it('blocks unsafe javascript URLs', () => {
    expect(safeUrl('javascript:alert(1)', '/fallback')).toBe('/fallback');
  });

  it('allows relative and http URLs', () => {
    expect(safeUrl('/profile/faris')).toBe('/profile/faris');
    expect(safeUrl('https://example.com/poster.jpg')).toBe('https://example.com/poster.jpg');
  });

  it('allows mailto only when requested', () => {
    expect(safeUrl('mailto:hello@example.com', null)).toBeNull();
    expect(safeUrl('mailto:hello@example.com', null, { allowMailto: true })).toBe('mailto:hello@example.com');
  });
});
