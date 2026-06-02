import { forwardRef, type SelectHTMLAttributes } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className = '', ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-content-primary shadow-xs outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-content-tertiary ${className}`}
      {...props}
    />
  );
});
