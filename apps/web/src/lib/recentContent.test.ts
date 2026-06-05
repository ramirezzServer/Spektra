import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecentContent, rememberRecentContent } from './recentContent';
import type { ContentItem } from '@/types';

describe('recent content helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('remembers content with a stable type and external ID key', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-05T12:00:00Z'));
    const item = {
      externalId: 'old-id-42',
      type: 'book',
      title: 'Dune',
      posterUrl: null,
      releaseYear: 1965,
    } as ContentItem;

    rememberRecentContent(item);

    expect(getRecentContent()).toMatchObject([
      { id: 'book:old-id-42', externalId: 'old-id-42', type: 'book', viewedAt: '2026-06-05T12:00:00.000Z' },
    ]);
  });

  it('ignores malformed storage safely', () => {
    localStorage.setItem('spektra:recently-viewed', '{broken json');

    expect(getRecentContent()).toEqual([]);
  });
});
