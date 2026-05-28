import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { User } from '@spektra/shared-types';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { token, user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<{ data: User }>('/auth/me');
      return res.data.data;
    },
    enabled: Boolean(token),
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; username: string; email: string; password: string; password_confirmation: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.data);
      navigate('/');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.data);
      navigate('/');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => api.post('/auth/logout'),
    onSettled: () => {
      clearAuth();
      navigate('/login');
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    register: registerMutation,
    login: loginMutation,
    logout: logoutMutation,
  };
}
