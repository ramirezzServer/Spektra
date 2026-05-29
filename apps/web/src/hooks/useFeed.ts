import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import type { ActivityFeedItem, CursorPaginatedResponse } from '@/types';

export type FeedScope = 'following' | 'global';

export function useActivityFeed(scope: FeedScope) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useInfiniteQuery({
    queryKey: ['feed', scope],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const response = await api.get<CursorPaginatedResponse<ActivityFeedItem>>('/feed', {
        params: {
          scope,
          cursor: pageParam ?? undefined,
          per_page: 20,
        },
      });
      return response.data;
    },
    enabled: scope === 'global' || isAuthenticated,
    getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
    staleTime: 1000 * 45,
    gcTime: 1000 * 60 * 10,
  });
}

export const useFeed = useActivityFeed;
