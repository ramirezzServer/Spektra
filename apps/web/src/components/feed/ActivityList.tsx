import { ActivityItem } from './ActivityItem';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getApiErrorMessage } from '@/lib/apiError';
import type { ActivityFeedItem } from '@/types';

interface ActivityListProps {
  items: ActivityFeedItem[];
  isLoading: boolean;
  isError: boolean;
  emptyMessage: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  error?: unknown;
  onLoadMore: () => void;
}

export function ActivityList({ items, isLoading, isError, emptyMessage, hasNextPage, isFetchingNextPage, error, onLoadMore }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading activity">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-card">
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
      <div className="rounded-2xl border border-dashed border-border bg-surface py-14 text-center text-sm font-medium text-content-tertiary shadow-card" role="status">
        {getApiErrorMessage(error, 'Unable to load activity right now.')}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface py-14 text-center text-sm font-medium text-content-tertiary shadow-card">
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
