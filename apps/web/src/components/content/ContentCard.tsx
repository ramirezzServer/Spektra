import { BookOpen, Check, Clock, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import type { ContentType, EntryStatus } from '@/types';
import { StatusBadge } from './StatusBadge';

const fallbackByType: Record<ContentType, string> = {
  film: 'Film',
  series: 'Series',
  game: 'Game',
  book: 'Book',
};

export interface ContentCardProps {
  id: string;
  title: string;
  type: ContentType;
  posterUrl: string | null;
  year: number | null;
  avgRating: number | null;
  userStatus?: EntryStatus;
}

export function ContentCard({ id, title, type, posterUrl, year, avgRating, userStatus }: ContentCardProps) {
  return (
    <Link to={`/content/${type}/${id}`} className="group block min-w-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-app-accent">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg border border-app-border bg-slate-100">
        {posterUrl ? (
          <img className="h-full w-full object-cover transition duration-300 group-hover:scale-105" src={posterUrl} alt={title} loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm font-semibold text-slate-400">{fallbackByType[type]}</div>
        )}
        <div className="absolute left-2 top-2">
          <Badge className="bg-app-surface/95 capitalize">{type}</Badge>
        </div>
        <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-app-text/85 px-2 py-1 text-xs font-semibold text-white">
          <Star className="h-3 w-3 fill-white" />
          {avgRating?.toFixed(1) ?? '-'}
        </div>
        <div className="absolute inset-x-2 bottom-2 hidden translate-y-2 gap-1 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <button className="grid min-h-11 flex-1 place-items-center rounded-md bg-white/95 text-app-muted shadow-sm" title="Want">
            <Plus className="h-4 w-4" />
          </button>
          <button className="grid min-h-11 flex-1 place-items-center rounded-md bg-white/95 text-amber-600 shadow-sm" title="In progress">
            <Clock className="h-4 w-4" />
          </button>
          <button className="grid min-h-11 flex-1 place-items-center rounded-md bg-white/95 text-emerald-600 shadow-sm" title="Done">
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 min-w-0">
        <h3 className="truncate text-sm font-semibold text-app-text">{title}</h3>
        <div className="mt-1 flex min-h-6 items-center justify-between gap-2 text-xs text-app-muted">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {year ?? 'TBA'}
          </span>
          {userStatus && <StatusBadge status={userStatus} />}
        </div>
      </div>
    </Link>
  );
}
