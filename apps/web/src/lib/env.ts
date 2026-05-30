const isProduction = import.meta.env.PROD;

function optionalEnv(name: string) {
  const value = import.meta.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function publicUrl(value: string) {
  return value.replace(/\/$/, '');
}

const apiUrl = optionalEnv('VITE_API_URL') || 'http://localhost:8000/api';
const siteUrl = publicUrl(optionalEnv('VITE_PUBLIC_SITE_URL'));

if (isProduction) {
  if (!optionalEnv('VITE_API_URL')) {
    console.warn('Spektra production build is missing VITE_API_URL.');
  }

  if (!siteUrl) {
    console.warn('Spektra production build is missing VITE_PUBLIC_SITE_URL; canonical URLs will be skipped.');
  }
}

export const env = {
  apiUrl,
  siteUrl,
  analyticsProvider: optionalEnv('VITE_ANALYTICS_PROVIDER') || 'none',
  gaMeasurementId: optionalEnv('VITE_GA_MEASUREMENT_ID'),
  umamiSrc: optionalEnv('VITE_UMAMI_SRC'),
  umamiWebsiteId: optionalEnv('VITE_UMAMI_WEBSITE_ID'),
  sentryDsn: optionalEnv('VITE_SENTRY_DSN'),
};
