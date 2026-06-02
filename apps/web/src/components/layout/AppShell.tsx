import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';

export function AppShell() {
  return (
    <div className="app-gradient min-h-screen">
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 flex-col overflow-y-auto border-r border-border-subtle bg-surface/88 shadow-panel backdrop-blur-xl md:flex">
        <Sidebar />
      </aside>

      <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col focus:outline-none md:ml-64">
        <Navbar />
        <EmailVerificationBanner />
        <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 pb-28 sm:px-5 md:px-7 md:py-6 md:pb-8 xl:px-10">
          <Outlet />
          <footer className="mt-8 flex flex-wrap gap-4 border-t border-border-subtle pt-4 text-xs font-semibold text-content-tertiary">
            <Link to="/privacy" className="hover:text-accent">Privacy</Link>
            <Link to="/terms" className="hover:text-accent">Terms</Link>
          </footer>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
