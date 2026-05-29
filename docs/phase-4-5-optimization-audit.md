# Phase 4.5 Optimization Audit

## Duplicated Logic Found
- API error parsing was already centralized; reused it for verification flows.
- Loading/empty/error UI patterns were repeated across pages, so small reusable UI primitives were added.
- Date formatting remains lightweight; larger date libraries were avoided.

## Components/Hooks Extracted
- Added `SEO`, `CookieConsentBanner`, `RouteAnalytics`, and `AppErrorBoundary`.
- Added UI primitives: `Textarea`, `Select`, `FormField`, `EmptyState`, `ErrorState`, `LoadingState`.
- Added email verification pages and resend mutation through `useAuth`.

## SEO Changes
- Added dynamic title/meta/OG/canonical helper for SPA routes.
- Added route-level SEO to public and private pages, with `noIndex` on auth/private routes.
- Added `robots.txt` and `sitemap.xml` with static public routes only.

## Client Performance Changes
- Kept SEO/analytics/monitoring dependency-free.
- Analytics scripts load only after consent.
- Existing lazy route splitting remains intact.

## Privacy/Compliance Changes
- Added Privacy Policy and Terms pages.
- Added consent banner for optional analytics/monitoring.
- Analytics adapter avoids email, token, full review text, and private payloads.

## Monitoring/Analytics Changes
- Added app error boundary.
- Added consent-gated analytics adapter for `none`, GA, and Umami.
- Sentry dependency was not added; `VITE_SENTRY_DSN` is documented for future wiring.

## Email Verification Changes
- Laravel user model now implements email verification.
- Registration sends verification email.
- Added resend and signed verification redirect flow.
- `REQUIRE_EMAIL_VERIFICATION` can block sensitive mutations when enabled.

## Known Limitations
- `robots.txt` and `sitemap.xml` use `https://example.com` placeholders until a real domain is known.
- Dynamic sitemap generation for content/profile pages is not implemented.
- Password reset was not added in this pass to keep scope focused.
- Future avatar uploads must validate type, extension, and file size.

## Manual Setup Needed
- Configure mail variables for non-local email delivery.
- Run migrations/status in Docker if the database is not current.
- Update sitemap/robots domain before public deployment.
