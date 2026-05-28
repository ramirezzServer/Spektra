export function Home() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-content-primary mb-1">Discover</h1>
      <p className="text-content-secondary text-sm mb-6">Trending films, series, games, and books</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-bg-tertiary animate-pulse aspect-[2/3]" />
        ))}
      </div>
    </div>
  );
}
