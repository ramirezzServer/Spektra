# Contributing

Thanks for helping improve Spektra. This repo is a monorepo with a React web app, a Laravel API, a Python worker, shared TypeScript types, operational scripts, and deployment docs.

## Branch Workflow

1. Start from an up-to-date `main`:

```bash
git switch main
git pull --ff-only
```

2. Create a focused feature branch:

```bash
git switch -c feature/short-description
```

Use prefixes such as `feature/`, `fix/`, `docs/`, `chore/`, or `audit/`.

3. Keep changes scoped. Avoid unrelated refactors, generated file churn, fake data, committed secrets, and API contract changes unless the PR is specifically about them.

4. Run the relevant checks before opening a PR. For broad changes, run the full set below.

## Quality Checks

Frontend:

```bash
cd apps/web
npm run lint
npm run format:check
npm run typecheck
npm run build
npm test -- --run
```

API:

```bash
cd apps/api
composer pint:test
php artisan test
```

API tests require PostgreSQL and the `pdo_pgsql` PHP extension.

Worker:

```bash
cd apps/worker
python -m py_compile main.py jobs/sync_trending.py jobs/refresh_ratings.py db/connection.py
pytest
```

Scripts and security checks:

```bash
node --check scripts/check-headers.mjs
node --check scripts/security-audit-check.mjs
node --check scripts/smoke-test.mjs
node scripts/security-audit-check.mjs
```

Docker Compose validation:

```bash
docker compose -f docker-compose.yml config --quiet
docker compose -f docker-compose.yml -f docker-compose.expose.yml config --quiet
docker compose -f docker-compose.prod.yml --profile local-db config --quiet
```

## Pull Requests

Open a PR into `main` after checks pass locally. Use the pull request template, link related issues, and call out migrations, env changes, API compatibility risks, or manual verification.

Prefer squash merge for feature and fix branches so `main` stays readable. Use regular merge only when preserving a branch history is useful for a coordinated release or long-running project branch.

## Optional Pre-Commit Routine

There is no root `package.json`, so the repo does not install Husky or lint-staged globally. That avoids adding root Node tooling just for hooks. Contributors who want a local pre-commit habit can run this before committing:

```bash
cd apps/web && npm run lint && npm run format:check && npm run typecheck
cd ../api && composer pint:test
cd ../../ && node scripts/security-audit-check.mjs
```

If a root package manager is introduced later, Husky/lint-staged can be added in a separate tooling PR.

## Releases

See [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md). Do not create release tags until CI is green and the release checklist is complete.
