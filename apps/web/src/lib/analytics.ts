import { getConsent } from './consent';

let initialized = false;

function appendScript(src: string, attrs: Record<string, string> = {}) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

export function initAnalytics() {
  if (initialized || getConsent() !== 'accepted') return;
  const provider = import.meta.env.VITE_ANALYTICS_PROVIDER ?? 'none';

  if (provider === 'ga' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    const id = import.meta.env.VITE_GA_MEASUREMENT_ID;
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(Array.from(arguments));
    };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false });
    initialized = true;
  }

  if (provider === 'umami' && import.meta.env.VITE_UMAMI_SRC && import.meta.env.VITE_UMAMI_WEBSITE_ID) {
    appendScript(import.meta.env.VITE_UMAMI_SRC, {
      'data-website-id': import.meta.env.VITE_UMAMI_WEBSITE_ID,
      defer: 'true',
    });
    initialized = true;
  }
}

export function trackPageView(path: string) {
  if (getConsent() !== 'accepted') return;
  initAnalytics();
  if (window.gtag && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: path,
      send_to: import.meta.env.VITE_GA_MEASUREMENT_ID,
    });
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (getConsent() !== 'accepted') return;
  initAnalytics();
  if (window.gtag) window.gtag('event', name, params);
}
