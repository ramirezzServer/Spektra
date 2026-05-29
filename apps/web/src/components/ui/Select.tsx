import { forwardRef, type SelectHTMLAttributes } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className = '', ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`min-h-11 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm text-app-text outline-none transition focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 ${className}`}
      {...props}
    />
  );
});
