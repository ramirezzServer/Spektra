import { Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ContentGrid } from '@/components/content/ContentGrid';
import { SEO } from '@/components/seo/SEO';
import { useSearch } from '@/hooks/useContent';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { ContentType } from '@/types';

const filters: Array<{ label: string; value: ContentType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Films', value: 'film' },
  { label: 'Series', value: 'series' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
];

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = filters.some((filter) => filter.value === searchParams.get('type')) ? (searchParams.get('type') as ContentType | 'all') : 'all';
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q')?.trim() ?? '');
  const [type, setType] = useState<ContentType | 'all'>(initialType);

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

  const resultLabel = useMemo(() => {
    if (isIdle || isLoading) return null;
    return `${formatNumber(total)} ${total === 1 ? 'result' : 'results'} for "${debouncedQuery}"`;
  }, [debouncedQuery, isIdle, isLoading, total]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 overflow-x-hidden">
      <SEO title="Search" description="Search films, series, games, and books on Spektra." canonicalPath="/search" />
      <div className="sticky top-16 z-10 space-y-3 rounded-3xl border border-border-subtle bg-surface/88 p-3 shadow-card backdrop-blur-xl md:top-4 md:p-4">
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
              if (event.key === 'Escape') setQuery('');
            }}
            className="w-full rounded-2xl border border-border bg-bg-subtle py-3.5 pl-12 pr-12 text-base font-semibold text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
            placeholder="Search films, series, games, books..."
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-content-tertiary hover:bg-surface hover:text-content-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setType(filter.value)}
              aria-pressed={type === filter.value}
              className={cn(
                'shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-content-secondary transition hover:border-border-strong hover:text-content-primary',
                type === filter.value && 'border-accent bg-accent-light text-accent shadow-sm',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {resultLabel && <p className="text-sm font-medium text-content-secondary">{resultLabel}</p>}

      {isIdle && (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center text-sm font-medium text-content-tertiary shadow-card">
          Start typing to search across films, series, games, and books.
        </div>
      )}

      {!isIdle && <ContentGrid items={items} isLoading={isLoading} skeletonCount={12} />}

      {!isIdle && search.isError && !isLoading && (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center shadow-card" role="status">
          <div>
            <h2 className="text-base font-semibold text-content-primary">Search is unavailable</h2>
            <p className="mt-2 text-sm text-content-tertiary">{getApiErrorMessage(search.error, 'Please try again in a moment.')}</p>
          </div>
        </div>
      )}

      {!isIdle && !search.isError && !isLoading && items.length === 0 && (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center shadow-card">
          <div>
            <h2 className="text-base font-semibold text-content-primary">No results found</h2>
            <p className="mt-2 text-sm text-content-tertiary">Try a different title or content type.</p>
          </div>
        </div>
      )}
    </div>
  );
}
