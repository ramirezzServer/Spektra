# Spektra

Spektra is a multi-content tracker for films, series, games, and books with social features: follow users, activity feeds, ratings, reviews, and custom lists.

## Stack Overview

| App | Tech | Purpose |
| --- | --- | --- |
| `apps/web` | React 18, Vite, TypeScript, TailwindCSS, React Router, TanStack Query, Zustand | Mobile-ready user interface |
| `apps/api` | Laravel 11, Sanctum, PostgreSQL, Redis | API, auth, social graph, library, lists |
| `apps/worker` | Python 3.11, FastAPI, APScheduler, asyncpg | Scheduled sync jobs and rating refreshes |
| `packages/shared-types` | TypeScript | Shared domain interfaces |

## Prerequisites

- Node 20+
- PHP 8.3+
- Python 3.11+
- Docker
- Composer

## Quick Start

```bash
git clone ...
cd spektra
cp .env.example .env
docker compose up -d postgres redis
cd apps/api && composer install && php artisan migrate
cd ../web && npm install && npm run dev
cd ../worker && pip install -r requirements.txt && uvicorn main:app --reload
```

## Environment Variables

| Variable | Used by | Description |
| --- | --- | --- |
| `DB_CONNECTION` | API | PostgreSQL connection driver, use `pgsql` |
| `DB_HOST` / `DB_PORT` | API, Worker | PostgreSQL host and port |
| `DB_DATABASE` | API, Worker | Database name |
| `DB_USERNAME` / `DB_PASSWORD` | API, Worker | Database credentials |
| `REDIS_HOST` / `REDIS_PORT` | API | Cache, queue, and session backend |
| `VITE_API_URL` | Web | API base URL, usually `http://localhost:8000/api` |
| `TMDB_API_KEY` | API, Worker | Film and series provider key |
| `RAWG_API_KEY` | API, Worker | Game provider key |
| `OPENLIBRARY_BASE_URL` | API, Worker | Book provider base URL |
| `YOUTUBE_API_KEY` | API | Future trailer metadata key |

## API Reference

The API routes live in [`apps/api/routes/api.php`](apps/api/routes/api.php). Responses use a consistent JSON envelope:

```json
{ "data": [], "meta": { "page": 1, "per_page": 20, "total": 0 } }
```

## Development Notes

- Web runs on `http://localhost:5173`.
- API runs on `http://localhost:8000`.
- Worker runs on `http://localhost:8001`; check `GET /health`.
- The web app includes local sample content so the product shell is usable before API data is seeded.
