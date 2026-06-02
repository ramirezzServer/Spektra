import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { formatNumber } from '@/lib/formatters';
import type { User } from '@/types';

export function UserCard({ user }: { user: User }) {
  return (
    <Link to={`/profile/${user.username}`} className="flex min-w-0 items-center gap-3 rounded-2xl border border-border-subtle bg-surface/95 p-4 shadow-card transition hover:border-accent/35 hover:shadow-cardHover active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100">
      <Avatar src={user.avatarUrl} alt={user.username} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-content-primary">@{user.username}</p>
        {user.bio ? <p className="mt-1 line-clamp-2 break-words text-sm text-content-secondary">{user.bio}</p> : null}
        <p className="mt-1 text-xs text-content-tertiary">
          {formatNumber(user.followersCount ?? 0)} followers · {formatNumber(user.followingCount ?? 0)} following
        </p>
      </div>
    </Link>
  );
}
