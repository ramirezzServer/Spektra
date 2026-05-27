import { forwardRef, type InputHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`min-h-11 w-full rounded-md border border-app-border bg-app-surface px-3 text-sm text-app-text outline-none transition placeholder:text-slate-400 focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 ${className}`}
      {...props}
    />
  );
});
