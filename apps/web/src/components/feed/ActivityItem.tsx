import { BookOpen, Clock, Star, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime } from '@/lib/formatters';
import { buildContentPath } from '@/lib/slugs';
import type { ActivityFeedItem } from '@/types';

const verbText: Record<ActivityFeedItem['verb'], string> = {
  rated: 'rated',
  reviewed: 'reviewed',
  added_to_library: 'added to library',
  status_changed: 'updated status for',
  added_to_list: 'added to a list',
  followed: 'followed',
};

function stringMeta(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function numberMeta(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function ActivityItem({ item }: { item: ActivityFeedItem }) {
  const actor = item.actor;
  const content = item.content;
  const rating = numberMeta(item.metadata.rating);
  const review = stringMeta(item.metadata.reviewExcerpt) ?? stringMeta(item.metadata.review);
  const status = stringMeta(item.metadata.status);
  const followedUsername = stringMeta(item.metadata.username);

  return (
    <article className="overflow-hidden rounded-3xl border border-border-subtle bg-surface/95 shadow-card transition hover:border-accent/30 hover:shadow-cardHover">
      <div className="flex gap-3 p-4">
        {actor?.username ? (
          <Link to={`/profile/${actor.username}`} className="shrink-0 rounded-full focus-ring">
            <Avatar src={actor.avatarUrl} alt={actor.username} />
          </Link>
        ) : (
          <Avatar alt="Someone" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {actor?.username ? (
              <Link to={`/profile/${actor.username}`} className="overflow-wrap-anywhere text-sm font-black text-content-primary hover:text-accent">
                @{actor.username}
              </Link>
            ) : (
              <span className="text-sm font-black text-content-primary">Someone</span>
            )}
            <span className="text-sm font-semibold text-content-secondary">{verbText[item.verb] ?? 'updated'}</span>
            {item.verb === 'followed' && followedUsername ? (
              <Link to={`/profile/${followedUsername}`} className="overflow-wrap-anywhere text-sm font-black text-content-primary hover:text-accent">
                @{followedUsername}
              </Link>
            ) : content ? (
              <Link to={buildContentPath(content)} className="overflow-wrap-anywhere text-sm font-black text-content-primary hover:text-accent">
                {content.title}
              </Link>
            ) : (
              <span className="text-sm font-black text-content-primary">something</span>
            )}
          </div>
          <time className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-content-tertiary" dateTime={item.createdAt}>
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatRelativeTime(item.createdAt)}
          </time>
        </div>
      </div>

      {content ? (
        <Link to={buildContentPath(content)} className="mx-4 mb-4 grid gap-3 rounded-2xl border border-border-subtle bg-bg-subtle p-2 transition hover:border-accent/40 sm:grid-cols-[76px_minmax(0,1fr)]">
          <div className="aspect-[2/3] w-20 overflow-hidden rounded-xl border border-border bg-surface shadow-xs sm:w-[76px]">
            <PosterImage src={content.posterUrl} title={content.title} type={content.type} className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 py-1">
            <div className="flex flex-wrap gap-1.5">
              <Badge className="capitalize">{content.type}</Badge>
              {status ? <Badge className="bg-info-light text-info-text">{status.replace('_', ' ')}</Badge> : null}
              {rating ? (
                <Badge className="bg-warning-light text-warning-text">
                  <Star className="h-3 w-3 fill-warning" />
                  {rating}/10
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-base font-black leading-tight text-content-primary">{content.title}</p>
            <p className="mt-1 text-xs font-bold text-content-tertiary">{content.releaseYear ?? 'TBA'} · {content.ratingsCount} ratings</p>
          </div>
        </Link>
      ) : item.verb === 'followed' ? (
        <div className="mx-4 mb-4 flex items-center gap-3 rounded-2xl border border-border-subtle bg-bg-subtle p-3">
          <UserPlus className="h-5 w-5 text-accent" aria-hidden="true" />
          <p className="text-sm font-bold text-content-secondary">A follow relationship changed.</p>
        </div>
      ) : null}

      {review ? (
        <blockquote className="mx-4 mb-4 overflow-wrap-anywhere rounded-2xl border-l-4 border-accent bg-accent-soft px-4 py-3 text-sm font-semibold leading-6 text-content-secondary">
          <BookOpen className="mb-2 h-4 w-4 text-accent" aria-hidden="true" />
          <span className="line-clamp-4">{review}</span>
        </blockquote>
      ) : null}
    </article>
  );
}
