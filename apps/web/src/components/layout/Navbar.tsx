import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/stores/authStore';

export function Navbar({ desktop = false }: { desktop?: boolean }) {
  const user = useAuthStore((state) => state.user);

  if (desktop) {
    return (
      <div className="flex h-16 items-center justify-between border-b border-app-border px-4">
        <Link to="/" className="text-lg font-bold tracking-normal text-app-text">Spektra</Link>
        <Avatar src={user?.avatarUrl} alt={user?.username ?? 'Guest'} size="sm" />
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-app-border bg-app-bg/95 px-4 backdrop-blur md:hidden">
      <Link to="/" className="text-lg font-bold text-app-text">Spektra</Link>
      <div className="flex items-center gap-2">
        <Link className="grid min-h-11 min-w-11 place-items-center rounded-md text-app-muted" to="/search" aria-label="Search">
          <Search className="h-5 w-5" />
        </Link>
        <Link to={user ? `/profile/${user.username}` : '/login'} aria-label="Profile">
          <Avatar src={user?.avatarUrl} alt={user?.username ?? 'Guest'} size="sm" />
        </Link>
      </div>
    </header>
  );
}
