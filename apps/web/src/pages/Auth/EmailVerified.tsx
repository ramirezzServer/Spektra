import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';

export function EmailVerified() {
  const [params] = useSearchParams();
  const success = params.get('status') === 'success';

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <SEO title={success ? 'Email verified' : 'Verification failed'} noIndex />
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-8 text-center shadow-card">
        <h1 className="text-xl font-semibold text-content-primary">{success ? 'Email verified' : 'Verification link failed'}</h1>
        <p className="mt-3 text-sm text-content-secondary">
          {success ? 'Your Spektra email address is now verified.' : 'The verification link may be expired or invalid. Sign in and request a new link.'}
        </p>
        <Link to={success ? '/' : '/email/verify'} className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-text hover:bg-accent-hover">
          {success ? 'Go to Spektra' : 'Request new link'}
        </Link>
      </section>
    </main>
  );
}
