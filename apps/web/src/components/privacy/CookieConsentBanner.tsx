import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getConsent, optionalTrackingConfigured, setConsent, type ConsentChoice } from '@/lib/consent';
import { initAnalytics } from '@/lib/analytics';

export function CookieConsentBanner() {
  const [choice, setChoiceState] = useState<ConsentChoice | null>(() => getConsent());
  const shouldShow = optionalTrackingConfigured() && !choice;

  useEffect(() => {
    const handler = (event: Event) => setChoiceState((event as CustomEvent<ConsentChoice>).detail);
    window.addEventListener('spektra:consent', handler);
    return () => window.removeEventListener('spektra:consent', handler);
  }, []);

  function choose(next: ConsentChoice) {
    setConsent(next);
    setChoiceState(next);
    if (next === 'accepted') initAnalytics();
  }

  if (!shouldShow) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl rounded-lg border border-border bg-surface p-4 shadow-card" role="region" aria-label="Privacy preferences">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-content-secondary">
          Spektra can use optional analytics and error monitoring to improve reliability. Read the <Link to="/privacy" className="font-semibold text-accent hover:text-accent-hover">Privacy Policy</Link>.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="min-h-12 rounded-md border border-border px-3 py-2 text-sm font-semibold text-content-secondary transition hover:text-content-primary active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100" onClick={() => choose('declined')}>
            Decline
          </button>
          <button type="button" className="min-h-12 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-text transition hover:bg-accent-hover active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100" onClick={() => choose('accepted')}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
