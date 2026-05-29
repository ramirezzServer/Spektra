import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import type { ActivityFeedItem } from '@/types';

const verbText: Record<ActivityFeedItem['verb'], string> = {
  rated: 'rated',
  reviewed: 'reviewed',
  added_to_library: 'added',
  status_changed: 'updated status for',
  added_to_list: 'added to a list',
  followed: 'followed',
};

function relativeTime(value: string) {
  const then = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - then);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

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
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex gap-3">
        {actor?.username ? (
          <Link to={`/profile/${actor.username}`} className="shrink-0">
            <img src={actor.avatarUrl ?? ''} alt="" className="h-10 w-10 rounded-full bg-accent-light object-cover" loading="lazy" decoding="async" />
          </Link>
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-full bg-accent-light" />
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="min-w-0">
            <p className="break-words text-sm text-content-secondary">
              {actor?.username ? (
                <Link to={`/profile/${actor.username}`} className="font-semibold text-content-primary hover:text-accent">
                  @{actor.username}
                </Link>
              ) : (
                <span className="font-semibold text-content-primary">Someone</span>
              )}{' '}
              {verbText[item.verb] ?? 'updated'}{' '}
              {item.verb === 'followed' && followedUsername ? (
                <Link to={`/profile/${followedUsername}`} className="font-semibold text-content-primary hover:text-accent">
                  @{followedUsername}
                </Link>
              ) : content ? (
                <Link to={`/content/${content.type}/${content.externalId}`} className="font-semibold text-content-primary hover:text-accent">
                  {content.title}
                </Link>
              ) : (
                <span className="font-semibold text-content-primary">something</span>
              )}
            </p>
            <time className="text-xs text-content-tertiary" dateTime={item.createdAt}>{relativeTime(item.createdAt)}</time>
          </div>

          {content && (
            <Link to={`/content/${content.type}/${content.externalId}`} className="flex gap-3 rounded-md border border-border bg-bg-secondary p-2 hover:border-border-strong">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-md border border-border bg-surface">
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
            <blockquote className="rounded-md border-l-4 border-accent bg-bg-secondary px-3 py-2 text-sm text-content-secondary">
              {review}
            </blockquote>
          )}
        </div>
      </div>
    </article>
  );
}
