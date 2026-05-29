import { Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterImage } from './PosterImage';
import { Badge } from '@/components/ui/Badge';
import type { ContentItem, ContentType, EntryStatus } from '@/types';

const badgeClass: Record<ContentType, string> = {
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
};

export interface ContentCardProps {
  item: ContentItem;
  userStatus?: EntryStatus;
  userRating?: number | null;
}

const statusLabel: Record<EntryStatus, string> = {
  want: 'Want',
  in_progress: 'In Progress',
  done: 'Done',
};

export function ContentCard({ item, userStatus, userRating }: ContentCardProps) {
  return (
    <Link
      to={`/content/${item.type}/${item.externalId}`}
      className="group block min-w-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-accent focus:ring-offset-2"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-app-border bg-app-surface shadow-card">
        <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute left-2 top-2">
          <Badge className={`capitalize ${badgeClass[item.type]}`}>{item.type}</Badge>
        </div>
        {item.avgRating !== null && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-app-text/85 px-2 py-1 text-xs font-semibold text-white">
            <Star className="h-3 w-3 fill-white" />
            {item.avgRating.toFixed(1)}
          </div>
        )}
        {(userStatus || userRating) && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {userStatus && <Badge className="border-white/20 bg-app-text/85 text-white">{statusLabel[userStatus]}</Badge>}
            {userRating ? <Badge className="border-white/20 bg-app-text/85 text-white">{userRating}/10</Badge> : null}
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
