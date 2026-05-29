import type { ReactNode } from 'react';

export function FormField({ label, htmlFor, hint, error, children }: { label: string; htmlFor: string; hint?: string; error?: string | null; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-content-primary">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-content-tertiary">{hint}</p> : null}
      {error ? <p className="mt-1.5 text-xs text-danger-text">{error}</p> : null}
    </div>
  );
}
