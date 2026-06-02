import { Compass, Library, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  const primaryItems = items.slice(0, 12);
  const moreItems = items.slice(12);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <SEO title="Discover" description="Discover real trending films, series, games, and books with Spektra." canonicalPath="/" />
      <header className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel md:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(91,77,255,0.55),transparent_34rem),radial-gradient(circle_at_88%_12%,rgba(20,184,166,0.32),transparent_28rem)]" aria-hidden="true" />
        <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">Spektra discovery</p>
            <h1 className="mt-2 text-balance text-3xl font-black tracking-tight md:text-5xl">Find the next story worth tracking.</h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-200 md:text-base">Trending films, series, games, and books from real Spektra content data.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm hover:bg-slate-100">
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link to="/library" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/20">
              <Library className="h-4 w-4" />
              Library
            </Link>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-xl font-black text-content-primary"><Compass className="h-5 w-5 text-accent" /> Trending This Week</h2>
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Trending filters">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active === tab.value}
                onClick={() => setActive(tab.value)}
                className={cn(
                  'min-h-11 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-accent/20 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
                  active === tab.value ? 'bg-accent text-white shadow-sm' : 'border border-border-subtle bg-surface text-content-secondary hover:bg-bg-tertiary',
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
                {primaryItems.map((item) => (
                  <div key={`${item.type}-${item.externalId}`} className="w-40 shrink-0">
                    <ContentGrid items={[item]} skeletonCount={1} />
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <ContentGrid items={primaryItems} />
            </div>
          </>
        )}
      </section>

      {moreItems.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-content-primary">More to Explore</h2>
          <ContentGrid items={moreItems} />
        </section>
      )}
    </div>
  );
}
