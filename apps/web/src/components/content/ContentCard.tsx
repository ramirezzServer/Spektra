import { BookOpen, Calendar, Gamepad2, Star, Tv, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import type { ContentItem, ContentType } from '@/types';

const iconByType: Record<ContentType, typeof Video> = {
  film: Video,
  series: Tv,
  game: Gamepad2,
  book: BookOpen,
};

const badgeClass: Record<ContentType, string> = {
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
};

export interface ContentCardProps {
  item: ContentItem;
}

export function ContentCard({ item }: ContentCardProps) {
  const FallbackIcon = iconByType[item.type];

  return (
    <Link
      to={`/content/${item.type}/${item.externalId}`}
      className="group block min-w-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-card">
        {item.posterUrl ? (
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={item.posterUrl} alt={item.title} loading="lazy" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg-tertiary px-4 text-center text-app-muted">
            <FallbackIcon className="h-9 w-9" />
            <span className="line-clamp-3 text-xs font-semibold">{item.title}</span>
          </div>
        )}
        <div className="absolute left-2 top-2">
          <Badge className={`capitalize ${badgeClass[item.type]}`}>{item.type}</Badge>
        </div>
        {item.avgRating !== null && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-app-text/85 px-2 py-1 text-xs font-semibold text-white">
            <Star className="h-3 w-3 fill-white" />
            {item.avgRating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="mt-3 min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-app-text">{item.title}</h3>
        <div className="mt-1 flex min-h-5 items-center gap-1 text-xs text-app-muted">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{item.releaseYear ?? 'TBA'}</span>
        </div>
      </div>
    </Link>
  );
}
