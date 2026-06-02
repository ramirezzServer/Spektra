import type { FeedScope } from '@/hooks/useFeed';

interface FeedTabsProps {
  active: FeedScope;
  isAuthenticated: boolean;
  onChange: (scope: FeedScope) => void;
}

export function FeedTabs({ active, isAuthenticated, onChange }: FeedTabsProps) {
  return (
    <div className="inline-flex rounded-2xl border border-border-subtle bg-surface p-1 shadow-sm" role="tablist" aria-label="Activity feed scope">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'following'}
        disabled={!isAuthenticated}
        onClick={() => onChange('following')}
        className={`min-h-11 rounded-xl px-4 py-2 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 ${
          active === 'following' ? 'bg-accent text-white shadow-sm' : 'text-content-secondary hover:bg-bg-subtle hover:text-content-primary'
        }`}
      >
        Following
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'global'}
        onClick={() => onChange('global')}
        className={`min-h-11 rounded-xl px-4 py-2 text-sm font-bold transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
          active === 'global' ? 'bg-accent text-white shadow-sm' : 'text-content-secondary hover:bg-bg-subtle hover:text-content-primary'
        }`}
      >
        Global
      </button>
    </div>
  );
}
