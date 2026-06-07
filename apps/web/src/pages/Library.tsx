import { BookMarked, BookOpen, Clapperboard, Compass, Film, Gamepad2, Library, RefreshCw, Search, SlidersHorizontal, Star, Tv, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Pagination } from '@/components/ui/Pagination';
import { SEO } from '@/components/seo/SEO';
import { useMyLibrary, useUserStats } from '@/hooks/useLibrary';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { ContentItem, ContentType, EntryStatus } from '@/types';

const statuses: Array<{ label: string; value?: EntryStatus }> = [
  { label: 'All' },
  { label: 'Want', value: 'want' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const types: Array<{ label: string; value?: ContentType; icon: typeof Library }> = [
  { label: 'All', icon: Library },
  { label: 'Films', value: 'film', icon: Film },
  { label: 'Series', value: 'series', icon: Tv },
  { label: 'Games', value: 'game', icon: Gamepad2 },
  { label: 'Books', value: 'book', icon: BookOpen },
];

const sorts = [
  { label: 'Recent', value: 'updated_desc' },
  { label: 'Title', value: 'title_asc' },
  { label: 'Rating', value: 'rating_desc' },
] as const;

export function LibraryPage() {
  const [status, setStatus] = useState<EntryStatus | undefined>();
  const [type, setType] = useState<ContentType | undefined>();
  const [sort, setSort] = useState<(typeof sorts)[number]['value']>('updated_desc');
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const { isOnline } = useOnlineStatus();
  const stats = useUserStats(user?.username);
  const library = useMyLibrary({ status, type, sort, page, perPage: 24 });
  const entries = useMemo(() => library.data?.data ?? [], [library.data?.data]);
  const items = useMemo(() => entries.map((entry) => entry.content).filter((item): item is ContentItem => Boolean(item)), [entries]);

  function resetPage(action: () => void) {
    action();
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <SEO title="Library" noIndex />
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(91,77,255,0.55),transparent_24rem),radial-gradient(circle_at_88%_16%,rgba(20,184,166,0.24),transparent_22rem)]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/80">
              <Library className="h-4 w-4" aria-hidden="true" />
              Collection studio
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Library</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-200">Your saved content, ratings, reviews, and current queue in one dense workspace.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/search" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-950 hover:bg-slate-100">
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white hover:bg-white/20">
              <Compass className="h-4 w-4" />
              Discover
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Total', value: stats.data?.total ?? 0, icon: Library },
          { label: 'Want', value: stats.data?.byStatus.want ?? 0, icon: Compass },
          { label: 'Active', value: stats.data?.byStatus.in_progress ?? 0, icon: SlidersHorizontal },
          { label: 'Done', value: stats.data?.byStatus.done ?? 0, icon: Clapperboard },
          { label: 'Rated', value: stats.data?.ratedCount ?? 0, icon: Star },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
            <card.icon className="h-5 w-5 text-accent" aria-hidden="true" />
            <p className="mt-3 text-2xl font-black text-content-primary">{stats.isLoading ? '-' : formatNumber(card.value)}</p>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="sticky top-16 z-10 space-y-3 rounded-3xl border border-border-subtle bg-surface/92 p-3 shadow-card backdrop-blur-xl md:top-4">
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Library status filters">
          {statuses.map((tab) => (
            <button key={tab.label} type="button" role="tab" aria-selected={status === tab.value} onClick={() => resetPage(() => setStatus(tab.value))} className={cn('min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20', status === tab.value ? 'bg-accent text-white shadow-sm' : 'border border-border bg-surface text-content-secondary hover:bg-bg-subtle hover:text-content-primary')}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Library type filters">
          {types.map((tab) => (
            <button key={tab.label} type="button" role="tab" aria-selected={type === tab.value} onClick={() => resetPage(() => setType(tab.value))} className={cn('inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20', type === tab.value ? 'bg-accent text-white shadow-sm' : 'border border-border bg-surface text-content-secondary hover:bg-bg-subtle hover:text-content-primary')}>
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Library sort controls">
          {sorts.map((option) => (
            <button key={option.value} type="button" onClick={() => resetPage(() => setSort(option.value))} className={cn('min-h-9 shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20', sort === option.value ? 'bg-accent-light text-accent shadow-sm' : 'border border-border bg-surface text-content-secondary hover:bg-bg-subtle hover:text-content-primary')}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <ContentGrid items={items} entries={entries} isLoading={library.isLoading} density="dense" skeletonCount={18} />
      {library.isError ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card" role="status">
          {isOnline ? <RefreshCw className="mx-auto h-10 w-10 text-danger" aria-hidden="true" /> : <WifiOff className="mx-auto h-10 w-10 text-warning" aria-hidden="true" />}
          <h2 className="mt-3 text-lg font-black text-content-primary">{isOnline ? 'Library is unavailable' : 'You are offline'}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-content-tertiary">{isOnline ? getApiErrorMessage(library.error, 'Unable to load your library right now.') : 'Your library needs a connection to refresh this view.'}</p>
          <button type="button" onClick={() => library.refetch()} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-black text-content-primary hover:bg-bg-subtle">
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : null}
      {!library.isLoading && !library.isError && items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card">
          <Library className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-black text-content-primary">Your library is empty for this view.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-content-tertiary">Search real content or jump back to discovery to start tracking films, series, games, and books.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link to="/search" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-black text-white shadow-sm hover:bg-accent-hover">Search</Link>
            <Link to="/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-black text-content-primary hover:bg-bg-subtle">Home discovery</Link>
            <Link to="/lists" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-black text-content-primary hover:bg-bg-subtle">
              <BookMarked className="h-4 w-4" />
              Create list
            </Link>
          </div>
        </div>
      ) : null}
      <Pagination page={page} lastPage={library.data?.meta.lastPage ?? 1} isFetching={library.isFetching} onPageChange={setPage} />
    </div>
  );
}
