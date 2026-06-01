# Phase 6.6 Form, Scroll, Network, Slug, and Upload Audit

## Autocomplete and Autofill

- Added explicit `name`, `autoComplete`, `inputMode`, `enterKeyHint`, capitalization, and spellcheck attributes to auth, search, review, and list fields.
- Kept credential fields aligned with browser and password-manager expectations: login uses `current-password`; registration uses `new-password`.
- Marked app-specific fields such as search, review, list name, and list description with `autoComplete="off"` to avoid accidental address/card autofill.
- Added Chromium autofill CSS normalization in `apps/web/src/index.css` so autofill keeps readable text and the app input background.

## Scroll Restoration

- Added `ScrollRestoration` mounted once under the router.
- New pathname navigations scroll to the top after route paint.
- Search/query-only updates on the same pathname do not force a scroll jump.
- Hash URLs try to scroll to the matching element ID.
- Browser back/forward (`POP`) keeps browser-like behavior where possible.

## Online, Offline, and Slow Network

- Added `useOnlineStatus` and `useSlowNetwork`.
- Added a fixed, non-layout-shifting `NetworkStatusBanner`.
- Offline state shows a polite status banner and disables existing write actions such as follow, list edits, list item changes, quick status changes, review save, and add-to-list.
- Slow connection/save-data detection shows one subtle transient message when supported by the browser.
- React Query retries stop while the browser reports offline.

## Clean URLs

- Added `slugify`, `buildContentPath`, and `buildListPath`.
- Content routes now support `/content/:type/:id/:slug?`; old `/content/:type/:id` URLs still work.
- List routes now support `/lists/:listId/:slug?`; old `/lists/:listId` URLs still work.
- Content and list detail pages fetch by stable ID only, then replace missing or stale slugs with canonical slug URLs.
- SEO canonical paths now use the slugged paths for content and lists.

## Upload MIME Validation Audit

- No file upload UI or upload endpoints currently exist.
- Existing avatar support is URL-based only; no `input type="file"`, multipart form, Laravel storage write, or upload controller path was found.
- MIME validation is not applicable yet, and no upload feature was added.
- Future upload endpoints must validate MIME/content server-side with Laravel validation or `Illuminate\Validation\Rules\File`, never extension-only checks. Image uploads should whitelist JPG, PNG, and WebP, enforce a size limit, generate safe filenames, and reject executable or script-like files.

## Files Changed

- `apps/web/src/main.tsx`
- `apps/web/src/index.css`
- `apps/web/src/lib/slugs.ts`
- `apps/web/src/lib/queryClient.ts`
- `apps/web/src/hooks/useOnlineStatus.ts`
- `apps/web/src/hooks/useSlowNetwork.ts`
- `apps/web/src/components/navigation/ScrollRestoration.tsx`
- `apps/web/src/components/network/NetworkStatusBanner.tsx`
- `apps/web/src/components/layout/AppShell.tsx`
- Auth, search, content, profile, feed, and list components/pages touched for form attributes, offline handling, canonical slugs, or internal links.

## Manual Checks Still Needed

- Verify browser/password-manager autofill on login and registration.
- Toggle DevTools offline and confirm the banner, disabled write actions, and back-online state.
- Scroll down, navigate between Home/Search/Profile/Feed, and confirm new pages start at the top.
- Confirm search query updates do not unexpectedly jump.
- Open old and new content/list URLs and confirm rendering plus canonical replacement.

## Known Limitations

- Browser back/forward scroll restoration is left to browser behavior instead of a custom per-route scroll position store.
- Slow-network detection depends on the Network Information API, which is not supported by every browser.
- Slugs are frontend-only and not unique identifiers; API fetches still depend on existing stable IDs.
