import type { ReactNode } from 'react';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-surface px-6 py-12 text-center shadow-card">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-20 rounded-full bg-accent/10 blur-2xl" aria-hidden="true" />
      <div className="relative mx-auto mb-4 h-10 w-10 rounded-2xl bg-accent-light glow-ring" aria-hidden="true" />
      <h2 className="relative text-base font-black text-content-primary">{title}</h2>
      {children ? <div className="relative mt-2 text-sm font-medium text-content-tertiary">{children}</div> : null}
    </div>
  );
}
