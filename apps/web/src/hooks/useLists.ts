import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/apiError';
import { useAuthStore } from '@/stores/authStore';
import type { ContentItem, ListDetail, ListItem, PaginatedResponse, UserList } from '@/types';

export interface ListInput {
  id?: string;
  name: string;
  description?: string | null;
  isPublic?: boolean;
}

const normalizePage = <T>(response: PaginatedResponse<T>): PaginatedResponse<T> => ({
  ...response,
  meta: {
    ...response.meta,
    perPage: response.meta.perPage ?? response.meta.per_page ?? 20,
    lastPage: response.meta.lastPage ?? response.meta.last_page ?? 1,
  },
});

const listParams = (page = 1, perPage = 20) => ({ page, per_page: perPage });

export const listKeys = {
  all: ['lists'] as const,
  mine: (page = 1, perPage = 20) => ['lists', 'mine', listParams(page, perPage)] as const,
  detail: (listId: string | undefined, page = 1, perPage = 20) => ['lists', 'detail', listId, listParams(page, perPage)] as const,
};

const toApiInput = (input: ListInput) => ({
  name: input.name.trim(),
  description: input.description?.trim() || null,
  is_public: Boolean(input.isPublic),
});

export function listErrorMessage(error: unknown) {
  return getApiErrorMessage(error, 'Unable to save list changes.');
}

export function useMyLists(page = 1, perPage = 20) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: listKeys.mine(page, perPage),
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<UserList>>('/lists', { params: listParams(page, perPage) });
      return normalizePage(response.data);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}

export function useListDetail(listId?: string, page = 1, perPage = 20) {
  return useQuery({
    queryKey: listKeys.detail(listId, page, perPage),
    queryFn: async () => {
      const response = await api.get<{ data: ListDetail; meta: PaginatedResponse<ListItem>['meta'] }>(`/lists/${listId}`, {
        params: listParams(page, perPage),
      });
      return {
        data: response.data.data,
        meta: {
          ...response.data.meta,
          perPage: response.data.meta.perPage ?? response.data.meta.per_page ?? 20,
          lastPage: response.data.meta.lastPage ?? response.data.meta.last_page ?? 1,
        },
      };
    },
    enabled: Boolean(listId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    placeholderData: keepPreviousData,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (input: ListInput) => {
      const response = await api.post<{ data: UserList }>('/lists', toApiInput(input));
      return response.data.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const snapshots = queryClient.getQueriesData<PaginatedResponse<UserList>>({ queryKey: listKeys.all });
      const optimistic: UserList = {
        id: `optimistic-${Date.now()}`,
        userId: user?.id ?? '',
        name: input.name.trim(),
        description: input.description?.trim() || null,
        isPublic: Boolean(input.isPublic),
        itemsCount: 0,
        previewItems: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueriesData<PaginatedResponse<UserList>>({ queryKey: listKeys.all }, (current) =>
        current ? { ...current, data: [optimistic, ...current.data], meta: { ...current.meta, total: current.meta.total + 1 } } : current,
      );

      return { snapshots };
    },
    onError: (_error, _input, context) => context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKeys.all }),
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ListInput & { id: string }) => {
      const response = await api.put<{ data: UserList }>(`/lists/${input.id}`, toApiInput(input));
      return response.data.data;
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const snapshots = queryClient.getQueriesData({ queryKey: listKeys.all });
      queryClient.setQueriesData<PaginatedResponse<UserList>>({ queryKey: listKeys.all }, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((list) =>
                list.id === input.id ? { ...list, name: input.name.trim(), description: input.description?.trim() || null, isPublic: Boolean(input.isPublic) } : list,
              ),
            }
          : current,
      );
      queryClient.setQueriesData<{ data: ListDetail; meta: unknown }>({ queryKey: ['lists', 'detail', input.id] }, (current) =>
        current ? { ...current, data: { ...current.data, name: input.name.trim(), description: input.description?.trim() || null, isPublic: Boolean(input.isPublic) } } : current,
      );
      return { snapshots };
    },
    onError: (_error, _input, context) => context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
      queryClient.invalidateQueries({ queryKey: ['lists', 'detail', input.id] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<{ data: { deleted: boolean } }>(`/lists/${id}`);
      return response.data.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      const snapshots = queryClient.getQueriesData({ queryKey: listKeys.all });
      queryClient.setQueriesData<PaginatedResponse<UserList>>({ queryKey: listKeys.all }, (current) =>
        current ? { ...current, data: current.data.filter((list) => list.id !== id), meta: { ...current.meta, total: Math.max(0, current.meta.total - 1) } } : current,
      );
      return { snapshots };
    },
    onError: (_error, _input, context) => context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKeys.all }),
  });
}

export function useAddListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, contentId }: { listId: string; contentId: string; content?: ContentItem }) => {
      const response = await api.post<{ data: ListItem }>(`/lists/${listId}/items`, { content_id: contentId });
      return response.data.data;
    },
    onMutate: async ({ listId, contentId, content }) => {
      const snapshots = queryClient.getQueriesData({ queryKey: ['lists', 'detail', listId] });
      if (content) {
        queryClient.setQueriesData<{ data: ListDetail; meta: PaginatedResponse<ListItem>['meta'] }>({ queryKey: ['lists', 'detail', listId] }, (current) => {
          if (!current || current.data.items.some((item) => item.contentId === contentId)) return current;
          const optimistic: ListItem = { listId, contentId, position: current.data.items.length + 1, content, addedAt: new Date().toISOString() };
          return { ...current, data: { ...current.data, items: [...current.data.items, optimistic], itemsCount: (current.data.itemsCount ?? 0) + 1 } };
        });
      }
      return { snapshots };
    },
    onError: (_error, input, context) => context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: ['lists', 'detail', input.listId] });
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

export function useRemoveListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, contentId }: { listId: string; contentId: string }) => {
      const response = await api.delete<{ data: { deleted: boolean } }>(`/lists/${listId}/items/${contentId}`);
      return response.data.data;
    },
    onMutate: async ({ listId, contentId }) => {
      await queryClient.cancelQueries({ queryKey: ['lists', 'detail', listId] });
      const snapshots = queryClient.getQueriesData({ queryKey: ['lists', 'detail', listId] });
      queryClient.setQueriesData<{ data: ListDetail; meta: unknown }>({ queryKey: ['lists', 'detail', listId] }, (current) =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                items: current.data.items.filter((item) => item.contentId !== contentId).map((item, index) => ({ ...item, position: index + 1 })),
                itemsCount: Math.max(0, (current.data.itemsCount ?? current.data.items.length) - 1),
              },
            }
          : current,
      );
      return { snapshots };
    },
    onError: (_error, _input, context) => context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: ['lists', 'detail', input.listId] });
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

export function useReorderListItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, items }: { listId: string; items: Array<{ contentId: string; position: number }> }) => {
      const response = await api.put<{ data: ListItem[] }>(`/lists/${listId}/items/reorder`, {
        items: items.map((item) => ({ content_id: item.contentId, position: item.position })),
      });
      return response.data.data;
    },
    onMutate: async ({ listId, items }) => {
      await queryClient.cancelQueries({ queryKey: ['lists', 'detail', listId] });
      const snapshots = queryClient.getQueriesData({ queryKey: ['lists', 'detail', listId] });
      const positions = new Map(items.map((item) => [item.contentId, item.position]));
      queryClient.setQueriesData<{ data: ListDetail; meta: unknown }>({ queryKey: ['lists', 'detail', listId] }, (current) =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                items: [...current.data.items].map((item) => ({ ...item, position: positions.get(item.contentId) ?? item.position })).sort((a, b) => a.position - b.position),
              },
            }
          : current,
      );
      return { snapshots };
    },
    onError: (_error, _input, context) => context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value)),
    onSettled: (_data, _error, input) => queryClient.invalidateQueries({ queryKey: ['lists', 'detail', input.listId] }),
  });
}
