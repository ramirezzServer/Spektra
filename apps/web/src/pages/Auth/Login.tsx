import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/apiError';

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const error = localError ?? (login.isError ? getApiErrorMessage(login.error, 'Unable to sign in. Please try again.') : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Email and password are required.');
      return;
    }
    if (login.isPending) return;
    login.mutate({ email, password });
  }

  return (
    <main className="app-gradient flex min-h-screen items-center justify-center px-4 py-8">
      <SEO title="Sign in" noIndex />
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-panel md:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-slate-950 p-8 text-white md:flex md:flex-col md:justify-end">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">Spektra</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Track the media that stays with you.</h2>
          <p className="mt-3 text-sm font-medium text-slate-200">Films, series, games, and books in one polished library.</p>
        </div>
        <div className="p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-content-primary">
            spek<span className="text-accent">.</span>tra
          </h1>
          <p className="mt-2 text-sm font-medium text-content-secondary">Track everything you watch, play, and read</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-content-primary">Sign in to your account</h2>

          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger-light p-3" role="alert" aria-live="polite">
              <p className="text-sm font-semibold text-danger-text">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-content-primary mb-1.5">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
                value={email}
                onChange={(event) => {
                  setLocalError(null);
                  login.reset();
                  setEmail(event.target.value);
                }}
                className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-content-primary mb-1.5">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                enterKeyHint="done"
                value={password}
                onChange={(event) => {
                  setLocalError(null);
                  login.reset();
                  setPassword(event.target.value);
                }}
                className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20"
                placeholder="********"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-content-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover font-medium">Create one</Link>
          </p>
          <p className="mt-3 text-center text-xs text-content-tertiary">
            <Link to="/privacy" className="hover:text-accent">Privacy</Link>
            {' · '}
            <Link to="/terms" className="hover:text-accent">Terms</Link>
          </p>
        </form>
        </div>
      </div>
    </main>
  );
}
