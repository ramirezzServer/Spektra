# Environment

Spektra uses separate environment files for the root compose setup, frontend, API, and worker. Do not commit real secrets.

## App

- `APP_ENV`: `local`, `staging`, or `production`.
- `APP_DEBUG`: set `false` in production.
- `APP_URL`: API public URL.
- `FRONTEND_URL`: frontend public URL used by CORS and email verification redirects.
- `REQUIRE_EMAIL_VERIFICATION`: set `true` to require verified email before sensitive mutations.

## Database

- `DATABASE_URL`: preferred production PostgreSQL connection string.
- `DB_CONNECTION`: `pgsql`.
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: local or fallback connection fields.
- `DB_SSLMODE`: use `require` for Neon and most managed PostgreSQL providers.

For Neon, set `DATABASE_URL` in both the API and worker. Include SSL mode in the URL or set `DB_SSLMODE=require` for the API.

## Redis

- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD` when the provider requires it.

Redis is used by Laravel cache, queue, and session configuration.

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

## Frontend

- `VITE_API_URL`: public API base, usually `https://api.example.com/api`.
- `VITE_PUBLIC_SITE_URL`: canonical frontend URL.
- `VITE_ANALYTICS_PROVIDER`: `none`, `ga`, or `umami`.
- `VITE_GA_MEASUREMENT_ID`
- `VITE_UMAMI_SRC`
- `VITE_UMAMI_WEBSITE_ID`
- `VITE_SENTRY_DSN`

Only `VITE_*` values are exposed to the browser.
