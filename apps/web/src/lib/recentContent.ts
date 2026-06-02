import type { ContentItem } from '@/types';

export interface RecentContentItem {
  id: string;
  externalId: string;
  type: ContentItem['type'];
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  viewedAt: string;
}

const key = 'spektra:recent-content';
const maxItems = 5;

function isRecentContentItem(value: unknown): value is RecentContentItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<RecentContentItem>;
  return Boolean(item.id && item.externalId && item.type && item.title && item.viewedAt);
}

export function getRecentContent(): RecentContentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown;
    return Array.isArray(parsed) ? parsed.filter(isRecentContentItem).slice(0, maxItems) : [];
  } catch {
    return [];
  }
}

export function rememberRecentContent(item: ContentItem) {
  if (typeof window === 'undefined') return;
  const next: RecentContentItem = {
    id: item.id,
    externalId: item.externalId,
    type: item.type,
    title: item.title,
    posterUrl: item.posterUrl,
    releaseYear: item.releaseYear,
    viewedAt: new Date().toISOString(),
  };
  const items = [next, ...getRecentContent().filter((existing) => existing.id !== item.id)].slice(0, maxItems);
  window.localStorage.setItem(key, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('spektra:recent-content-updated'));
}
