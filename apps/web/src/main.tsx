import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/auth/RequireAuth';

import { Home } from '@/pages/Home';
import { Search } from '@/pages/Search';
import { Feed } from '@/pages/Feed';
import { Lists } from '@/pages/Lists';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';

import './index.css';

const Profile = React.lazy(() => import('@/pages/Profile').then((module) => ({ default: module.Profile })));
const ContentDetail = React.lazy(() => import('@/pages/ContentDetail').then((module) => ({ default: module.ContentDetail })));
const LibraryPage = React.lazy(() => import('@/pages/Library').then((module) => ({ default: module.LibraryPage })));

function lazyPage(element: React.ReactNode) {
  return <React.Suspense fallback={<div className="py-16 text-sm text-content-tertiary">Loading...</div>}>{element}</React.Suspense>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile/:username" element={lazyPage(<Profile />)} />
            <Route path="/content/:type/:id" element={lazyPage(<ContentDetail />)} />

            <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
            <Route path="/library" element={<RequireAuth>{lazyPage(<LibraryPage />)}</RequireAuth>} />
            <Route path="/lists" element={<RequireAuth><Lists /></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
