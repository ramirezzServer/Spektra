import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

const variants = {
  primary: 'bg-accent text-accent-text shadow-sm hover:bg-accent-hover focus-visible:ring-accent/30',
  secondary: 'border border-border bg-surface/95 text-content-primary shadow-xs hover:border-border-strong hover:bg-bg-subtle focus-visible:ring-accent/25',
  ghost: 'text-content-secondary hover:bg-bg-tertiary hover:text-content-primary focus-visible:ring-accent/20',
  subtle: 'bg-accent-soft text-accent hover:bg-accent-light focus-visible:ring-accent/20',
  danger: 'bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/25',
  success: 'bg-success text-white hover:bg-success/90 focus-visible:ring-success/25',
  icon: 'border border-border bg-surface text-content-secondary shadow-xs hover:border-border-strong hover:text-content-primary focus-visible:ring-accent/25',
};

const sizes = {
  sm: 'min-h-10 rounded-lg px-3 py-1.5 text-xs',
  md: 'min-h-11 rounded-xl px-4 py-2 text-sm',
  lg: 'min-h-12 rounded-xl px-5 py-2.5 text-base',
  icon: 'min-h-11 min-w-11 rounded-xl p-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants; size?: keyof typeof sizes; isLoading?: boolean | undefined; children: ReactNode }>(function Button(
  { className = '', variant = 'primary', size = variant === 'icon' ? 'icon' : 'md', isLoading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 font-semibold leading-none transition duration-150 focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" /> : null}
      {children}
    </button>
  );
});
