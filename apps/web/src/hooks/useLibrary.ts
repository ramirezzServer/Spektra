import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/stores/authStore';
import type { ContentType, EntryStatus, PaginatedResponse, User, UserEntry, UserStats } from '@/types';

type LibrarySort = 'updated_desc' | 'updated_asc' | 'title_asc' | 'rating_desc' | 'rating_asc';
type PublicLibrarySort = 'updated_desc' | 'title_asc' | 'rating_desc';

export interface LibraryParams {
  status?: EntryStatus | undefined;
  type?: ContentType | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
  sort?: LibrarySort | undefined;
}

export interface UpsertEntryInput {
  content_id: string;
  status: EntryStatus;
  rating?: number | null;
  review?: string | null;
}

const normalizePage = <T>(response: PaginatedResponse<T>): PaginatedResponse<T> => ({
  ...response,
  meta: {
    ...response.meta,
    perPage: response.meta.perPage ?? response.meta.per_page ?? 20,
    lastPage: response.meta.lastPage ?? response.meta.last_page ?? 1,
  },
});

const paramsForApi = (params: LibraryParams = {}) => ({
  status: params.status,
  type: params.type,
  page: params.page ?? 1,
  per_page: params.perPage ?? 20,
  sort: params.sort ?? 'updated_desc',
});

export const libraryKeys = {
  mine: (params?: LibraryParams) => ['library', 'mine', paramsForApi(params)] as const,
  user: (username: string | undefined, params?: LibraryParams) => ['library', 'user', username, paramsForApi(params)] as const,
  stats: (username: string | undefined) => ['users', username, 'stats'] as const,
  profile: (username: string | undefined) => ['users', username, 'profile'] as const,
  entryByContent: (contentId: string | undefined) => ['entries', 'by-content', contentId] as const,
};

export function useMyLibrary(params: LibraryParams = {}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: libraryKeys.mine(params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<UserEntry>>('/library', { params: paramsForApi(params) });
      return normalizePage(response.data);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}

export function useUserLibrary(username: string | undefined, params: LibraryParams & { sort?: PublicLibrarySort } = {}) {
  return useQuery({
    queryKey: libraryKeys.user(username, params),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<UserEntry>>(`/users/${username}/library`, { params: paramsForApi(params) });
      return normalizePage(response.data);
    },
    enabled: Boolean(username),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}

export function useUserStats(username: string | undefined) {
  return useQuery({
    queryKey: libraryKeys.stats(username),
    queryFn: async () => {
      const response = await api.get<{ data: UserStats }>(`/users/${username}/stats`);
      return response.data.data;
    },
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useUserProfile(username: string | undefined) {
  return useQuery({
    queryKey: libraryKeys.profile(username),
    queryFn: async () => {
      const response = await api.get<{ data: User }>(`/users/${username}`);
      return response.data.data;
    },
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}

export function useEntryByContent(contentId?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: libraryKeys.entryByContent(contentId),
    queryFn: async () => {
      const response = await api.get<{ data: UserEntry | null }>(`/entries/by-content/${contentId}`);
      return response.data.data;
    },
    enabled: isAuthenticated && Boolean(contentId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
  });
}

export function libraryErrorMessage(error: unknown) {
  return getApiErrorMessage(error, 'Unable to save changes.');
}

export function useUpsertEntry() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (input: UpsertEntryInput) => {
      const response = await api.post<{ data: UserEntry }>('/entries', input);
      return response.data.data;
    },
    onMutate: async (input) => {
      const key = libraryKeys.entryByContent(input.content_id);
      await queryClient.cancelQueries({ queryKey: key });
      const previousEntry = queryClient.getQueryData<UserEntry | null>(key);
      const optimistic: UserEntry = {
        id: previousEntry?.id ?? 'optimistic',
        userId: previousEntry?.userId ?? user?.id ?? '',
        contentId: input.content_id,
        ...(previousEntry?.content ? { content: previousEntry.content } : {}),
        status: input.status,
        rating: input.rating ?? previousEntry?.rating ?? null,
        review: input.review ?? previousEntry?.review ?? null,
        createdAt: previousEntry?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData(key, optimistic);
      return { previousEntry, key };
    },
    onError: (error, _input, context) => {
      if (context) queryClient.setQueryData(context.key, context.previousEntry ?? null);
    },
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.entryByContent(input.content_id) });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string; contentId?: string }) => {
      const response = await api.delete<{ data: { deleted: boolean } }>(`/entries/${id}`);
      return response.data.data;
    },
    onMutate: async ({ contentId }) => {
      const key = libraryKeys.entryByContent(contentId);
      const previousEntry = contentId ? queryClient.getQueryData<UserEntry | null>(key) : undefined;
      if (contentId) queryClient.setQueryData(key, null);
      return { previousEntry, key, contentId };
    },
    onError: (error, _input, context) => {
      if (context?.contentId) queryClient.setQueryData(context.key, context.previousEntry ?? null);
    },
    onSettled: (_data, _error, input) => {
      if (input.contentId) queryClient.invalidateQueries({ queryKey: libraryKeys.entryByContent(input.contentId) });
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
