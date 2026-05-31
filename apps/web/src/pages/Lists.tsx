import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ListFormModal } from '@/components/lists/ListFormModal';
import { ListGrid } from '@/components/lists/ListGrid';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { listErrorMessage, useCreateList, useDeleteList, useMyLists, useUpdateList } from '@/hooks/useLists';
import { useAuthStore } from '@/stores/authStore';
import type { UserList } from '@/types';

export function Lists() {
  const [page, setPage] = useState(1);
  const lists = useMyLists(page, 20);
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const [editing, setEditing] = useState<UserList | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<UserList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);

  async function submit(input: { name: string; description: string | null; isPublic: boolean }) {
    setError(null);
    if (createList.isPending || updateList.isPending) return;
    try {
      if (editing) await updateList.mutateAsync({ ...input, id: editing.id });
      else {
        await createList.mutateAsync(input);
        sessionStorage.removeItem(`spektra:draft:list:${user?.id ?? 'guest'}:new:name`);
        sessionStorage.removeItem(`spektra:draft:list:${user?.id ?? 'guest'}:new:description`);
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      setError(listErrorMessage(err));
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    if (deleteList.isPending) return;
    try {
      await deleteList.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (err) {
      setError(listErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <SEO title="Lists" description="Your private Spektra lists." canonicalPath="/lists" noIndex />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-content-primary">Lists</h1>
          <p className="mt-1 text-sm text-content-secondary">Create custom collections from real Spektra content.</p>
        </div>
        <Button onClick={() => { setEditing(null); setError(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />
          Create List
        </Button>
      </div>

      {error && !formOpen && !deleting && <p className="text-sm text-danger">{error}</p>}

      <ListGrid
        lists={lists.data?.data ?? []}
        page={page}
        lastPage={lists.data?.meta.lastPage ?? 1}
        isLoading={lists.isLoading}
        isError={lists.isError}
        isFetching={lists.isFetching}
        onPageChange={setPage}
        onEdit={(list) => { setEditing(list); setError(null); setFormOpen(true); }}
        onDelete={setDeleting}
      />

      <ListFormModal
        open={formOpen}
        list={editing}
        isPending={createList.isPending || updateList.isPending}
        error={error}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={submit}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this list?"
        description={deleting ? `${deleting.name} and its items will be removed. This action cannot be undone.` : 'This list and its items will be removed. This action cannot be undone.'}
        confirmLabel="Delete"
        isPending={deleteList.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
