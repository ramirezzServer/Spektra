import { Home, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';

export function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center px-4 text-center">
      <SEO title="Page not found" description="The page you are looking for does not exist or has been moved." noIndex />
      <section className="space-y-5 rounded-3xl border border-border-subtle bg-surface/90 p-8 shadow-card">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">404</p>
          <h1 className="mt-2 text-3xl font-black text-content-primary">Page not found</h1>
          <p className="mt-3 text-sm leading-6 text-content-secondary">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-hover">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link to="/search" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-content-secondary hover:bg-bg-tertiary">
            <Search className="h-4 w-4" />
            Search
          </Link>
        </div>
      </section>
    </div>
  );
}
