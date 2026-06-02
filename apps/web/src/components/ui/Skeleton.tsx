import { cn } from '@/lib/utils';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200', className)} />;
}

export function ContentCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
