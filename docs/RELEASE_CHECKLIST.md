# Release Checklist

## Code Quality

- [ ] Web CI passes: install, lint, format check, typecheck, unit tests, and build.
- [ ] Backend Pint style check passes.
- [ ] API CI passes: Composer install/validate, Pint, PHP syntax, migrations, and tests against PostgreSQL.
- [ ] Worker CI passes: Python 3.11 dependency install, py_compile, and pytest.
- [ ] Scripts CI passes: `node --check` for `scripts/*.mjs`.
- [ ] Security CI passes: security audit script and header-check script syntax.
- [ ] Docker CI passes: Compose config validation for dev, exposed dev, and production-like files.
- [ ] Manual Smoke workflow passes for production-like Docker Compose when needed.
- [ ] CI is green before release.

## Environment

- [ ] Production API env configured.
- [ ] Frontend env configured.
- [ ] Frontend `VITE_API_URL` points to the preferred `/api/v1` base for new deployments.
- [ ] Worker env configured.
- [ ] Database URL configured.
- [ ] Redis configured if required.
- [ ] Mail configured.
- [ ] Password reset emails deliver and open the frontend `/reset-password` route.
- [ ] External API keys configured.
- [ ] Analytics/monitoring decision documented.

## Database

- [ ] Migrations applied.
- [ ] Seed/demo policy clear.
- [ ] Backup plan noted.

## Security

- [ ] `APP_DEBUG=false`.
- [ ] No secrets committed.
- [ ] CORS frontend URL correct.
- [ ] `SANCTUM_TOKEN_EXPIRATION_MINUTES` set to the intended API token lifetime.
- [ ] `HEALTH_CHECK_SECRET` set to a long random production value.
- [ ] `REQUIRE_EMAIL_VERIFICATION=true` in production.
- [ ] Privacy and terms routes available.
- [ ] External `target="_blank"` links include `rel="noopener noreferrer"`.
- [ ] API responses do not expose app-controlled `X-Powered-By`.
- [ ] Login/register/email/search/write route throttles verified.
- [ ] 429 API responses show a friendly frontend message.
- [ ] Security audit script reviewed.
- [ ] No automated test requires real TMDB, RAWG, OpenLibrary, mail, Neon, or production credentials.

## Accessibility

- [ ] Keyboard navigation reaches primary navigation, bottom navigation, command palette, dialogs, forms, cards, ratings, and list actions.
- [ ] Focus indicators are visible in light and dark themes.
- [ ] Dialogs and confirm dialogs trap focus, close with Escape, and return focus to the opener.
- [ ] Forms have labels associated with inputs using `htmlFor`/`id`, and validation errors are announced where practical.
- [ ] Content images have meaningful alt text; decorative icons and imagery are hidden from assistive technology.
- [ ] Text, badges, buttons, and focus rings meet WCAG AA contrast as much as practical in light and dark themes.
- [ ] Icon-only buttons have screen reader names.
- [ ] Reduced-motion preferences are respected for animations and interaction effects.
- [ ] Command palette, sidebar, and mobile bottom navigation controls have clear accessible names.

## Smoke Tests

- [ ] Frontend loads.
- [ ] API health passes.
- [ ] Deep API health returns 403 without `X-Health-Secret` and works with the correct header.
- [ ] Legacy `/api` compatibility and preferred `/api/v1` routes both pass smoke checks.
- [ ] Worker health passes.
- [ ] Register/login works.
- [ ] Auth token refresh returns a new token and rejects the old token.
- [ ] Forgot-password and reset-password work without revealing account existence.
- [ ] Email verification works.
- [ ] Unverified users cannot create library entries or follow users when `REQUIRE_EMAIL_VERIFICATION=true`.
- [ ] Account deletion requires password confirmation, deletes user-owned data, and rejects the old token.
- [ ] Content search works.
- [ ] Library tracking works.
- [ ] Follow/feed works.
- [ ] Lists work.

## SEO/PWA

- [ ] Domain in `robots.txt` and `sitemap.xml` updated.
- [ ] `VITE_PUBLIC_SITE_URL` matches the chosen HTTPS canonical frontend domain.
- [ ] HTTP to HTTPS and chosen `www`/non-`www` redirect verified at the production edge.
- [ ] Canonical tags use absolute URLs and match clean slug routes.
- [ ] CSP allows deployed API, analytics, font, PWA, and provider image domains.
- [ ] Reviews, list descriptions, provider metadata, and script-like text render as text.
- [ ] Upload policy reviewed; no upload UI or endpoint is introduced unintentionally.
- [ ] Favicon and touch icon verified.
- [ ] Manifest verified.
- [ ] Install/update prompt tested.
- [ ] PWA offline fallback page is precached and shown or reachable when the installed app is offline.
- [ ] Offline banner still appears in the SPA.
- [ ] Service worker does not cache `/api` responses or queue offline mutations.
- [ ] Private pages noindex where appropriate.
