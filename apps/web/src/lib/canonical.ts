import { env } from '@/lib/env';

export function normalizeSiteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  try {
    const url = new URL(trimmed);
    url.pathname = url.pathname.replace(/\/+$/, '');
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return trimmed.replace(/\/+$/, '');
  }
}

function normalizePath(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/)[0] || '/';
  const withLeadingSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  return collapsed === '/' ? '/' : collapsed.replace(/\/+$/, '');
}

export function buildCanonicalUrl(pathname: string, options: { includeSearch?: boolean; search?: string } = {}): string | undefined {
  const origin = normalizeSiteUrl(env.siteUrl);
  if (!origin) {
    return undefined;
  }

  const path = normalizePath(pathname);
  const search = options.includeSearch && options.search ? options.search.trim() : '';
  const normalizedSearch = search && search !== '?' ? (search.startsWith('?') ? search : `?${search}`) : '';

  return `${origin}${path}${normalizedSearch}`;
}
