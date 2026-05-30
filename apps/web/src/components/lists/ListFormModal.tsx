import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { UserList } from '@/types';

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

  useEffect(() => {
    if (!open) return;
    setName(list?.name ?? '');
    setDescription(list?.description ?? '');
    setIsPublic(Boolean(list?.isPublic));
    setNameError(null);
  }, [open, list]);

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
    onSubmit({ name: trimmed, description: description.trim() || null, isPublic });
  }

  return (
    <Dialog open={open} title={list ? 'Edit list' : 'Create list'} description="Organize content into your own curated collection." onClose={onClose}>
      <form className="space-y-4" onSubmit={submit}>
        <div className="space-y-1.5">
          <label htmlFor="list-name" className="text-sm font-medium text-content-primary">
            Name
          </label>
          <Input id="list-name" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(nameError)} aria-describedby="list-name-error" />
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
          <Textarea id="list-description" value={description} maxLength={1000} onChange={(event) => setDescription(event.target.value)} />
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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save list'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
