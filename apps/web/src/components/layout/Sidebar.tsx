import { Activity, BookMarked, Home, LogOut, Search } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/feed', label: 'Feed', icon: Activity },
  { to: '/lists', label: 'Lists', icon: BookMarked },
];

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <>
      <div className="px-4 py-5 border-b border-border">
        <span className="text-xl font-semibold tracking-tight text-content-primary">
          spek<span className="text-accent">.</span>tra
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-content-secondary hover:bg-bg-tertiary hover:text-content-primary'
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 px-2">
            <img src={user?.avatarUrl ?? ''} className="w-7 h-7 rounded-full bg-accent-light" alt="" />
            <span className="text-sm font-medium text-content-primary flex-1 truncate">{user?.username}</span>
            <button onClick={() => logout.mutate()} title="Log out" type="button">
              <LogOut size={15} className="text-content-tertiary hover:text-danger" />
            </button>
          </div>
        ) : (
          <Link to="/login" className="block text-center text-sm text-accent hover:text-accent-hover font-medium py-2">
            Sign in
          </Link>
        )}
      </div>
    </>
  );
}
