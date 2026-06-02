import { forwardRef, type TextareaHTMLAttributes } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`min-h-28 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-medium text-content-primary shadow-xs outline-none transition placeholder:text-content-muted focus:border-accent focus:ring-4 focus:ring-accent/20 disabled:cursor-not-allowed disabled:bg-bg-subtle disabled:text-content-tertiary ${className}`}
      {...props}
    />
  );
});
