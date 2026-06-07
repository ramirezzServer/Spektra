import { AlertTriangle, Compass, PlugZap, Search, WifiOff, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface StateAction {
  label: string;
  to?: string | undefined;
  onClick?: (() => void) | undefined;
}

interface DiscoveryStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | undefined;
  primaryAction?: StateAction | undefined;
  secondaryAction?: StateAction | undefined;
  tone?: 'neutral' | 'warning' | 'danger' | undefined;
}

const toneClass = {
  neutral: 'border-border-subtle bg-surface text-content-secondary',
  warning: 'border-warning/25 bg-warning-light text-warning-text',
  danger: 'border-danger/25 bg-danger-light text-danger-text',
};

function StateButton({ action, variant = 'primary' }: { action: StateAction; variant?: 'primary' | 'secondary' }) {
  if (action.to) {
    return (
      <Link
        to={action.to}
        className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-black ${
          variant === 'primary' ? 'bg-accent text-white shadow-sm hover:bg-accent-hover' : 'border border-border bg-surface text-content-primary hover:bg-bg-subtle'
        }`}
      >
        {action.label}
      </Link>
    );
  }

  return (
    <Button type="button" variant={variant} onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function DiscoveryEmptyState({ title, description, icon: Icon = Compass, primaryAction, secondaryAction, tone = 'neutral' }: DiscoveryStateProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-dashed px-5 py-8 text-center shadow-card ${toneClass[tone]}`}>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-white/60 blur-2xl dark:bg-accent/20" aria-hidden="true" />
      <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-surface/80 text-accent shadow-xs" aria-hidden="true">
        <Icon className="h-6 w-6" />
      </div>
      <h2 className="relative mt-4 text-lg font-black text-content-primary">{title}</h2>
      <p className="relative mx-auto mt-2 max-w-xl text-sm font-semibold leading-6">{description}</p>
      {(primaryAction || secondaryAction) && (
        <div className="relative mt-5 flex flex-wrap justify-center gap-2">
          {primaryAction ? <StateButton action={primaryAction} /> : null}
          {secondaryAction ? <StateButton action={secondaryAction} variant="secondary" /> : null}
        </div>
      )}
    </div>
  );
}

export function ProviderMissingState() {
  return (
    <DiscoveryEmptyState
      icon={PlugZap}
      title="No real trending data yet"
      description="Spektra did not receive trending content for this filter. Provider API keys may be missing, providers may have no cached content yet, or this content type has not been seeded by search."
      primaryAction={{ label: 'Search content', to: '/search' }}
      secondaryAction={{ label: 'Go home', to: '/' }}
      tone="warning"
    />
  );
}

export function SearchEmptyState({ query, onRetry, primaryAction }: { query?: string; onRetry?: () => void; primaryAction?: StateAction }) {
  return (
    <DiscoveryEmptyState
      icon={Search}
      title={query ? 'No matching real content' : 'Start with a real title'}
      description={query ? `No provider result matched "${query}". Try a different title, remove a filter, or search another content type.` : 'Search films, series, games, and books from the connected content providers. Suggestions below are query shortcuts only.'}
      primaryAction={primaryAction ?? (query ? { label: 'Back to discovery', to: '/' } : { label: 'Browse trending', to: '/' })}
      secondaryAction={onRetry ? { label: 'Retry', onClick: onRetry } : undefined}
    />
  );
}

export function SearchErrorState({ message, isOffline, onRetry }: { message: string; isOffline: boolean; onRetry: () => void }) {
  return (
    <DiscoveryEmptyState
      icon={isOffline ? WifiOff : AlertTriangle}
      title={isOffline ? 'You are offline' : 'Search is unavailable'}
      description={isOffline ? 'Search needs a network connection because results come from real providers and cached Spektra content.' : message}
      primaryAction={{ label: 'Retry search', onClick: onRetry }}
      secondaryAction={{ label: 'Back to discovery', to: '/' }}
      tone="danger"
    />
  );
}
