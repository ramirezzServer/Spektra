import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/lib/apiError';

export function EmailVerificationNotice() {
  const { user, resendVerification } = useAuth();
  const message = resendVerification.isSuccess
    ? 'Verification email sent. Check your inbox or local mail log.'
    : resendVerification.isError
      ? getApiErrorMessage(resendVerification.error, 'Unable to resend verification email.')
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <SEO title="Verify your email" noIndex />
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-card">
        <h1 className="text-xl font-semibold text-content-primary">Verify your email</h1>
        <p className="mt-3 text-sm text-content-secondary">
          We sent a verification link to {user?.email ?? 'your email address'}. Verification helps keep Spektra accounts tied to real inboxes.
        </p>
        {message && <p className="mt-4 text-sm text-content-secondary" role="status" aria-live="polite">{message}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="button" disabled={resendVerification.isPending} onClick={() => resendVerification.mutate()}>
            {resendVerification.isPending ? 'Sending...' : 'Resend email'}
          </Button>
          <Link to="/" className="inline-flex min-h-11 items-center rounded-md px-4 py-2 text-sm font-semibold text-content-secondary hover:text-content-primary">
            Continue
          </Link>
        </div>
      </section>
    </main>
  );
}
