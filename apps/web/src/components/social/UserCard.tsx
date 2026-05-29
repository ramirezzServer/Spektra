import { Link } from 'react-router-dom';
import type { User } from '@/types';

export function UserCard({ user }: { user: User }) {
  return (
    <Link to={`/profile/${user.username}`} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 hover:border-border-strong">
      <img src={user.avatarUrl ?? ''} alt="" className="h-12 w-12 rounded-full bg-accent-light object-cover" loading="lazy" decoding="async" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-content-primary">@{user.username}</p>
        {user.bio ? <p className="mt-1 line-clamp-2 text-sm text-content-secondary">{user.bio}</p> : null}
        <p className="mt-1 text-xs text-content-tertiary">
          {user.followersCount ?? 0} followers · {user.followingCount ?? 0} following
        </p>
      </div>
    </Link>
  );
}
