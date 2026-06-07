import { BookOpen, Calendar, Check, Clock, Gamepad2, Layers, ListPlus, Plus, Sparkles, Star, Trash2, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AddToListModal } from '@/components/lists/AddToListModal';
import { PosterImage } from '@/components/content/PosterImage';
import { RatingStars } from '@/components/content/RatingStars';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/seo/SEO';
import { useContentItem } from '@/hooks/useContent';
import { useDraftStorage } from '@/hooks/useDraftStorage';
import { libraryErrorMessage, useDeleteEntry, useEntryByContent, useUpsertEntry } from '@/hooks/useLibrary';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { formatNumber } from '@/lib/formatters';
import { rememberRecentContent } from '@/lib/recentContent';
import { safeUrl } from '@/lib/safeUrl';
import { buildContentPath } from '@/lib/slugs';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { ContentItem, ContentType, EntryStatus, UserEntry } from '@/types';

const typeClass: Record<ContentType, string> = {
  film: 'border-film-light bg-film-light text-film-text',
  series: 'border-series-light bg-series-light text-series-text',
  game: 'border-game-light bg-game-light text-game-text',
  book: 'border-book-light bg-book-light text-book-text',
};

const statusTheme: Record<EntryStatus, string> = {
  want: 'border-accent/30 bg-accent-light text-accent',
  in_progress: 'border-info/30 bg-info-light text-info-text',
  done: 'border-success/30 bg-success-light text-success-text',
};

const statusOptions: Array<{ value: EntryStatus; label: string; icon: typeof Plus }> = [
  { value: 'want', label: 'Want', icon: Plus },
  { value: 'in_progress', label: 'In Progress', icon: Clock },
  { value: 'done', label: 'Done', icon: Check },
];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function valueText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

function backdropUrl(item: ContentItem): string | null {
  const metadata = item.metadata as Record<string, unknown>;
  return valueText(metadata.backdropUrl) ?? valueText(metadata.backdrop_path) ?? item.posterUrl;
}

function MetadataCard({ label, value, icon: Icon = Layers }: { label: string; value: string | null; icon?: typeof Layers }) {
  if (!value) return null;
  return (
    <div className="min-w-0 rounded-2xl border border-border-subtle bg-surface/90 p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-bold leading-6 text-content-primary">{value}</p>
    </div>
  );
}

export function ContentDetail() {
  const { type = '', id = '', slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const content = useContentItem(type, id);
  const item = content.data;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const entry = useEntryByContent(item?.id);
  const upsertEntry = useUpsertEntry();
  const deleteEntry = useDeleteEntry();
  const { isOnline } = useOnlineStatus();
  const [review, setReview] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const draft = useDraftStorage(item && user ? `spektra:draft:review:${user.id}:${item.id}` : null, entry.data?.review ?? '');

  useEffect(() => {
    if (!item) return;
    rememberRecentContent(item);
    const canonicalPath = buildContentPath(item);
    if (location.pathname !== canonicalPath) {
      navigate(`${canonicalPath}${location.search}${location.hash}`, { replace: true });
    }
  }, [item, location.hash, location.pathname, location.search, navigate, slug]);

  useEffect(() => {
    setReview(draft.value);
  }, [draft.value]);

  const savedReview = entry.data?.review ?? '';
  const hasUnsavedReview = isAuthenticated && review !== savedReview;
  useUnsavedChangesWarning(hasUnsavedReview);

  async function saveEntry(next: Partial<Pick<UserEntry, 'status' | 'rating' | 'review'>>) {
    if (!item) return;
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
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
    if (!isOnline) {
      setMessage('You appear to be offline. Check your connection and try again.');
      return;
    }
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

  const detailData = useMemo(() => {
    if (!item) return null;
    const metadata = item.metadata as Record<string, unknown>;
    const platforms = asStringArray(metadata.platforms);
    const authors = asStringArray(metadata.authors);
    const subjects = asStringArray(metadata.subjects);
    const overview = valueText(metadata.overview);
    const voteAverage = valueText(metadata.voteAverage);
    const popularity = valueText(metadata.popularity);
    const metacritic = valueText(metadata.metacritic);
    const firstPublishYear = valueText(metadata.firstPublishYear) ?? valueText(metadata.first_publish_year);

    const cards = [
      item.type !== 'book' ? { label: 'Vote average', value: voteAverage, icon: Star } : null,
      item.type !== 'book' ? { label: 'Popularity', value: popularity, icon: Sparkles } : null,
      item.type === 'game' ? { label: 'Platforms', value: platforms.slice(0, 8).join(', ') || null, icon: Gamepad2 } : null,
      item.type === 'game' ? { label: 'Metacritic', value: metacritic, icon: Star } : null,
      item.type === 'book' ? { label: 'Authors', value: authors.join(', ') || null, icon: UserRound } : null,
      item.type === 'book' ? { label: 'First published', value: firstPublishYear ?? (item.releaseYear ? String(item.releaseYear) : null), icon: Calendar } : null,
      item.type === 'book' ? { label: 'Subjects', value: subjects.slice(0, 10).join(', ') || item.genres.join(', ') || null, icon: BookOpen } : null,
    ].filter(Boolean) as Array<{ label: string; value: string | null; icon: typeof Layers }>;

    return { platforms, authors, subjects, overview, cards };
  }, [item]);

  if (content.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          <Skeleton className="aspect-[2/3] rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (content.isError || !item || !detailData) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center shadow-card">
        <div>
          <h1 className="text-lg font-black text-content-primary">Content not found</h1>
          <p className="mt-2 text-sm font-semibold text-content-tertiary">This item is not in Spektra yet.</p>
        </div>
      </div>
    );
  }

  const currentBackdrop = safeUrl(backdropUrl(item));
  const status = entry.data?.status;

  return (
    <div className="mx-auto w-full max-w-[1380px] overflow-x-hidden">
      <SEO
        title={item.title}
        description={detailData.overview ?? `${item.title} on Spektra.`}
        image={safeUrl(item.posterUrl) ?? undefined}
        type="article"
        canonicalPath={buildContentPath(item)}
      />

      <section className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 text-white shadow-panel">
        {currentBackdrop ? <img src={currentBackdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-38 blur-sm scale-105" loading="eager" decoding="async" /> : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_8%,rgba(91,77,255,0.42),transparent_28rem),linear-gradient(to_top,rgba(2,6,23,0.98),rgba(2,6,23,0.58)_48%,rgba(2,6,23,0.82))]" aria-hidden="true" />
        <div className="relative grid gap-5 p-5 md:p-7 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-end">
          <div className="mx-auto w-44 shrink-0 overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-floating backdrop-blur sm:w-52 lg:mx-0">
            <div className="aspect-[2/3]">
              <PosterImage src={item.posterUrl} title={item.title} type={item.type} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap gap-2">
              <Badge className={cn('capitalize shadow-sm', typeClass[item.type])}>{item.type}</Badge>
              {status ? <Badge className={cn('shadow-sm', statusTheme[status])}>{statusOptions.find((option) => option.value === status)?.label}</Badge> : null}
            </div>
            <h1 className="mt-3 max-w-5xl break-words text-4xl font-black tracking-tight md:text-6xl">{item.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-200">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                {item.releaseYear ?? 'TBA'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                <Star className="h-4 w-4 fill-warning text-warning" aria-hidden="true" />
                {item.avgRating !== null ? `${item.avgRating.toFixed(1)} average` : 'No Spektra rating'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
                <Users className="h-4 w-4" aria-hidden="true" />
                {formatNumber(item.ratingsCount)} ratings
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <main className="min-w-0 space-y-5">
          {item.genres.length > 0 && (
            <section className="flex flex-wrap gap-2">
              {item.genres.map((genre) => (
                <span key={genre} className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-black text-content-secondary shadow-xs">
                  {genre}
                </span>
              ))}
            </section>
          )}

          <section className="rounded-3xl border border-border-subtle bg-surface/90 p-5 shadow-card md:p-6">
            <h2 className="text-lg font-black text-content-primary">Overview</h2>
            {detailData.overview ? (
              <p className="mt-3 max-w-4xl break-words text-base font-medium leading-8 text-content-secondary">{detailData.overview}</p>
            ) : (
              <p className="mt-3 rounded-2xl border border-dashed border-border bg-bg-subtle p-4 text-sm font-semibold text-content-tertiary">No overview is available from the current provider metadata.</p>
            )}
          </section>

          <section className="rounded-3xl border border-border-subtle bg-surface/90 p-5 shadow-card md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-content-primary">Your rating and review</h2>
                <p className="mt-1 text-sm font-semibold text-content-tertiary">Keep your personal notes tied to this real content item.</p>
              </div>
              {draft.restored ? <span className="rounded-full bg-warning-light px-3 py-1 text-xs font-black text-warning-text">Draft restored</span> : null}
            </div>

            {!isAuthenticated ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border bg-bg-subtle p-4 text-sm font-semibold text-content-secondary">
                <Link to="/login" className="font-black text-accent hover:text-accent-hover">Sign in</Link> to rate, review, and track this item.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <RatingStars value={entry.data?.rating ?? null} disabled={upsertEntry.isPending || !isOnline} onChange={(rating) => saveEntry({ rating })} />
                <textarea
                  name="review"
                  autoComplete="off"
                  spellCheck={true}
                  maxLength={5000}
                  value={review}
                  onChange={(event) => {
                    setReview(event.target.value);
                    draft.setValue(event.target.value);
                  }}
                  disabled={upsertEntry.isPending}
                  className="min-h-40 w-full resize-none rounded-3xl border border-border bg-bg-subtle p-4 text-sm font-semibold leading-6 text-content-primary shadow-innerSubtle placeholder:text-content-tertiary focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20"
                  placeholder="Write your review..."
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-content-tertiary">{review.length}/5000</span>
                  <div className="flex flex-wrap gap-2">
                    {hasUnsavedReview ? (
                      <Button type="button" variant="ghost" disabled={upsertEntry.isPending} onClick={() => setConfirmDiscardOpen(true)}>
                        Discard draft
                      </Button>
                    ) : null}
                    {entry.data ? (
                      <Button variant="ghost" disabled={deleteEntry.isPending} onClick={() => setConfirmRemoveOpen(true)}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                    <Button disabled={upsertEntry.isPending || !isOnline} onClick={() => saveEntry({ review })}>
                      Save review
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {detailData.cards.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-black text-content-primary">Provider metadata</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {detailData.cards.map((card) => (
                  <MetadataCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-panel backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-black text-content-primary">Track this</h2>
              {entry.isFetching && isAuthenticated ? <span className="text-xs font-bold text-content-tertiary">Syncing</span> : null}
            </div>

            {!isAuthenticated ? (
              <Link to="/login" className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-black text-white shadow-glow hover:bg-accent-hover">
                Sign in to track
              </Link>
            ) : (
              <div className="mt-4 space-y-3">
                {entry.isLoading ? (
                  <div className="grid gap-2" aria-label="Loading tracking controls">
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                    <Skeleton className="h-12" />
                  </div>
                ) : null}
                <div className="grid gap-2">
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    const active = entry.data?.status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={upsertEntry.isPending || deleteEntry.isPending || !isOnline}
                        onClick={() => saveEntry({ status: option.value })}
                        className={cn(
                          'flex min-h-12 items-center justify-between rounded-2xl border px-3 text-sm font-black transition active:scale-[0.98] disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:scale-100',
                          active ? statusTheme[option.value] : 'border-border bg-bg-subtle text-content-secondary hover:border-accent/40 hover:text-content-primary',
                        )}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {option.label}
                        </span>
                        {active ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isOnline ? <p className="mt-3 rounded-2xl bg-warning-light p-3 text-xs font-bold text-warning-text">You are offline. Tracking changes will be disabled until your connection returns.</p> : null}
            {message ? <p className="mt-3 text-sm font-semibold text-content-secondary" role="status" aria-live="polite">{message}</p> : null}
          </section>

          <section className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-content-primary">Custom lists</h2>
                <p className="mt-1 text-sm font-semibold text-content-tertiary">Add this item to one of your curated collections.</p>
              </div>
              <ListPlus className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            </div>
            {isAuthenticated ? (
              <Button type="button" className="mt-4 w-full" variant="secondary" disabled={!isOnline} onClick={() => setAddToListOpen(true)}>
                <Plus className="h-4 w-4" />
                Add to List
              </Button>
            ) : (
              <Link to="/login" className="mt-4 flex min-h-11 items-center justify-center rounded-2xl border border-border bg-bg-subtle text-sm font-black text-accent hover:bg-surface">
                Sign in to add
              </Link>
            )}
          </section>

          <section className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
            <h2 className="text-base font-black text-content-primary">At a glance</h2>
            <div className="mt-3 divide-y divide-border-subtle rounded-2xl border border-border-subtle bg-bg-subtle">
              {[
                { label: 'Type', value: item.type, icon: Layers },
                { label: 'Release year', value: item.releaseYear ? String(item.releaseYear) : 'TBA', icon: Calendar },
                { label: 'Spektra ratings', value: formatNumber(item.ratingsCount), icon: Users },
              ].map((row) => (
                <div key={row.label} className="flex min-w-0 items-center gap-3 px-3 py-3">
                  <row.icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-xs font-black uppercase tracking-[0.14em] text-content-tertiary">{row.label}</span>
                  <span className="min-w-0 break-words text-right text-sm font-black capitalize text-content-primary">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

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
