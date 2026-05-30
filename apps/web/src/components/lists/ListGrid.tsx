import { ListCard } from '@/components/lists/ListCard';
import { EmptyState } from '@/components/ui/EmptyState';
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
}

export function ListGrid({ lists, page, lastPage, isLoading, isError, isFetching, onPageChange, onEdit, onDelete }: ListGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-64" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState message="Unable to load your lists." />;

  if (!lists.length) {
    return (
      <EmptyState title="No lists yet">
        Create a list to organize films, series, games, and books from real Spektra content.
      </EmptyState>
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
