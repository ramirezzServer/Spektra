import { ArrowDown, ArrowUp, Calendar, GripVertical, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { ListItem } from '@/types';

interface ListItemRowProps {
  item: ListItem;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isOwner?: boolean;
  isPending?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
}

export function ListItemRow({ item, canMoveUp, canMoveDown, isOwner, isPending, onMoveUp, onMoveDown, onRemove }: ListItemRowProps) {
  const content = item.content;
  if (!content) return null;

  return (
    <article className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-[72px_minmax(0,1fr)_auto]">
      <Link to={`/content/${content.type}/${content.externalId}`} className="block aspect-[2/3] overflow-hidden rounded-md bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-accent">
        <PosterImage src={content.posterUrl} title={content.title} type={content.type} className="h-full w-full object-cover" />
      </Link>
      <div className="min-w-0 self-center">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="capitalize">{content.type}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-content-tertiary">
            <Calendar className="h-3 w-3" />
            {content.releaseYear ?? 'TBA'}
          </span>
        </div>
        <Link to={`/content/${content.type}/${content.externalId}`} className="mt-2 block text-sm font-semibold text-content-primary hover:text-accent">
          {content.title}
        </Link>
        <p className="mt-1 text-xs text-content-tertiary">Position {item.position}</p>
      </div>
      {isOwner && (
        <div className="col-span-2 flex items-center justify-end gap-1 border-t border-border pt-3 sm:col-span-1 sm:border-t-0 sm:pt-0">
          <GripVertical className="h-4 w-4 text-content-tertiary" aria-hidden="true" />
          <Button type="button" variant="ghost" className="min-h-9 px-2" aria-label={`Move ${content.title} up`} disabled={!canMoveUp || isPending} onClick={onMoveUp}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="min-h-9 px-2" aria-label={`Move ${content.title} down`} disabled={!canMoveDown || isPending} onClick={onMoveDown}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" className="min-h-9 px-2 text-danger hover:text-danger" aria-label={`Remove ${content.title}`} disabled={isPending} onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </article>
  );
}
