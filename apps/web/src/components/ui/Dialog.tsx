import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export function Dialog({ open, title, description, children, onClose }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6" role="presentation" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? 'dialog-description' : undefined}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-xl outline-none"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-lg font-semibold text-content-primary">
              {title}
            </h2>
            {description && (
              <p id="dialog-description" className="mt-1 text-sm text-content-tertiary">
                {description}
              </p>
            )}
          </div>
          <Button type="button" variant="ghost" className="min-h-9 px-2" aria-label="Close dialog" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
