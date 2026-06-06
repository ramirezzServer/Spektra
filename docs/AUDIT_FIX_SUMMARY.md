# Audit Fix Summary

## Audit Issues Received

- Testing needed meaningful API, frontend, worker, and CI coverage.
- Docker and environment setup needed safer defaults, optional DB/Redis exposure,
  and clearer documentation.
- API versioning needed preferred `/api/v1` routes while preserving legacy
  `/api` compatibility.
- License and project storytelling docs were missing.
- Hardcoded credentials and committed secrets needed review.

## Fixes Applied

- Confirmed frontend utility tests, API feature tests, worker tests/compile
  checks, and CI workflow coverage exist.
- Confirmed `CHANGELOG.md`, `docs/PROJECT_HISTORY.md`, and `LICENSE` exist and
  are linked from the README.
- Confirmed default dev Compose exposes only web, API, and worker ports; DB and
  Redis host exposure is opt-in through `docker-compose.expose.yml`.
- Confirmed docs prefer `/api/v1` and document legacy `/api` support.
- Added root `.env` to `.gitignore` so a copied root environment file is not
  accidentally committed.

## Commands Run

```bash
cd apps/web
npm run typecheck
npm run build
npm test -- --run

cd apps/api
php artisan route:list --path=api
php artisan test

cd apps/worker
py -m py_compile main.py jobs/sync_trending.py jobs/refresh_ratings.py db/connection.py
pytest
py -m pytest

node --check scripts/smoke-test.mjs
node --check scripts/check-headers.mjs
node --check scripts/security-audit-check.mjs

docker compose config
docker compose -f docker-compose.yml -f docker-compose.expose.yml config
docker compose -f docker-compose.prod.yml config
```

## Results

- Frontend typecheck, build, and Vitest suite passed.
- API route listing passed and showed both `/api` and `/api/v1` routes.
- API tests are present, but the local PHP runtime did not have `pdo_pgsql`, so
  PostgreSQL-backed feature tests failed before application assertions could run.
  CI installs `pdo_pgsql` and runs these tests against PostgreSQL.
- Worker Python compile checks passed.
- Worker tests are present, but local Python did not have `pytest` installed.
- Script syntax checks passed.
- Default, expose override, and production Compose configs validated.

## Remaining Manual Checks

- Re-run `php artisan test` with PHP `pdo_pgsql` installed and a disposable
  PostgreSQL test database available.
- Re-run worker `pytest` after installing worker dependencies.
- Run smoke tests against live local or deployed web/API/worker services.
- Replace placeholder `robots.txt` and `sitemap.xml` domains before launch.
- Verify production CSP, redirects, analytics consent, PWA behavior, and email
  delivery in the deployed environment.

## Known Limitations

- Local defaults such as `spektra_user` and `spektra_pass` are development-only
  examples and must be replaced for shared or production environments.
- Legacy `/api` routes remain for compatibility; new clients should use
  `/api/v1`.
- No upload feature exists, so upload-specific hardening remains future policy.
- No Git history rewrite, fake commits, fake contributors, or product feature
  changes were introduced by this audit pass.
