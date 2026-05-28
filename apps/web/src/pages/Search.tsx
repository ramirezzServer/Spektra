export function Search() {
  return (
    <div>
      <input
        autoFocus
        className="w-full px-4 py-3 text-sm bg-surface border border-border rounded-lg text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent mb-6"
        placeholder="Search films, series, games, books..."
      />
      <div className="flex items-center justify-center py-24 text-content-tertiary">
        <p className="text-sm">Start typing to search across all content</p>
      </div>
    </div>
  );
}
