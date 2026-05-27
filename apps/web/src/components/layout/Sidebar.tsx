import { BookMarked, Home, List, Search, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/feed', label: 'Feed', icon: Users },
  { to: '/lists', label: 'Lists', icon: List },
  { to: '/profile/demo', label: 'Profile', icon: BookMarked },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-app-border bg-app-surface md:block">
      <Navbar desktop />
      <nav className="space-y-1 p-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                isActive ? 'bg-indigo-50 text-app-accent' : 'text-app-muted hover:bg-slate-100 hover:text-app-text'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
