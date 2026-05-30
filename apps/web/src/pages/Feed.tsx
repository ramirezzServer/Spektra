import { useMemo, useState } from 'react';
import { ActivityList } from '@/components/feed/ActivityList';
import { FeedTabs } from '@/components/feed/FeedTabs';
import { SEO } from '@/components/seo/SEO';
import { useActivityFeed, type FeedScope } from '@/hooks/useFeed';
import { useAuthStore } from '@/stores/authStore';

export function Feed() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [scope, setScope] = useState<FeedScope>(isAuthenticated ? 'following' : 'global');
  const feed = useActivityFeed(scope);
  const items = useMemo(() => feed.data?.pages.flatMap((page) => page.data) ?? [], [feed.data]);
  const emptyMessage = scope === 'following' ? 'Follow people to see their activity here.' : 'No public activity yet.';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SEO title="Activity Feed" description="Recent Spektra activity from followed users and the global community." canonicalPath="/feed" />
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-content-primary">Activity Feed</h1>
        <FeedTabs active={scope} isAuthenticated={isAuthenticated} onChange={setScope} />
        {!isAuthenticated && (
          <p className="text-sm text-content-tertiary">Sign in to see activity from people you follow.</p>
        )}
      </div>

      <ActivityList
        items={items}
        isLoading={feed.isLoading}
        isError={feed.isError}
        error={feed.error}
        emptyMessage={emptyMessage}
        hasNextPage={feed.hasNextPage}
        isFetchingNextPage={feed.isFetchingNextPage}
        onLoadMore={() => feed.fetchNextPage()}
      />
    </div>
  );
}
