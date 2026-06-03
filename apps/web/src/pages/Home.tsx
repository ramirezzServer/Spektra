import { Activity, BookMarked, CheckCircle2, Clapperboard, Compass, DatabaseZap, Film, Gamepad2, Library, RefreshCw, Search, Sparkles, Tv, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentGrid } from '@/components/content/ContentGrid';
import { DiscoveryEmptyState, ProviderMissingState } from '@/components/discovery/DiscoveryStates';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { ContentCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useTrending } from '@/hooks/useContent';
import { useUserStats } from '@/hooks/useLibrary';
import { formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { ContentType } from '@/types';

const tabs: Array<{ label: string; value: ContentType | 'all'; icon: typeof Sparkles }> = [
  { label: 'All', value: 'all', icon: Sparkles },
  { label: 'Films', value: 'film', icon: Film },
  { label: 'Series', value: 'series', icon: Tv },
  { label: 'Games', value: 'game', icon: Gamepad2 },
  { label: 'Books', value: 'book', icon: BookOpen },
];

const queryChips = ['Dune', 'Batman', 'Final Fantasy', 'Foundation', 'The Hobbit'];

const statusChips = [
  { label: 'Real content APIs', icon: DatabaseZap },
  { label: 'Track films, series, games, books', icon: CheckCircle2 },
  { label: 'Social activity', icon: Activity },
];

export function Home() {
  const [active, setActive] = useState<ContentType | 'all'>('all');
  const { user, isAuthenticated } = useAuthStore();
  const stats = useUserStats(isAuthenticated ? user?.username : undefined);
  const trending = useTrending(active, 24);
  const items = trending.data ?? [];
  const featuredItems = items.slice(0, 8);
  const featuredKeys = new Set(featuredItems.map((item) => `${item.type}:${item.externalId}`));
  const moreItems = items.filter((item) => !featuredKeys.has(`${item.type}:${item.externalId}`));

  return (
    <div className="space-y-5 overflow-x-hidden">
      <SEO title="Discover" description="Discover real trending films, series, games, and books with Spektra." canonicalPath="/" />
      <header className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(91,77,255,0.58),transparent_26rem),radial-gradient(circle_at_72%_18%,rgba(20,184,166,0.34),transparent_24rem),linear-gradient(135deg,rgba(15,23,42,0),rgba(8,13,27,0.85))]" aria-hidden="true" />
        <div className="relative grid gap-5 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/85">
              <Clapperboard className="h-4 w-4" aria-hidden="true" />
              Spektra discovery cockpit
            </p>
            <h1 className="mt-2 max-w-3xl text-balance text-3xl font-black tracking-tight md:text-5xl">Find what is actually worth tracking next.</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-200 md:text-base">Search real provider content, save your status, build lists, and move through Spektra without waiting on fake recommendations.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {statusChips.map((chip) => (
                <span key={chip.label} className="inline-flex min-h-8 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-xs font-black text-slate-100 backdrop-blur">
                  <chip.icon className="h-3.5 w-3.5 text-cyan-200" aria-hidden="true" />
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link to="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:bg-slate-100">
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link to="/library" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
              <Library className="h-4 w-4" />
              Library
            </Link>
            {isAuthenticated ? (
              <Link to="/feed" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
                <Activity className="h-4 w-4" />
                Feed
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="sticky top-16 z-10 rounded-3xl border border-border-subtle bg-surface/90 p-2 shadow-card backdrop-blur-xl md:top-4">
        <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Trending filters">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active === tab.value}
                onClick={() => setActive(tab.value)}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl px-3 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
                  active === tab.value ? 'bg-accent text-white shadow-sm' : 'text-content-secondary hover:bg-bg-tertiary hover:text-content-primary',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-xl font-black text-content-primary"><Compass className="h-5 w-5 text-accent" /> Trending This Week</h2>
            <p className="mt-1 text-sm font-semibold text-content-tertiary">Powered by existing Spektra content and provider data.</p>
          </div>
          <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActive(tab.value)}
                className={cn(
                  'min-h-9 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20',
                  active === tab.value ? 'bg-accent text-white shadow-sm' : 'border border-border-subtle bg-surface text-content-secondary hover:bg-bg-tertiary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {trending.isLoading && (
          <div className="space-y-4">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className={cn('shrink-0', index === 0 ? 'w-48 md:w-56' : 'w-36 md:w-44')}>
                  <ContentCardSkeleton />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index}>
                  <ContentCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        )}

        {trending.isFetching && !trending.isLoading ? <p className="text-xs font-bold uppercase tracking-[0.16em] text-content-tertiary">Refreshing real data...</p> : null}

        {trending.isError && (
          <div className="space-y-3">
            <ErrorState message="Unable to load trending content from Spektra right now." />
            <Button type="button" variant="secondary" onClick={() => trending.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!trending.isLoading && !trending.isError && items.length === 0 && <ProviderMissingState />}

        {!trending.isLoading && !trending.isError && featuredItems.length > 0 && (
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5 md:-mx-6 md:px-6 xl:-mx-8 xl:px-8">
            <div className="flex gap-4">
              {featuredItems.map((item, index) => (
                <div key={`${item.type}-${item.externalId}`} className={cn('shrink-0', index === 0 ? 'w-48 md:w-56' : 'w-36 md:w-44')}>
                  <ContentCard item={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {moreItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-black text-content-primary">More to Explore</h2>
          <ContentGrid items={moreItems} skeletonCount={12} />
        </section>
      )}

      <section className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-border-subtle bg-surface/90 p-4 shadow-card">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="text-base font-black text-content-primary">Search shortcuts</h2>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {queryChips.map((query) => (
              <Link key={query} to={`/search?q=${encodeURIComponent(query)}`} className="rounded-full border border-border bg-bg-subtle px-3 py-2 text-xs font-black text-content-secondary hover:border-accent/40 hover:text-accent">
                {query}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {isAuthenticated ? (
            <div className="rounded-3xl border border-border-subtle bg-surface/90 p-4 shadow-card">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-content-tertiary">Your tracking</p>
              {stats.isLoading ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </div>
              ) : stats.data ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl bg-bg-subtle p-3">
                    <p className="text-lg font-black text-content-primary">{formatNumber(stats.data.total)}</p>
                    <p className="text-[10px] font-bold text-content-tertiary">Total</p>
                  </div>
                  <div className="rounded-2xl bg-info-light p-3">
                    <p className="text-lg font-black text-info-text">{formatNumber(stats.data.byStatus.in_progress)}</p>
                    <p className="text-[10px] font-bold text-info-text">Active</p>
                  </div>
                  <div className="rounded-2xl bg-success-light p-3">
                    <p className="text-lg font-black text-success-text">{formatNumber(stats.data.byStatus.done)}</p>
                    <p className="text-[10px] font-bold text-success-text">Done</p>
                  </div>
                </div>
              ) : (
                <Link to="/library" className="mt-3 block rounded-2xl border border-dashed border-border bg-bg-subtle px-3 py-3 text-sm font-bold text-content-secondary hover:text-accent">Start tracking your first item.</Link>
              )}
            </div>
          ) : (
            <DiscoveryEmptyState
              title="Start tracking"
              description="Sign in to save statuses, ratings, reviews, and private lists."
              primaryAction={{ label: 'Sign in', to: '/login' }}
              secondaryAction={{ label: 'Search first', to: '/search' }}
            />
          )}

          <Link to="/lists" className="rounded-3xl border border-border-subtle bg-surface/90 p-4 shadow-card hover:border-accent/30">
            <BookMarked className="h-5 w-5 text-accent" aria-hidden="true" />
            <p className="mt-2 text-sm font-black text-content-primary">Create a list</p>
            <p className="mt-1 text-xs font-semibold text-content-tertiary">Collect real content into a focused watch, read, or play queue.</p>
          </Link>
          <Link to="/feed" className="rounded-3xl border border-border-subtle bg-surface/90 p-4 shadow-card hover:border-accent/30">
            <Activity className="h-5 w-5 text-accent" aria-hidden="true" />
            <p className="mt-2 text-sm font-black text-content-primary">Explore global feed</p>
            <p className="mt-1 text-xs font-semibold text-content-tertiary">See social activity already available in Spektra.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
