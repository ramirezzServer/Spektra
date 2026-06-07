import { create } from 'zustand';
import { readThemePreference, themeLabel, writeThemePreference, type ThemeMode } from '@/lib/theme';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

function initialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  return readThemePreference(window.localStorage);
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: initialMode(),
  setMode: (mode) => {
    if (typeof window !== 'undefined') writeThemePreference(window.localStorage, mode);
    set({ mode });
  },
}));

export function useThemeLabel() {
  const mode = useThemeStore((state) => state.mode);
  return themeLabel(mode);
}
