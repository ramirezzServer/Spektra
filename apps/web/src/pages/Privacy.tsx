import { SEO } from '@/components/seo/SEO';

export function Privacy() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <SEO title="Privacy Policy" description="How Spektra handles account, library, social, analytics, and monitoring data." canonicalPath="/privacy" />
      <h1 className="text-3xl font-semibold text-content-primary">Privacy Policy</h1>
      <section className="space-y-3 text-sm leading-6 text-content-secondary">
        <p>Spektra stores account details such as your email address, username, profile text, avatar URL, library entries, ratings, reviews, follow relationships, and activity feed events.</p>
        <p>Your public profile, public library activity, reviews, follows, and feed activity may be visible to other users. Email addresses are private and only shown to you.</p>
        <p>Optional analytics and error monitoring only initialize after consent. Spektra does not intentionally send email addresses, tokens, full review text, or private library payloads to analytics helpers.</p>
        <p>You can delete your account from Account settings. Deletion requires your password and removes your profile, API tokens, library entries, lists, list items, follow relationships, and activity feed events. Deleted account responses do not include your email address.</p>
        <p>Spektra uses third-party content data from TMDB, RAWG, and OpenLibrary. Those providers may have their own terms and privacy practices.</p>
        <p>For privacy requests, configure an administrator contact for your deployment.</p>
      </section>
    </article>
  );
}
