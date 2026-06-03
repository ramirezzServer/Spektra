import { Command, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';

interface NavbarProps {
  onOpenCommandPalette: () => void;
}

export function Navbar({ onOpenCommandPalette }: NavbarProps) {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface/80 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/" className="text-xl font-black tracking-tight text-content-primary">
          spek<span className="text-accent">.</span>tra
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-content-secondary hover:bg-bg-tertiary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            <Command size={19} aria-hidden="true" />
          </button>
          <Link to="/search" aria-label="Search" className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-content-secondary hover:bg-bg-tertiary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/20 motion-reduce:transition-none motion-reduce:active:scale-100">
            <Search size={19} aria-hidden="true" />
          </Link>
          {isAuthenticated ? (
            <Link to={`/profile/${user?.username}`} aria-label="Open profile" className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100">
              <Avatar src={user?.avatarUrl} alt={user?.username ?? 'User'} size="sm" />
            </Link>
          ) : (
            <Link to="/login" className="rounded-xl bg-accent px-3 py-2 text-sm font-bold text-white">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
