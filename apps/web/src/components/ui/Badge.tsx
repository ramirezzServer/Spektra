import type { ReactNode } from 'react';

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-app-border bg-app-surface px-2.5 py-1 text-xs font-semibold text-app-muted ${className}`}>
      {children}
    </span>
  );
}
