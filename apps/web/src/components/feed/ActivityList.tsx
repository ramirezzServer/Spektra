import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ActivityFeedItem } from '@/types';

interface ActivityListProps {
  items: ActivityFeedItem[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore: () => void;
}

export function ActivityList({ items, isLoading, isError, emptyMessage, hasNextPage, isFetchingNextPage, onLoadMore }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading activity">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary" role="status">
        Unable to load activity right now.
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActivityItem key={item.id} item={item} />
      ))}
      {hasNextPage && (
        <div className="pt-2 text-center">
          <Button type="button" variant="secondary" disabled={isFetchingNextPage} onClick={onLoadMore}>
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
