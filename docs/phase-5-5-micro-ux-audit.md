# Phase 5.5 Micro-UX Audit

## Micro-UX Improvements

- Added autofocus and mobile-friendly input hints to auth and search forms.
- Added guards against repeated mutation submits for auth, list, list item, review, follow, verification, and quick status actions.
- Preserved valuable drafts for content reviews and new list creation with session-scoped storage.
- Added refresh/close warning for unsaved review text.

## Error UX Improvements

- Expanded API error mapping for validation, auth, access, not found, rate limit, server, timeout, and offline/network states.
- Applied friendlier error copy in library, feed, search, content detail, list, and auth flows.

## Visual Polish

- Added a custom Spektra 404 page.
- Added Spektra favicon SVG, generated touch icon, and theme color metadata.
- Improved focus-visible styling globally.
- Reduced broken-image risk with poster and avatar fallbacks.

## Localization

- Added Indonesian `Intl` formatting helpers for dates, date-times, relative time, numbers, compact numbers, and IDR currency.
- Applied localized relative times and formatted counts to feed, profile, user cards, list cards, list detail, add-to-list, and content detail.

## Resilience Fixes

- Search state is synced to `/search?q=...&type=...` with debounced replace navigation.
- Broken avatar images now show initials instead of browser broken-image UI.
- Long titles, usernames, bios, reviews, and list text wrap or truncate in card contexts.
- Home trending avoids duplicating the same items across primary and secondary sections.

## Files Changed

- `apps/web/src/lib/apiError.ts`
- `apps/web/src/lib/formatters.ts`
- `apps/web/src/hooks/useDraftStorage.ts`
- `apps/web/src/hooks/useUnsavedChangesWarning.ts`
- `apps/web/src/pages/NotFound.tsx`
- Auth, search, home, content detail, profile, library, feed, lists, and list detail pages.
- Content, feed, list, social, layout, and UI components.
- `apps/web/index.html`, `apps/web/public/favicon.svg`, `apps/web/public/apple-touch-icon.png`

## Manual Visual Checks Needed

- Verify browser tab favicon and touch icon.
- Confirm review draft restoration/discard behavior after refresh.
- Confirm `/search` URL restore/back behavior.
- Check keyboard Tab focus on nav, cards, modals, filters, and quick actions.
- Test broken poster/avatar URLs visually.
- Test narrow mobile widths for horizontal overflow.

## Known Limitations

- Draft protection is intentionally limited to valuable long-form inputs, not every small form.
- No offline mutation queue was added.
- No service worker, PWA install behavior, deployment, CI/CD, or Phase 6 scope was added.
