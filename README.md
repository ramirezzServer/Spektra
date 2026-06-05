# Spektra

Spektra is a full-stack tracker for films, series, games, and books. It combines external content discovery with personal library tracking, ratings, reviews, profiles, follows, activity feeds, and custom lists.

## Feature Overview

- Email/password auth with optional email verification.
- Content search and detail views backed by TMDB, RAWG, and OpenLibrary.
- Personal library tracking with Want, In Progress, and Done statuses.
- Ratings, reviews, profile stats, and paginated public libraries.
- Social graph with follow/unfollow, followers, following, and relationship state.
- Activity feed with Following and Global scopes.
- Custom lists with public/private visibility and ordered items.
- Home discovery, SPA SEO metadata, privacy/terms pages, and PWA installability.
- Consent-gated analytics hooks and frontend error boundary.

## Tech Stack

| App | Tech | Purpose |
| --- | --- | --- |
| `apps/web` | React 18, Vite, TypeScript, TailwindCSS, React Router, TanStack Query, Zustand | SPA frontend |
| `apps/api` | Laravel 11, Sanctum, PostgreSQL, Redis | API, auth, library, social graph, feed |
| `apps/worker` | Python 3.11, FastAPI, APScheduler, asyncpg | Scheduled sync and rating refresh jobs |
| `packages/shared-types` | TypeScript | Shared domain types |

## Monorepo Structure

```txt
apps/web       React/Vite frontend
apps/api       Laravel API
apps/worker    FastAPI scheduled worker
packages       shared TypeScript packages
docs           production, API, and release documentation
scripts        operational helper scripts
```

## Quick Start

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

The default dev Compose file exposes the API, worker, and web ports only. PostgreSQL and Redis are available to containers on the Docker network as `postgres` and `redis`.

For host DB/Redis tools such as TablePlus, DBeaver, psql, or RedisInsight, opt in to port forwarding:

```bash
docker compose -f docker-compose.yml -f docker-compose.expose.yml up -d
```

Manual local service setup without Docker:

```bash
cd apps/api
composer install
php artisan key:generate
php artisan migrate

cd ../web
npm install
npm run dev

cd ../worker
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Environment

Copy each example file before running the matching service:

- Root: `.env.example` for optional Compose defaults and host port override variables
- Frontend: `apps/web/.env.example`
- API: `apps/api/.env.example`; use `DB_HOST=postgres` and `REDIS_HOST=redis` in Docker
- Worker: `apps/worker/.env.example`; use a `DATABASE_URL` with host `postgres` in Docker

Core production variables are `APP_ENV`, `APP_DEBUG`, `APP_URL`, `FRONTEND_URL`, `DATABASE_URL` or `DB_*`, `DB_SSLMODE`, `REDIS_*`, `MAIL_*`, `TMDB_API_KEY`, `RAWG_API_KEY`, `OPENLIBRARY_BASE_URL`, `VITE_API_URL`, and `VITE_PUBLIC_SITE_URL`.

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for details.

## Docker Usage

Local development:

```bash
docker compose up --build
```

Optional DB/Redis host access:

```bash
docker compose -f docker-compose.yml -f docker-compose.expose.yml up -d
```

Production-like local run with an included Postgres service:

```bash
docker compose -f docker-compose.prod.yml --profile local-db up --build
```

For managed PostgreSQL such as Neon, set `DATABASE_URL` for the API and worker and omit the `local-db` profile.

## Database Migrations

Run migrations after configuring the API environment:

```bash
cd apps/api
php artisan migrate
```

Production deploys should use:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Worker Usage

The worker runs scheduled content sync and rating refresh jobs:

```bash
cd apps/worker
uvicorn main:app --host 0.0.0.0 --port 8001
```

The health endpoint is `GET /health`.

## Testing And Build

```bash
cd apps/web && npm run typecheck
cd apps/web && npm run build
cd apps/web && npm test -- --run
cd apps/api && php artisan route:list --path=api
cd apps/api && php artisan test
cd apps/worker && python -m py_compile main.py jobs/sync_trending.py jobs/refresh_ratings.py db/connection.py
cd apps/worker && pytest
node --check scripts/check-headers.mjs
node --check scripts/security-audit-check.mjs
node --check scripts/smoke-test.mjs
```

API tests use PostgreSQL because the migrations rely on PostgreSQL-specific SQL. Web and worker tests are unit/light integration tests and do not require TMDB, RAWG, OpenLibrary, mail, Neon, or production credentials. See [docs/TESTING.md](docs/TESTING.md) for the fuller testing guide.

Smoke test:

```bash
WEB_URL=http://localhost:5173 API_URL=http://localhost:8000/api WORKER_URL=http://localhost:8001 node scripts/smoke-test.mjs
```

## Deployment

- Frontend: static host from `apps/web`, build with `npm ci && npm run build`, publish `dist`.
- API: Docker-capable Laravel host with PostgreSQL, Redis, mail, provider API keys, and migrations.
- Worker: separate service using the same production database and provider API keys.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/API.md](docs/API.md), and [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md).

## Data Providers

Spektra uses TMDB for films/series, RAWG for games, and OpenLibrary for books. API keys must remain server-side.

## Known Limitations

- `robots.txt` and `sitemap.xml` contain `https://your-domain.example`; update before launch.
- Dynamic content/profile/list sitemap generation is future work.
- PWA support caches the app shell and static assets only. API responses and offline mutations are intentionally not cached.
- No production credentials are committed. Use environment variables for secrets.
