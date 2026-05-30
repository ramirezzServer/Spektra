import axios from 'axios';
import { env } from './env';

const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('spektra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !['/login', '/register'].includes(window.location.pathname)) {
      localStorage.removeItem('spektra_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export { api };
export default api;
