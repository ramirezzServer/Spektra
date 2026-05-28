import { Calendar, Check, Clock, Gamepad2, Plus, Star, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { RatingStars } from '@/components/content/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useContentItem } from '@/hooks/useContent';
import { cn } from '@/lib/utils';
import type { ContentType } from '@/types';

const typeClass: Record<ContentType, string> = {
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function highlightValue(value: unknown): string | null {
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return null;
}

export function ContentDetail() {
  const { type = '', id = '' } = useParams();
  const content = useContentItem(type, id);
  const item = content.data;
  const metadata = item?.metadata ?? {};

  if (content.isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="aspect-[2/3] w-full max-w-72" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (content.isError || !item) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-content-primary">Content not found</h1>
          <p className="mt-2 text-sm text-content-tertiary">This item is not in Spektra yet.</p>
        </div>
      </div>
    );
  }

  const platforms = asStringArray(metadata.platforms);
  const authors = asStringArray(metadata.authors);
  const highlights = [
    item.type !== 'book' && { label: 'TMDB vote', value: highlightValue(metadata.voteAverage) },
    item.type !== 'book' && { label: 'Popularity', value: highlightValue(metadata.popularity) },
    item.type === 'game' && { label: 'Metacritic', value: highlightValue(metadata.metacritic) },
    item.type === 'game' && platforms.length > 0 && { label: 'Platforms', value: platforms.slice(0, 4).join(', ') },
    item.type === 'book' && authors.length > 0 && { label: 'Authors', value: authors.join(', ') },
  ].filter(Boolean) as Array<{ label: string; value: string | null }>;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 overflow-x-hidden lg:grid-cols-[minmax(220px,320px)_1fr]">
      <div className="w-full max-w-80">
        <div className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          {item.posterUrl ? (
            <img src={item.posterUrl} alt={item.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-bg-tertiary px-6 text-center text-sm font-semibold text-content-tertiary">
              No poster available
            </div>
          )}
        </div>
      </div>

      <section className="min-w-0 space-y-6">
        <div className="space-y-3">
          <Badge className={cn('capitalize', typeClass[item.type])}>{item.type}</Badge>
          <h1 className="break-words text-3xl font-bold text-content-primary md:text-5xl">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-content-secondary">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {item.releaseYear ?? 'TBA'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {item.avgRating !== null ? `${item.avgRating.toFixed(1)} average` : 'No Spektra rating'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {item.ratingsCount} ratings
            </span>
          </div>
        </div>

        {item.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.genres.map((genre) => (
              <span key={genre} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-content-secondary">
                {genre}
              </span>
            ))}
          </div>
        )}

        {typeof metadata.overview === 'string' && metadata.overview && (
          <p className="max-w-3xl text-base leading-7 text-content-secondary">{metadata.overview}</p>
        )}

        {highlights.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase text-content-tertiary">{highlight.label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-content-primary">{highlight.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-content-primary">Tracking controls arrive in Phase 3.</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button disabled variant="secondary">
              <Plus className="h-4 w-4" />
              Want
            </Button>
            <Button disabled variant="secondary">
              <Clock className="h-4 w-4" />
              In Progress
            </Button>
            <Button disabled variant="secondary">
              <Check className="h-4 w-4" />
              Done
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-content-primary">Your rating</p>
            <RatingStars value={null} disabled />
          </div>
          <textarea
            disabled
            className="min-h-28 w-full resize-none rounded-lg border border-border bg-bg-secondary p-3 text-sm text-content-secondary placeholder:text-content-tertiary"
            placeholder="Review writing will be available in Phase 3."
          />
        </div>

        {item.type === 'game' && platforms.length > 0 && (
          <p className="inline-flex items-center gap-2 text-sm text-content-secondary">
            <Gamepad2 className="h-4 w-4" />
            {platforms.slice(0, 6).join(', ')}
          </p>
        )}
      </section>
    </div>
  );
}
