import { ArrowLeft, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { UserList } from '@/components/social/UserList';
import { Pagination } from '@/components/ui/Pagination';
import { SEO } from '@/components/seo/SEO';
import { useFollowers, useFollowing } from '@/hooks/useSocial';

export function UserConnections({ kind }: { kind: 'followers' | 'following' }) {
  const { username } = useParams();
  const [page, setPage] = useState(1);
  const followers = useFollowers(kind === 'followers' ? username : undefined, page, 20);
  const following = useFollowing(kind === 'following' ? username : undefined, page, 20);
  const query = kind === 'followers' ? followers : following;
  const title = kind === 'followers' ? `@${username}'s followers` : `@${username} follows`;
  const emptyMessage = kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.';
  const Icon = kind === 'followers' ? Users : UserPlus;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <SEO title={title} description={`View ${title} on Spektra.`} canonicalPath={username ? `/profile/${username}/${kind}` : undefined} />
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-slate-950 p-5 text-white shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(91,77,255,0.52),transparent_22rem),radial-gradient(circle_at_90%_20%,rgba(20,184,166,0.24),transparent_18rem)]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to={`/profile/${username}`} className="inline-flex items-center gap-2 text-sm font-black text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to profile
            </Link>
            <h1 className="mt-2 flex items-center gap-2 text-3xl font-black tracking-tight text-white">
              <Icon className="h-7 w-7 text-cyan-200" aria-hidden="true" />
              {title}
            </h1>
          </div>
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-black text-slate-100">
            Page {page}
          </span>
        </div>
      </section>
      <UserList users={query.data?.data ?? []} isLoading={query.isLoading} isError={query.isError} emptyMessage={emptyMessage} />
      <Pagination page={page} lastPage={query.data?.meta.lastPage ?? 1} isFetching={query.isFetching} onPageChange={setPage} />
    </div>
  );
}
