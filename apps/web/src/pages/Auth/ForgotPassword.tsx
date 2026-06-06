import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/apiError';

export function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const success = forgotPassword.isSuccess ? forgotPassword.data.message : null;
  const error = localError ?? (forgotPassword.isError ? getApiErrorMessage(forgotPassword.error, 'Unable to send reset instructions. Please try again.') : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!email.trim()) {
      setLocalError('Email is required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setLocalError('Enter a valid email address.');
      return;
    }
    if (forgotPassword.isPending) return;
    forgotPassword.mutate({ email: email.trim() });
  }

  return (
    <main className="app-gradient flex min-h-screen items-center justify-center px-4 py-8">
      <SEO title="Reset password" noIndex />
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-panel md:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-slate-950 p-8 text-white md:flex md:flex-col md:justify-end">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">Spektra</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Find your way back into your library.</h2>
          <p className="mt-3 text-sm font-medium text-slate-200">We will send reset instructions if the email matches an account.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-content-primary">
              spek<span className="text-accent">.</span>tra
            </h1>
            <p className="mt-2 text-sm font-medium text-content-secondary">Reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-content-primary">Request reset link</h2>

            {success ? (
              <div className="rounded-xl border border-success/20 bg-success-light p-3" role="status" aria-live="polite">
                <p className="text-sm font-semibold text-success-text">{success}</p>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-danger/20 bg-danger-light p-3" role="alert" aria-live="polite">
                <p className="text-sm font-semibold text-danger-text">{error}</p>
              </div>
            ) : null}

            <div>
              <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-content-primary">Email</label>
              <input
                id="forgot-email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                inputMode="email"
                enterKeyHint="send"
                value={email}
                onChange={(event) => {
                  setLocalError(null);
                  forgotPassword.reset();
                  setEmail(event.target.value);
                }}
                className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={forgotPassword.isPending}
              className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {forgotPassword.isPending ? 'Sending...' : 'Send reset link'}
            </button>

            <p className="text-center text-sm text-content-secondary">
              Remembered it? <Link to="/login" className="font-medium text-accent hover:text-accent-hover">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
