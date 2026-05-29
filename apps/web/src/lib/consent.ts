export type ConsentChoice = 'accepted' | 'declined';

const key = 'spektra_cookie_consent';

export function getConsent(): ConsentChoice | null {
  const value = localStorage.getItem(key);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function setConsent(value: ConsentChoice) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new CustomEvent('spektra:consent', { detail: value }));
}

export function optionalTrackingConfigured() {
  return Boolean(
    import.meta.env.VITE_SENTRY_DSN ||
      import.meta.env.VITE_GA_MEASUREMENT_ID ||
      (import.meta.env.VITE_UMAMI_SRC && import.meta.env.VITE_UMAMI_WEBSITE_ID),
  );
}
