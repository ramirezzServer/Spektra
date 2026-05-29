import { forwardRef, type TextareaHTMLAttributes } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={`min-h-28 w-full rounded-md border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition placeholder:text-slate-400 focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 ${className}`}
      {...props}
    />
  );
});
