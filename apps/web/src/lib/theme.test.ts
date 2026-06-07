import { describe, expect, it } from 'vitest';
import { nextThemeMode, readThemePreference, resolveTheme, themeStorageKey, writeThemePreference } from './theme';

describe('theme helpers', () => {
  it('resolves system mode from the current preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('stores and restores valid preferences', () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    writeThemePreference(storage, 'dark');

    expect(values.get(themeStorageKey)).toBe('dark');
    expect(readThemePreference(storage)).toBe('dark');
  });

  it('falls back to system for invalid storage values', () => {
    expect(readThemePreference({ getItem: () => 'night' })).toBe('system');
  });

  it('cycles light, dark, and system modes', () => {
    expect(nextThemeMode('light')).toBe('dark');
    expect(nextThemeMode('dark')).toBe('system');
    expect(nextThemeMode('system')).toBe('light');
  });
});
