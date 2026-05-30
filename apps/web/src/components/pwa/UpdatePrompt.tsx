import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-md border border-app-border bg-app-surface p-3 shadow-card md:bottom-4 md:left-auto">
      <p className="text-sm font-medium text-content-primary">A new Spektra version is ready.</p>
      <div className="flex shrink-0 items-center gap-2">
        <Button className="min-h-9 px-3 py-1.5" onClick={() => updateServiceWorker(true)}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh
        </Button>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-content-secondary hover:bg-bg-tertiary hover:text-content-primary"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss update prompt"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
