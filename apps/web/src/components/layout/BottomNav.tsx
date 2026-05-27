import { Home, Search, User, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/feed', label: 'Feed', icon: Users },
  { to: '/profile/demo', label: 'Profile', icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-14 grid-cols-4 border-t border-app-border bg-app-surface/95 px-2 backdrop-blur md:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)', height: 'calc(56px + env(safe-area-inset-bottom) + 8px)' }}>
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-md text-xs font-semibold ${
              isActive ? 'text-app-accent' : 'text-app-muted'
            }`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
