# Audit Reconciliation

This document reconciles the audit findings against the current Spektra
repository state. It does not rewrite Git history, add product features, remove
legacy `/api` routes, or change `/api/v1` behavior.

Severity values are carried forward as practical audit priorities based on the
finding category because the original uploaded audit file is not present in the
repository.

## Current-State Map

| Audit finding | Severity from audit | Current repo status | Evidence file/path | Next segment to handle it |
| --- | --- | --- | --- | --- |
| Password reset routes | Medium | Fixed | `apps/api/routes/api.php` registers `/auth/forgot-password` and `/auth/reset-password` under both legacy `/api` and `/api/v1`; `apps/api/app/Http/Controllers/Api/AuthController.php` uses Laravel's password broker; `apps/web/src/pages/Auth/ForgotPassword.tsx` and `ResetPassword.tsx` provide frontend pages | Security & Authentication |
| Sanctum token expiry | High | Not fixed | `apps/api/config/sanctum.php` has `'expiration' => null` | Security & Authentication |
| Health deep endpoint protection | Medium | Partially fixed | `apps/api/routes/api.php` exposes `/health/deep` publicly but applies `throttle:api.health`; `docs/API.md` documents auth as `No` | Security & Authentication |
| `REQUIRE_EMAIL_VERIFICATION` default and docs | Medium | Partially fixed | `apps/api/config/auth.php` defaults to `false`; `docs/ENVIRONMENT.md`, `docs/API.md`, and `docs/RELEASE_CHECKLIST.md` document the setting and release decision | Security & Authentication |
| Account deletion endpoint | High | Not fixed | `apps/api/routes/api.php` has no account/profile delete route; no controller method found for deleting the authenticated user | Security & Authentication |
| Rate limiting implementation and docs | High | Fixed | `apps/api/app/Providers/AppServiceProvider.php` defines named limiters; `apps/api/routes/api.php` applies throttles; `docs/DEPLOYMENT.md` documents rate limits | Security & Authentication |
| API versioning with legacy compatibility | High | Fixed | `apps/api/routes/api.php` registers unversioned routes and `Route::prefix('v1')`; `php artisan route:list --path=api` showed 64 routes across `/api` and `/api/v1`; `docs/API.md` prefers `/api/v1` and documents legacy `/api` | API Versioning |
| API tests | High | Fixed | `apps/api/tests/Feature/*` includes auth, content, API versioning, library, list, feed/social, and security tests; CI runs `php artisan test` with PostgreSQL and `pdo_pgsql` | Testing & QA |
| Frontend utility tests | Medium | Fixed | `apps/web/src/lib/*.test.ts`; `apps/web/package.json` has Vitest test script; CI runs `npm test -- --run` | Testing & QA |
| Worker scheduled job tests | Medium | Fixed | `apps/worker/tests/test_sync_trending.py`, `test_refresh_ratings.py`, and `test_health.py`; CI installs worker requirements and runs `pytest` | Testing & QA |
| Worker compile checks | Low | Fixed | README and CI run `python -m py_compile main.py jobs/sync_trending.py jobs/refresh_ratings.py db/connection.py` | Testing & QA |
| Smoke test in CI | Medium | Partially fixed | `scripts/smoke-test.mjs` exists and CI runs `node --check scripts/smoke-test.mjs`; CI does not run the smoke test against live services | CI/CD & Deployment |
| CI meaningful checks | High | Fixed | `.github/workflows/ci.yml` runs frontend typecheck/build/tests, backend composer validation/PHP syntax/API tests, worker compile/tests, and script syntax checks | CI/CD & Deployment |
| Docker DB/Redis exposure | High | Fixed | `docker-compose.yml` exposes only API, worker, and web; `docker-compose.expose.yml` opt-in publishes PostgreSQL and Redis; `docs/DEPLOYMENT.md` and `docs/ENVIRONMENT.md` document this | CI/CD & Deployment |
| Dev Compose env defaults and hardcoded credentials | High | Partially fixed | `docker-compose.yml` uses `${DB_*:-...}` local defaults; `.env.example` and docs call them local defaults; no production secrets should use these defaults | CI/CD & Deployment |
| Production Compose validation | Medium | Fixed | `docker-compose.prod.yml` exists; previous regression validated `docker compose -f docker-compose.prod.yml config` | CI/CD & Deployment |
| Changelog | Low | Fixed | `CHANGELOG.md` exists and README links it | Documentation & Repo Hygiene |
| License | High | Fixed | `LICENSE` exists with MIT license; README links it | Documentation & Repo Hygiene |
| Project history/storytelling | Low | Fixed | `docs/PROJECT_HISTORY.md` exists and README links it | Documentation & Repo Hygiene |
| Git history quality | Medium | Needs manual GitHub action | Repo docs now tell the project story, but actual commit history cannot be repaired without rewriting history; prompt explicitly forbids fake commits and history rewriting | Git Workflow & Dev Experience |
| GitHub topics/description | Low | Needs manual GitHub action | No in-repo file can set repository topics/description reliably; this must be done in GitHub repository settings | Git Workflow & Dev Experience |
| TypeScript strict flags | Medium | Fixed | `apps/web/tsconfig.json` has `"strict": true` | Git Workflow & Dev Experience |
| ESLint/Prettier | Medium | Not fixed | `apps/web/package.json` has no lint/format scripts and no ESLint/Prettier dependencies/config found | Git Workflow & Dev Experience |
| Laravel Pint | Low | Partially fixed | `apps/api/composer.json` includes `laravel/pint` in `require-dev`, but no Pint script or CI step is configured | Git Workflow & Dev Experience |
| `per_page` hard caps | Medium | Fixed | `FeedController`, `FollowController`, `ListController`, `UserController`, and `UserEntryController` validate `per_page` with `max:50` and clamp values | Performance & Scalability |
| Content detail caching | Medium | Partially fixed | `ContentController::trending`, feed/profile stats, and provider aggregation use cache; `ContentController::show` fetches the content detail directly without a dedicated cache layer | Performance & Scalability |
| Eager loading and N+1 risk | Medium | Partially fixed | Library, feed, lists, list items, and profiles use `with(...)`, `withCount(...)`, or preview batching; some aggregate paths still rely on separate count queries | Performance & Scalability |
| Code splitting | Medium | Fixed | `apps/web/src/main.tsx` lazy-loads major routes with `React.lazy` and `Suspense` | Performance & Scalability |
| Image optimization and fallback behavior | Medium | Partially fixed | `PosterImage` and `Avatar` use safe URLs, lazy loading/async decoding, and fallbacks; no responsive `srcset`/image transformation pipeline is present | Performance & Scalability |
| Database index docs/migrations | Medium | Fixed | Index migrations exist, including `2026_05_27_000008_add_spektra_indexes.php` and phase-specific index migrations; docs mention production readiness and DB checks | Performance & Scalability |
| Dark mode | Low | Not fixed | `docs/phase-6-5-advanced-ux-reliability-audit.md` explicitly notes no full dark mode/theme switching system exists | UI/UX & Frontend Quality |
| Skeleton loading states | Low | Fixed | `apps/web/src/components/ui/Skeleton.tsx` and page/component loading skeletons exist across content, feed, lists, profile, and detail views | UI/UX & Frontend Quality |
| Optimistic UI | Low | Fixed | `apps/web/src/hooks/useLibrary.ts`, `useLists.ts`, and `useSocial.ts` use React Query `onMutate` optimistic updates | UI/UX & Frontend Quality |
| Search debounce | Low | Fixed | `apps/web/src/pages/Search.tsx` uses `setTimeout` to debounce search by 400ms and syncs URL search params | UI/UX & Frontend Quality |
| Accessibility checklist | Medium | Partially fixed | Accessible labels, roles, focus rings, and dialog focus management exist; manual accessibility checks remain in `docs/phase-6-5-advanced-ux-reliability-audit.md` and `docs/phase-5-5-micro-ux-audit.md` | UI/UX & Frontend Quality |
| PWA offline fallback | Low | Partially fixed | `apps/web/vite.config.ts` configures PWA static asset caching and denies `/api`; README states API responses/offline mutations are not cached; no full offline fallback page is documented | UI/UX & Frontend Quality |
| Screenshots/demo link | Low | Not fixed | README has no screenshot section or demo URL; no app screenshots found outside Laravel starter view assets | Documentation & Repo Hygiene |
| OpenAPI/Swagger | Medium | Not fixed | `docs/API.md` is hand-written route documentation; no OpenAPI/Swagger spec or generator config found | Documentation & Repo Hygiene |
| Release/deployment docs | Medium | Fixed | `docs/DEPLOYMENT.md`, `docs/ENVIRONMENT.md`, `docs/RELEASE_CHECKLIST.md`, and README cover deployment, env, release, Docker, and tests | Documentation & Repo Hygiene |
| Hardcoded secrets in tracked files | High | Partially fixed | `.env.example` files use empty provider keys and local defaults; actual local `.env` files are ignored; local defaults like `spektra_pass` remain documented for development only | Documentation & Repo Hygiene |
| Uploaded audit vs current repo drift | Medium | Fixed | This reconciliation file maps current statuses so later segments can avoid reimplementing already-fixed items | Documentation & Repo Hygiene |

## Verification Performed

```bash
git status --short
rg --files
php artisan route:list --path=api
```

Additional targeted `rg` and file reads inspected routes, auth config, Sanctum
config, controllers, migrations, tests, CI, Docker Compose, frontend TypeScript
configuration, PWA configuration, and documentation.

## Summary

Already fixed areas include password reset, rate limiting, API versioning
compatibility, test coverage across API/web/worker, CI, Docker DB/Redis
exposure, changelog, license, project history, TypeScript strict mode,
per-page hard caps, route code splitting, skeleton/optimistic UI, search
debounce, and deployment docs.

Remaining or partially fixed areas include Sanctum token expiration, account
deletion, public deep health behavior, live smoke testing in CI,
ESLint/Prettier, Pint wiring, content-detail-specific caching, full dark mode,
full PWA offline fallback, screenshots/demo link, OpenAPI/Swagger, and GitHub
repository topics/description.
