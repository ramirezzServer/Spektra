import { useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isPending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog open={open} title={title} description={description} role="alertdialog" onClose={onCancel} initialFocusRef={cancelRef}>
      <div className="flex flex-wrap justify-end gap-2">
        <Button ref={cancelRef} type="button" variant="secondary" disabled={isPending} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" disabled={isPending} className="bg-danger hover:bg-danger/90 focus:ring-danger" onClick={onConfirm}>
          {isPending ? 'Working...' : confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
