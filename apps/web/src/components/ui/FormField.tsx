import type { ReactNode } from 'react';

export function FormField({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-content-primary">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs font-medium text-content-tertiary">{hint}</p> : null}
      {error ? <p className="text-xs font-semibold text-danger-text">{error}</p> : null}
    </div>
  );
}
