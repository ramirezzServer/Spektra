import type { ReactNode } from 'react';

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-content-primary">{title}</h2>
      {children ? <div className="mt-2 text-sm text-content-tertiary">{children}</div> : null}
    </div>
  );
}
