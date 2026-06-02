import { Activity, BookMarked, CircleDot, Compass, Home, Library, LogOut, Plus, Search, ShieldAlert, ShieldCheck, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats } from '@/hooks/useLibrary';
import { formatNumber } from '@/lib/formatters';
import { getRecentContent, type RecentContentItem } from '@/lib/recentContent';
import { slugify } from '@/lib/slugs';

const baseNavItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/feed', label: 'Feed', icon: Activity },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/lists', label: 'Lists', icon: BookMarked },
];

const quickActions = [
  { to: '/search', label: 'Search content', icon: Search },
  { to: '/lists', label: 'Create list', icon: Plus },
  { to: '/library', label: 'Open library', icon: Library },
  { to: '/feed', label: 'Explore feed', icon: Compass },
];

function recentContentPath(item: RecentContentItem) {
  return `/content/${encodeURIComponent(item.type)}/${encodeURIComponent(item.externalId)}/${slugify(item.title) || 'content'}`;
}

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const stats = useUserStats(isAuthenticated ? user?.username : undefined);
  const [recent, setRecent] = useState<RecentContentItem[]>(() => getRecentContent());
  const navItems = isAuthenticated && user?.username
    ? [...baseNavItems, { to: `/profile/${user.username}`, label: 'Profile', icon: User }]
    : baseNavItems;

  useEffect(() => {
    function refreshRecent() {
      setRecent(getRecentContent());
    }

    window.addEventListener('storage', refreshRecent);
    window.addEventListener('spektra:recent-content-updated', refreshRecent);
    return () => {
      window.removeEventListener('storage', refreshRecent);
      window.removeEventListener('spektra:recent-content-updated', refreshRecent);
    };
  }, []);

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-4 py-5">
        <div className="rounded-3xl bg-slate-950 p-4 text-white shadow-floating">
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-black tracking-tight">
              spek<span className="text-cyan-300">.</span>tra
            </span>
            <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">A command center for everything you watch, play, and read.</p>
        </div>
      </div>

      <div className="flex-1 space-y-4 px-3 pb-4">
        <section aria-label="Primary navigation">
          <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-content-tertiary">Navigate</div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {({ isActive }) => (
                  <div
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-bold transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                      isActive
                        ? 'bg-accent text-white shadow-glow'
                        : 'text-content-secondary hover:bg-white/75 hover:text-content-primary'
                    }`}
                  >
                    <item.icon size={17} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </section>

        <section className="rounded-3xl border border-border-subtle bg-white/70 p-3 shadow-innerSubtle backdrop-blur" aria-label="Quick actions">
          <div className="mb-2 flex items-center gap-2 px-1 text-[10px] font-black uppercase tracking-[0.18em] text-content-tertiary">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Quick Actions
          </div>
          <div className="grid gap-1.5">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex min-h-10 items-center gap-2 rounded-2xl px-2.5 text-xs font-bold text-content-secondary transition hover:bg-surface hover:text-content-primary focus-ring"
              >
                <action.icon className="h-4 w-4 text-accent" aria-hidden="true" />
                {action.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border-subtle bg-white/70 p-3 shadow-innerSubtle backdrop-blur" aria-label="Library snapshot">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-content-tertiary">Library Snapshot</p>
            {stats.isFetching ? <span className="text-[10px] font-bold text-content-tertiary">Syncing</span> : null}
          </div>
          {isAuthenticated ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-surface p-2 shadow-xs">
                <p className="text-base font-black text-content-primary">{stats.isLoading ? '-' : formatNumber(stats.data?.total ?? 0)}</p>
                <p className="text-[10px] font-bold text-content-tertiary">Total</p>
              </div>
              <div className="rounded-2xl bg-success-light p-2 shadow-xs">
                <p className="text-base font-black text-success-text">{stats.isLoading ? '-' : formatNumber(stats.data?.byStatus.done ?? 0)}</p>
                <p className="text-[10px] font-bold text-success-text">Done</p>
              </div>
              <div className="rounded-2xl bg-info-light p-2 shadow-xs">
                <p className="text-base font-black text-info-text">{stats.isLoading ? '-' : formatNumber(stats.data?.byStatus.in_progress ?? 0)}</p>
                <p className="text-[10px] font-bold text-info-text">Active</p>
              </div>
            </div>
          ) : (
            <Link to="/login" className="block rounded-2xl border border-dashed border-border bg-surface px-3 py-3 text-xs font-bold text-content-secondary hover:text-accent">
              Sign in to see your library pulse.
            </Link>
          )}
        </section>

        <section className="rounded-3xl border border-border-subtle bg-white/70 p-3 shadow-innerSubtle backdrop-blur" aria-label="Recently viewed">
          <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-content-tertiary">
            <CircleDot className="h-3.5 w-3.5 text-accent-secondary" />
            Recent
          </div>
          {recent.length > 0 ? (
            <div className="space-y-1.5">
              {recent.slice(0, 4).map((item) => (
                <Link key={item.id} to={recentContentPath(item)} className="group flex min-h-10 min-w-0 items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-surface focus-ring">
                  <span className="h-8 w-6 shrink-0 overflow-hidden rounded-md bg-bg-tertiary">
                    {item.posterUrl ? <img src={item.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-content-primary group-hover:text-accent">{item.title}</span>
                    <span className="block text-[10px] font-bold capitalize text-content-tertiary">{item.type}{item.releaseYear ? ` / ${item.releaseYear}` : ''}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <Link to="/search" className="block rounded-2xl border border-dashed border-border bg-surface px-3 py-3 text-xs font-bold text-content-secondary hover:text-accent">
              Start exploring to build local shortcuts.
            </Link>
          )}
        </section>
      </div>

      <div className="border-t border-white/70 p-3">
        {isAuthenticated ? (
          <div className="rounded-3xl border border-border-subtle bg-white/80 p-3 shadow-card backdrop-blur">
            <div className="flex items-center gap-2.5">
              <Link to={`/profile/${user?.username}`} className="shrink-0 rounded-full focus-ring">
                <Avatar src={user?.avatarUrl} alt={user?.username ?? 'User'} size="sm" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/profile/${user?.username}`} className="block truncate text-sm font-black text-content-primary hover:text-accent">
                  @{user?.username}
                </Link>
                <Badge variant={user?.emailVerified ? 'success' : 'warning'} className="mt-1">
                  {user?.emailVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                  {user?.emailVerified ? 'Verified' : 'Verify email'}
                </Badge>
              </div>
              <button
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl text-content-tertiary transition hover:bg-bg-subtle hover:text-danger active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
                onClick={() => logout.mutate()}
                title="Log out"
                aria-label="Log out"
                type="button"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="flex min-h-12 items-center justify-center rounded-2xl bg-accent text-sm font-black text-white shadow-glow hover:bg-accent-hover">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
