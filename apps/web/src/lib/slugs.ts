import type { ContentItem, UserList } from '@/types';

export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '');
}

export function buildContentPath(item: ContentItem): string {
  return `/content/${encodeURIComponent(item.type)}/${encodeURIComponent(item.externalId)}/${slugify(item.title) || 'content'}`;
}

export function buildListPath(list: UserList): string {
  return `/lists/${encodeURIComponent(list.id)}/${slugify(list.name) || 'list'}`;
}
