# Spektra

Spektra is a full-stack tracker for films, series, games, and books. It supports account auth, external content search, personal library tracking, ratings, reviews, profiles, following, and real activity feeds.

## Implemented Features

- Email/password auth with optional email verification.
- Content search and detail pages for TMDB, RAWG, and OpenLibrary-backed data.
- User library tracking with Want, In Progress, and Done statuses.
- Ratings, reviews, profile stats, and paginated library views.
- Social graph: follow/unfollow, followers, following, relationship state.
- Activity feed with Following and Global scopes.
- Privacy/Terms pages, SPA SEO metadata, robots.txt, sitemap.xml.
- Optional consent-gated analytics adapter and app error boundary.

## Stack

| App | Tech | Purpose |
| --- | --- | --- |
| `apps/web` | React 18, Vite, TypeScript, TailwindCSS, React Router, TanStack Query, Zustand | SPA frontend |
| `apps/api` | Laravel 11, Sanctum, PostgreSQL, Redis | API, auth, library, social graph, feed |
| `apps/worker` | Python, FastAPI, APScheduler, asyncpg | Scheduled sync and rating refresh jobs |
| `packages/shared-types` | TypeScript | Shared frontend domain types |

## Local Setup

```bash
cp .env.example .env
docker compose up -d postgres redis

cd apps/api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate

cd ../web
npm install
npm run dev

cd ../worker
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment

Core variables:

- `DB_*` / `DB_URL`: PostgreSQL connection settings.
- `REDIS_*`: cache, queue, and session settings.
- `FRONTEND_URL`: SPA URL used by email verification redirects.
- `VITE_API_URL`: frontend API base URL.
- `VITE_PUBLIC_SITE_URL`: canonical SEO base URL.
- `TMDB_API_KEY`: required for full film/series search.
- `RAWG_API_KEY`: required for full game search.
- `OPENLIBRARY_BASE_URL`: book search provider, no key required.
- `MAIL_*`: email verification mail settings. Use `MAIL_MAILER=log` locally.
- `REQUIRE_EMAIL_VERIFICATION`: set `true` to block sensitive mutations until verified.
- `VITE_ANALYTICS_PROVIDER`, `VITE_GA_MEASUREMENT_ID`, `VITE_UMAMI_*`: optional consent-gated analytics.
- `VITE_SENTRY_DSN`: reserved for optional frontend monitoring wiring.

## Useful Commands

```bash
cd apps/web && npm run typecheck
cd apps/web && npm run build
cd apps/api && php artisan route:list --path=api
docker compose exec api php artisan migrate
docker compose exec worker python -m py_compile main.py jobs/sync_trending.py jobs/refresh_ratings.py db/connection.py
```

## Notes

- The SPA SEO files include placeholder `https://example.com` values in `robots.txt` and `sitemap.xml`; update them for a real domain.
- Dynamic content/profile sitemap generation is future work.
- No production credentials should be committed. Use environment variables for API keys, mail, database, analytics, and monitoring.
