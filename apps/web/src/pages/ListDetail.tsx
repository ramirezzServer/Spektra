import { ArrowLeft, Edit2, Eye, Lock, Search, Trash2, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ListFormModal } from '@/components/lists/ListFormModal';
import { ListItemGrid } from '@/components/lists/ListItemGrid';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/seo/SEO';
import { listErrorMessage, useDeleteList, useListDetail, useRemoveListItem, useReorderListItems, useUpdateList } from '@/hooks/useLists';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatDate, formatNumber } from '@/lib/formatters';
import { buildListPath } from '@/lib/slugs';
import { useAuthStore } from '@/stores/authStore';
import type { ListItem } from '@/types';

export function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [view, setViewState] = useState<'list' | 'grid'>(() => {
    if (typeof window === 'undefined') return 'list';
    return window.localStorage.getItem('spektra:list-detail:view') === 'grid' ? 'grid' : 'list';
  });
  const detail = useListDetail(listId, page, 20);
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const removeItem = useRemoveListItem();
  const reorderItems = useReorderListItems();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState<ListItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const list = detail.data?.data;
  const isOwner = Boolean(user?.id && list?.userId === user.id);
  const { isOnline } = useOnlineStatus();

  function setView(next: 'list' | 'grid') {
    setViewState(next);
    if (typeof window !== 'undefined') window.localStorage.setItem('spektra:list-detail:view', next);
  }

  useEffect(() => {
    if (!list) return;
    const canonicalPath = buildListPath(list);
    if (location.pathname !== canonicalPath) {
      navigate(`${canonicalPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [list, location.hash, location.pathname, location.search, navigate]);

  async function submit(input: { name: string; description: string | null; isPublic: boolean }) {
    if (!list) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
    if (updateList.isPending) return;
    setMessage(null);
    try {
      await updateList.mutateAsync({ ...input, id: list.id });
      setEditing(false);
    } catch (error) {
      setMessage(listErrorMessage(error));
    }
  }

  async function deleteCurrentList() {
    if (!list) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
    if (deleteList.isPending) return;
    setMessage(null);
    try {
      await deleteList.mutateAsync(list.id);
      navigate('/lists');
    } catch (error) {
      setMessage(listErrorMessage(error));
    }
  }

  async function removeConfirmed() {
    if (!list || !removing) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
    if (removeItem.isPending) return;
    try {
      await removeItem.mutateAsync({ listId: list.id, contentId: removing.contentId });
      setRemoving(null);
    } catch (error) {
      setMessage(listErrorMessage(error));
    }
  }

  async function move(fromIndex: number, direction: -1 | 1) {
    if (!list) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
    if (reorderItems.isPending) return;
    const items = [...list.items];
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return;
    const moved = items[fromIndex];
    items[fromIndex] = items[toIndex];
    items[toIndex] = moved;
    const ordered = items.map((item, index) => ({ contentId: item.contentId, position: (page - 1) * 20 + index + 1 }));
    try {
      await reorderItems.mutateAsync({ listId: list.id, items: ordered });
    } catch (error) {
      setMessage(listErrorMessage(error));
    }
  }

  if (detail.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
    );
  }

  if (detail.isError || !list) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card">
        <SEO title="List not found" description="This list is unavailable." noIndex />
        <h1 className="text-lg font-black text-content-primary">List not found</h1>
        <p className="mt-2 text-sm font-semibold text-content-tertiary">It may be private or deleted.</p>
        <Link to="/lists" className="mt-4 inline-flex text-sm font-black text-accent hover:text-accent-hover">Back to lists</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <SEO title={list.name} description={list.description ?? `${list.name} on Spektra.`} canonicalPath={buildListPath(list)} noIndex={!list.isPublic} />
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(91,77,255,0.55),transparent_24rem),radial-gradient(circle_at_88%_16%,rgba(20,184,166,0.24),transparent_22rem)]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link to="/lists" className="inline-flex items-center gap-2 text-sm font-black text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to lists
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge className={list.isPublic ? 'border-white/20 bg-white text-slate-950' : 'border-white/15 bg-white/10 text-white'}>
                {list.isPublic ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {list.isPublic ? 'Public' : 'Private'}
              </Badge>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-black text-slate-100">{formatNumber(list.itemsCount ?? detail.data?.meta.total ?? 0)} items</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-black text-slate-100">Updated {formatDate(list.updatedAt, { month: 'short', day: '2-digit', year: 'numeric' })}</span>
            </div>
            <h1 className="mt-3 overflow-wrap-anywhere text-3xl font-black tracking-tight md:text-5xl">{list.name}</h1>
            {list.description ? <p className="mt-2 max-w-3xl break-words text-sm font-semibold leading-6 text-slate-200">{list.description}</p> : <p className="mt-2 text-sm font-semibold text-slate-300">No description yet.</p>}
            {list.owner ? (
              <Link to={`/profile/${list.owner.username}`} className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-slate-100 hover:bg-white/20">
                <Avatar src={list.owner.avatarUrl} alt={list.owner.username} size="sm" />
                @{list.owner.username}
              </Link>
            ) : (
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-slate-300">
                <UserRound className="h-4 w-4" />
                Curated list
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/search" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white hover:bg-white/20">
              <Search className="h-4 w-4" />
              Search
            </Link>
            {isOwner ? (
              <>
                <Button type="button" variant="secondary" disabled={!isOnline} onClick={() => setEditing(true)}>
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button type="button" variant="ghost" className="border border-white/15 bg-white/10 text-white hover:bg-white/20 hover:text-white" disabled={!isOnline} onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {message ? <p className="rounded-2xl border border-border bg-surface px-3 py-2 text-sm font-bold text-content-secondary shadow-xs">{message}</p> : null}

      <ListItemGrid
        items={list.items}
        page={page}
        lastPage={detail.data?.meta.lastPage ?? 1}
        isOwner={isOwner}
        isLoading={detail.isLoading}
        isError={detail.isError}
        isFetching={detail.isFetching}
        isPending={removeItem.isPending || reorderItems.isPending || !isOnline}
        emptyMessage={isOwner ? 'Add content from Search or Content pages.' : 'This list has no items yet.'}
        view={view}
        onViewChange={setView}
        onPageChange={setPage}
        onMove={move}
        onRemove={setRemoving}
      />

      <ListFormModal open={editing} list={list} isPending={updateList.isPending} error={message} onClose={() => setEditing(false)} onSubmit={submit} />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this list?"
        description={`${list.name} and its items will be removed. This action cannot be undone.`}
        confirmLabel="Delete"
        isPending={deleteList.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteCurrentList}
      />

      <ConfirmDialog
        open={Boolean(removing)}
        title="Remove this item?"
        description={`${removing?.content?.title ?? 'This item'} will be removed from this list. You can add it again later.`}
        confirmLabel="Remove"
        isPending={removeItem.isPending}
        onCancel={() => setRemoving(null)}
        onConfirm={removeConfirmed}
      />
    </div>
  );
}
