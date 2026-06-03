import { Activity, Globe2, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  emptyKind?: 'following' | 'global';
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  error?: unknown;
  onLoadMore: () => void;
  onShowGlobal?: () => void;
}

export function ActivityList({ items, isLoading, isError, emptyMessage, emptyKind = 'global', hasNextPage, isFetchingNextPage, error, onLoadMore, onShowGlobal }: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-label="Loading activity">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-border-subtle bg-surface p-4 shadow-card">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-28 w-full rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center text-sm font-semibold text-content-tertiary shadow-card" role="status">
        <Activity className="mx-auto mb-3 h-8 w-8 text-danger" aria-hidden="true" />
        {getApiErrorMessage(error, 'Unable to load activity right now.')}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card">
        {emptyKind === 'following' ? <Users className="mx-auto h-9 w-9 text-accent" aria-hidden="true" /> : <Globe2 className="mx-auto h-9 w-9 text-accent" aria-hidden="true" />}
        <h2 className="mt-3 text-lg font-black text-content-primary">{emptyKind === 'following' ? 'Your following feed is quiet' : 'No activity yet'}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-content-tertiary">{emptyMessage}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {emptyKind === 'following' && onShowGlobal ? (
            <Button type="button" onClick={onShowGlobal}>
              <Globe2 className="h-4 w-4" />
              View global feed
            </Button>
          ) : (
            <Link to="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-accent-hover">
              <Search className="h-4 w-4" />
              Start tracking
            </Link>
          )}
          <Link to="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-black text-content-primary hover:bg-bg-subtle">
            Search content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ActivityItem key={item.id} item={item} />
      ))}
      {hasNextPage && (
        <div className="pt-3 text-center">
          <Button type="button" variant="secondary" disabled={isFetchingNextPage} isLoading={isFetchingNextPage} onClick={onLoadMore}>
            {isFetchingNextPage ? 'Loading...' : 'Load more activity'}
          </Button>
        </div>
      )}
    </div>
  );
}
