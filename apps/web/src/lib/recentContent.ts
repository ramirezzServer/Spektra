import type { ContentItem } from '@/types';
import { getRecentlyViewed, rememberRecentlyViewed, type RecentlyViewedItem } from '@/hooks/useRecentlyViewed';

export type RecentContentItem = RecentlyViewedItem & { id: string; viewedAt: string };

export function getRecentContent(): RecentContentItem[] {
  return getRecentlyViewed().map((item) => ({
    ...item,
    id: `${item.type}:${item.externalId}`,
    viewedAt: new Date(item.timestamp).toISOString(),
  }));
}

export function rememberRecentContent(item: ContentItem) {
  rememberRecentlyViewed(item);
}
