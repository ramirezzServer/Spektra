# Security Hardening Active Attack Audit

## SQL Injection Audit Result

API controller queries use Eloquent or Laravel query builder bindings. Sort keys for library/profile views are allow-listed before being mapped to fixed columns. Worker database writes use asyncpg `$1`, `$2` placeholders, and worker maintenance updates are static SQL.

Risky patterns found for review:
- `routes/api.php`: `DB::select('select 1')` is a static health check.
- `UserController.php`: `selectRaw('status, count(*) as total')` and `selectRaw('content_items.type, count(*) as total')` are static aggregate expressions.
- Migrations contain static `DB::statement` and `DB::raw` schema SQL with no request input.

No user-controlled SQL concatenation was found, and no query rewrites were needed.

## XSS Audit Result

Frontend source has no `dangerouslySetInnerHTML`, `innerHTML` assignment, markdown renderer, or document HTML injection. User reviews, bios, list descriptions, provider titles, and provider overview text render as plain React strings. Added `safeUrl` and applied it to poster, backdrop, avatar, and SEO image URLs so unsafe protocols such as `javascript:` and `data:` are not used in browser URL contexts.

## CSP Changes

Static frontend headers now include a compatible CSP in `_headers` and `nginx.conf`:

```txt
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https: http://localhost:8000 http://127.0.0.1:8000; worker-src 'self' blob:; manifest-src 'self'
```

`style-src 'unsafe-inline'` remains for static-host compatibility with inline first-paint styles and runtime style attributes. `script-src https:` keeps optional analytics script hosts compatible when configured by env. API JSON responses receive a stricter `default-src 'none'` CSP.

## Rate Limiting Changes

Named Laravel limiters were added:
- `auth.login`: 5 attempts per 15 minutes per email and IP.
- `auth.register`: 5 attempts per hour per IP.
- `auth.email`: 3 attempts per 10 minutes per user/IP.
- `api.search`: 30 requests per minute per user/IP.
- `api.feed`: 60 requests per minute per user/IP.
- `api.write`: 60 write requests per minute per user/IP.
- `api.health`: 120 requests per minute per IP.

Throttle middleware is applied to login, register, verification, search/trending, feed, mutation-heavy authenticated routes, and health endpoints. 429 responses return JSON with `message` and `retry_after`.

## Upload/RCE Audit Result

No upload UI or API upload endpoint was found. No upload feature was added. Future uploads should validate MIME/content server-side, reject SVG/HTML/scripts unless sanitized, enforce size limits, generate random filenames, and store files in non-executable storage or object storage.

## Tests/Checks Added

- `apps/api/tests/Feature/SecurityHardeningTest.php` checks login throttling and important route throttle middleware.
- `scripts/security-audit-check.mjs` scans for raw SQL review points, unsafe HTML rendering, upload surfaces, new-tab/window surfaces, and `javascript:` URL literals.

## Files Changed

- `apps/api/app/Providers/AppServiceProvider.php`
- `apps/api/routes/api.php`
- `apps/api/app/Http/Middleware/SecurityHeaders.php`
- `apps/api/app/Http/Controllers/Api/ContentController.php`
- `apps/api/app/Http/Controllers/Api/FeedController.php`
- `apps/api/app/Http/Controllers/Api/UserEntryController.php`
- `apps/api/app/Http/Controllers/Api/ListController.php`
- `apps/api/app/Http/Controllers/Api/FollowController.php`
- `apps/api/app/Http/Controllers/Api/UserController.php`
- `apps/api/tests/Feature/SecurityHardeningTest.php`
- `apps/web/public/_headers`
- `apps/web/nginx.conf`
- `apps/web/src/lib/safeUrl.ts`
- `apps/web/src/components/content/PosterImage.tsx`
- `apps/web/src/components/ui/Avatar.tsx`
- `apps/web/src/pages/ContentDetail.tsx`
- `apps/web/src/components/seo/SEO.tsx`
- `scripts/security-audit-check.mjs`
- `docs/DEPLOYMENT.md`
- `docs/RELEASE_CHECKLIST.md`

## Manual Checks Still Needed

- Confirm normal login/register/search/write flows do not hit throttles during ordinary use.
- Confirm repeated bad login attempts return 429 and the frontend shows the friendly retry message.
- Confirm provider posters/backdrops and Dicebear avatars load under deployed CSP.
- Confirm PWA service worker registration and offline banner still work under deployed CSP.
- Review any `REVIEW` output from `scripts/security-audit-check.mjs` before release.

## Known Limitations and Future Recommendations

The static CSP intentionally allows HTTPS scripts/connects for compatibility with env-configured analytics/API hosts; a final deployment can tighten those to exact domains. No CAPTCHA or bot-management provider was added; consider one at the edge only if real abuse appears. Upload-specific hardening remains a future policy because no upload surface currently exists.
