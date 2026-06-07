import { Calendar, Check, Clock, Eye, Plus, Star, Users } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PosterImage } from './PosterImage';
import { Badge } from '@/components/ui/Badge';
import { useUpsertEntry } from '@/hooks/useLibrary';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { buildContentPath } from '@/lib/slugs';
import { useAuthStore } from '@/stores/authStore';
import type { ContentItem, ContentType, EntryStatus } from '@/types';

const badgeClass: Record<ContentType, string> = {
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
};

export interface ContentCardProps {
  item: ContentItem;
  userStatus?: EntryStatus | undefined;
  userRating?: number | null | undefined;
}

const statusLabel: Record<EntryStatus, string> = {
  want: 'Want',
  in_progress: 'In Progress',
  done: 'Done',
};

const quickActions: Array<{ value: EntryStatus; label: string; icon: typeof Plus }> = [
  { value: 'want', label: 'Want', icon: Plus },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'done', label: 'Done', icon: Check },
];

export function ContentCard({ item, userStatus, userRating }: ContentCardProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const upsertEntry = useUpsertEntry();
  const { isOnline } = useOnlineStatus();
  const [localStatus, setLocalStatus] = useState<EntryStatus | undefined>(userStatus);
  const visibleStatus = localStatus ?? userStatus;

  useEffect(() => {
    setLocalStatus(userStatus);
  }, [userStatus]);

  async function setStatus(status: EntryStatus, event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (upsertEntry.isPending || !isOnline) return;
    setLocalStatus(status);
    try {
      await upsertEntry.mutateAsync({ content_id: item.id, status });
    } catch {
      setLocalStatus(userStatus);
    }
  }

  return (
    <Link
      to={buildContentPath(item)}
      className="group block min-w-0 rounded-[1.35rem] focus:outline-none focus:ring-4 focus:ring-accent/20"
    >
      <article className="overflow-hidden rounded-[1.35rem] border border-border-subtle bg-surface shadow-card transition duration-300 group-hover:-translate-y-1 group-hover:border-accent/45 group-hover:shadow-cardHover motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
          <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/18 to-slate-950/20" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 opacity-0 ring-1 ring-inset ring-accent/60 transition group-hover:opacity-100" aria-hidden="true" />
          <div className="absolute left-2 top-2 flex max-w-[calc(100%-1rem)] flex-wrap gap-1">
            <Badge className={`capitalize shadow-sm ${badgeClass[item.type]}`}>{item.type}</Badge>
            {visibleStatus && <Badge className="border-white/20 bg-slate-950/85 text-white shadow-sm backdrop-blur">{statusLabel[visibleStatus]}</Badge>}
          </div>
          {(item.avgRating !== null || userRating) && (
            <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-950/90 px-2 py-1 text-xs font-black text-white shadow-sm backdrop-blur">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {userRating ? `${userRating}/10` : item.avgRating?.toFixed(1)}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-3 text-white">
            <h3 className="line-clamp-3 text-sm font-black leading-tight drop-shadow">{item.title}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-200">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {item.releaseYear ?? 'TBA'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" aria-hidden="true" />
                {item.ratingsCount}
              </span>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block">
          <div className="pointer-events-auto grid gap-1 rounded-2xl border border-white/10 bg-slate-950/92 p-1.5 shadow-lg backdrop-blur">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const active = visibleStatus === action.value;
              return (
                <button
                  key={action.value}
                  type="button"
                  disabled={upsertEntry.isPending || !isOnline}
                  onClick={(event) => setStatus(action.value, event)}
                  className={`inline-flex min-h-9 items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold transition ${
                    active ? 'bg-white text-content-primary' : 'text-white hover:bg-white/20'
                  } disabled:opacity-60`}
                  aria-label={`Mark ${item.title} as ${action.label}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
          </div>
        </div>
        <div className="space-y-2 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs font-black uppercase tracking-[0.14em] text-content-tertiary">{item.type}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-content-tertiary">
              <Eye className="h-3 w-3" aria-hidden="true" />
              Details
            </span>
          </div>
          <div className="flex min-h-7 flex-wrap gap-1">
            {item.genres.slice(0, 2).map((genre) => (
              <span key={genre} className="max-w-full truncate rounded-full bg-bg-subtle px-2 py-1 text-[10px] font-black text-content-tertiary">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
