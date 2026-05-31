import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { UserList } from '@/types';
import { useDraftStorage } from '@/hooks/useDraftStorage';
import { useAuthStore } from '@/stores/authStore';

interface ListFormModalProps {
  open: boolean;
  list?: UserList | null;
  isPending?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: { name: string; description: string | null; isPublic: boolean }) => void;
}

export function ListFormModal({ open, list, isPending = false, error, onClose, onSubmit }: ListFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const user = useAuthStore((state) => state.user);
  const draftKey = open && !list ? `spektra:draft:list:${user?.id ?? 'guest'}:new` : null;
  const nameDraft = useDraftStorage(draftKey ? `${draftKey}:name` : null);
  const descriptionDraft = useDraftStorage(draftKey ? `${draftKey}:description` : null);

  useEffect(() => {
    if (!open) return;
    setName(list?.name ?? '');
    setDescription(list?.description ?? '');
    setIsPublic(Boolean(list?.isPublic));
    setNameError(null);
  }, [open, list]);

  useEffect(() => {
    if (!open || list) return;
    if (nameDraft.value) setName(nameDraft.value);
    if (descriptionDraft.value) setDescription(descriptionDraft.value);
  }, [descriptionDraft.value, list, nameDraft.value, open]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required.');
      return;
    }
    if (trimmed.length > 100) {
      setNameError('Name must be 100 characters or fewer.');
      return;
    }
    if (isPending) return;
    onSubmit({ name: trimmed, description: description.trim() || null, isPublic });
  }

  const hasMeaningfulDraft = open && (
    name.trim() !== (list?.name ?? '') ||
    description.trim() !== (list?.description ?? '') ||
    isPublic !== Boolean(list?.isPublic)
  );

  function requestClose() {
    if (hasMeaningfulDraft) {
      setDiscarding(true);
      return;
    }
    onClose();
  }

  function discardDraft() {
    if (!list) {
      nameDraft.clearDraft();
      descriptionDraft.clearDraft();
    }
    setDiscarding(false);
    onClose();
  }

  return (
    <Dialog open={open} title={list ? 'Edit list' : 'Create list'} description="Organize content into your own curated collection." onClose={requestClose}>
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-1.5">
          <label htmlFor="list-name" className="text-sm font-medium text-content-primary">
            Name
          </label>
          <Input
            id="list-name"
            value={name}
            maxLength={100}
            autoFocus
            onChange={(event) => {
              setName(event.target.value);
              if (!list) nameDraft.setValue(event.target.value);
            }}
            aria-invalid={Boolean(nameError)}
            aria-describedby="list-name-error"
          />
          {nameError && (
            <p id="list-name-error" className="text-sm text-danger">
              {nameError}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="list-description" className="text-sm font-medium text-content-primary">
            Description
          </label>
          <Textarea
            id="list-description"
            value={description}
            maxLength={1000}
            onChange={(event) => {
              setDescription(event.target.value);
              if (!list) descriptionDraft.setValue(event.target.value);
            }}
          />
          <p className="text-xs text-content-tertiary">{description.length}/1000</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-content-secondary">
          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
          Public list
        </label>
        {error && (
          <p className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={requestClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save list'}
          </Button>
        </div>
      </form>
      <ConfirmDialog
        open={discarding}
        title="Discard this draft?"
        description="Your unsaved list changes will be removed."
        confirmLabel="Discard"
        onCancel={() => setDiscarding(false)}
        onConfirm={discardDraft}
      />
    </Dialog>
  );
}
