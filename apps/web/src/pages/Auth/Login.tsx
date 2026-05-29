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
    login.mutate({ email, password });
  }

  return (
    <main className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
      <SEO title="Sign in" noIndex />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-content-primary tracking-tight">
            spek<span className="text-accent">.</span>tra
          </h1>
          <p className="text-content-secondary text-sm mt-2">Track everything you watch, play, and read</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl shadow-card p-8">
          <h2 className="text-lg font-semibold text-content-primary mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-danger-light border border-red-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-sm text-danger-text">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-content-primary mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setLocalError(null);
                  login.reset();
                  setEmail(event.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-content-primary mb-1.5">Password</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setLocalError(null);
                  login.reset();
                  setPassword(event.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                placeholder="********"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="mt-6 w-full bg-accent hover:bg-accent-hover text-accent-text text-sm font-medium py-2.5 px-4 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-content-secondary mt-4">
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
    </main>
  );
}
