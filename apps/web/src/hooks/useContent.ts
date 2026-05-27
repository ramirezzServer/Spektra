import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ContentItem, ContentType, PaginatedResponse } from '@/types';

export function useTrending(type?: ContentType | 'all') {
  return useQuery({
    queryKey: ['content', 'trending', type],
    queryFn: async () => {
      const response = await api.get<{ data: ContentItem[] }>('/content/trending', {
        params: type && type !== 'all' ? { type } : {},
      });
      return response.data.data;
    },
  });
}

export function useSearchContent(query: string, type?: ContentType | 'all') {
  return useQuery({
    queryKey: ['content', 'search', query, type],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<ContentItem>>('/content', {
        params: { q: query, type: type === 'all' ? undefined : type },
      });
      return response.data.data;
    },
    enabled: query.trim().length > 1,
  });
}
