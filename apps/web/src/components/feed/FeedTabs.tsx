import type { FeedScope } from '@/hooks/useFeed';

interface FeedTabsProps {
  active: FeedScope;
  isAuthenticated: boolean;
  onChange: (scope: FeedScope) => void;
}

export function FeedTabs({ active, isAuthenticated, onChange }: FeedTabsProps) {
  return (
    <div className="inline-flex rounded-2xl border border-white/10 bg-white/10 p-1 shadow-sm backdrop-blur" role="tablist" aria-label="Activity feed scope">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'following'}
        disabled={!isAuthenticated}
        onClick={() => onChange('following')}
        className={`min-h-11 rounded-xl px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 ${
          active === 'following' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`}
      >
        Following
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === 'global'}
        onClick={() => onChange('global')}
        className={`min-h-11 rounded-xl px-4 py-2 text-sm font-black transition focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 ${
          active === 'global' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-200 hover:bg-white/10 hover:text-white'
        }`}
      >
        Global
      </button>
    </div>
  );
}
