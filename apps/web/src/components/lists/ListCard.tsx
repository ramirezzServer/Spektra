import { Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/formatters';
import { buildListPath } from '@/lib/slugs';
import type { UserList } from '@/types';

interface ListCardProps {
  list: UserList;
  onEdit?: (list: UserList) => void;
  onDelete?: (list: UserList) => void;
}

export function ListCard({ list, onEdit, onDelete }: ListCardProps) {
  const previews = list.previewItems ?? [];

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <Link to={buildListPath(list)} className="block focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
        <div className="grid h-28 grid-cols-5 gap-1 overflow-hidden rounded-md bg-bg-secondary">
          {previews.length > 0 ? (
            previews.slice(0, 5).map((item) => (
              <div key={item.id} className="min-w-0 bg-bg-tertiary">
                <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover" />
              </div>
            ))
          ) : (
            <div className="col-span-5 flex items-center justify-center text-sm text-content-tertiary">No items yet</div>
          )}
        </div>
        <div className="mt-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 break-words text-base font-semibold text-content-primary">{list.name}</h2>
            <Badge className={list.isPublic ? 'border-accent-light bg-accent-light text-accent' : 'border-border bg-bg-secondary text-content-tertiary'}>
              {list.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
          {list.description && <p className="mt-2 line-clamp-2 break-words text-sm text-content-secondary">{list.description}</p>}
          <p className="mt-3 text-xs font-medium text-content-tertiary">{formatNumber(list.itemsCount ?? 0)} items</p>
        </div>
      </Link>
      {(onEdit || onDelete) && (
        <div className="mt-4 flex justify-end gap-2 border-t border-border pt-3">
          {onEdit && (
            <Button type="button" variant="ghost" className="min-w-12 px-2" aria-label={`Edit ${list.name}`} onClick={() => onEdit(list)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="ghost" className="min-w-12 px-2 text-danger hover:text-danger" aria-label={`Delete ${list.name}`} onClick={() => onDelete(list)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
