import type { FeedScope } from '@/hooks/useFeed';

interface FeedTabsProps {
  active: FeedScope;
  isAuthenticated: boolean;
  onChange: (scope: FeedScope) => void;
}

export function FeedTabs({ active, isAuthenticated, onChange }: FeedTabsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Activity feed scope">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'following'}
        disabled={!isAuthenticated}
        onClick={() => onChange('following')}
        className={`min-h-12 rounded-md border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 ${
          active === 'following' ? 'border-accent bg-accent-light text-accent' : 'border-border bg-surface text-content-secondary hover:text-content-primary'
        }`}
      >
        Following
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'global'}
        onClick={() => onChange('global')}
        className={`min-h-12 rounded-md border px-4 py-2 text-sm font-semibold transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
          active === 'global' ? 'border-accent bg-accent-light text-accent' : 'border-border bg-surface text-content-secondary hover:text-content-primary'
        }`}
      >
        Global
      </button>
    </div>
  );
}
