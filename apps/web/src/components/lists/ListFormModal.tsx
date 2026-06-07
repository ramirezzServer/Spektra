import { useEffect, useState, type FormEvent } from 'react';
import { Eye, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { UserList } from '@/types';
import { useDraftStorage } from '@/hooks/useDraftStorage';
import { useAuthStore } from '@/stores/authStore';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

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
  const { isOnline } = useOnlineStatus();

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
    if (!isOnline) {
      setNameError('You appear to be offline. Check your connection and try again.');
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
        <div className="rounded-3xl border border-border-subtle bg-slate-950 p-4 text-white shadow-card">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-200" aria-hidden="true" />
            <p className="text-sm font-black">Collection settings</p>
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">Lists can stay private or become public showcases. No fake data, only content you add.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="list-name" className="text-sm font-black text-content-primary">
            Name
          </label>
          <Input
            id="list-name"
            name="list-name"
            value={name}
            maxLength={100}
            autoComplete="off"
            enterKeyHint="next"
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
          <label htmlFor="list-description" className="text-sm font-black text-content-primary">
            Description
          </label>
          <Textarea
            id="list-description"
            name="list-description"
            value={description}
            maxLength={1000}
            autoComplete="off"
            onChange={(event) => {
              setDescription(event.target.value);
              if (!list) descriptionDraft.setValue(event.target.value);
            }}
          />
          <p className="text-xs text-content-tertiary">{description.length}/1000</p>
        </div>
        <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-bg-subtle px-3 text-sm font-bold text-content-secondary">
          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="h-4 w-4 rounded border-border text-accent focus:ring-accent" />
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-accent">
            {isPublic ? <Eye className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
          </span>
          <span>
            <span className="block text-content-primary">{isPublic ? 'Public list' : 'Private list'}</span>
            <span className="block text-xs text-content-tertiary">{isPublic ? 'Visible to others when routed publicly.' : 'Only you can manage this collection.'}</span>
          </span>
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
          <Button type="submit" disabled={isPending || !isOnline}>
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
