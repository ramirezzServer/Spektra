import { useMemo, useState } from 'react';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/Button';
import type { ContentType } from '@/types';
import { sampleContent } from './mockData';

const tabs: Array<ContentType | 'all'> = ['all', 'film', 'series', 'game', 'book'];

export function Home() {
  const [filter, setFilter] = useState<ContentType | 'all'>('all');
  const items = useMemo(() => sampleContent.filter((item) => filter === 'all' || item.type === filter), [filter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-app-accent">Discover</p>
          <h1 className="mt-1 text-3xl font-bold tracking-normal text-app-text">Track everything worth your time.</h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <Button key={tab} variant={filter === tab ? 'primary' : 'secondary'} onClick={() => setFilter(tab)} className="shrink-0 capitalize">
              {tab === 'all' ? 'All' : `${tab}s`}
            </Button>
          ))}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Trending this week</h2>
        <div className="flex snap-x gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-4 md:overflow-visible lg:grid-cols-5">
          {items.slice(0, 5).map((item) => (
            <div className="w-40 shrink-0 snap-start md:w-auto" key={item.id}>
              <ContentCard id={item.id} title={item.title} type={item.type} posterUrl={item.posterUrl} year={item.releaseYear} avgRating={item.avgRating} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Recently added</h2>
        <ContentGrid items={items} />
      </section>
    </div>
  );
}
