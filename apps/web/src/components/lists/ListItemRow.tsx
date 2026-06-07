import { ArrowDown, ArrowUp, Calendar, GripVertical, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { buildContentPath } from '@/lib/slugs';
import type { ListItem } from '@/types';

interface ListItemRowProps {
  item: ListItem;
  canMoveUp?: boolean | undefined;
  canMoveDown?: boolean | undefined;
  isOwner?: boolean | undefined;
  isPending?: boolean | undefined;
  view?: 'list' | 'grid' | undefined;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}

export function ListItemRow({ item, canMoveUp, canMoveDown, isOwner, isPending, view = 'list', onMoveUp, onMoveDown, onRemove }: ListItemRowProps) {
  const content = item.content;
  if (!content) return null;

  if (view === 'grid') {
    return (
      <article className="overflow-hidden rounded-3xl border border-border-subtle bg-surface/95 shadow-card">
        <Link to={buildContentPath(content)} className="block aspect-[2/3] overflow-hidden bg-bg-subtle focus:outline-none focus:ring-4 focus:ring-accent/20">
          <PosterImage src={content.posterUrl} title={content.title} type={content.type} className="h-full w-full object-cover" />
        </Link>
        <div className="p-3">
          <div className="flex flex-wrap gap-1.5">
            <Badge className="capitalize">{content.type}</Badge>
            {content.avgRating !== null ? (
              <Badge className="bg-warning-light text-warning-text">
                <Star className="h-3 w-3 fill-warning" />
                {content.avgRating.toFixed(1)}
              </Badge>
            ) : null}
          </div>
          <Link to={buildContentPath(content)} className="mt-2 line-clamp-2 block text-sm font-black leading-tight text-content-primary hover:text-accent">
            {content.title}
          </Link>
          <p className="mt-1 text-xs font-bold text-content-tertiary">#{item.position} / {content.releaseYear ?? 'TBA'}</p>
          {isOwner ? (
            <div className="mt-3 flex justify-end gap-1 border-t border-border-subtle pt-2">
              <Button type="button" variant="ghost" className="min-w-10 px-2" aria-label={`Move ${content.title} up`} disabled={!canMoveUp || isPending} onClick={onMoveUp}><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" className="min-w-10 px-2" aria-label={`Move ${content.title} down`} disabled={!canMoveDown || isPending} onClick={onMoveDown}><ArrowDown className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" className="min-w-10 px-2 text-danger hover:text-danger" aria-label={`Remove ${content.title}`} disabled={isPending} onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-3xl border border-border-subtle bg-surface/95 p-3 shadow-card sm:grid-cols-[84px_minmax(0,1fr)_auto]">
      <Link to={buildContentPath(content)} className="block aspect-[2/3] overflow-hidden rounded-2xl bg-bg-subtle focus:outline-none focus:ring-4 focus:ring-accent/20">
        <PosterImage src={content.posterUrl} title={content.title} type={content.type} className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="capitalize">{content.type}</Badge>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-content-tertiary">
            <Calendar className="h-3 w-3" aria-hidden="true" />
            {content.releaseYear ?? 'TBA'}
          </span>
          {content.avgRating !== null ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-warning-text">
              <Star className="h-3 w-3 fill-warning" aria-hidden="true" />
              {content.avgRating.toFixed(1)}
            </span>
          ) : null}
        </div>
        <Link to={buildContentPath(content)} className="mt-2 block break-words text-base font-black leading-tight text-content-primary hover:text-accent">
          {content.title}
        </Link>
        <p className="mt-1 text-xs font-bold text-content-tertiary">Position {item.position}</p>
      </div>
      {isOwner ? (
        <div className="col-span-2 flex items-center justify-end gap-1 border-t border-border-subtle pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
          <GripVertical className="h-4 w-4 text-content-tertiary" aria-hidden="true" />
          <Button type="button" variant="ghost" className="min-w-12 px-2" aria-label={`Move ${content.title} up`} disabled={!canMoveUp || isPending} onClick={onMoveUp}><ArrowUp className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" className="min-w-12 px-2" aria-label={`Move ${content.title} down`} disabled={!canMoveDown || isPending} onClick={onMoveDown}><ArrowDown className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" className="min-w-12 px-2 text-danger hover:text-danger" aria-label={`Remove ${content.title}`} disabled={isPending} onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ) : null}
    </article>
  );
}
