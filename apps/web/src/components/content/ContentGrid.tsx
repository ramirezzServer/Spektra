import { ContentCard } from './ContentCard';
import type { ContentItem } from '@/types';

export function ContentGrid({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <ContentCard
          key={item.id}
          id={item.id}
          title={item.title}
          type={item.type}
          posterUrl={item.posterUrl}
          year={item.releaseYear}
          avgRating={item.avgRating}
        />
      ))}
    </div>
  );
}
