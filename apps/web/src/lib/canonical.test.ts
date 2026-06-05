import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('canonical URLs', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('normalizes duplicate slashes and drops hash fragments', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://spektra.example///');
    const { buildCanonicalUrl } = await import('./canonical');

    expect(buildCanonicalUrl('//content//film/42?utm=ignored#section')).toBe('https://spektra.example/content/film/42');
  });

  it('can include normalized search when requested', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://spektra.example/app/');
    const { buildCanonicalUrl } = await import('./canonical');

    expect(buildCanonicalUrl('/search', { includeSearch: true, search: 'q=arrival' })).toBe('https://spektra.example/app/search?q=arrival');
  });

  it('returns undefined when the site URL is absent', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', '');
    const { buildCanonicalUrl } = await import('./canonical');

    expect(buildCanonicalUrl('/content')).toBeUndefined();
  });
});
