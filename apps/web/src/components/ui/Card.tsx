import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  compact?: boolean;
}

export function Card({ className = '', hover = false, compact = false, ...props }: CardProps) {
  return (
    <div
      className={`media-card rounded-2xl ${compact ? 'p-3' : ''} ${hover ? 'card-lift' : ''} ${className}`}
      {...props}
    />
  );
}
