import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
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
  const [message, setMessage] = useState<string | null>(null);

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
        {lists.isLoading && <p className="text-sm text-content-tertiary">Loading your lists...</p>}
        {lists.isError && <p className="text-sm text-danger">Unable to load lists.</p>}
        {lists.data?.data.length ? (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {lists.data.data.map((list) => (
              <button
                key={list.id}
                type="button"
                disabled={addItem.isPending || !isOnline}
                onClick={() => addToList(list.id)}
                className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-border bg-bg-secondary px-3 py-3 text-left text-sm transition hover:border-accent active:scale-[0.99] disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-content-primary">{list.name}</span>
                  <span className="text-xs text-content-tertiary">{formatNumber(list.itemsCount ?? 0)} items</span>
                </span>
                <Plus className="h-4 w-4 shrink-0 text-accent" />
              </button>
            ))}
          </div>
        ) : (
          !lists.isLoading && <p className="text-sm text-content-tertiary">You do not have any lists yet.</p>
        )}
        <div className="space-y-2 border-t border-border pt-4">
          <label htmlFor="quick-list-name" className="text-sm font-medium text-content-primary">
            New private list
          </label>
          <div className="flex gap-2">
            <Input id="quick-list-name" name="list-name" value={newName} maxLength={100} autoComplete="off" enterKeyHint="done" onChange={(event) => setNewName(event.target.value)} placeholder="List name" />
            <Button type="button" disabled={!newName.trim() || createList.isPending || addItem.isPending || !isOnline} onClick={createAndAdd}>
              Create
            </Button>
          </div>
        </div>
        {message && (
          <p className="text-sm text-content-secondary" role="status" aria-live="polite">
            {message}
          </p>
        )}
      </div>
    </Dialog>
  );
}
