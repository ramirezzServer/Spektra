import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

const storedToken = localStorage.getItem('spektra_token');
const storedUser = localStorage.getItem('spektra_user');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedUser ? (JSON.parse(storedUser) as User) : null,
  setAuth: (token, user) => {
    localStorage.setItem('spektra_token', token);
    localStorage.setItem('spektra_user', JSON.stringify(user));
    set({ token, user });
  },
  clearAuth: () => {
    localStorage.removeItem('spektra_token');
    localStorage.removeItem('spektra_user');
    set({ token: null, user: null });
  },
}));
