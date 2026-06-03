import { Users } from 'lucide-react';
import { UserCard } from './UserCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { User } from '@/types';

interface UserListProps {
  users: User[];
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage: string;
}

export function UserList({ users, isLoading = false, isError = false, emptyMessage }: UserListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-card">
            <Skeleton className="h-16 rounded-none" />
            <div className="-mt-6 flex items-center gap-3 p-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2 pt-6">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center text-sm font-semibold text-content-tertiary shadow-card" role="status">
        <Users className="mx-auto mb-3 h-8 w-8 text-danger" aria-hidden="true" />
        Unable to load users right now.
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-surface px-6 py-16 text-center text-sm font-semibold text-content-tertiary shadow-card">
        <Users className="mx-auto mb-3 h-8 w-8 text-accent" aria-hidden="true" />
        <p className="font-black text-content-primary">No people here yet</p>
        <p className="mt-1">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
