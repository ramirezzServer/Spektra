import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

interface AuthResponse {
  data: {
    token: string;
    user: User;
  };
}

export function useAuth() {
  const { token, user, setAuth, clearAuth } = useAuthStore();
  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => (await api.get<{ data: User }>('/auth/me')).data.data,
    enabled: Boolean(token),
  });

  const login = useMutation({
    mutationFn: async (payload: { email: string; password: string }) =>
      (await api.post<AuthResponse>('/auth/login', payload)).data.data,
    onSuccess: ({ token: nextToken, user: nextUser }) => setAuth(nextToken, nextUser),
  });

  const register = useMutation({
    mutationFn: async (payload: { username: string; email: string; password: string }) =>
      (await api.post<AuthResponse>('/auth/register', payload)).data.data,
    onSuccess: ({ token: nextToken, user: nextUser }) => setAuth(nextToken, nextUser),
  });

  return { token, user: me.data ?? user, login, register, logout: clearAuth };
}
