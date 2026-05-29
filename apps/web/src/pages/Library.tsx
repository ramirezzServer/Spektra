import { useMemo, useState } from 'react';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { SEO } from '@/components/seo/SEO';
import { useMyLibrary } from '@/hooks/useLibrary';
import type { ContentItem, ContentType, EntryStatus } from '@/types';

const statuses: Array<{ label: string; value?: EntryStatus }> = [
  { label: 'All' },
  { label: 'Want', value: 'want' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const types: Array<{ label: string; value?: ContentType }> = [
  { label: 'All' },
  { label: 'Films', value: 'film' },
  { label: 'Series', value: 'series' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
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
  const library = useMyLibrary({ status, type, sort, page, perPage: 20 });
  const entries = library.data?.data ?? [];
  const items = useMemo(() => entries.map((entry) => entry.content).filter((item): item is ContentItem => Boolean(item)), [entries]);

  function resetPage(action: () => void) {
    action();
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <SEO title="Library" noIndex />
      <div>
        <h1 className="text-2xl font-semibold text-content-primary">Library</h1>
        <p className="mt-1 text-sm text-content-secondary">Your saved content, ratings, and reviews.</p>
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {statuses.map((tab) => (
            <Button key={tab.label} variant={status === tab.value ? 'primary' : 'secondary'} onClick={() => resetPage(() => setStatus(tab.value))}>
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((tab) => (
            <Button key={tab.label} variant={type === tab.value ? 'primary' : 'secondary'} onClick={() => resetPage(() => setType(tab.value))}>
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {sorts.map((option) => (
            <Button key={option.value} variant={sort === option.value ? 'primary' : 'secondary'} onClick={() => resetPage(() => setSort(option.value))}>
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <ContentGrid items={items} entries={entries} isLoading={library.isLoading} />
      {library.isError && (
        <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary" role="status">
          Unable to load your library right now.
        </div>
      )}
      {!library.isLoading && !library.isError && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary">
          Your library is empty for this view.
        </div>
      )}
      <Pagination page={page} lastPage={library.data?.meta.lastPage ?? 1} isFetching={library.isFetching} onPageChange={setPage} />
    </div>
  );
}
