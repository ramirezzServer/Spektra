# API

Preferred base path: `/api/v1`

Legacy base path: `/api`

The unversioned `/api` routes remain backward-compatible for existing clients. New clients should use `/api/v1`. Future breaking API changes should be introduced under a new prefix such as `/api/v2` while keeping supported older versions available during migration windows.

Responses generally use `{ "data": ... }` with optional `meta`. Validation errors follow Laravel's `message` plus `errors` object shape. Token auth uses Laravel Sanctum bearer tokens.

## Auth

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | `name`, `username`, `email`, `password`, `password_confirmation` |
| `POST` | `/auth/login` | No | `email`, `password` |
| `POST` | `/auth/forgot-password` | No | `email` |
| `POST` | `/auth/reset-password` | No | `token`, `email`, `password`, `password_confirmation` |
| `POST` | `/auth/logout` | Yes | none |
| `GET` | `/auth/me` | Yes | none |

Register/login return a user resource and `token`.

Forgot-password responses are generic and do not reveal whether an email belongs
to an account. Password reset links point to the frontend `/reset-password`
route using `FRONTEND_URL`. Successful password resets revoke existing API
tokens for that user.

## Email Verification

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `GET` | `/email/verify/{id}/{hash}` | Signed URL | Laravel signed verification URL |
| `POST` | `/email/verification-notification` | Yes | none |

Verification redirects to the frontend email status route.

Laravel email verification URLs still preserve the legacy `verification.verify` route name. A versioned route also exists under `/api/v1/email/verify/{id}/{hash}` for direct v1 compatibility, but generated verification mail keeps using the legacy named URL unless changed intentionally.

## Content

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `GET` | `/content` | No | `q`, `type`, `page` |
| `GET` | `/content/trending` | No | `type`, `limit` |
| `GET` | `/content/{type}/{externalId}` | No | `type`: `film`, `series`, `game`, `book` |

Content search uses page pagination and returns content item summaries.

## Library And Tracking

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `POST` | `/entries` | Yes | `content_id`, `status`, optional `rating`, `review` |
| `DELETE` | `/entries/{id}` | Yes | entry id |
| `GET` | `/entries/by-content/{contentId}` | Yes | content UUID |
| `GET` | `/library` | Yes | `status`, `type`, `sort`, `page`, `per_page` |

Statuses are `want`, `in_progress`, and `done`. Ratings are integers from 1 to 10.

## Profiles And Stats

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `GET` | `/users/{username}` | No | username |
| `GET` | `/users/{username}/stats` | No | username |
| `GET` | `/users/{username}/library` | No | `status`, `type`, `sort`, `page`, `per_page` |

Profile library endpoints use page pagination.

## Social

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `POST` | `/follows/{username}` | Yes | username |
| `DELETE` | `/follows/{username}` | Yes | username |
| `GET` | `/users/{username}/relationship` | Yes | username |
| `GET` | `/users/{username}/followers` | No | `page`, `per_page` |
| `GET` | `/users/{username}/following` | No | `page`, `per_page` |

Follow mutations may require verified email when `REQUIRE_EMAIL_VERIFICATION=true`.

## Feed

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `GET` | `/feed` | Optional | `scope`, `cursor`, `per_page` |

`scope=global` is public. `scope=following` requires auth. Feed uses cursor pagination with `next_cursor` and `has_more`.

## Lists

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `GET` | `/lists` | Yes | `page`, `per_page` |
| `POST` | `/lists` | Yes | `name`, optional `description`, `is_public` |
| `GET` | `/lists/{id}` | Public if list is public | list UUID, `page`, `per_page` |
| `PUT` | `/lists/{id}` | Yes, owner | `name`, optional `description`, `is_public` |
| `DELETE` | `/lists/{id}` | Yes, owner | list UUID |
| `POST` | `/lists/{id}/items` | Yes, owner | `content_id` |
| `DELETE` | `/lists/{id}/items/{contentId}` | Yes, owner | content UUID |
| `PUT` | `/lists/{id}/items/reorder` | Yes, owner | `items[]` with `content_id`, `position` |

## Health

| Method | Path | Auth | Params |
| --- | --- | --- | --- |
| `GET` | `/health` | No | none |
| `GET` | `/health/deep` | No | none |

Deep health checks database and Redis without exposing secrets.

## Pagination

Page pagination returns `meta.page`, `meta.per_page`, `meta.total`, and `meta.last_page` where available. Cursor pagination returns `meta.next_cursor` and `meta.has_more`.

## Provider Keys

TMDB, RAWG, mail, database, and monitoring credentials are server-side secrets. Do not expose them through frontend env variables.
