import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
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
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setLocalError('Enter a valid email address.');
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
    if (register.isPending) return;
    register.mutate({
      name,
      username,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  return (
    <main className="app-gradient flex min-h-screen items-center justify-center px-4 py-8">
      <SEO title="Create account" noIndex />
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-panel md:grid-cols-[0.9fr_1fr]">
        <div className="hidden bg-slate-950 p-8 text-white md:flex md:flex-col md:justify-end">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">Join Spektra</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Build a library across every format.</h2>
          <p className="mt-3 text-sm font-medium text-slate-200">One account for watchlists, reading logs, game progress, and curated lists.</p>
        </div>
        <div className="p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-content-primary">
            spek<span className="text-accent">.</span>tra
          </h1>
          <p className="mt-2 text-sm font-medium text-content-secondary">Track everything you watch, play, and read</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="text-lg font-bold text-content-primary">Create your account</h2>

          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger-light p-3" role="alert" aria-live="polite">
              <p className="text-sm font-semibold text-danger-text">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-content-primary mb-1.5">Name</label>
              <input id="register-name" name="name" type="text" required autoFocus autoComplete="name" enterKeyHint="next" value={name} onChange={(event) => clearAndSet(setName, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="register-username" className="block text-sm font-medium text-content-primary mb-1.5">Username</label>
              <input id="register-username" name="username" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} enterKeyHint="next" value={username} onChange={(event) => clearAndSet(setUsername, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="your_username" />
              <p className="text-xs text-content-tertiary mt-1.5">Letters, numbers, underscores only</p>
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-content-primary mb-1.5">Email</label>
              <input id="register-email" name="email" required type="email" autoComplete="email" inputMode="email" enterKeyHint="next" value={email} onChange={(event) => clearAndSet(setEmail, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-content-primary mb-1.5">Password</label>
              <input id="register-password" name="password" required minLength={8} type="password" autoComplete="new-password" enterKeyHint="next" value={password} onChange={(event) => clearAndSet(setPassword, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="********" />
            </div>
            <div>
              <label htmlFor="register-password-confirmation" className="block text-sm font-medium text-content-primary mb-1.5">Confirm Password</label>
              <input id="register-password-confirmation" name="password_confirmation" required minLength={8} type="password" autoComplete="new-password" enterKeyHint="done" value={passwordConfirmation} onChange={(event) => clearAndSet(setPasswordConfirmation, event.target.value)} className="w-full rounded-xl border border-border bg-bg-subtle px-3.5 py-3 text-sm font-medium text-content-primary placeholder:text-content-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20" placeholder="********" />
            </div>
          </div>

          <button type="submit" disabled={register.isPending} className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-text transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50">
            {register.isPending ? 'Creating account...' : 'Create account'}
          </button>

          <p className="mt-3 text-center text-xs text-content-tertiary">
            By creating an account, you agree to the <Link to="/terms" className="text-accent hover:text-accent-hover">Terms</Link> and <Link to="/privacy" className="text-accent hover:text-accent-hover">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-content-secondary mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
          </p>
        </form>
        </div>
      </div>
    </main>
  );
}
