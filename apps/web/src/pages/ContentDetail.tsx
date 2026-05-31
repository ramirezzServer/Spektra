import { Calendar, Check, Clock, Gamepad2, Plus, Star, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AddToListModal } from '@/components/lists/AddToListModal';
import { RatingStars } from '@/components/content/RatingStars';
import { PosterImage } from '@/components/content/PosterImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/seo/SEO';
import { useContentItem } from '@/hooks/useContent';
import { useDraftStorage } from '@/hooks/useDraftStorage';
import { libraryErrorMessage, useDeleteEntry, useEntryByContent, useUpsertEntry } from '@/hooks/useLibrary';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/formatters';
import { useAuthStore } from '@/stores/authStore';
import type { ContentType, EntryStatus, UserEntry } from '@/types';

const typeClass: Record<ContentType, string> = {
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function highlightValue(value: unknown): string | null {
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return null;
}

const statusOptions: Array<{ value: EntryStatus; label: string; icon: typeof Plus }> = [
  { value: 'want', label: 'Want', icon: Plus },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'done', label: 'Done', icon: Check },
];

export function ContentDetail() {
  const { type = '', id = '' } = useParams();
  const content = useContentItem(type, id);
  const item = content.data;
  const metadata = item?.metadata ?? {};
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const entry = useEntryByContent(item?.id);
  const upsertEntry = useUpsertEntry();
  const deleteEntry = useDeleteEntry();
  const [review, setReview] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const draft = useDraftStorage(item && user ? `spektra:draft:review:${user.id}:${item.id}` : null, entry.data?.review ?? '');

  useEffect(() => {
    setReview(draft.value);
  }, [draft.value]);

  const savedReview = entry.data?.review ?? '';
  const hasUnsavedReview = isAuthenticated && review !== savedReview;
  useUnsavedChangesWarning(hasUnsavedReview);

  async function saveEntry(next: Partial<Pick<UserEntry, 'status' | 'rating' | 'review'>>) {
    if (!item) return;
    if (upsertEntry.isPending) return;
    setMessage(null);
    try {
      await upsertEntry.mutateAsync({
        content_id: item.id,
        status: next.status ?? entry.data?.status ?? 'done',
        rating: next.rating ?? entry.data?.rating ?? null,
        review: next.review ?? entry.data?.review ?? null,
      });
      if (typeof next.review === 'string') draft.clearDraft();
      setMessage('Saved.');
    } catch (error) {
      setMessage(libraryErrorMessage(error));
    }
  }

  async function removeEntry() {
    if (!entry.data || !item) return;
    if (deleteEntry.isPending) return;
    setMessage(null);
    try {
      await deleteEntry.mutateAsync({ id: entry.data.id, contentId: item.id });
      setReview('');
      draft.setValue('');
      draft.clearDraft();
      setMessage('Removed from your library.');
    } catch (error) {
      setMessage(libraryErrorMessage(error));
    }
  }

  function discardReviewDraft() {
    setReview(savedReview);
    draft.setValue('');
    draft.clearDraft();
    setConfirmDiscardOpen(false);
  }

  if (content.isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Skeleton className="aspect-[2/3] w-full max-w-72" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (content.isError || !item) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-content-primary">Content not found</h1>
          <p className="mt-2 text-sm text-content-tertiary">This item is not in Spektra yet.</p>
        </div>
      </div>
    );
  }

  const platforms = asStringArray(metadata.platforms);
  const authors = asStringArray(metadata.authors);
  const highlights = [
    item.type !== 'book' && { label: 'TMDB vote', value: highlightValue(metadata.voteAverage) },
    item.type !== 'book' && { label: 'Popularity', value: highlightValue(metadata.popularity) },
    item.type === 'game' && { label: 'Metacritic', value: highlightValue(metadata.metacritic) },
    item.type === 'game' && platforms.length > 0 && { label: 'Platforms', value: platforms.slice(0, 4).join(', ') },
    item.type === 'book' && authors.length > 0 && { label: 'Authors', value: authors.join(', ') },
  ].filter(Boolean) as Array<{ label: string; value: string | null }>;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 overflow-x-hidden lg:grid-cols-[minmax(220px,320px)_1fr]">
      <SEO
        title={item.title}
        description={typeof metadata.overview === 'string' && metadata.overview ? metadata.overview : `${item.title} on Spektra.`}
        image={item.posterUrl ?? undefined}
        type="article"
        canonicalPath={`/content/${item.type}/${item.externalId}`}
      />
      <div className="w-full max-w-80">
        <div className="aspect-[2/3] overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          {item.posterUrl ? (
            <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover" />
          ) : (
            <PosterImage src={null} title={item.title} type={item.type} className="h-full w-full" />
          )}
        </div>
      </div>

      <section className="min-w-0 space-y-6">
        <div className="space-y-3">
          <Badge className={cn('capitalize', typeClass[item.type])}>{item.type}</Badge>
          <h1 className="break-words text-3xl font-bold text-content-primary md:text-5xl">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-content-secondary">
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {item.releaseYear ?? 'TBA'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {item.avgRating !== null ? `${item.avgRating.toFixed(1)} average` : 'No Spektra rating'}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {formatNumber(item.ratingsCount)} ratings
            </span>
          </div>
        </div>

        {item.genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {item.genres.map((genre) => (
              <span key={genre} className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-content-secondary">
                {genre}
              </span>
            ))}
          </div>
        )}

        {typeof metadata.overview === 'string' && metadata.overview && (
          <p className="max-w-3xl text-base leading-7 text-content-secondary">{metadata.overview}</p>
        )}

        {highlights.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-semibold uppercase text-content-tertiary">{highlight.label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-content-primary">{highlight.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-content-primary">Your library</p>
            {entry.isFetching && isAuthenticated && <span className="text-xs text-content-tertiary">Syncing...</span>}
          </div>

          {!isAuthenticated ? (
            <div className="rounded-md border border-dashed border-border bg-bg-secondary p-4 text-sm text-content-secondary">
              <Link to="/login" className="font-semibold text-accent hover:text-accent-hover">Sign in</Link> to track status, rating, and review.
            </div>
          ) : (
            <>
              {entry.isLoading && (
                <div className="grid gap-2 sm:grid-cols-3" aria-label="Loading tracking controls">
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  const active = entry.data?.status === option.value;
                  return (
                    <Button
                      key={option.value}
                      disabled={upsertEntry.isPending || deleteEntry.isPending}
                      variant={active ? 'primary' : 'secondary'}
                      onClick={() => saveEntry({ status: option.value })}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-content-primary">Your rating</p>
                <RatingStars value={entry.data?.rating ?? null} disabled={upsertEntry.isPending} onChange={(rating) => saveEntry({ rating })} />
              </div>
              <div className="space-y-2">
                <textarea
                  maxLength={5000}
                  value={review}
                  onChange={(event) => {
                    setReview(event.target.value);
                    draft.setValue(event.target.value);
                  }}
                  disabled={upsertEntry.isPending}
                  className="min-h-28 w-full resize-none rounded-lg border border-border bg-bg-secondary p-3 text-sm text-content-secondary placeholder:text-content-tertiary"
                  placeholder="Write your review..."
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-content-tertiary">
                    {review.length}/5000
                    {draft.restored ? ' · Draft restored' : ''}
                  </span>
                  <div className="flex gap-2">
                    {hasUnsavedReview && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={upsertEntry.isPending}
                        onClick={() => setConfirmDiscardOpen(true)}
                      >
                        Discard draft
                      </Button>
                    )}
                    {entry.data && (
                      <Button variant="ghost" disabled={deleteEntry.isPending} onClick={() => setConfirmRemoveOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    )}
                    <Button disabled={upsertEntry.isPending} onClick={() => saveEntry({ review })}>
                      Save review
                    </Button>
                  </div>
                </div>
              </div>
              {message && <p className="text-sm text-content-secondary" role="status" aria-live="polite">{message}</p>}
            </>
          )}
        </div>

        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-content-primary">Custom lists</p>
              <p className="mt-1 text-sm text-content-tertiary">Add this item to one of your curated lists.</p>
            </div>
            {isAuthenticated ? (
              <Button type="button" variant="secondary" onClick={() => setAddToListOpen(true)}>
                <Plus className="h-4 w-4" />
                Add to List
              </Button>
            ) : (
              <Link to="/login" className="text-sm font-semibold text-accent hover:text-accent-hover">
                Sign in to add
              </Link>
            )}
          </div>
        </div>

        {item.type === 'game' && platforms.length > 0 && (
          <p className="inline-flex items-center gap-2 text-sm text-content-secondary">
            <Gamepad2 className="h-4 w-4" />
            {platforms.slice(0, 6).join(', ')}
          </p>
        )}
      </section>
      <AddToListModal open={addToListOpen} content={item} onClose={() => setAddToListOpen(false)} />
      <ConfirmDialog
        open={confirmDiscardOpen}
        title="Discard this draft?"
        description="Your unsaved review text will be removed."
        confirmLabel="Discard"
        onCancel={() => setConfirmDiscardOpen(false)}
        onConfirm={discardReviewDraft}
      />
      <ConfirmDialog
        open={confirmRemoveOpen}
        title="Remove from library?"
        description={`${item.title} will be removed from your library. You can add it again later.`}
        confirmLabel="Remove"
        isPending={deleteEntry.isPending}
        onCancel={() => setConfirmRemoveOpen(false)}
        onConfirm={async () => {
          await removeEntry();
          setConfirmRemoveOpen(false);
        }}
      />
    </div>
  );
}
