# Deployment

## Local Production-Like Run

1. Copy env examples and set local-safe values.
2. Build and run services:

```bash
docker compose -f docker-compose.prod.yml --profile local-db up --build
```

3. Run API migrations:

```bash
docker compose -f docker-compose.prod.yml exec api php artisan migrate
```

4. Run smoke tests:

```bash
WEB_URL=http://localhost:8080 API_URL=http://localhost:8000/api WORKER_URL=http://localhost:8001 node scripts/smoke-test.mjs
```

## Neon PostgreSQL

- Create a Neon PostgreSQL database.
- Set `DATABASE_URL` for both `apps/api` and `apps/worker`.
- Include SSL mode in the connection string or set `DB_SSLMODE=require` for Laravel.
- Run `php artisan migrate --force` after the API is deployed.
- Do not commit the connection string.

## Frontend Static Hosting

Working directory: `apps/web`

- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Required env: `VITE_API_URL`, `VITE_PUBLIC_SITE_URL`
- Optional env: analytics and monitoring variables from `docs/ENVIRONMENT.md`

The frontend includes SPA fallback files for Vercel and Netlify-compatible hosts.

## Backend Deployment

Deploy `apps/api` as a Docker service or Laravel-compatible PHP service.

Required steps:

1. Set `APP_ENV=production` and `APP_DEBUG=false`.
2. Set `APP_KEY`, `APP_URL`, `FRONTEND_URL`, database, Redis, mail, and provider API key env vars.
3. Run `composer install --no-dev --optimize-autoloader`.
4. Run:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

5. Ensure the queue worker is running if queued jobs are used:

```bash
php artisan queue:work
```

## Worker Deployment

Deploy `apps/worker` as a separate service:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

It uses the same production database as the API. Set `DATABASE_URL`, `TMDB_API_KEY`, `RAWG_API_KEY`, and `OPENLIBRARY_BASE_URL`.

Health endpoint: `GET /health`.

## Post-Deploy Checklist

- API health: `GET /api/health`.
- Worker health: `GET /health`.
- Frontend loads and unknown routes fall back to the SPA.
- Register, login, logout.
- Email verification link flow.
- Content search and detail.
- Library tracking, rating, review.
- Follow/unfollow and feed.
- Custom lists.
- PWA manifest and install prompt.
- `robots.txt` and `sitemap.xml` updated to the production domain.
- Analytics and monitoring consent behavior checked.
- Smoke test script passes.
