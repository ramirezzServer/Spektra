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

## Canonical Domain and Redirects

Choose one production frontend origin, such as `https://your-domain.example`, and set `VITE_PUBLIC_SITE_URL` to that exact origin. Keep local and preview deployments free of forced redirects.

At the production edge or reverse proxy, redirect HTTP to HTTPS and redirect either `www` to non-`www` or non-`www` to `www`. For Netlify-style rules, keep these domain-specific redirects above the SPA fallback after replacing the placeholder:

```txt
http://your-domain.example/* https://your-domain.example/:splat 301!
https://www.your-domain.example/* https://your-domain.example/:splat 301!
/* /index.html 200
```

For Vercel, configure the production domain redirect in the dashboard or with real-domain project settings rather than hardcoding placeholder domains in `vercel.json`, so preview URLs continue to work.

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

If a reverse proxy such as Nginx fronts the API or worker, disable version tokens there (`server_tokens off;`) and enforce HTTPS at the proxy/load balancer. Application code cannot remove every provider-managed `Server` header on static hosts.

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
- Header check script passes for deployed targets:

```bash
WEB_URL=https://your-domain.example API_URL=https://api.your-domain.example/api/health WORKER_URL=https://worker.your-domain.example/health node scripts/check-headers.mjs
```
