import { AlertTriangle, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SEO } from '@/components/seo/SEO';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/stores/authStore';

export function Account() {
  const navigate = useNavigate();
  const { user, deleteAccount } = useAuth();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [password, setPassword] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => {
      clearAuth();
      navigate('/login', { replace: true });
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [clearAuth, navigate, success]);

  function requestDeletion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!password) {
      setError('Enter your password to continue.');
      return;
    }

    setConfirmOpen(true);
  }

  async function confirmDeletion() {
    setError(null);

    try {
      const result = await deleteAccount.mutateAsync({ password });
      setConfirmOpen(false);
      setPassword('');
      setSuccess(result.message || 'Account deleted. Redirecting to sign in.');
    } catch (error) {
      setConfirmOpen(false);
      setError(getApiErrorMessage(error, 'We could not delete your account. Check your password and try again.'));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SEO title="Account Settings" description="Manage your Spektra account and data deletion options." canonicalPath="/account" />

      <section className="rounded-3xl border border-border-subtle bg-surface/95 p-5 shadow-panel">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">Account</p>
        <h1 className="mt-2 text-2xl font-black text-content-primary">Account settings</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-content-secondary">
          Signed in as @{user?.username}. Email addresses stay private and are not shown in deletion responses.
        </p>
      </section>

      <section className="rounded-3xl border border-danger/25 bg-surface p-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-content-primary">Delete account</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-content-secondary">
              This permanently removes your account, library entries, lists, list items, follow relationships, activity feed events, and active sessions.
            </p>
          </div>
        </div>

        <form className="mt-5 space-y-3" onSubmit={requestDeletion}>
          <label className="block text-sm font-black text-content-primary" htmlFor="delete-account-password">
            Confirm password
          </label>
          <Input
            id="delete-account-password"
            type="password"
            autoComplete="current-password"
            value={password}
            disabled={deleteAccount.isPending || Boolean(success)}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(null);
            }}
          />
          {error ? <p className="text-sm font-bold text-danger-text" role="alert">{error}</p> : null}
          {success ? <p className="text-sm font-bold text-success-text" role="status">{success}</p> : null}
          <Button type="submit" variant="danger" disabled={!password || deleteAccount.isPending || Boolean(success)}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete account
          </Button>
        </form>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete your account?"
        description="This action is irreversible. Your profile, library, lists, follows, activity, and active sessions will be removed."
        confirmLabel="Delete account"
        isPending={deleteAccount.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
      />
    </div>
  );
}
