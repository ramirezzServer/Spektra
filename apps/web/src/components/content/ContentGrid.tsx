import { useMemo } from 'react';
import { ContentCard } from './ContentCard';
import { ContentCardSkeleton } from '@/components/ui/Skeleton';
import type { ContentItem, UserEntry } from '@/types';

interface ContentGridProps {
  items: ContentItem[];
  entries?: UserEntry[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function ContentGrid({ items, entries = [], isLoading = false, skeletonCount = 10 }: ContentGridProps) {
  const entriesByContentId = useMemo(() => new Map(entries.map((entry) => [entry.contentId, entry])), [entries]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ContentCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <ContentCard
          key={`${item.type}-${item.externalId}`}
          item={item}
          userStatus={entriesByContentId.get(item.id)?.status}
          userRating={entriesByContentId.get(item.id)?.rating}
        />
      ))}
    </div>
  );
}
