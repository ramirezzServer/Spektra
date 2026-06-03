import { useCallback, useEffect, useState } from 'react';
import type { ContentItem } from '@/types';

export interface RecentlyViewedItem {
  externalId: string;
  type: ContentItem['type'];
  title: string;
  posterUrl: string | null;
  releaseYear: number | null;
  timestamp: number;
}

const storageKey = 'spektra:recently-viewed';
const legacyStorageKey = 'spektra:recent-content';
const maxItems = 10;
const updateEventName = 'spektra:recently-viewed-updated';
const legacyUpdateEventName = 'spektra:recent-content-updated';
const validTypes = new Set(['film', 'series', 'game', 'book']);

function isRecentlyViewedItem(value: unknown): value is RecentlyViewedItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<RecentlyViewedItem>;
  return Boolean(item.externalId && item.type && item.title && typeof item.timestamp === 'number');
}

function normalizeStoredItem(value: unknown): RecentlyViewedItem | null {
  if (isRecentlyViewedItem(value)) return value;
  if (!value || typeof value !== 'object') return null;
  const legacy = value as {
    externalId?: unknown;
    type?: unknown;
    title?: unknown;
    posterUrl?: unknown;
    releaseYear?: unknown;
    viewedAt?: unknown;
  };
  if (typeof legacy.externalId !== 'string' || typeof legacy.title !== 'string' || typeof legacy.type !== 'string' || !validTypes.has(legacy.type)) return null;
  const timestamp = typeof legacy.viewedAt === 'string' ? Date.parse(legacy.viewedAt) : 0;
  return {
    externalId: legacy.externalId,
    type: legacy.type as ContentItem['type'],
    title: legacy.title,
    posterUrl: typeof legacy.posterUrl === 'string' ? legacy.posterUrl : null,
    releaseYear: typeof legacy.releaseYear === 'number' ? legacy.releaseYear : null,
    timestamp: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : Date.now(),
  };
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey) ?? '[]';
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeStoredItem)
      .filter((item): item is RecentlyViewedItem => Boolean(item))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, maxItems);
  } catch {
    return [];
  }
}

export function rememberRecentlyViewed(item: ContentItem) {
  if (typeof window === 'undefined') return;
  const next: RecentlyViewedItem = {
    externalId: item.externalId,
    type: item.type,
    title: item.title,
    posterUrl: item.posterUrl,
    releaseYear: item.releaseYear,
    timestamp: Date.now(),
  };
  const items = [next, ...getRecentlyViewed().filter((existing) => `${existing.type}:${existing.externalId}` !== `${item.type}:${item.externalId}`)].slice(0, maxItems);
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(updateEventName));
  window.dispatchEvent(new CustomEvent(legacyUpdateEventName));
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>(() => getRecentlyViewed());

  const refresh = useCallback(() => {
    setItems(getRecentlyViewed());
  }, []);

  useEffect(() => {
    window.addEventListener('storage', refresh);
    window.addEventListener(updateEventName, refresh);
    window.addEventListener(legacyUpdateEventName, refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(updateEventName, refresh);
      window.removeEventListener(legacyUpdateEventName, refresh);
    };
  }, [refresh]);

  return { items, remember: rememberRecentlyViewed, refresh };
}
