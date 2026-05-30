import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <header className="md:hidden sticky top-0 z-20 bg-surface border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <Link to="/" className="text-lg font-semibold tracking-tight text-content-primary">
          spek<span className="text-accent">.</span>tra
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/search" aria-label="Search" className="p-2 rounded-md text-content-secondary hover:bg-bg-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">
            <Search size={19} aria-hidden="true" />
          </Link>
          {isAuthenticated ? (
            <Link to={`/profile/${user?.username}`} aria-label="Open profile">
              <Avatar src={user?.avatarUrl} alt={user?.username ?? 'User'} size="sm" />
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-medium text-accent">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
