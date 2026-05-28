import { ContentCard } from './ContentCard';
import { ContentCardSkeleton } from '@/components/ui/Skeleton';
import type { ContentItem } from '@/types';

interface ContentGridProps {
  items: ContentItem[];
  isLoading?: boolean;
  skeletonCount?: number;
}

export function ContentGrid({ items, isLoading = false, skeletonCount = 10 }: ContentGridProps) {
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
        <ContentCard key={`${item.type}-${item.externalId}`} item={item} />
      ))}
    </div>
  );
}
