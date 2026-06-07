# Testing

Spektra uses focused automated tests for the API, worker, and frontend utility layer. The suite avoids real provider calls and production credentials.

## API

Run from `apps/api`:

```bash
./vendor/bin/pint --test
php artisan test
```

Pint enforces the Laravel PHP style preset. The Laravel tests cover auth, content discovery fallbacks, library entries, lists, social follow/feed behavior, and API throttling. They require PostgreSQL because the migrations use PostgreSQL-specific features such as `gen_random_uuid`, `jsonb`, array casts, and raw DDL.

For local runs, point the API test environment at a disposable database:

```bash
APP_ENV=testing
APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=spektra_test
DB_USERNAME=spektra_user
DB_PASSWORD=spektra_pass
CACHE_STORE=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=array
MAIL_MAILER=array
TMDB_API_KEY=
RAWG_API_KEY=
php artisan test
```

## Frontend

Run from `apps/web`:

```bash
npm run typecheck
npm run build
npm test -- --run
```

Vitest covers pure frontend utilities: slug/path building, canonical URL normalization, safe URL filtering, formatters, API error messages, command item definitions, and recent-content helpers.

## Worker

Run from `apps/worker`:

```bash
python -m py_compile main.py jobs/sync_trending.py jobs/refresh_ratings.py db/connection.py
pytest
```

Pytest covers worker normalization, missing API key behavior, rating refresh SQL calls with a fake async pool, and the FastAPI health endpoint with the database check mocked.

## Scripts

Run from the repository root:

```bash
node --check scripts/check-headers.mjs
node --check scripts/security-audit-check.mjs
node --check scripts/smoke-test.mjs
```

## Manual Coverage

Smoke tests, email delivery, production provider credentials, deployed edge redirects, analytics, and real hosted database connectivity remain manual or environment-level checks.
