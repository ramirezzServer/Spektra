import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { formatDate, formatNumber } from '@/lib/formatters';
import type { User } from '@/types';

export function UserCard({ user }: { user: User }) {
  return (
    <Link to={`/profile/${user.username}`} className="group block min-w-0 overflow-hidden rounded-3xl border border-border-subtle bg-surface/95 shadow-card transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-cardHover active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100">
      <div className="h-16 bg-slate-950 bg-[radial-gradient(circle_at_20%_0%,rgba(91,77,255,0.46),transparent_12rem),radial-gradient(circle_at_90%_20%,rgba(20,184,166,0.24),transparent_10rem)]" aria-hidden="true" />
      <div className="-mt-7 flex min-w-0 gap-3 px-4 pb-4">
        <Avatar src={user.avatarUrl} alt={user.username} size="lg" />
        <div className="min-w-0 flex-1 pt-8">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-black text-content-primary group-hover:text-accent">@{user.username}</p>
            {user.emailVerified ? <span className="shrink-0 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-black text-success-text">Verified</span> : null}
          </div>
          {user.name ? <p className="truncate text-xs font-bold text-content-tertiary">{user.name}</p> : null}
          {user.bio ? <p className="mt-2 line-clamp-2 break-words text-sm font-medium leading-5 text-content-secondary">{user.bio}</p> : <p className="mt-2 text-sm font-medium text-content-tertiary">Spektra member</p>}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-content-tertiary">
            <span><span className="font-black text-content-primary">{formatNumber(user.followersCount ?? 0)}</span> followers</span>
            <span><span className="font-black text-content-primary">{formatNumber(user.followingCount ?? 0)}</span> following</span>
            {user.createdAt ? <span>Joined {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
