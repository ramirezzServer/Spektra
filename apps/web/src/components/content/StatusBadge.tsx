import type { EntryStatus } from '@/types';

const labels: Record<EntryStatus, string> = {
  want: 'Want',
  in_progress: 'In Progress',
  done: 'Done',
};

const classes: Record<EntryStatus, string> = {
  want: 'border-app-border bg-slate-100 text-slate-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-700',
  done: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export function StatusBadge({ status }: { status: EntryStatus }) {
  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${classes[status]}`}>{labels[status]}</span>;
}
