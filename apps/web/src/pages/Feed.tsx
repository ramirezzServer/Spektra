import { Activity, Globe2, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const emptyMessage = scope === 'following'
    ? 'Follow people to see real library, rating, review, and list activity here.'
    : 'No public activity has been recorded yet. Track content or write a review to help the global feed come alive.';

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <SEO title="Activity Feed" description="Recent Spektra activity from followed users and the global community." canonicalPath="/feed" />
      <main className="min-w-0 space-y-5">
        <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel md:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(91,77,255,0.52),transparent_24rem),radial-gradient(circle_at_90%_18%,rgba(20,184,166,0.24),transparent_22rem)]" aria-hidden="true" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/80">
                <Activity className="h-4 w-4" aria-hidden="true" />
                Spektra social
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Activity Feed</h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-200">Real activity from followed users and the wider Spektra community.</p>
            </div>
            <FeedTabs active={scope} isAuthenticated={isAuthenticated} onChange={setScope} />
          </div>
          {!isAuthenticated ? <p className="relative mt-4 text-sm font-semibold text-slate-300">Sign in to unlock the Following tab.</p> : null}
        </section>

        <ActivityList
          items={items}
          isLoading={feed.isLoading}
          isError={feed.isError}
          error={feed.error}
          emptyMessage={emptyMessage}
          emptyKind={scope}
          hasNextPage={feed.hasNextPage}
          isFetchingNextPage={feed.isFetchingNextPage}
          onLoadMore={() => feed.fetchNextPage()}
          onShowGlobal={() => setScope('global')}
        />
      </main>

      <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
          <Globe2 className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-2 text-base font-black text-content-primary">How feed works</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-content-tertiary">Feed cards are built only from real tracking, rating, review, list, and follow events.</p>
        </section>
        <section className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
          <UserPlus className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="mt-2 text-base font-black text-content-primary">Grow following</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-content-tertiary">Open user profiles from global activity and follow people whose taste you trust.</p>
          <Link to="/search" className="mt-3 inline-flex min-h-10 items-center rounded-xl border border-border bg-bg-subtle px-3 text-sm font-black text-content-primary hover:text-accent">
            Search content
          </Link>
        </section>
      </aside>
    </div>
  );
}
