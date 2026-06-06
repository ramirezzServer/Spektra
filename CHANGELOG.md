# Changelog

This changelog is Keep-a-Changelog inspired. It summarizes the documented
evolution of Spektra without rewriting Git history or inventing unavailable
release dates.

## Unreleased

### Added

- MIT license for legal clarity.
- Project history documentation for reviewers and maintainers.
- Changelog documenting the major implementation milestones already reflected
  in the codebase and audit documents.

## Major Milestones

### Security Hardening Milestone

#### Added

- Rate limiting for auth, search, feed, write-heavy authenticated routes, and
  health endpoints.
- Security audit script for raw SQL review points, unsafe HTML rendering,
  upload surfaces, new-tab/window surfaces, and unsafe URL literals.
- API feature coverage for security hardening behavior.

#### Changed

- Applied compatible frontend CSP headers for static hosts and a stricter API
  response CSP.
- Added safe URL handling for browser URL contexts such as posters, backdrops,
  avatars, and SEO images.
- Hardened server/header leakage paths across API, web, worker, and deployment
  documentation.

### UI Overkill Redesign Milestone

#### Changed

- Refreshed the app into a more content-forward media tracking interface.
- Expanded Tailwind tokens, shadows, radius, typography, status colors, and
  component variants.
- Redesigned major pages including Home, Search, Content Detail, Profile, Feed,
  Library, Lists, auth routes, and NotFound.
- Preserved accessibility safeguards such as focus-visible behavior, dialog
  focus trapping, accessible icon controls, and mobile tap targets.

### Phase 6 Production Readiness Milestone

#### Added

- Production web image, hardened service Dockerfiles, production-like Compose
  configuration, and static host SPA fallback files.
- CI workflow for frontend, backend, and worker checks.
- PWA manifest, static asset caching, update prompt, and generated placeholder
  icons.
- API documentation, deployment documentation, release checklist, smoke test,
  and deeper health checks.

#### Changed

- Centralized public frontend environment reads.
- Documented production environment variables and deployment steps.
- Added security headers for API and static hosting paths.

### Phase 5 Lists + Home Milestone

#### Added

- Custom user lists with public/private visibility and ordered list items.
- List cards, list detail views, add-to-list flow, and list item management UI.
- Home discovery experience for trending and recently viewed content.

#### Changed

- Added list data model updates and list API resources/controllers.
- Improved micro-UX around repeated submits, draft preservation, error copy,
  localized formatting, favicon/touch icon polish, and custom 404 handling.

### Phase 4 Social + Feed Milestone

#### Added

- Social graph with follow/unfollow, followers, following, and relationship
  state.
- Activity feed with Following and Global scopes.
- Feed, user connection, and social card UI.
- Email verification, privacy/terms pages, route SEO metadata, consent-gated
  analytics hooks, and an app error boundary during follow-up optimization.

#### Changed

- Added social graph and activity feed database updates.
- Kept SEO, analytics, and monitoring additions dependency-light.

### Phase 3 Library + Tracking Milestone

#### Added

- Personal library entries with Want, In Progress, and Done statuses.
- Ratings, reviews, profile stats, and paginated public library views.
- Library hooks, pages, resources, models, and API endpoints.

#### Changed

- Stabilized auth, search, detail, profile, library, worker sync, image
  fallback, provider failure, and query loading behavior in the Phase 3.5 pass.

### Phase 2 Content Search + Detail Milestone

#### Added

- Content search and detail flows backed by aggregated external providers.
- Content item model updates for provider metadata.
- Search and content detail frontend views with reusable content components.

#### Changed

- Expanded content storage fields and provider aggregation behavior so films,
  series, games, and books can share one discovery surface.

### Phase 1 Auth + Navigation Milestone

#### Added

- Email/password authentication foundation using Laravel Sanctum.
- User account fields used by later profile and social features.
- Application shell, navigation, protected-route handling, and auth pages.

#### Changed

- Established the web/API contract and initial monorepo application structure
  that later phases extended.
