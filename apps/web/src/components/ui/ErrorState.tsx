export function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-danger/25 bg-danger-light px-6 py-12 text-center text-sm font-semibold text-danger-text shadow-card" role="status">
      <div className="pointer-events-none absolute inset-x-10 top-0 h-20 rounded-full bg-danger/10 blur-2xl" aria-hidden="true" />
      <span className="relative">{message}</span>
    </div>
  );
}
