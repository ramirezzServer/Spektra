import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/apiError';
import { libraryKeys } from '@/hooks/useLibrary';
import { useAuthStore } from '@/stores/authStore';
import type { FollowRelationship, PaginatedResponse, User } from '@/types';

export const socialKeys = {
  relationship: (username?: string) => ['social', 'relationship', username] as const,
  followers: (username?: string, page = 1, perPage = 20) => ['social', 'followers', username, page, perPage] as const,
  following: (username?: string, page = 1, perPage = 20) => ['social', 'following', username, page, perPage] as const,
};

const normalizePage = <T>(response: PaginatedResponse<T>): PaginatedResponse<T> => ({
  ...response,
  meta: {
    ...response.meta,
    perPage: response.meta.perPage ?? response.meta.per_page ?? 20,
    lastPage: response.meta.lastPage ?? response.meta.last_page ?? 1,
  },
});

export function useRelationship(username?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: socialKeys.relationship(username),
    queryFn: async () => {
      const response = await api.get<{ data: FollowRelationship }>(`/users/${username}/relationship`);
      return response.data.data;
    },
    enabled: isAuthenticated && Boolean(username),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
}

export function useFollowers(username?: string, page = 1, perPage = 20) {
  return useQuery({
    queryKey: socialKeys.followers(username, page, perPage),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<User>>(`/users/${username}/followers`, {
        params: { page, per_page: perPage },
      });
      return normalizePage(response.data);
    },
    enabled: Boolean(username),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}

export function useFollowing(username?: string, page = 1, perPage = 20) {
  return useQuery({
    queryKey: socialKeys.following(username, page, perPage),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<User>>(`/users/${username}/following`, {
        params: { page, per_page: perPage },
      });
      return normalizePage(response.data);
    },
    enabled: Boolean(username),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}

function useFollowMutation(method: 'post' | 'delete') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      const response = method === 'post'
        ? await api.post<{ data: { following: boolean; followersCount: number; followingCount: number } }>(`/follows/${username}`)
        : await api.delete<{ data: { following: boolean; followersCount: number; followingCount: number } }>(`/follows/${username}`);
      return response.data.data;
    },
    onMutate: async (username) => {
      const key = socialKeys.relationship(username);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FollowRelationship>(key);
      queryClient.setQueryData<FollowRelationship>(key, {
        isSelf: previous?.isSelf ?? false,
        isFollowing: method === 'post',
      });
      return { key, previous, username };
    },
    onError: (error, _username, context) => {
      if (context?.previous) queryClient.setQueryData(context.key, context.previous);
    },
    onSettled: (_data, _error, username) => {
      queryClient.invalidateQueries({ queryKey: socialKeys.relationship(username) });
      queryClient.invalidateQueries({ queryKey: libraryKeys.profile(username) });
      queryClient.invalidateQueries({ queryKey: ['social'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'following'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'global'] });
    },
  });
}

export function useFollowUser() {
  return useFollowMutation('post');
}

export function useUnfollowUser() {
  return useFollowMutation('delete');
}
