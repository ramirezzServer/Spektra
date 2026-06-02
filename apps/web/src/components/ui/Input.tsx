import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`min-h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-content-primary shadow-xs outline-none transition placeholder:text-content-muted focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-content-tertiary ${className}`}
      {...props}
    />
  );
});
