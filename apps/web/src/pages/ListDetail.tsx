import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ListFormModal } from '@/components/lists/ListFormModal';
import { ListItemGrid } from '@/components/lists/ListItemGrid';
import { SEO } from '@/components/seo/SEO';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { listErrorMessage, useDeleteList, useListDetail, useRemoveListItem, useReorderListItems, useUpdateList } from '@/hooks/useLists';
import { formatNumber } from '@/lib/formatters';
import { useAuthStore } from '@/stores/authStore';
import type { ListItem } from '@/types';

export function ListDetail() {
  const { listId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
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

  async function submit(input: { name: string; description: string | null; isPublic: boolean }) {
    if (!list) return;
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
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }

  if (detail.isError || !list) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
        <SEO title="List not found" description="This list is unavailable." noIndex />
        <h1 className="text-lg font-semibold text-content-primary">List not found</h1>
        <p className="mt-2 text-sm text-content-tertiary">It may be private or deleted.</p>
        <Link to="/lists" className="mt-4 inline-flex text-sm font-semibold text-accent hover:text-accent-hover">
          Back to lists
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SEO title={list.name} description={list.description ?? `${list.name} on Spektra.`} canonicalPath={`/lists/${list.id}`} noIndex={!list.isPublic} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={list.isPublic ? 'border-accent-light bg-accent-light text-accent' : 'border-border bg-bg-secondary text-content-tertiary'}>
              {list.isPublic ? 'Public' : 'Private'}
            </Badge>
            <span className="text-sm text-content-tertiary">{formatNumber(list.itemsCount ?? detail.data?.meta.total ?? 0)} items</span>
          </div>
          <h1 className="mt-3 overflow-wrap-anywhere text-3xl font-semibold text-content-primary">{list.name}</h1>
          {list.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-content-secondary">{list.description}</p>}
          {list.owner && <p className="mt-2 text-xs text-content-tertiary">By {list.owner.username}</p>}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button type="button" variant="ghost" className="text-danger hover:text-danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {message && <p className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-content-secondary">{message}</p>}

      <ListItemGrid
        items={list.items}
        page={page}
        lastPage={detail.data?.meta.lastPage ?? 1}
        isOwner={isOwner}
        isLoading={detail.isLoading}
        isError={detail.isError}
        isFetching={detail.isFetching}
        isPending={removeItem.isPending || reorderItems.isPending}
        emptyMessage={isOwner ? 'Add content from Search or Content pages.' : 'This list has no items yet.'}
        onPageChange={setPage}
        onMove={move}
        onRemove={setRemoving}
      />

      <ListFormModal open={editing} list={list} isPending={updateList.isPending} error={message} onClose={() => setEditing(false)} onSubmit={submit} />

      <Dialog open={confirmDelete} title="Delete list" description="This action removes the list and its items." onClose={() => setConfirmDelete(false)}>
        <div className="space-y-4">
          <p className="text-sm text-content-secondary">Delete “{list.name}”?</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={deleteList.isPending} className="bg-danger hover:bg-danger/90" onClick={deleteCurrentList}>
              Delete
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog open={Boolean(removing)} title="Remove item" description="This removes the item from this list only." onClose={() => setRemoving(null)}>
        <div className="space-y-4">
          <p className="text-sm text-content-secondary">Remove “{removing?.content?.title ?? 'this item'}”?</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button type="button" disabled={removeItem.isPending} className="bg-danger hover:bg-danger/90" onClick={removeConfirmed}>
              Remove
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
