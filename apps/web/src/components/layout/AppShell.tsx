import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppShell() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-app-bg text-app-text">
      <Sidebar />
      <div className="md:pl-60">
        <Navbar />
        <main className="mx-auto w-full max-w-[1200px] px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
