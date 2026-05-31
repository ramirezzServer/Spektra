import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { Button } from '@/components/ui/Button';

interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  role?: 'dialog' | 'alertdialog';
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  initialFocusRef?: RefObject<HTMLElement>;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const dialogStack: symbol[] = [];
let lockedBodyCount = 0;
let previousBodyOverflow = '';

function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') return false;
    return isVisible(element);
  });
}

export function Dialog({
  open,
  title,
  description,
  children,
  onClose,
  role = 'dialog',
  closeOnEscape = true,
  closeOnBackdrop = true,
  initialFocusRef,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogId = useRef(Symbol('dialog'));
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const currentDialog = dialogId.current;

    dialogStack.push(currentDialog);
    lockedBodyCount += 1;
    if (lockedBodyCount === 1) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || dialogStack[dialogStack.length - 1] !== currentDialog) return;
      const target = initialFocusRef?.current && panel.contains(initialFocusRef.current)
        ? initialFocusRef.current
        : getFocusableElements(panel)[0] ?? panel;
      target.focus();
    });

    function onKeyDown(event: KeyboardEvent) {
      const panel = panelRef.current;
      if (!panel || dialogStack[dialogStack.length - 1] !== currentDialog) return;

      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusable = getFocusableElements(panel);
      if (!focusable.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (!active || active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const index = dialogStack.indexOf(currentDialog);
      if (index !== -1) dialogStack.splice(index, 1);
      lockedBodyCount = Math.max(0, lockedBodyCount - 1);
      if (lockedBodyCount === 0) document.body.style.overflow = previousBodyOverflow;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [closeOnEscape, initialFocusRef, onClose, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="presentation"
      onMouseDown={() => {
        if (closeOnBackdrop) onClose();
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-5 shadow-xl outline-none"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-content-primary">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-sm text-content-tertiary">
                {description}
              </p>
            )}
          </div>
          <Button type="button" variant="ghost" className="min-h-12 min-w-12 px-2" aria-label="Close dialog" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
