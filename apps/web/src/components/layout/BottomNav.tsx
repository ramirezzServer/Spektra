import { Home, Library, Search, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function BottomNav() {
  const user = useAuthStore((state) => state.user);
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/search', label: 'Search', icon: Search },
    { to: '/library', label: 'Library', icon: Library },
    { to: '/profile/' + (user?.username ?? ''), label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)' }}
    >
      <div className="flex">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="flex-1">
            {({ isActive }) => (
              <div
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center pt-2 pb-1 gap-0.5 min-h-[44px] ${
                  isActive ? 'text-accent' : 'text-content-tertiary'
                }`}
              >
                <item.icon size={20} aria-hidden="true" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
