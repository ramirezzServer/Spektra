import { ArrowUpRight, Clock, Compass, Film, Gamepad2, Library, Search as SearchIcon, Sparkles, Tv, BookOpen, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ContentGrid } from '@/components/content/ContentGrid';
import { PosterImage } from '@/components/content/PosterImage';
import { DiscoveryEmptyState, SearchEmptyState, SearchErrorState } from '@/components/discovery/DiscoveryStates';
import { SEO } from '@/components/seo/SEO';
import { useSearch } from '@/hooks/useContent';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useRecentlyViewed, type RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatNumber } from '@/lib/formatters';
import { slugify } from '@/lib/slugs';
import { cn } from '@/lib/utils';
import type { ContentType } from '@/types';

const filters: Array<{ label: string; value: ContentType | 'all'; icon: typeof Sparkles }> = [
  { label: 'All', value: 'all', icon: Sparkles },
  { label: 'Films', value: 'film', icon: Film },
  { label: 'Series', value: 'series', icon: Tv },
  { label: 'Games', value: 'game', icon: Gamepad2 },
  { label: 'Books', value: 'book', icon: BookOpen },
];

const suggestions = ['Dune', 'Batman', 'Zelda', 'The Last of Us', 'Agatha Christie', 'Spider-Man', 'Foundation', 'Studio Ghibli'];

function recentPath(item: RecentlyViewedItem) {
  return `/content/${encodeURIComponent(item.type)}/${encodeURIComponent(item.externalId)}/${slugify(item.title) || 'content'}`;
}

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = filters.some((filter) => filter.value === searchParams.get('type')) ? (searchParams.get('type') as ContentType | 'all') : 'all';
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q')?.trim() ?? '');
  const [type, setType] = useState<ContentType | 'all'>(initialType);
  const { items: recentItems } = useRecentlyViewed();
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedQuery) next.set('q', debouncedQuery);
    if (type !== 'all') next.set('type', type);
    setSearchParams(next, { replace: true });
  }, [debouncedQuery, setSearchParams, type]);

  const search = useSearch(debouncedQuery, type);
  const items = search.data?.data ?? [];
  const total = search.data?.meta.total ?? items.length;
  const isIdle = debouncedQuery.length < 2;
  const isWaitingForDebounce = query.trim().length >= 2 && query.trim() !== debouncedQuery;
  const isLoading = search.isFetching || isWaitingForDebounce;
  const activeFilter = filters.find((filter) => filter.value === type)?.label ?? 'All';

  const resultLabel = useMemo(() => {
    if (isIdle || isLoading) return null;
    return `${formatNumber(total)} ${total === 1 ? 'result' : 'results'} for "${debouncedQuery}"`;
  }, [debouncedQuery, isIdle, isLoading, total]);

  function runSuggestion(value: string) {
    setQuery(value);
    setDebouncedQuery(value);
  }

  function clearSearch() {
    setQuery('');
    setDebouncedQuery('');
  }

  return (
    <div className="mx-auto w-full max-w-[1380px] space-y-5 overflow-x-hidden">
      <SEO title="Search" description="Search films, series, games, and books on Spektra." canonicalPath="/search" />
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-4 text-white shadow-panel md:p-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(91,77,255,0.55),transparent_25rem),radial-gradient(circle_at_88%_16%,rgba(20,184,166,0.24),transparent_22rem)]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/80">Content search</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-4xl">Search the real catalog.</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-200">Find provider-backed films, series, games, and books, then track or list them from the results.</p>
          </div>
          <Link to="/" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-black text-white hover:bg-white/20">
            <Compass className="h-4 w-4" aria-hidden="true" />
            Trending
          </Link>
        </div>
      </section>

      <div className="sticky top-16 z-10 space-y-3 rounded-3xl border border-border-subtle bg-surface/92 p-3 shadow-card backdrop-blur-xl md:top-4 md:p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-tertiary" />
            <input
              id="content-search"
              name="search"
              aria-label="Search content"
              autoFocus
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') clearSearch();
              }}
              className="w-full rounded-2xl border border-border bg-bg-subtle py-4 pl-12 pr-12 text-base font-black text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20"
              placeholder="Search films, series, games, books..."
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-content-tertiary hover:bg-surface hover:text-content-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-bg-subtle px-3 py-2 text-xs font-black text-content-tertiary">
            <Library className="h-4 w-4 text-accent" aria-hidden="true" />
            {resultLabel ?? (isIdle ? 'Type 2+ characters' : 'Searching real content')}
          </div>
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Content type filters">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setType(filter.value)}
              aria-pressed={type === filter.value}
              className={cn(
                'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-black text-content-secondary transition hover:border-border-strong hover:text-content-primary',
                type === filter.value && 'border-accent bg-accent-light text-accent shadow-sm',
              )}
            >
              <filter.icon className="h-4 w-4" aria-hidden="true" />
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {suggestions.slice(0, 6).map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => runSuggestion(suggestion)} className="shrink-0 rounded-full bg-bg-subtle px-3 py-1.5 text-xs font-black text-content-tertiary hover:text-accent">
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {!isIdle && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-black text-content-primary">{isLoading ? 'Searching...' : resultLabel}</p>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-content-tertiary">Filter: {activeFilter}</p>
        </div>
      )}

      {isIdle && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <SearchEmptyState />
          <section className="rounded-3xl border border-border-subtle bg-surface/90 p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-base font-black text-content-primary">Recently viewed</h2>
            </div>
            {recentItems.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {recentItems.slice(0, 6).map((item) => (
                  <Link key={`${item.type}:${item.externalId}`} to={recentPath(item)} className="group min-w-0 rounded-2xl border border-border-subtle bg-bg-subtle p-2 hover:border-accent/40">
                    <div className="aspect-[2/3] overflow-hidden rounded-xl bg-surface">
                      <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs font-black text-content-primary group-hover:text-accent">{item.title}</p>
                    <p className="mt-1 text-[10px] font-bold capitalize text-content-tertiary">{item.type}{item.releaseYear ? ` / ${item.releaseYear}` : ''}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <DiscoveryEmptyState
                title="No local recents yet"
                description="Open a content detail page and Spektra will keep a small local shortcut here. No private data or tokens are stored."
                primaryAction={{ label: 'Browse trending', to: '/' }}
              />
            )}
          </section>
          <section className="rounded-3xl border border-border-subtle bg-surface/90 p-4 shadow-card lg:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-base font-black text-content-primary">Query shortcuts</h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => runSuggestion(suggestion)} className="rounded-full border border-border bg-bg-subtle px-3 py-2 text-xs font-black text-content-secondary hover:border-accent/40 hover:text-accent">
                  {suggestion}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {!isIdle && search.isError && !isLoading && (
        <SearchErrorState
          message={getApiErrorMessage(search.error, 'The content provider or Spektra cache did not respond. Please try again in a moment.')}
          isOffline={!isOnline}
          onRetry={() => search.refetch()}
        />
      )}

      {!isIdle && !search.isError && <ContentGrid items={items} isLoading={isLoading} skeletonCount={18} />}

      {!isIdle && !search.isError && !isLoading && items.length === 0 && (
        <SearchEmptyState
          query={debouncedQuery}
          onRetry={() => search.refetch()}
          primaryAction={type !== 'all' ? { label: 'Search all types', onClick: () => setType('all') } : { label: 'Try Dune', onClick: () => runSuggestion('Dune') }}
        />
      )}

      {!isIdle && !isLoading && !search.isError && items.length > 0 && (
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-black text-accent hover:text-accent-hover">
          Back to trending
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
