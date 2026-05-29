import { BookOpen, Clapperboard, Gamepad2, Library, MessageSquare, Star, Tv } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ContentGrid } from '@/components/content/ContentGrid';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { useUserLibrary, useUserProfile, useUserStats } from '@/hooks/useLibrary';
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

function initials(username?: string) {
  return (username?.slice(0, 2) || 'SP').toUpperCase();
}

export function Profile() {
  const { username } = useParams();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<EntryStatus | undefined>();
  const [type, setType] = useState<ContentType | undefined>();
  const [page, setPage] = useState(1);
  const profile = useUserProfile(username);
  const stats = useUserStats(username);
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
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
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
            {profile.data?.avatarUrl ? (
              <img src={profile.data.avatarUrl} alt="" className="h-20 w-20 rounded-full bg-accent-light object-cover" loading="lazy" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent-light text-xl font-semibold text-accent">
                {initials(username)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="break-words text-2xl font-semibold text-content-primary">@{profile.data?.username}</h1>
              <p className="mt-1 max-w-2xl text-sm text-content-secondary">
                {profile.data?.bio || (isOwnProfile ? 'Your library lives here.' : 'Member of Spektra')}
              </p>
              {profile.data?.createdAt && (
                <p className="mt-2 text-xs text-content-tertiary">Joined {new Date(profile.data.createdAt).toLocaleDateString()}</p>
              )}
            </div>
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
          <div key={card.label} className="rounded-lg border border-border bg-surface p-4">
            <card.icon className="h-5 w-5 text-accent" />
            <p className="mt-3 text-2xl font-semibold text-content-primary">{stats.isLoading ? '-' : card.value}</p>
            <p className="text-sm text-content-tertiary">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="flex flex-wrap gap-3 text-sm text-content-secondary">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <Library className="h-4 w-4" /> {stats.data?.total ?? 0} entries
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <Star className="h-4 w-4" /> {stats.data?.ratedCount ?? 0} rated
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5">
          <MessageSquare className="h-4 w-4" /> {stats.data?.reviewedCount ?? 0} reviewed
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
        {!library.isLoading && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary">
            No library entries here yet.
          </div>
        )}
        <Pagination page={page} lastPage={library.data?.meta.lastPage ?? 1} isFetching={library.isFetching} onPageChange={setPage} />
      </section>
    </div>
  );
}
