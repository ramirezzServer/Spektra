import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ContentGrid } from '@/components/content/ContentGrid';
import { useSearch } from '@/hooks/useContent';
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
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [type, setType] = useState<ContentType | 'all'>('all');

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const search = useSearch(debouncedQuery, type);
  const items = search.data?.data ?? [];
  const total = search.data?.meta.total ?? items.length;
  const isIdle = debouncedQuery.length < 2;
  const isWaitingForDebounce = query.trim().length >= 2 && query.trim() !== debouncedQuery;
  const isLoading = search.isFetching || isWaitingForDebounce;

  const resultLabel = useMemo(() => {
    if (isIdle || isLoading) return null;
    return `${total} ${total === 1 ? 'result' : 'results'} for "${debouncedQuery}"`;
  }, [debouncedQuery, isIdle, isLoading, total]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 overflow-x-hidden">
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-tertiary" />
          <input
            id="content-search"
            aria-label="Search content"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-3 pl-12 pr-4 text-base text-content-primary placeholder:text-content-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            placeholder="Search films, series, games, books..."
          />
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setType(filter.value)}
              className={cn(
                'shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-content-secondary transition hover:border-border-strong hover:text-content-primary',
                type === filter.value && 'border-accent bg-accent-light text-accent',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {resultLabel && <p className="text-sm font-medium text-content-secondary">{resultLabel}</p>}

      {isIdle && (
        <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 text-center text-sm text-content-tertiary">
          Start typing to search across films, series, games, and books.
        </div>
      )}

      {!isIdle && <ContentGrid items={items} isLoading={isLoading} skeletonCount={12} />}

      {!isIdle && search.isError && !isLoading && (
        <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 text-center" role="status">
          <div>
            <h2 className="text-base font-semibold text-content-primary">Search is unavailable</h2>
            <p className="mt-2 text-sm text-content-tertiary">Please try again in a moment.</p>
          </div>
        </div>
      )}

      {!isIdle && !search.isError && !isLoading && items.length === 0 && (
        <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 text-center">
          <div>
            <h2 className="text-base font-semibold text-content-primary">No results found</h2>
            <p className="mt-2 text-sm text-content-tertiary">Try a different title or content type.</p>
          </div>
        </div>
      )}
    </div>
  );
}
