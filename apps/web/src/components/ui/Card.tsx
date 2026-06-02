import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  compact?: boolean;
}

export function Card({ className = '', hover = false, compact = false, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle bg-surface/95 shadow-card ${compact ? 'p-3' : ''} ${hover ? 'card-hover' : ''} ${className}`}
      {...props}
    />
  );
}
