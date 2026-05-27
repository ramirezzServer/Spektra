import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variants = {
  primary: 'bg-app-accent text-white hover:bg-indigo-700 focus:ring-app-accent',
  secondary: 'border border-app-border bg-app-surface text-app-text hover:bg-slate-100 focus:ring-app-accent',
  ghost: 'text-app-muted hover:bg-slate-100 hover:text-app-text focus:ring-app-accent',
};

export function Button({
  className = '',
  variant = 'primary',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; children: ReactNode }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
