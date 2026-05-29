export function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center text-sm text-content-tertiary" role="status">
      {message}
    </div>
  );
}
