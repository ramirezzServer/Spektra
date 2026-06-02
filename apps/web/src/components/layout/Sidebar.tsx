import { Activity, BookMarked, Home, Library, LogOut, Search } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/feed', label: 'Feed', icon: Activity },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/lists', label: 'Lists', icon: BookMarked },
];

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <>
      <div className="border-b border-border-subtle px-4 py-5">
        <span className="text-2xl font-black tracking-tight text-content-primary">
          spek<span className="text-accent">.</span>tra
        </span>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-content-tertiary">Track everything</p>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {({ isActive }) => (
              <div
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                  isActive
                    ? 'bg-accent text-white shadow-glow'
                    : 'text-content-secondary hover:bg-bg-tertiary hover:text-content-primary'
                }`}
              >
                <item.icon size={17} aria-hidden="true" />
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border-subtle px-3 py-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 rounded-2xl border border-border-subtle bg-bg-subtle p-2">
            <Avatar src={user?.avatarUrl} alt={user?.username ?? 'User'} size="sm" />
            <span className="flex-1 truncate text-sm font-bold text-content-primary">{user?.username}</span>
            <button className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-content-tertiary transition hover:bg-surface hover:text-danger active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100" onClick={() => logout.mutate()} title="Log out" aria-label="Log out" type="button">
              <LogOut size={15} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="flex min-h-12 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-sm hover:bg-accent-hover">
            Sign in
          </Link>
        )}
      </div>
    </>
  );
}
