import { Calendar, Edit2, Eye, Lock, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PosterImage } from '@/components/content/PosterImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatNumber } from '@/lib/formatters';
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
    <article className="overflow-hidden rounded-3xl border border-border-subtle bg-surface/95 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-cardHover motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <Link to={buildListPath(list)} className="block focus:outline-none focus:ring-4 focus:ring-accent/20">
        <div className="grid h-40 grid-cols-4 gap-1 bg-slate-950 p-1">
          {previews.length > 0 ? (
            previews.slice(0, 4).map((item, index) => (
              <div key={item.id} className={index === 0 ? 'col-span-2 row-span-2 min-w-0 overflow-hidden rounded-2xl bg-bg-tertiary' : 'min-w-0 overflow-hidden rounded-xl bg-bg-tertiary'}>
                <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover" />
              </div>
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_0%,rgba(91,77,255,0.35),transparent_14rem)] text-sm font-black text-slate-300">No items yet</div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="line-clamp-2 break-words text-lg font-black leading-tight text-content-primary">{list.name}</h2>
            <Badge className={list.isPublic ? 'border-accent-light bg-accent-light text-accent' : 'border-border bg-bg-subtle text-content-tertiary'}>
              {list.isPublic ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {list.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
          {list.description ? <p className="mt-2 line-clamp-2 break-words text-sm font-semibold leading-6 text-content-secondary">{list.description}</p> : <p className="mt-2 text-sm font-semibold text-content-tertiary">No description yet.</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">
            <span>{formatNumber(list.itemsCount ?? 0)} items</span>
            <span className="inline-flex items-center gap-1 normal-case tracking-normal">
              <Calendar className="h-3 w-3" aria-hidden="true" />
              Updated {formatDate(list.updatedAt, { month: 'short', day: '2-digit', year: 'numeric' })}
            </span>
          </div>
        </div>
      </Link>
      {(onEdit || onDelete) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle px-4 py-3">
          <Link to={buildListPath(list)} className="inline-flex min-h-10 items-center rounded-xl px-3 text-sm font-black text-accent hover:bg-accent-light">
            View list
          </Link>
          <div className="flex gap-2">
          {onEdit ? (
            <Button type="button" variant="ghost" className="min-w-12 px-2" aria-label={`Edit ${list.name}`} onClick={() => onEdit(list)}>
              <Edit2 className="h-4 w-4" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button type="button" variant="ghost" className="min-w-12 px-2 text-danger hover:text-danger" aria-label={`Delete ${list.name}`} onClick={() => onDelete(list)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
