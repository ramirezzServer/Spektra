import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function EmailVerificationBanner() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.emailVerified) return null;

  return (
    <div className="border-b border-warning/30 bg-warning-light px-4 py-2 text-sm text-content-secondary">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-2">
        <span>Please verify your email to keep your Spektra account secure.</span>
        <Link to="/email/verify" className="font-semibold text-content-primary hover:text-accent">
          Resend verification
        </Link>
      </div>
    </div>
  );
}
