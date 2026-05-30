import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { ContentGrid } from '@/components/content/ContentGrid';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ContentCardSkeleton } from '@/components/ui/Skeleton';
import { useTrending } from '@/hooks/useContent';
import { cn } from '@/lib/utils';
import type { ContentType } from '@/types';

const tabs: Array<{ label: string; value: ContentType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Films', value: 'film' },
  { label: 'Series', value: 'series' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
];

export function Home() {
  const [active, setActive] = useState<ContentType | 'all'>('all');
  const trending = useTrending(active, 24);
  const items = trending.data ?? [];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <SEO title="Discover" description="Discover real trending films, series, games, and books with Spektra." canonicalPath="/" />
      <header>
        <h1 className="text-3xl font-semibold text-content-primary">Discover</h1>
        <p className="mt-1 text-sm text-content-secondary">Trending films, series, games, and books from Spektra content data.</p>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-content-primary">Trending This Week</h2>
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Trending filters">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active === tab.value}
                onClick={() => setActive(tab.value)}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent',
                  active === tab.value ? 'bg-accent text-white' : 'bg-surface text-content-secondary hover:bg-bg-tertiary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {trending.isLoading && (
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="w-40 shrink-0 md:w-auto">
                <ContentCardSkeleton />
              </div>
            ))}
          </div>
        )}

        {trending.isError && (
          <div className="space-y-3">
            <ErrorState message="Unable to load trending content." />
            <Button type="button" variant="secondary" onClick={() => trending.refetch()}>
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {!trending.isLoading && !trending.isError && items.length === 0 && (
          <EmptyState title="No trending content yet">
            Spektra did not receive real trending data for this filter. Check API keys or seed cached content.
          </EmptyState>
        )}

        {!trending.isLoading && !trending.isError && items.length > 0 && (
          <>
            <div className="md:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {items.map((item) => (
                  <div key={`${item.type}-${item.externalId}`} className="w-40 shrink-0">
                    <ContentGrid items={[item]} skeletonCount={1} />
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <ContentGrid items={items} />
            </div>
          </>
        )}
      </section>

      {items.length >= 12 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-content-primary">More to Explore</h2>
          <ContentGrid items={items.slice(12)} />
        </section>
      )}
    </div>
  );
}
