import { Laptop, Moon, Sun } from 'lucide-react';
import { nextThemeMode, themeLabel, type ThemeMode } from '@/lib/theme';
import { useThemeStore } from '@/stores/themeStore';

const iconByMode: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Laptop,
};

export function ThemeToggle({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const mode = useThemeStore((state) => state.mode);
  const setMode = useThemeStore((state) => state.setMode);
  const Icon = iconByMode[mode];
  const label = themeLabel(mode);

  return (
    <button
      type="button"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-surface/80 px-3 text-sm font-black text-content-secondary shadow-xs transition hover:border-border-strong hover:bg-bg-subtle hover:text-content-primary focus-ring ${className}`}
      onClick={() => setMode(nextThemeMode(mode))}
      aria-label={`Theme: ${label}. Switch theme.`}
      title={`Theme: ${label}`}
    >
      <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
      {compact ? null : <span>{label}</span>}
    </button>
  );
}
