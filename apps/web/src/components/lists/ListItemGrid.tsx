import { ListItemRow } from '@/components/lists/ListItemRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
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
  onPageChange: (page: number) => void;
  onMove: (fromIndex: number, direction: -1 | 1) => void;
  onRemove: (item: ListItem) => void;
}

export function ListItemGrid({ items, page, lastPage, isOwner, isLoading, isError, isFetching, isPending, emptyMessage, onPageChange, onMove, onRemove }: ListItemGridProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    );
  }

  if (isError) return <ErrorState message="Unable to load list items." />;
  if (!items.length) return <EmptyState title="This list is empty">{emptyMessage}</EmptyState>;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((item, index) => (
          <ListItemRow
            key={item.contentId}
            item={item}
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
