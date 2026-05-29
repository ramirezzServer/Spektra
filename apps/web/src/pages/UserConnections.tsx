import { useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const title = kind === 'followers' ? `${username}'s followers` : `${username} is following`;
  const emptyMessage = kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <SEO title={title} description={`View ${title} on Spektra.`} canonicalPath={username ? `/profile/${username}/${kind}` : undefined} />
      <h1 className="text-2xl font-semibold text-content-primary">{title}</h1>
      <UserList users={query.data?.data ?? []} isLoading={query.isLoading} isError={query.isError} emptyMessage={emptyMessage} />
      <Pagination page={page} lastPage={query.data?.meta.lastPage ?? 1} isFetching={query.isFetching} onPageChange={setPage} />
    </div>
  );
}
