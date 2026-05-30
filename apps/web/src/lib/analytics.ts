import { getConsent } from './consent';
import { env } from './env';

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
  const provider = env.analyticsProvider;

  if (provider === 'ga' && env.gaMeasurementId) {
    const id = env.gaMeasurementId;
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${id}`);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer?.push(Array.from(arguments));
    };
    window.gtag('js', new Date());
    window.gtag('config', id, { send_page_view: false });
    initialized = true;
  }

  if (provider === 'umami' && env.umamiSrc && env.umamiWebsiteId) {
    appendScript(env.umamiSrc, {
      'data-website-id': env.umamiWebsiteId,
      defer: 'true',
    });
    initialized = true;
  }
}

export function trackPageView(path: string) {
  if (getConsent() !== 'accepted') return;
  initAnalytics();
  if (window.gtag && env.gaMeasurementId) {
    window.gtag('event', 'page_view', {
      page_path: path,
      send_to: env.gaMeasurementId,
    });
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (getConsent() !== 'accepted') return;
  initAnalytics();
  if (window.gtag) window.gtag('event', name, params);
}
