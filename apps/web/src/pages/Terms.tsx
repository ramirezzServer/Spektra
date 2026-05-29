import { SEO } from '@/components/seo/SEO';

export function Terms() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <SEO title="Terms" description="Spektra usage terms and content provider disclaimers." canonicalPath="/terms" />
      <h1 className="text-3xl font-semibold text-content-primary">Terms</h1>
      <section className="space-y-3 text-sm leading-6 text-content-secondary">
        <p>Use Spektra responsibly. Do not post abusive, illegal, infringing, or harmful reviews or profile content.</p>
        <p>You are responsible for your account credentials and activity. Reviews and profile text are user-generated content.</p>
        <p>Spektra displays metadata and images from TMDB, RAWG, and OpenLibrary. Spektra does not claim ownership of third-party media metadata or artwork.</p>
        <p>The app is provided as-is for tracking and discovery. Availability of external content data depends on provider APIs and configured keys.</p>
      </section>
    </article>
  );
}
