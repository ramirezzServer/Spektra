import type { ReactNode } from 'react';

const variants = {
  neutral: 'border-border-subtle bg-bg-subtle text-content-secondary',
  accent: 'border-accent/20 bg-accent-light text-accent',
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
  want: 'border-status-want/20 bg-accent-light text-accent',
  progress: 'border-status-progress/20 bg-info-light text-info-text',
  done: 'border-status-done/20 bg-success-light text-success-text',
  danger: 'border-danger/20 bg-danger-light text-danger-text',
  warning: 'border-warning/20 bg-warning-light text-warning-text',
  success: 'border-success/20 bg-success-light text-success-text',
  info: 'border-info/20 bg-info-light text-info-text',
};

export function Badge({ children, className = '', variant = 'neutral' }: { children: ReactNode; className?: string; variant?: keyof typeof variants }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold leading-none ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
