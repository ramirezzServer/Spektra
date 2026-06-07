import { useEffect } from 'react';
import { applyThemeClass, resolveTheme } from '@/lib/theme';
import { useThemeStore } from '@/stores/themeStore';

function preferredDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function syncTheme(mode: ReturnType<typeof useThemeStore.getState>['mode']) {
  if (typeof document === 'undefined') return;
  const resolved = applyThemeClass(document.documentElement.classList, mode, preferredDark());
  document.documentElement.dataset.theme = mode;
  document.documentElement.dataset.resolvedTheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#070A12' : '#4F46E5');
}

export function ThemeController() {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    syncTheme(mode);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (mode === 'system') syncTheme(mode);
      else document.documentElement.dataset.resolvedTheme = resolveTheme(mode, media.matches);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [mode]);

  return null;
}
