import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { CommandPalette } from '@/components/command/CommandPalette';
import { ListFormModal } from '@/components/lists/ListFormModal';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { listErrorMessage, useCreateList } from '@/hooks/useLists';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

export function AppShell() {
  const commandPalette = useCommandPalette();
  const recentlyViewed = useRecentlyViewed();
  const createList = useCreateList();
  const { user, isAuthenticated } = useAuthStore();
  const [createListOpen, setCreateListOpen] = useState(false);
  const [createListError, setCreateListError] = useState<string | null>(null);

  function openCreateList() {
    if (!isAuthenticated) return;
    setCreateListError(null);
    setCreateListOpen(true);
  }

  async function submitList(input: { name: string; description: string | null; isPublic: boolean }) {
    setCreateListError(null);
    if (createList.isPending) return;
    try {
      await createList.mutateAsync(input);
      sessionStorage.removeItem(`spektra:draft:list:${user?.id ?? 'guest'}:new:name`);
      sessionStorage.removeItem(`spektra:draft:list:${user?.id ?? 'guest'}:new:description`);
      setCreateListOpen(false);
    } catch (error) {
      setCreateListError(listErrorMessage(error));
    }
  }

  return (
    <div className="app-shell-bg min-h-screen">
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-72 flex-col overflow-y-auto border-r border-border-subtle bg-surface/80 shadow-floating backdrop-blur-2xl md:flex">
        <Sidebar onOpenCommandPalette={commandPalette.openPalette} onCreateList={openCreateList} shortcutLabel={commandPalette.shortcutLabel} recentItems={recentlyViewed.items} />
      </aside>

      <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col focus:outline-none md:ml-72">
        <Navbar onOpenCommandPalette={commandPalette.openPalette} />
        <EmailVerificationBanner />
        <div className="mx-auto w-full max-w-[1520px] flex-1 px-4 py-4 pb-28 sm:px-5 md:px-6 md:py-5 md:pb-7 xl:px-8">
          <Outlet />
          <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface/70 px-4 py-3 text-xs font-semibold text-content-tertiary shadow-xs backdrop-blur">
            <span>Spektra media command center</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-accent">Privacy</Link>
              <Link to="/terms" className="hover:text-accent">Terms</Link>
            </div>
          </footer>
        </div>
      </main>

      <BottomNav onOpenCommandPalette={commandPalette.openPalette} />
      <CommandPalette open={commandPalette.open} recentItems={recentlyViewed.items} onClose={commandPalette.closePalette} onCreateList={openCreateList} />
      <ListFormModal
        open={createListOpen}
        isPending={createList.isPending}
        error={createListError}
        onClose={() => setCreateListOpen(false)}
        onSubmit={submitList}
      />
    </div>
  );
}
