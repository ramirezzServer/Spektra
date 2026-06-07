# Spektra

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.11-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)

Spektra is a full-stack media tracking platform for films, series, games, and books. It combines external discovery, personal library tracking, ratings, reviews, profiles, follows, activity feeds, custom lists, and PWA installability in one monorepo.

**Demo:** _Add deployed demo URL here._

## Screenshots

Screenshots are not committed yet. See [docs/screenshots/README.md](docs/screenshots/README.md) for the required portfolio capture list before publishing the repo.

## Product Highlights

- Unified discovery across TMDB, RAWG, and OpenLibrary-backed content.
- Personal library with Want, In Progress, Done, ratings, and reviews.
- Public profiles, followers/following, and global/following activity feeds.
- Custom public/private lists with ordered items.
- React SPA with route splitting, dark mode, PWA install/update flow, and offline messaging.
- Laravel Sanctum API with versioned `/api/v1` routes and legacy `/api` compatibility.
- FastAPI worker for scheduled sync and rating refresh jobs.

## Architecture

```txt
React/Vite PWA (apps/web)
        |
        | HTTP /api/v1
        v
Laravel API + Sanctum (apps/api)
        |
        +--> PostgreSQL: users, content, library, feed, lists
        +--> Redis: cache, throttling, queues
        +--> Provider APIs: TMDB, RAWG, OpenLibrary

FastAPI worker (apps/worker)
        |
        +--> PostgreSQL + provider APIs for scheduled sync/refresh
```

## Tech Stack

| App                     | Tech                                                                           | Purpose                                       |
| ----------------------- | ------------------------------------------------------------------------------ | --------------------------------------------- |
| `apps/web`              | React 18, Vite, TypeScript, TailwindCSS, React Router, TanStack Query, Zustand | SPA/PWA frontend                              |
| `apps/api`              | Laravel 11, Sanctum, PostgreSQL, Redis                                         | Auth, API, library, social graph, feed, lists |
| `apps/worker`           | Python 3.11, FastAPI, APScheduler, asyncpg                                     | Scheduled content sync and rating refresh     |
| `packages/shared-types` | TypeScript                                                                     | Shared domain types                           |

## Quick Start

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env
docker compose up --build
```

The default Compose file exposes only the app services:

- Web: `http://localhost:5173`
- API: `http://localhost:8000`
- Worker: `http://localhost:8001`

PostgreSQL and Redis stay inside the Docker network by default. If you need host access for database tools:

```bash
docker compose -f docker-compose.yml -f docker-compose.expose.yml up -d
```

Manual local setup:

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

Copy each `.env.example` before running the matching service. Core production variables include `APP_ENV`, `APP_DEBUG`, `APP_URL`, `FRONTEND_URL`, database/Redis settings, mail settings, provider API keys, `VITE_API_URL`, and `VITE_PUBLIC_SITE_URL`.

New frontend deployments should set `VITE_API_URL` to the preferred `/api/v1` API base. See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for details.

## Testing

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

API tests use PostgreSQL because migrations rely on PostgreSQL-specific SQL. Web and worker tests are unit/light integration tests and do not require real provider, mail, Neon, or production credentials.

## Deployment

- Frontend: build `apps/web` with `npm ci && npm run build`, publish `dist`.
- API: deploy `apps/api` to a Docker-capable Laravel host with PostgreSQL, Redis, mail, provider API keys, and migrations.
- Worker: deploy `apps/worker` as a separate service using the same production database and provider API keys.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md) before release.

## Documentation

- [Changelog](CHANGELOG.md)
- [Project History](docs/PROJECT_HISTORY.md)
- [Testing Guide](docs/TESTING.md)
- [API Guide](docs/API.md)
- [OpenAPI Specification](docs/openapi.yaml)
- [Environment Guide](docs/ENVIRONMENT.md)
- [GitHub Repo Setup](docs/GITHUB_REPO_SETUP.md)

## Known Limitations

- Demo URL and screenshots need to be added before public portfolio/recruiter sharing.
- `robots.txt` and `sitemap.xml` contain `https://your-domain.example`; update before launch.
- Dynamic content/profile/list sitemap generation is future work.
- PWA support caches the app shell, static assets, and a static offline fallback page only. API responses and offline mutations are intentionally not cached or queued.
- No production credentials are committed. Use environment variables for secrets.

## License

Spektra is licensed under the [MIT License](LICENSE).
