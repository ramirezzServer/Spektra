import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { ActivityFeedItem, PaginatedResponse } from '@/types';

export function useFeed(scope: 'following' | 'global') {
  return useInfiniteQuery({
    queryKey: ['feed', scope],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<PaginatedResponse<ActivityFeedItem>>('/feed', {
        params: { page: pageParam, scope },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const next = lastPage.meta.page + 1;
      return lastPage.data.length && next * lastPage.meta.perPage <= lastPage.meta.total + lastPage.meta.perPage ? next : undefined;
    },
  });
}
