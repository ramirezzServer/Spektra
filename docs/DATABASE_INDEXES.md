# Database Indexes

This document records the indexes that support Spektra's feed, library, social graph, and list query patterns. Indexes are additive and should not require dropping application data.

## Feed

- `activity_feed_actor_id_created_at_index` / phase variants on `activity_feed(actor_id, created_at DESC)` support following-feed queries that filter activity to followed users.
- `activity_feed_created_at_phase4_index` on `activity_feed(created_at DESC, id DESC)` supports the global cursor feed ordering.
- `activity_feed_object_type_object_id_phase4_index` and `activity_feed_object_id_object_type_phase3_index` support object lookups and activity fan-out maintenance.

The schema uses `actor_id` for feed ownership rather than `user_id`; this is the equivalent of the audit item `activity_feed(user_id, created_at)`.

## Library

- `user_entries_user_id_status_index` / phase variants on `user_entries(user_id, status)` support library status filters.
- `user_entries_user_id_updated_at_phase3_index` on `user_entries(user_id, updated_at DESC)` supports the default library recency sort.
- `user_entries_user_id_created_at_index` on `user_entries(user_id, created_at DESC)` supports created-date library scans and satisfies the audit index request.
- `user_entries_content_id_index` / phase variants on `user_entries(content_id)` support reverse lookups from content to library entries.
- The unique key on `user_entries(user_id, content_id)` keeps a user's library entry idempotent per content item.

Library controllers eager load `content` before returning `UserEntryResource`, and the resource uses `whenLoaded('content')` to avoid per-item lazy loading.

## Content Discovery

- `content_items_type_release_year_index` on `content_items(type, release_year)` supports type-filtered release-year browsing.
- `content_items_type_ratings_count_index` on `content_items(type, ratings_count DESC)` supports type-filtered trending/popularity queries.
- `content_items_ratings_count_index` / phase variants support global trending queries ordered by rating count.

## Social Graph

- The primary/unique key on `follows(follower_id, following_id)` supports follow creation, idempotency, and relationship checks.
- `follows_following_id_index` / phase variants on `follows(following_id)` support follower-list lookups.
- `follows_follower_id_phase4_index` supports following-list lookups.
- `follows_created_at_phase4_index` supports pivot-created ordering for followers/following pagination.

The schema uses `following_id` rather than `followed_id`; this is the equivalent of the audit item `follows(follower_id, followed_id)`.

Follower/following endpoints use `withCount(['followers', 'following'])` so `UserResource` can serialize counts without relationship lazy loads.

## Lists

- `lists_user_id_updated_at_index` on `lists(user_id, updated_at DESC)` supports owner list pagination sorted by recent updates.
- `lists_user_id_is_public_index` supports owner/public visibility checks.
- `list_items_list_id_position_index` on `list_items(list_id, position)` supports list show, reorder normalization, and preview item ordering.
- `list_items_content_id_index` supports reverse lookups from content to lists.

List index loads item counts and bounded preview content in bulk; list show loads paginated items with `content`. `UserListResource` and `ListItemResource` use loaded relationships/counts only.
