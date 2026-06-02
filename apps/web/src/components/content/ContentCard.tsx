import { Calendar, Check, Clock, Plus, Star } from 'lucide-react';
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
  userStatus?: EntryStatus;
  userRating?: number | null;
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
      className="group block min-w-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/20"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-card transition duration-200 group-hover:-translate-y-1 group-hover:border-accent/35 group-hover:shadow-cardHover motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
        <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-slate-950/25 opacity-75" aria-hidden="true" />
        <div className="absolute left-2 top-2">
          <Badge className={`capitalize ${badgeClass[item.type]}`}>{item.type}</Badge>
        </div>
        {item.avgRating !== null && (
          <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-slate-950/85 px-2 py-1 text-xs font-bold text-white shadow-sm backdrop-blur">
            <Star className="h-3 w-3 fill-white" />
            {item.avgRating.toFixed(1)}
          </div>
        )}
        {(visibleStatus || userRating) && (
          <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
            {visibleStatus && <Badge className="border-white/20 bg-slate-950/85 text-white">{statusLabel[visibleStatus]}</Badge>}
            {userRating ? <Badge className="border-white/20 bg-slate-950/85 text-white">{userRating}/10</Badge> : null}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden translate-y-2 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:block">
          <div className="pointer-events-auto grid gap-1 rounded-xl bg-slate-950/90 p-1.5 shadow-lg backdrop-blur">
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
                    active ? 'bg-white text-content-primary' : 'text-white hover:bg-white/15'
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
      <div className="mt-2.5 min-w-0 px-0.5">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-content-primary">{item.title}</h3>
        <div className="mt-1 flex min-h-5 items-center gap-1 text-xs font-semibold text-content-tertiary">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{item.releaseYear ?? 'TBA'}</span>
        </div>
      </div>
    </Link>
  );
}
