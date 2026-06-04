# Final Polish Security and SEO Audit

## Font Loading / FOUT Handling

Spektra uses Google Fonts for Instrument Sans with `display=swap` and existing preconnect hints. The global and Tailwind font stacks now start with Instrument Sans, then stable system fallbacks, and early inline body styles set the first-paint font and line-height. No local font assets or extra remote font dependencies were added.

## External Link Tabnabbing Hardening

Frontend source was searched for `target="_blank"` and `window.open`. No active external new-tab links were found, so no `ExternalLink` component was needed. Future new-tab links should include `rel="noopener noreferrer"` and `window.open` calls should use `noopener,noreferrer`.

## Canonical URL and Redirect Strategy

Canonical generation now uses `VITE_PUBLIC_SITE_URL` through `buildCanonicalUrl`, normalizes duplicate/trailing slashes, keeps root as `/`, and avoids browser-host-dependent canonicals when the env var is set. Production HTTP/HTTPS and `www`/non-`www` redirects are documented for deployment edge configuration, not forced in local or preview builds.

## Scrollbar-Gutter Layout Stability

`html { scrollbar-gutter: stable; }` was added to reduce horizontal layout shifts between short and long pages without forcing permanent scrollbars. Older browsers that do not support it keep the previous behavior.

## Server/Header Leakage Hardening

The Laravel security middleware removes `X-Powered-By`, the API Docker image sets `expose_php = Off`, the production web Nginx config disables version tokens, and the worker Uvicorn launch disables its server header. Static hosts and upstream proxies may still emit provider-managed `Server` headers.

## Files Changed

- `apps/web/index.html`
- `apps/web/src/index.css`
- `apps/web/tailwind.config.ts`
- `apps/web/src/lib/canonical.ts`
- `apps/web/src/lib/env.ts`
- `apps/web/src/components/seo/SEO.tsx`
- `apps/api/app/Http/Middleware/SecurityHeaders.php`
- `apps/api/docker/php/conf.d/security.ini`
- `apps/api/Dockerfile`
- `apps/web/nginx.conf`
- `apps/worker/Dockerfile`
- `docker-compose.yml`
- `scripts/check-headers.mjs`
- `docs/DEPLOYMENT.md`
- `docs/ENVIRONMENT.md`
- `docs/RELEASE_CHECKLIST.md`

## Commands Run

- `rg` audits for fonts, canonical usage, external links, and header leakage.
- `npm run typecheck` in `apps/web`.
- `npm run build` in `apps/web`.
- `php -l app\Http\Middleware\SecurityHeaders.php` in `apps/api`.
- `php artisan route:list --path=api` in `apps/api`.
- `php artisan test` in `apps/api`.
- `py -m py_compile main.py jobs\sync_trending.py jobs\refresh_ratings.py db\connection.py` in `apps/worker`.
- `py -m uvicorn --help` check for `--no-server-header`.
- `node --check scripts\check-headers.mjs`.
- `docker compose config`.
- `docker compose -f docker-compose.prod.yml config`.

## Manual Deployment Checks Still Needed

- Replace `https://your-domain.example` in `robots.txt` and `sitemap.xml`.
- Set `VITE_PUBLIC_SITE_URL` to the chosen HTTPS frontend origin.
- Configure production HTTP to HTTPS and chosen `www`/non-`www` redirects at the host or proxy.
- Inspect rendered canonical tags in the deployed app.
- Check short/long page transitions and modal scroll lock in a browser.
- Run `scripts/check-headers.mjs` against deployed web, API, and worker URLs.

## Known Limitations

Application code cannot remove all provider-managed `Server` headers from Vercel, Netlify, Cloudflare, load balancers, or reverse proxies. The active static hosting configs intentionally avoid fake-domain redirects so previews and local development keep working.
