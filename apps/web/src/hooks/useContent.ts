import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ContentItem, ContentType, PaginatedResponse } from '@/types';

type ContentResponse = PaginatedResponse<ContentItem> & {
  meta: PaginatedResponse<ContentItem>['meta'] & {
    per_page?: number;
    query?: string;
  };
};

export function useSearch(query: string, type?: ContentType | 'all', page = 1) {
  return useQuery({
    queryKey: ['content', 'search', query, type, page],
    queryFn: async () => {
      const response = await api.get<ContentResponse>('/content', {
        params: {
          q: query,
          type: type && type !== 'all' ? type : undefined,
          page,
        },
      });

      return {
        ...response.data,
        meta: {
          ...response.data.meta,
          perPage: response.data.meta.perPage ?? response.data.meta.per_page ?? 20,
        },
      };
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 20,
    placeholderData: keepPreviousData,
  });
}

export function useTrending(type?: ContentType | 'all', limit = 20) {
  return useQuery({
    queryKey: ['content', 'trending', type, limit],
    queryFn: async () => {
      const response = await api.get<{ data: ContentItem[] }>('/content/trending', {
        params: {
          type: type && type !== 'all' ? type : undefined,
          limit,
        },
      });
      return response.data.data;
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useContentItem(type: string, externalId: string) {
  return useQuery({
    queryKey: ['content', 'item', type, externalId],
    queryFn: async () => {
      const response = await api.get<{ data: ContentItem }>(`/content/${type}/${externalId}`);
      return response.data.data;
    },
    enabled: Boolean(type && externalId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 20,
  });
}

export const useSearchContent = useSearch;
