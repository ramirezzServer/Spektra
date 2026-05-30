import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { AppErrorBoundary } from '@/components/monitoring/AppErrorBoundary';
import { CookieConsentBanner } from '@/components/privacy/CookieConsentBanner';
import { RouteAnalytics } from '@/components/monitoring/RouteAnalytics';

import { Home } from '@/pages/Home';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import { EmailVerificationNotice } from '@/pages/Auth/EmailVerificationNotice';
import { EmailVerified } from '@/pages/Auth/EmailVerified';

import './index.css';

const Profile = React.lazy(() => import('@/pages/Profile').then((module) => ({ default: module.Profile })));
const ContentDetail = React.lazy(() => import('@/pages/ContentDetail').then((module) => ({ default: module.ContentDetail })));
const LibraryPage = React.lazy(() => import('@/pages/Library').then((module) => ({ default: module.LibraryPage })));
const Search = React.lazy(() => import('@/pages/Search').then((module) => ({ default: module.Search })));
const Feed = React.lazy(() => import('@/pages/Feed').then((module) => ({ default: module.Feed })));
const Lists = React.lazy(() => import('@/pages/Lists').then((module) => ({ default: module.Lists })));
const ListDetail = React.lazy(() => import('@/pages/ListDetail').then((module) => ({ default: module.ListDetail })));
const UserConnections = React.lazy(() => import('@/pages/UserConnections').then((module) => ({ default: module.UserConnections })));
const Privacy = React.lazy(() => import('@/pages/Privacy').then((module) => ({ default: module.Privacy })));
const Terms = React.lazy(() => import('@/pages/Terms').then((module) => ({ default: module.Terms })));

function lazyPage(element: React.ReactNode) {
  return <React.Suspense fallback={<div className="py-16 text-sm text-content-tertiary">Loading...</div>}>{element}</React.Suspense>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RouteAnalytics />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email/verify" element={<RequireAuth><EmailVerificationNotice /></RequireAuth>} />
            <Route path="/email/verified" element={<EmailVerified />} />

            <Route element={<AppShell />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={lazyPage(<Search />)} />
              <Route path="/profile/:username" element={lazyPage(<Profile />)} />
              <Route path="/profile/:username/followers" element={lazyPage(<UserConnections kind="followers" />)} />
              <Route path="/profile/:username/following" element={lazyPage(<UserConnections kind="following" />)} />
              <Route path="/content/:type/:id" element={lazyPage(<ContentDetail />)} />
              <Route path="/privacy" element={lazyPage(<Privacy />)} />
              <Route path="/terms" element={lazyPage(<Terms />)} />

              <Route path="/feed" element={<RequireAuth>{lazyPage(<Feed />)}</RequireAuth>} />
              <Route path="/library" element={<RequireAuth>{lazyPage(<LibraryPage />)}</RequireAuth>} />
              <Route path="/lists" element={<RequireAuth>{lazyPage(<Lists />)}</RequireAuth>} />
              <Route path="/lists/:listId" element={lazyPage(<ListDetail />)} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CookieConsentBanner />
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
