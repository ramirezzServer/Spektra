import { Eye, Layers, Lock, Plus, Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListFormModal } from '@/components/lists/ListFormModal';
import { ListGrid } from '@/components/lists/ListGrid';
import { SEO } from '@/components/seo/SEO';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { listErrorMessage, useCreateList, useDeleteList, useMyLists, useUpdateList } from '@/hooks/useLists';
import { formatNumber } from '@/lib/formatters';
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
  const loadedLists = lists.data?.data ?? [];
  const counts = useMemo(() => ({
    total: lists.data?.meta.total ?? loadedLists.length,
    public: loadedLists.filter((list) => list.isPublic).length,
    private: loadedLists.filter((list) => !list.isPublic).length,
    visibleItems: loadedLists.reduce((sum, list) => sum + (list.itemsCount ?? 0), 0),
  }), [lists.data?.meta.total, loadedLists]);

  function openCreate() {
    setEditing(null);
    setError(null);
    setFormOpen(true);
  }

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
    if (!deleting || deleteList.isPending) return;
    try {
      await deleteList.mutateAsync(deleting.id);
      setDeleting(null);
    } catch (err) {
      setError(listErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <SEO title="Lists" description="Your private Spektra lists." canonicalPath="/lists" noIndex />
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(91,77,255,0.55),transparent_24rem),radial-gradient(circle_at_88%_16%,rgba(20,184,166,0.24),transparent_22rem)]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-100/80">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Collection studio
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Lists</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-200">Build curated collections from real Spektra content.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create List
            </Button>
            <Link to="/search" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-black text-white hover:bg-white/20">
              <Search className="h-4 w-4" />
              Search
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
          <Sparkles className="h-5 w-5 text-accent" aria-hidden="true" />
          <p className="mt-3 text-2xl font-black text-content-primary">{lists.isLoading ? '-' : formatNumber(counts.total)}</p>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">Total lists</p>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
          <Eye className="h-5 w-5 text-accent" aria-hidden="true" />
          <p className="mt-3 text-2xl font-black text-content-primary">{lists.isLoading ? '-' : formatNumber(counts.public)}</p>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">Public on page</p>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
          <Lock className="h-5 w-5 text-accent" aria-hidden="true" />
          <p className="mt-3 text-2xl font-black text-content-primary">{lists.isLoading ? '-' : formatNumber(counts.private)}</p>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">Private on page</p>
        </div>
        <div className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
          <Layers className="h-5 w-5 text-accent" aria-hidden="true" />
          <p className="mt-3 text-2xl font-black text-content-primary">{lists.isLoading ? '-' : formatNumber(counts.visibleItems)}</p>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">Items on page</p>
        </div>
      </section>

      {error && !formOpen && !deleting ? <p className="rounded-2xl bg-danger-light p-3 text-sm font-bold text-danger-text">{error}</p> : null}

      <ListGrid
        lists={loadedLists}
        page={page}
        lastPage={lists.data?.meta.lastPage ?? 1}
        isLoading={lists.isLoading}
        isError={lists.isError}
        isFetching={lists.isFetching}
        onPageChange={setPage}
        onCreate={openCreate}
        onEdit={(list) => { setEditing(list); setError(null); setFormOpen(true); }}
        onDelete={setDeleting}
      />

      <ListFormModal open={formOpen} list={editing} isPending={createList.isPending || updateList.isPending} error={error} onClose={() => { setFormOpen(false); setEditing(null); }} onSubmit={submit} />

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
