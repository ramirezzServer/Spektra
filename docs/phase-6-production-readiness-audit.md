# Phase 6 Production Readiness Audit

## Production Readiness Changes

- Centralized public frontend env reads in `apps/web/src/lib/env.ts`.
- Added production warnings for missing frontend API or site URLs.
- Kept local defaults for development.
- Updated root, web, API, and worker env examples.

## Deployment Configuration Added

- Added production web image with Nginx static serving.
- Hardened API and worker Dockerfiles.
- Updated `docker-compose.prod.yml` for production-like local runs and optional local Postgres profile.
- Added Vercel and Netlify SPA fallback files.

## CI/CD Changes

- Added `.github/workflows/ci.yml`.
- Frontend job runs `npm ci`, typecheck, and build.
- Backend job installs Composer dependencies, validates Composer metadata, checks PHP syntax, and runs Laravel tests with local-safe env.
- Worker job installs Python dependencies and compiles key Python files.

## PWA Changes

- Added `site.webmanifest` and generated placeholder PNG icons.
- Added `vite-plugin-pwa` with static asset caching.
- API routes and private data are not runtime-cached.
- Added a small update prompt for new service worker versions.

## API Documentation Changes

- Added `docs/API.md` with current routes grouped by domain.
- Documented auth, pagination, validation error shape, health checks, and server-side provider keys.

## Security Improvements

- Added API security headers middleware.
- Added static hosting headers for Netlify and Nginx.
- Avoided strict CSP to prevent accidental breakage with provider images, analytics, and Vite output.
- Updated database config to support `DATABASE_URL` and configurable `DB_SSLMODE`.

## Health And Smoke Test Changes

- Expanded `GET /api/health` with environment and timestamp.
- Added `GET /api/health/deep` for database and Redis checks.
- Expanded worker `GET /health` with service name, jobs, and database status.
- Added `scripts/smoke-test.mjs`.

## Required Environment Variables

- API: `APP_KEY`, `APP_ENV`, `APP_DEBUG`, `APP_URL`, `FRONTEND_URL`, `DATABASE_URL` or `DB_*`, `DB_SSLMODE`, `REDIS_*`, `MAIL_*`, `TMDB_API_KEY`, `RAWG_API_KEY`.
- Worker: `DATABASE_URL`, `TMDB_API_KEY`, `RAWG_API_KEY`, `OPENLIBRARY_BASE_URL`.
- Web: `VITE_API_URL`, `VITE_PUBLIC_SITE_URL`, optional analytics/monitoring variables.

## Manual Deployment Checklist

- Set production env vars outside git.
- Run migrations with `php artisan migrate --force`.
- Run Laravel cache commands after env is final.
- Verify `/api/health`, `/api/health/deep`, and worker `/health`.
- Run `scripts/smoke-test.mjs`.
- Update `robots.txt` and `sitemap.xml` to the production domain.
- Replace placeholder PWA icons with final brand assets.

## Known Limitations

- API Docker command still uses `php artisan serve` for provider compatibility and simplicity; a dedicated PHP-FPM/Nginx or Octane setup is recommended for heavier production traffic.
- PWA support intentionally excludes offline API data and offline mutation queues.
- Dynamic sitemap generation for content, profiles, and public lists remains future work.
- CI tests rely on current Laravel test setup and do not provision external provider credentials.
