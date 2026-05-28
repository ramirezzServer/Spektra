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
import { Profile } from '@/pages/Profile';
import { ContentDetail } from '@/pages/ContentDetail';
import { Lists } from '@/pages/Lists';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';

import './index.css';

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
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/content/:type/:id" element={<ContentDetail />} />

            <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
            <Route path="/lists" element={<RequireAuth><Lists /></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
