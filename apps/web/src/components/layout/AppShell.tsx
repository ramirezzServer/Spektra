import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

export function AppShell() {
  return (
    <div className="min-h-screen bg-bg-secondary">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col bg-surface border-r border-border z-30 overflow-y-auto">
        <Sidebar />
      </aside>

      <main className="md:ml-60 min-h-screen flex flex-col">
        <Navbar />
        <EmailVerificationBanner />
        <div className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-screen-xl mx-auto w-full">
          <Outlet />
          <footer className="mt-10 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-content-tertiary">
            <Link to="/privacy" className="hover:text-accent">Privacy</Link>
            <Link to="/terms" className="hover:text-accent">Terms</Link>
          </footer>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
