import { CheckCircle2, Eye, ListPlus, Lock, Plus, RefreshCw, Search, WifiOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PosterImage } from '@/components/content/PosterImage';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { listErrorMessage, useAddListItem, useCreateList, useMyLists } from '@/hooks/useLists';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { formatNumber } from '@/lib/formatters';
import type { ContentItem } from '@/types';

interface AddToListModalProps {
  open: boolean;
  content: ContentItem | null;
  onClose: () => void;
}

export function AddToListModal({ open, content, onClose }: AddToListModalProps) {
  const lists = useMyLists(1, 50);
  const addItem = useAddListItem();
  const createList = useCreateList();
  const { isOnline } = useOnlineStatus();
  const [newName, setNewName] = useState('');
  const [listQuery, setListQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const filteredLists = useMemo(() => {
    const query = listQuery.trim().toLowerCase();
    const all = lists.data?.data ?? [];
    if (!query) return all;
    return all.filter((list) => `${list.name} ${list.description ?? ''}`.toLowerCase().includes(query));
  }, [listQuery, lists.data?.data]);

  async function addToList(listId: string) {
    if (!content) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
    if (addItem.isPending) return;
    setMessage(null);
    try {
      await addItem.mutateAsync({ listId, contentId: content.id, content });
      setMessage('Added to list.');
    } catch (error) {
      setMessage(listErrorMessage(error));
    }
  }

  async function createAndAdd() {
    if (!content || !newName.trim()) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
    if (createList.isPending || addItem.isPending) return;
    setMessage(null);
    try {
      const list = await createList.mutateAsync({ name: newName, description: null, isPublic: false });
      await addItem.mutateAsync({ listId: list.id, contentId: content.id, content });
      setNewName('');
      setMessage('Created list and added item.');
    } catch (error) {
      setMessage(listErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} title="Add to list" description={content ? `Choose a list for ${content.title}.` : undefined} onClose={onClose}>
      <div className="space-y-4">
        {content ? (
          <div className="rounded-3xl border border-border-subtle bg-bg-subtle p-3">
            <p className="line-clamp-2 text-sm font-black text-content-primary">{content.title}</p>
            <p className="mt-1 text-xs font-bold capitalize text-content-tertiary">{content.type}{content.releaseYear ? ` / ${content.releaseYear}` : ''}</p>
          </div>
        ) : null}
        {lists.isLoading && (
          <div className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-bg-subtle p-3 text-sm font-bold text-content-tertiary">
            <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading your lists...
          </div>
        )}
        {!isOnline ? (
          <div className="flex items-center gap-2 rounded-2xl bg-warning-light p-3 text-sm font-bold text-warning-text">
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            You are offline. Add/create actions are disabled.
          </div>
        ) : null}
        {lists.isError && <p className="rounded-2xl bg-danger-light p-3 text-sm font-bold text-danger-text">Unable to load lists.</p>}
        {lists.data?.data.length ? (
          <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-tertiary" aria-hidden="true" />
            <Input value={listQuery} name="list-filter" autoComplete="off" onChange={(event) => setListQuery(event.target.value)} placeholder="Filter lists..." className="pl-9" />
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {filteredLists.map((list) => (
              <button
                key={list.id}
                type="button"
                disabled={addItem.isPending || !isOnline}
                onClick={() => addToList(list.id)}
                className="flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border border-border bg-bg-subtle px-3 py-3 text-left text-sm shadow-xs transition hover:border-accent/50 hover:bg-surface active:scale-[0.99] disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-xl bg-accent-light text-accent">
                    {list.previewItems?.length ? list.previewItems.slice(0, 4).map((item) => (
                      <span key={item.id} className="overflow-hidden bg-bg-tertiary">
                        <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover" />
                      </span>
                    )) : <span className="col-span-2 flex items-center justify-center"><ListPlus className="h-4 w-4" aria-hidden="true" /></span>}
                  </span>
                  <span className="min-w-0">
                  <span className="block truncate font-black text-content-primary">{list.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-content-tertiary">
                    <span>{formatNumber(list.itemsCount ?? 0)} items</span>
                    <Badge className={list.isPublic ? 'bg-accent-light text-accent' : 'bg-bg-tertiary text-content-tertiary'}>
                      {list.isPublic ? <Eye className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      {list.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </span>
                  </span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-accent" />
              </button>
            ))}
            {!filteredLists.length ? <p className="rounded-2xl border border-dashed border-border bg-bg-subtle p-4 text-sm font-semibold text-content-tertiary">No lists match that filter.</p> : null}
          </div>
          </>
        ) : (
          !lists.isLoading && <p className="rounded-2xl border border-dashed border-border bg-bg-subtle p-4 text-sm font-semibold text-content-tertiary">You do not have any lists yet. Create a private list below and this item will be added automatically.</p>
        )}
        <div className="space-y-2 border-t border-border pt-4">
          <label htmlFor="quick-list-name" className="text-sm font-black text-content-primary">
            New private list
          </label>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input id="quick-list-name" name="list-name" value={newName} maxLength={100} autoComplete="off" enterKeyHint="done" onChange={(event) => setNewName(event.target.value)} placeholder="List name" />
            <Button type="button" disabled={!newName.trim() || createList.isPending || addItem.isPending || !isOnline} onClick={createAndAdd}>
              Create
            </Button>
          </div>
        </div>
        {message && (
          <p className="inline-flex items-center gap-2 rounded-2xl bg-success-light p-3 text-sm font-bold text-success-text" role="status" aria-live="polite">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
