# Environment

Spektra uses separate environment files for the root compose setup, frontend, API, and worker. Do not commit real secrets.

## File Roles

- Root `.env` is optional for Docker Compose variable substitution. If it is absent, `docker-compose.yml` uses safe local defaults such as `spektra`, `spektra_user`, and `spektra_pass`.
- `apps/api/.env` is loaded by the API container and Laravel.
- `apps/worker/.env` is loaded by the worker container.
- `apps/web/.env` is loaded by Vite, and only `VITE_*` values are exposed to the browser.
- Default dev Compose does not publish PostgreSQL or Redis to the host. Use `docker-compose.expose.yml` only when a host tool needs direct DB/Redis access.

## App

- `APP_ENV`: `local`, `staging`, or `production`.
- `APP_DEBUG`: set `false` in production.
- `APP_URL`: API public URL.
- `FRONTEND_URL`: frontend public URL used by CORS and email verification redirects.
- Password reset emails also use `FRONTEND_URL` to generate `/reset-password?token=...&email=...` links.
- `REQUIRE_EMAIL_VERIFICATION`: set `true` to require verified email before sensitive mutations.
- `SANCTUM_TOKEN_EXPIRATION_MINUTES`: API token lifetime in minutes. Defaults to `1440` so bearer tokens expire after 24 hours unless overridden.
- `HEALTH_CHECK_SECRET`: shared secret required by `X-Health-Secret` for `/api/health/deep` when set. Leave unset only for local development; production should set a long random value.

## Database

- `DATABASE_URL`: preferred production PostgreSQL connection string.
- `DB_CONNECTION`: `pgsql`.
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: local or fallback connection fields.
- `DB_SSLMODE`: use `require` for Neon and most managed PostgreSQL providers.
- `DB_FORWARD_PORT`: optional host port used only by `docker-compose.expose.yml`, default `5432`.

For Neon, set `DATABASE_URL` in both the API and worker. Include SSL mode in the URL or set `DB_SSLMODE=require` for the API.

For Docker local development, the API database host is `postgres`, not `127.0.0.1`. The worker should use a Docker-network connection string such as `postgresql://spektra_user:spektra_pass@postgres:5432/spektra`.

If you need TablePlus, DBeaver, psql, or another host tool to connect directly, start Compose with the expose override:

```bash
docker compose -f docker-compose.yml -f docker-compose.expose.yml up -d
```

Then connect from the host using `127.0.0.1:${DB_FORWARD_PORT:-5432}`.

## Redis

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` when the provider requires it.
- `REDIS_FORWARD_PORT`: optional host port used only by `docker-compose.expose.yml`, default `6379`.

Redis is used by Laravel cache, queue, and session configuration.

For Docker local development, the API Redis host is `redis`. Redis remains unauthenticated on the private local Docker network by default.

## External Providers

- `TMDB_API_KEY`
- `TMDB_BASE_URL`
- `RAWG_API_KEY`
- `RAWG_BASE_URL`
- `OPENLIBRARY_BASE_URL`

Frontend code must not receive provider API keys.

## Mail

- `MAIL_MAILER`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_ENCRYPTION`
- `MAIL_FROM_ADDRESS`
- `MAIL_FROM_NAME`

Use `MAIL_MAILER=log` locally.

Password reset and email verification both depend on the configured mailer in
non-local environments. Confirm `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME`, and the
provider credentials before enabling real user email flows.

## Frontend

- `VITE_API_URL`: public API base, usually `https://api.example.com/api/v1`. Existing `/api` values continue to work while legacy routes are supported.
- `VITE_PUBLIC_SITE_URL`: canonical frontend origin, with one production domain only, for example `https://your-domain.example`. Do not include a path or trailing slash.
- `VITE_ANALYTICS_PROVIDER`: `none`, `ga`, or `umami`.
- `VITE_GA_MEASUREMENT_ID`
- `VITE_UMAMI_SRC`
- `VITE_UMAMI_WEBSITE_ID`
- `VITE_SENTRY_DSN`

Only `VITE_*` values are exposed to the browser.

Before launch, replace `https://your-domain.example` in `robots.txt` and `sitemap.xml` with the same origin used for `VITE_PUBLIC_SITE_URL`. Set `APP_URL` to the public API/backend URL, not the frontend URL.
