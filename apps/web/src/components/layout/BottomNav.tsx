import { Home, Library, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function BottomNav() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/library', label: 'Library', icon: Library },
    { to: isAuthenticated && user?.username ? `/profile/${user.username}` : '/login', label: isAuthenticated ? 'Profile' : 'Sign in', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 px-3 md:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }}
    >
      <div className="mx-auto flex max-w-md rounded-2xl border border-border-subtle bg-surface/90 p-1.5 shadow-panel backdrop-blur-xl">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="flex-1 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100">
            {({ isActive }) => (
              <div
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 ${
                  isActive ? 'bg-accent text-white shadow-sm' : 'text-content-tertiary'
                }`}
              >
                <item.icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-bold leading-none">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
