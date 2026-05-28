import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type ApiError = { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };

function getErrorMessage(error: unknown): string {
  const response = (error as ApiError).response;
  const validationError = response?.data?.errors ? Object.values(response.data.errors)[0]?.[0] : undefined;
  return validationError ?? response?.data?.message ?? 'Unable to sign in. Please try again.';
}

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const error = login.isError ? getErrorMessage(login.error) : null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
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
            <div className="mb-4 p-3 bg-danger-light border border-red-200 rounded-md">
              <p className="text-sm text-danger-text">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-primary mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
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
        </form>
      </div>
    </div>
  );
}
