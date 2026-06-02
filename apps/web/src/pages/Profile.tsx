import { BookOpen, Clapperboard, Gamepad2, Library, MessageSquare, Star, Tv, UserCheck, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { SEO } from '@/components/seo/SEO';
import { useUserLibrary, useUserProfile, useUserStats } from '@/hooks/useLibrary';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useFollowUser, useRelationship, useUnfollowUser } from '@/hooks/useSocial';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDate, formatNumber } from '@/lib/formatters';
import { useAuthStore } from '@/stores/authStore';
import type { ContentItem, ContentType, EntryStatus } from '@/types';

const statusTabs: Array<{ label: string; value?: EntryStatus }> = [
  { label: 'All' },
  { label: 'Want', value: 'want' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];

const typeTabs: Array<{ label: string; value?: ContentType }> = [
  { label: 'All' },
  { label: 'Films', value: 'film' },
  { label: 'Series', value: 'series' },
  { label: 'Games', value: 'game' },
  { label: 'Books', value: 'book' },
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
  const entries = library.data?.data ?? [];
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
      if (relationship.data?.isFollowing) {
        await unfollowUser.mutateAsync(username);
      } else {
        await followUser.mutateAsync(username);
      }
    } catch (error) {
      setFollowError(getApiErrorMessage(error, 'Unable to update follow status.'));
    }
  }

  if (profile.isError) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 text-center">
        <div>
          <h1 className="text-lg font-semibold text-content-primary">Profile not found</h1>
          <p className="mt-2 text-sm text-content-tertiary">This user does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SEO
        title={profile.data?.username ? `@${profile.data.username}` : 'Profile'}
        description={profile.data?.bio || 'Spektra profile, library, ratings, reviews, and activity.'}
        image={profile.data?.avatarUrl ?? undefined}
        type="profile"
        canonicalPath={username ? `/profile/${username}` : undefined}
      />
      <section className="flex flex-col gap-4 rounded-3xl border border-border-subtle bg-surface/90 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        {profile.isLoading ? (
          <>
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </>
        ) : (
          <>
            <Avatar src={profile.data?.avatarUrl} alt={profile.data?.username ?? username ?? 'User'} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="overflow-wrap-anywhere text-3xl font-black text-content-primary">@{profile.data?.username}</h1>
              <p className="mt-1 max-w-2xl break-words text-sm font-medium text-content-secondary">
                {profile.data?.bio || (isOwnProfile ? 'Your library lives here.' : 'Member of Spektra')}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-content-secondary">
                <Link to={`/profile/${username}/followers`} className="hover:text-accent" aria-label={`${profile.data?.followersCount ?? 0} followers`}>
                  <span className="font-semibold text-content-primary">{formatNumber(profile.data?.followersCount ?? 0)}</span> followers
                </Link>
                <Link to={`/profile/${username}/following`} className="hover:text-accent" aria-label={`${profile.data?.followingCount ?? 0} following`}>
                  <span className="font-semibold text-content-primary">{formatNumber(profile.data?.followingCount ?? 0)}</span> following
                </Link>
              </div>
              {profile.data?.createdAt && (
                <p className="mt-2 text-xs text-content-tertiary">Joined {formatDate(profile.data.createdAt, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              )}
              {followError && <p className="mt-2 text-sm text-danger-text" role="alert">{followError}</p>}
            </div>
            {isOwnProfile ? (
              <span className="rounded-xl border border-border bg-bg-subtle px-4 py-2 text-sm font-bold text-content-secondary">This is you</span>
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
              <Link to="/login" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-accent hover:text-accent-hover">
                Sign in to follow
              </Link>
            )}
          </>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Films', value: stats.data?.byType.film ?? 0, icon: Clapperboard },
          { label: 'Series', value: stats.data?.byType.series ?? 0, icon: Tv },
          { label: 'Games', value: stats.data?.byType.game ?? 0, icon: Gamepad2 },
          { label: 'Books', value: stats.data?.byType.book ?? 0, icon: BookOpen },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-card">
            <card.icon className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-black text-content-primary">{stats.isLoading ? '-' : formatNumber(card.value)}</p>
            <p className="text-sm font-semibold text-content-tertiary">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-3 text-sm text-content-secondary">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-semibold shadow-xs">
          <Library className="h-4 w-4" /> {formatNumber(stats.data?.total ?? 0)} entries
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-semibold shadow-xs">
          <Star className="h-4 w-4" /> {formatNumber(stats.data?.ratedCount ?? 0)} rated
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-semibold shadow-xs">
          <MessageSquare className="h-4 w-4" /> {formatNumber(stats.data?.reviewedCount ?? 0)} reviewed
        </span>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((tab) => (
            <Button key={tab.label} variant={status === tab.value ? 'primary' : 'secondary'} onClick={() => chooseStatus(tab.value)}>
              {tab.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {typeTabs.map((tab) => (
            <Button key={tab.label} variant={type === tab.value ? 'primary' : 'secondary'} onClick={() => chooseType(tab.value)}>
              {tab.label}
            </Button>
          ))}
        </div>

        <ContentGrid items={items} entries={entries} isLoading={library.isLoading} />
        {library.isError && (
          <div className="rounded-3xl border border-dashed border-border bg-surface py-14 text-center text-sm font-medium text-content-tertiary shadow-card" role="status">
            Unable to load this library right now.
          </div>
        )}
        {!library.isLoading && !library.isError && items.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border bg-surface py-14 text-center text-sm font-medium text-content-tertiary shadow-card">
            No library entries here yet.
          </div>
        )}
        <Pagination page={page} lastPage={library.data?.meta.lastPage ?? 1} isFetching={library.isFetching} onPageChange={setPage} />
      </section>
    </div>
  );
}
