# Project History

Spektra evolved as an iterative full-stack media tracker for films, series,
games, and books. This document summarizes the project structure and milestone
sequence for reviewers without inventing a timeline that is not present in the
repository history.

## Monorepo Rationale

Spektra uses a monorepo because the product surface spans a React frontend, a
Laravel API, a Python worker, shared domain types, deployment files, and
operational documentation. Keeping these pieces together makes cross-service
changes easier to review: an API contract change, UI integration, database
migration, worker sync update, and deployment note can live in one visible
project context.

The monorepo also keeps onboarding practical. Reviewers can inspect the full
system from the root README, run Docker Compose for local development, and find
service-specific code under predictable `apps/` folders.

## Service Boundaries

Spektra separates `web`, `api`, and `worker` because each service has a
different responsibility and runtime profile:

- `apps/web` owns the SPA user experience, routing, client state, and
  presentation components.
- `apps/api` owns authentication, authorization, persistence, user library
  state, social graph behavior, feeds, lists, and public API responses.
- `apps/worker` owns scheduled provider sync and rating refresh jobs that
  should not block interactive user requests.

This split keeps the API focused on request/response behavior while background
provider work can be deployed, scaled, and monitored separately.

## Aggregated Content Providers

Spektra aggregates TMDB, RAWG, and OpenLibrary so users can search and track
multiple media types through one product model. The API normalizes provider
responses into shared content records, while provider API keys remain
server-side. This avoids pushing external service details or credentials into
the frontend and gives the application one place to handle provider failures,
metadata mapping, and future provider expansion.

## Phased Product Growth

The feature set was split into phases so each layer had a stable base before
the next one depended on it. Auth and navigation came first because private
library features require identity. Search and detail views followed because
tracking needs content records. Library tracking added personal status, ratings,
reviews, and profile views. Social and feed features then connected users
through follows and activity. Lists and Home rounded out collection-building and
discovery workflows.

Follow-up stabilization and micro-UX passes addressed the practical details
that appear after core flows exist: loading states, empty states, draft
preservation, error copy, localization helpers, image fallbacks, keyboard focus,
and responsive polish.

## Production Readiness And Security

Production readiness was added after the core product areas were present. That
work documented environments, deployment, release checks, API behavior, smoke
tests, health checks, Docker configuration, CI, and PWA behavior. Security
hardening then reviewed common risk areas such as SQL injection, XSS, CSP,
rate limiting, unsafe URL contexts, upload/RCE exposure, external-link
tabnabbing, and server/header leakage.

These additions do not make the project finished or production-certified, but
they make the operational assumptions explicit and give future work a clearer
checklist.

## Future Work

- Replace placeholder `robots.txt` and `sitemap.xml` domains before launch.
- Add dynamic sitemap generation for public content, profiles, and lists.
- Replace placeholder PWA icons with final brand assets.
- Consider a PHP-FPM/Nginx or Octane API runtime for heavier production
  traffic.
- Tighten CSP to exact production domains after final analytics, API, and asset
  hosts are known.
- Add password reset if the product needs a complete auth recovery flow.
- Add upload-specific validation and storage hardening only if upload features
  are introduced.
- Expand automated end-to-end coverage for core user journeys.
