import { BookMarked, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ListCard } from '@/components/lists/ListCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import type { UserList } from '@/types';

interface ListGridProps {
  lists: UserList[];
  page: number;
  lastPage: number;
  isLoading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (list: UserList) => void;
  onDelete: (list: UserList) => void;
  onCreate?: () => void;
}

export function ListGrid({ lists, page, lastPage, isLoading, isError, isFetching, onPageChange, onEdit, onDelete, onCreate }: ListGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-card">
            <Skeleton className="h-40 rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState message="Unable to load your lists." />;

  if (!lists.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card">
        <BookMarked className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-black text-content-primary">No lists yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-content-tertiary">Create a collection for real Spektra content, then add items from search or content detail pages.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {onCreate ? (
            <button type="button" onClick={onCreate} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-black text-white shadow-sm hover:bg-accent-hover">
              Create list
            </button>
          ) : null}
          <Link to="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-black text-content-primary hover:bg-bg-subtle">
            <Search className="h-4 w-4" />
            Search content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lists.map((list) => (
          <ListCard key={list.id} list={list} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <Pagination page={page} lastPage={lastPage} isFetching={isFetching} onPageChange={onPageChange} />
    </div>
  );
}
