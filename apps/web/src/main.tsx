import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { ContentDetail } from '@/pages/ContentDetail';
import { Feed } from '@/pages/Feed';
import { Home } from '@/pages/Home';
import { Lists } from '@/pages/Lists';
import { Profile } from '@/pages/Profile';
import { Search } from '@/pages/Search';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import './index.css';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/search', element: <Search /> },
      { path: '/feed', element: <RequireAuth><Feed /></RequireAuth> },
      { path: '/profile/:username', element: <Profile /> },
      { path: '/content/:type/:id', element: <ContentDetail /> },
      { path: '/lists', element: <RequireAuth><Lists /></RequireAuth> },
    ],
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
