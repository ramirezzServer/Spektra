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
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
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
      <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary" role="status">
        Unable to load users right now.
      </div>
    );
  }

  if (!users.length) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface py-16 text-center text-sm text-content-tertiary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
