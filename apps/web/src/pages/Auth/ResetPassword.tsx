import { FormEvent, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/apiError';

export function ResetPassword() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const initialEmail = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const hasResetParams = useMemo(() => Boolean(token && initialEmail), [initialEmail, token]);
  const success = resetPassword.isSuccess ? resetPassword.data.message : null;
  const error = localError ?? (resetPassword.isError ? getApiErrorMessage(resetPassword.error, 'Unable to reset password. Please try again.') : null);

  function clearAndSet(setter: (value: string) => void, value: string) {
    setLocalError(null);
    resetPassword.reset();
    setter(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!token) {
      setLocalError('Reset token is missing. Request a new reset link.');
      return;
    }
    if (!email.trim() || !password || !passwordConfirmation) {
      setLocalError('Email, password, and confirmation are required.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirmation) {
      setLocalError('Password confirmation does not match.');
      return;
    }
    if (resetPassword.isPending) return;
    resetPassword.mutate({
      token,
      email: email.trim(),
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  return (
    <main className="app-gradient flex min-h-screen items-center justify-center px-4 py-8">
      <SEO title="Choose new password" noIndex />
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-panel md:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-slate-950 p-8 text-white md:flex md:flex-col md:justify-end">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">Spektra</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Set a fresh password.</h2>
          <p className="mt-3 text-sm font-medium text-slate-200">After reset, existing API sessions are revoked.</p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-content-primary">
              spek<span className="text-accent">.</span>tra
            </h1>
            <p className="mt-2 text-sm font-medium text-content-secondary">Choose a new password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-lg font-bold text-content-primary">Reset password</h2>

            {!hasResetParams ? (
              <div className="rounded-xl border border-warning/20 bg-warning-light p-3" role="alert" aria-live="polite">
                <p className="text-sm font-semibold text-warning-text">This reset link is missing required details. Request a new link.</p>
              </div>
            ) : null}

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

            <div className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-content-primary">Email</label>
                <input id="reset-email" name="email" type="email" required autoFocus autoComplete="email" inputMode="email" enterKeyHint="next" value={email} onChange={(event) => clearAndSet(setEmail, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="reset-password" className="mb-1.5 block text-sm font-medium text-content-primary">New password</label>
                <input id="reset-password" name="password" type="password" required minLength={8} autoComplete="new-password" enterKeyHint="next" value={password} onChange={(event) => clearAndSet(setPassword, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="********" />
              </div>
              <div>
                <label htmlFor="reset-password-confirmation" className="mb-1.5 block text-sm font-medium text-content-primary">Confirm new password</label>
                <input id="reset-password-confirmation" name="password_confirmation" type="password" required minLength={8} autoComplete="new-password" enterKeyHint="done" value={passwordConfirmation} onChange={(event) => clearAndSet(setPasswordConfirmation, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="********" />
              </div>
            </div>

            <button type="submit" disabled={resetPassword.isPending || resetPassword.isSuccess} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50">
              {resetPassword.isPending ? 'Resetting...' : 'Reset password'}
            </button>

            <p className="text-center text-sm text-content-secondary">
              Need a new link? <Link to="/forgot-password" className="font-medium text-accent hover:text-accent-hover">Request reset email</Link>
            </p>
            {success ? (
              <p className="text-center text-sm text-content-secondary">
                <Link to="/login" className="font-medium text-accent hover:text-accent-hover">Sign in with your new password</Link>
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
