import { describe, expect, it } from 'vitest';
import { buildContentPath, buildListPath, slugify } from './slugs';
import type { ContentItem, UserList } from '@/types';

describe('slugs', () => {
  it('slugifies readable titles while preserving useful words', () => {
    expect(slugify('  Wall-E & Café Society!!  ')).toBe('wall-e-and-cafe-society');
  });

  it('builds content paths with encoded old external IDs intact', () => {
    const item = {
      type: 'film',
      externalId: 'tmdb/123 old',
      title: 'Arrival',
    } as ContentItem;

    expect(buildContentPath(item)).toBe('/content/film/tmdb%2F123%20old/arrival');
  });

  it('builds list paths with a fallback slug', () => {
    const list = { id: 'list-1', name: '!!!' } as UserList;

    expect(buildListPath(list)).toBe('/lists/list-1/list');
  });
});
