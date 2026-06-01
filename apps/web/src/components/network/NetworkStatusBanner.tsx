import { useEffect, useRef, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useSlowNetwork } from '@/hooks/useSlowNetwork';

export function NetworkStatusBanner() {
  const { isOnline } = useOnlineStatus();
  const { isSlowNetwork, saveData } = useSlowNetwork();
  const wasOffline = useRef(false);
  const slowNoticeShown = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'warning' | 'success' | 'info'>('info');

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      setTone('warning');
      setMessage("You're offline. Some features may not work until your connection returns.");
      return;
    }

    if (wasOffline.current) {
      wasOffline.current = false;
      setTone('success');
      setMessage('Back online.');
      const timeout = window.setTimeout(() => setMessage(null), 3000);
      return () => window.clearTimeout(timeout);
    }

    if ((isSlowNetwork || saveData) && !slowNoticeShown.current) {
      slowNoticeShown.current = true;
      setTone('info');
      setMessage('This may take a little longer on your connection.');
      const timeout = window.setTimeout(() => setMessage(null), 4500);
      return () => window.clearTimeout(timeout);
    }
  }, [isOnline, isSlowNetwork, saveData]);

  if (!message) return null;

  const toneClass = {
    warning: 'border-warning bg-warning-light text-warning-text',
    success: 'border-success bg-success-light text-success-text',
    info: 'border-border bg-surface text-content-secondary',
  }[tone];

  return (
    <div className="fixed inset-x-3 top-3 z-50 flex justify-center pointer-events-none">
      <div className={`pointer-events-auto max-w-lg rounded-md border px-4 py-2 text-center text-sm font-medium shadow-card ${toneClass}`} role="status" aria-live="polite">
        {message}
      </div>
    </div>
  );
}
