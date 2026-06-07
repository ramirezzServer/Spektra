import { BookMarked, BookOpen, Calendar, CheckCircle2, Clapperboard, Gamepad2, Library, MessageSquare, Search, Settings, ShieldAlert, Star, Tv, UserCheck, UserPlus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { SEO } from '@/components/seo/SEO';
import { useUserLibrary, useUserProfile, useUserStats } from '@/hooks/useLibrary';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useFollowUser, useRelationship, useUnfollowUser } from '@/hooks/useSocial';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDate, formatNumber } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { ContentItem, ContentType, EntryStatus } from '@/types';

const statusTabs: Array<{ label: string; value?: EntryStatus }> = [
  { label: 'All' },
  { label: 'Want', value: 'want' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const typeTabs: Array<{ label: string; value?: ContentType; icon: typeof Library }> = [
  { label: 'All', icon: Library },
  { label: 'Films', value: 'film', icon: Clapperboard },
  { label: 'Series', value: 'series', icon: Tv },
  { label: 'Games', value: 'game', icon: Gamepad2 },
  { label: 'Books', value: 'book', icon: BookOpen },
];

export function Profile() {
  const { username } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<EntryStatus | undefined>();
  const [type, setType] = useState<ContentType | undefined>();
  const [page, setPage] = useState(1);
  const profile = useUserProfile(username);
  const stats = useUserStats(username);
  const relationship = useRelationship(username);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const [followError, setFollowError] = useState<string | null>(null);
  const { isOnline } = useOnlineStatus();
  const library = useUserLibrary(username, { status, type, page, perPage: 20, sort: 'updated_desc' });
  const entries = useMemo(() => library.data?.data ?? [], [library.data?.data]);
  const items = useMemo(() => entries.map((entry) => entry.content).filter((item): item is ContentItem => Boolean(item)), [entries]);
  const isOwnProfile = currentUser?.username === username;

  function chooseStatus(next?: EntryStatus) {
    setStatus(next);
    setPage(1);
  }

  function chooseType(next?: ContentType) {
    setType(next);
    setPage(1);
  }

  async function toggleFollow() {
    if (!username) return;
    if (!isOnline) {
      setFollowError('You appear to be offline. Check your connection and try again.');
      return;
    }
    setFollowError(null);
    try {
      if (relationship.data?.isFollowing) await unfollowUser.mutateAsync(username);
      else await followUser.mutateAsync(username);
    } catch (error) {
      setFollowError(getApiErrorMessage(error, 'Unable to update follow status.'));
    }
  }

  if (profile.isError) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center shadow-card">
        <div>
          <h1 className="text-lg font-black text-content-primary">Profile not found</h1>
          <p className="mt-2 text-sm font-semibold text-content-tertiary">This user does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px] space-y-5">
      <SEO
        title={profile.data?.username ? `@${profile.data.username}` : 'Profile'}
        description={profile.data?.bio || 'Spektra profile, library, ratings, reviews, and activity.'}
        image={profile.data?.avatarUrl ?? undefined}
        type="profile"
        canonicalPath={username ? `/profile/${username}` : undefined}
      />

      <section className="overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-panel">
        <div className="relative min-h-44 bg-slate-950 p-5 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(91,77,255,0.62),transparent_24rem),radial-gradient(circle_at_92%_16%,rgba(20,184,166,0.28),transparent_20rem)]" aria-hidden="true" />
          <div className="relative flex justify-end">
            {isOwnProfile ? <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-slate-100">This is you</span> : null}
          </div>
        </div>

        <div className="-mt-16 grid gap-4 px-5 pb-5 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-end">
          {profile.isLoading ? (
            <>
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-52" />
                <Skeleton className="h-4 w-80" />
              </div>
            </>
          ) : (
            <>
              <Avatar src={profile.data?.avatarUrl} alt={profile.data?.username ?? username ?? 'User'} size="xl" />
              <div className="min-w-0 pt-14 md:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="overflow-wrap-anywhere text-3xl font-black text-content-primary">@{profile.data?.username}</h1>
                  {profile.data?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success-light px-2.5 py-1 text-xs font-black text-success-text">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Verified
                    </span>
                  ) : isOwnProfile ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-light px-2.5 py-1 text-xs font-black text-warning-text">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                      Verify email
                    </span>
                  ) : null}
                </div>
                {profile.data?.name ? <p className="mt-1 text-sm font-black text-content-secondary">{profile.data.name}</p> : null}
                <p className="mt-2 max-w-3xl break-words text-sm font-semibold leading-6 text-content-secondary">
                  {profile.data?.bio || (isOwnProfile ? 'Your Spektra library lives here.' : 'Member of Spektra')}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-content-secondary">
                  <Link to={`/profile/${username}/followers`} className="hover:text-accent">
                    <span className="font-black text-content-primary">{formatNumber(profile.data?.followersCount ?? 0)}</span> followers
                  </Link>
                  <Link to={`/profile/${username}/following`} className="hover:text-accent">
                    <span className="font-black text-content-primary">{formatNumber(profile.data?.followingCount ?? 0)}</span> following
                  </Link>
                  {profile.data?.createdAt ? (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      Joined {formatDate(profile.data.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  ) : null}
                </div>
                {followError ? <p className="mt-2 text-sm font-bold text-danger-text" role="alert">{followError}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2 md:justify-end">
                {isOwnProfile ? (
                  <>
                    <Link to="/library" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-accent-hover">
                      <Library className="h-4 w-4" />
                      Library
                    </Link>
                    <Link to="/lists" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-black text-content-primary hover:bg-bg-subtle">
                      <BookMarked className="h-4 w-4" />
                      Lists
                    </Link>
                    <Link to="/search" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-black text-content-primary hover:bg-bg-subtle">
                      <Search className="h-4 w-4" />
                      Search
                    </Link>
                    <Link to="/account" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-black text-content-primary hover:bg-bg-subtle">
                      <Settings className="h-4 w-4" />
                      Account
                    </Link>
                  </>
                ) : currentUser ? (
                  <Button
                    type="button"
                    variant={relationship.data?.isFollowing ? 'secondary' : 'primary'}
                    disabled={relationship.isLoading || followUser.isPending || unfollowUser.isPending || !isOnline}
                    onClick={toggleFollow}
                  >
                    {relationship.data?.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {followUser.isPending || unfollowUser.isPending ? 'Saving...' : relationship.data?.isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                ) : (
                  <Link to="/login" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-black text-accent hover:text-accent-hover">
                    Sign in to follow
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          { label: 'Total', value: stats.data?.total ?? 0, icon: Library },
          { label: 'Films', value: stats.data?.byType.film ?? 0, icon: Clapperboard },
          { label: 'Series', value: stats.data?.byType.series ?? 0, icon: Tv },
          { label: 'Games', value: stats.data?.byType.game ?? 0, icon: Gamepad2 },
          { label: 'Books', value: stats.data?.byType.book ?? 0, icon: BookOpen },
          { label: 'Reviewed', value: stats.data?.reviewedCount ?? 0, icon: MessageSquare },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-border-subtle bg-surface/95 p-4 shadow-card">
            <card.icon className="h-5 w-5 text-accent" aria-hidden="true" />
            <p className="mt-3 text-2xl font-black text-content-primary">{stats.isLoading ? '-' : formatNumber(card.value)}</p>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-3 text-sm text-content-secondary">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-bold shadow-xs">
          <Star className="h-4 w-4 text-warning" /> {formatNumber(stats.data?.ratedCount ?? 0)} rated
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-bold shadow-xs">
          <Users className="h-4 w-4 text-accent" /> {formatNumber(profile.data?.followersCount ?? 0)} followers
        </span>
      </section>

      <section className="space-y-4 rounded-3xl border border-border-subtle bg-surface/80 p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-content-primary">{isOwnProfile ? 'Your library preview' : 'Public library'}</h2>
            <p className="mt-1 text-sm font-semibold text-content-tertiary">Filtered public entries from real library data.</p>
          </div>
          {library.isFetching ? <span className="text-xs font-black uppercase tracking-[0.16em] text-content-tertiary">Refreshing</span> : null}
        </div>

        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Library status filters">
          {statusTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={status === tab.value}
              onClick={() => chooseStatus(tab.value)}
              className={cn('min-h-10 shrink-0 rounded-full px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20', status === tab.value ? 'bg-accent text-white shadow-sm' : 'border border-border bg-surface text-content-secondary hover:bg-bg-subtle hover:text-content-primary')}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Library type filters">
          {typeTabs.map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={type === tab.value}
              onClick={() => chooseType(tab.value)}
              className={cn('inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-accent/20', type === tab.value ? 'bg-accent text-white shadow-sm' : 'border border-border bg-surface text-content-secondary hover:bg-bg-subtle hover:text-content-primary')}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        <ContentGrid items={items} entries={entries} isLoading={library.isLoading} density="dense" skeletonCount={12} />
        {library.isError ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface py-14 text-center text-sm font-semibold text-content-tertiary shadow-card" role="status">
            Unable to load this library right now.
          </div>
        ) : null}
        {!library.isLoading && !library.isError && items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-14 text-center shadow-card">
            <Library className="mx-auto h-9 w-9 text-accent" aria-hidden="true" />
            <h3 className="mt-3 text-lg font-black text-content-primary">No entries here yet</h3>
            <p className="mt-2 text-sm font-semibold text-content-tertiary">{isOwnProfile ? 'Search for content and start tracking to fill this library.' : 'This profile has no public entries for the selected filters.'}</p>
            {isOwnProfile ? (
              <Link to="/search" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 text-sm font-black text-white shadow-sm hover:bg-accent-hover">
                Search content
              </Link>
            ) : null}
          </div>
        ) : null}
        <Pagination page={page} lastPage={library.data?.meta.lastPage ?? 1} isFetching={library.isFetching} onPageChange={setPage} />
      </section>
    </div>
  );
}
