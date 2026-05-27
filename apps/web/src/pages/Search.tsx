import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import type { ContentType } from '@/types';
import { sampleContent } from './mockData';

const filters: Array<ContentType | 'all'> = ['all', 'film', 'series', 'game', 'book'];

export function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<ContentType | 'all'>('all');

  useEffect(() => inputRef.current?.focus(), []);

  const results = useMemo(() => {
    const normalized = query.toLowerCase();
    return sampleContent.filter((item) => (type === 'all' || item.type === type) && item.title.toLowerCase().includes(normalized));
  }, [query, type]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="relative mt-4">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-app-muted" />
          <Input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Films, series, games, books..." className="pl-10" />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => (
          <button key={filter} onClick={() => setType(filter)} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold capitalize ${type === filter ? 'border-app-accent bg-indigo-50 text-app-accent' : 'border-app-border bg-app-surface text-app-muted'}`}>
            {filter}
          </button>
        ))}
      </div>
      {query ? (
        results.length ? <ContentGrid items={results} /> : <EmptySearch />
      ) : (
        <div className="rounded-lg border border-app-border bg-app-surface p-6">
          <Badge>Try "Dune", "Hades", or "Tomorrow"</Badge>
        </div>
      )}
    </div>
  );
}

function EmptySearch() {
  return (
    <div className="grid min-h-80 place-items-center rounded-lg border border-dashed border-app-border bg-app-surface p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-indigo-50 text-app-accent">
          <SearchIcon className="h-10 w-10" />
        </div>
        <h2 className="text-lg font-bold">No matches found</h2>
        <p className="mt-1 text-sm text-app-muted">Try a different title or content type.</p>
      </div>
    </div>
  );
}
