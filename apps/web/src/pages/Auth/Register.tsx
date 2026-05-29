import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/apiError';

export function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const error = localError ?? (register.isError ? getApiErrorMessage(register.error, 'Unable to create your account. Please try again.') : null);

  function clearAndSet(setter: (value: string) => void, value: string) {
    setLocalError(null);
    register.reset();
    setter(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);
    if (!name.trim() || !username.trim() || !email.trim() || !password || !passwordConfirmation) {
      setLocalError('All fields are required.');
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
    register.mutate({
      name,
      username,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
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
          <h2 className="text-lg font-semibold text-content-primary mb-6">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-danger-light border border-red-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-sm text-danger-text">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-content-primary mb-1.5">Name</label>
              <input id="register-name" required autoComplete="name" value={name} onChange={(event) => clearAndSet(setName, event.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="register-username" className="block text-sm font-medium text-content-primary mb-1.5">Username</label>
              <input id="register-username" required autoComplete="username" value={username} onChange={(event) => clearAndSet(setUsername, event.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors" placeholder="your_username" />
              <p className="text-xs text-content-tertiary mt-1.5">Letters, numbers, underscores only</p>
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-content-primary mb-1.5">Email</label>
              <input id="register-email" required type="email" autoComplete="email" value={email} onChange={(event) => clearAndSet(setEmail, event.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-content-primary mb-1.5">Password</label>
              <input id="register-password" required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => clearAndSet(setPassword, event.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors" placeholder="********" />
            </div>
            <div>
              <label htmlFor="register-password-confirmation" className="block text-sm font-medium text-content-primary mb-1.5">Confirm Password</label>
              <input id="register-password-confirmation" required minLength={8} type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => clearAndSet(setPasswordConfirmation, event.target.value)} className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-md text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors" placeholder="********" />
            </div>
          </div>

          <button type="submit" disabled={register.isPending} className="mt-6 w-full bg-accent hover:bg-accent-hover text-accent-text text-sm font-medium py-2.5 px-4 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed">
            {register.isPending ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-content-secondary mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
