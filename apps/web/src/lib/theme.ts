export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const themeStorageKey = 'spektra-theme';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'system') return prefersDark ? 'dark' : 'light';
  return mode;
}

export function readThemePreference(storage: Pick<Storage, 'getItem'> | null | undefined): ThemeMode {
  if (!storage) return 'system';
  try {
    const value = storage.getItem(themeStorageKey);
    return isThemeMode(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function writeThemePreference(storage: Pick<Storage, 'setItem'> | null | undefined, mode: ThemeMode) {
  if (!storage) return;
  try {
    storage.setItem(themeStorageKey, mode);
  } catch {
    // Ignore storage failures in private browsing or locked-down environments.
  }
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  if (mode === 'light') return 'dark';
  if (mode === 'dark') return 'system';
  return 'light';
}

export function themeLabel(mode: ThemeMode) {
  if (mode === 'light') return 'Light';
  if (mode === 'dark') return 'Dark';
  return 'System';
}

export function applyThemeClass(root: Pick<DOMTokenList, 'toggle'>, mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  const resolved = resolveTheme(mode, prefersDark);
  root.toggle('dark', resolved === 'dark');
  return resolved;
}
