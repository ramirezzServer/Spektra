import { Grid2X2, List, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListItemRow } from '@/components/lists/ListItemRow';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import type { ListItem } from '@/types';

interface ListItemGridProps {
  items: ListItem[];
  page: number;
  lastPage: number;
  isOwner?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  isPending?: boolean;
  emptyMessage: string;
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  onPageChange: (page: number) => void;
  onMove: (fromIndex: number, direction: -1 | 1) => void;
  onRemove: (item: ListItem) => void;
}

export function ListItemGrid({ items, page, lastPage, isOwner, isLoading, isError, isFetching, isPending, emptyMessage, view, onViewChange, onPageChange, onMove, onRemove }: ListItemGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-48 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState message="Unable to load list items." />;
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card">
        <Plus className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-black text-content-primary">This list is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-content-tertiary">{emptyMessage}</p>
        <Link to="/search" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-sm font-black text-white shadow-sm hover:bg-accent-hover">
          <Search className="h-4 w-4" />
          Search content
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-content-primary">{items.length} visible items</p>
        <div className="inline-flex rounded-2xl border border-border-subtle bg-surface p-1 shadow-xs" aria-label="List item view">
          {[
            { value: 'list' as const, icon: List, label: 'List' },
            { value: 'grid' as const, icon: Grid2X2, label: 'Grid' },
          ].map((option) => (
            <button key={option.value} type="button" onClick={() => onViewChange(option.value)} className={cn('inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20', view === option.value ? 'bg-accent text-white shadow-sm' : 'text-content-secondary hover:bg-bg-subtle hover:text-content-primary')}>
              <option.icon className="h-4 w-4" aria-hidden="true" />
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className={view === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5' : 'space-y-3'}>
        {items.map((item, index) => (
          <ListItemRow
            key={item.contentId}
            item={item}
            view={view}
            isOwner={isOwner}
            isPending={isPending}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            onMoveUp={() => onMove(index, -1)}
            onMoveDown={() => onMove(index, 1)}
            onRemove={() => onRemove(item)}
          />
        ))}
      </div>
      <Pagination page={page} lastPage={lastPage} isFetching={isFetching} onPageChange={onPageChange} />
    </div>
  );
}
