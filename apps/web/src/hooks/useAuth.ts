import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@spektra/shared-types';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { token, user, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const me = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<{ data: User }>('/auth/me');
      return res.data.data;
    },
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (me.data) updateUser(me.data);
  }, [me.data, updateUser]);

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; username: string; email: string; password: string; password_confirmation: string }) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.token, data.data);
      navigate(data.data.emailVerified ? '/' : '/email/verify');
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

  const resendVerification = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: { sent: boolean; verified: boolean } }>('/email/verification-notification');
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.verified && user) updateUser({ emailVerified: true });
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    register: registerMutation,
    login: loginMutation,
    logout: logoutMutation,
    resendVerification,
  };
}
