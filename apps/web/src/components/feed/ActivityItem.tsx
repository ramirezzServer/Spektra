import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import { Avatar } from '@/components/ui/Avatar';
import { formatRelativeTime } from '@/lib/formatters';
import { buildContentPath } from '@/lib/slugs';
import type { ActivityFeedItem } from '@/types';

const verbText: Record<ActivityFeedItem['verb'], string> = {
  rated: 'rated',
  reviewed: 'reviewed',
  added_to_library: 'added',
  status_changed: 'updated status for',
  added_to_list: 'added to a list',
  followed: 'followed',
};

function stringMeta(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function numberMeta(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

export function ActivityItem({ item }: { item: ActivityFeedItem }) {
  const actor = item.actor;
  const content = item.content;
  const rating = numberMeta(item.metadata.rating);
  const review = stringMeta(item.metadata.reviewExcerpt) ?? stringMeta(item.metadata.review);
  const followedUsername = stringMeta(item.metadata.username);

  return (
    <article className="rounded-2xl border border-border-subtle bg-surface/95 p-4 shadow-card">
      <div className="flex gap-3">
        {actor?.username ? (
          <Link to={`/profile/${actor.username}`} className="shrink-0">
            <Avatar src={actor.avatarUrl} alt={actor.username} />
          </Link>
        ) : (
          <Avatar alt="Someone" />
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="min-w-0">
            <p className="break-words text-sm text-content-secondary">
              {actor?.username ? (
                <Link to={`/profile/${actor.username}`} className="font-semibold text-content-primary hover:text-accent overflow-wrap-anywhere">
                  @{actor.username}
                </Link>
              ) : (
                <span className="font-semibold text-content-primary">Someone</span>
              )}{' '}
              {verbText[item.verb] ?? 'updated'}{' '}
              {item.verb === 'followed' && followedUsername ? (
                <Link to={`/profile/${followedUsername}`} className="font-semibold text-content-primary hover:text-accent overflow-wrap-anywhere">
                  @{followedUsername}
                </Link>
              ) : content ? (
                <Link to={buildContentPath(content)} className="font-semibold text-content-primary hover:text-accent overflow-wrap-anywhere">
                  {content.title}
                </Link>
              ) : (
                <span className="font-semibold text-content-primary">something</span>
              )}
            </p>
            <time className="text-xs text-content-tertiary" dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
          </div>

          {content && (
            <Link to={buildContentPath(content)} className="flex gap-3 rounded-xl border border-border-subtle bg-bg-subtle p-2 transition hover:border-accent/35 active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100">
              <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface shadow-xs">
                <PosterImage src={content.posterUrl} title={content.title} type={content.type} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 py-1">
                <p className="line-clamp-2 text-sm font-semibold text-content-primary">{content.title}</p>
                <p className="mt-1 text-xs capitalize text-content-tertiary">{content.type}</p>
                {rating ? <p className="mt-2 text-xs font-semibold text-content-secondary">{rating}/10</p> : null}
              </div>
            </Link>
          )}

          {review && (
            <blockquote className="overflow-wrap-anywhere rounded-xl border-l-4 border-accent bg-accent-soft px-3 py-2 text-sm font-medium text-content-secondary">
              {review}
            </blockquote>
          )}
        </div>
      </div>
    </article>
  );
}
