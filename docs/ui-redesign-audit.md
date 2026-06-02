# Spektra UI Redesign Audit

## Design direction

Spektra now leans into a premium media-tracking interface: content-first, cinematic, compact, and social without becoming an admin dashboard. The visual system uses layered light surfaces, deep slate hero panels, controlled violet/cyan/emerald accents, stronger poster cards, and denser grids.

## Design tokens changed

- Added semantic Tailwind tokens for `bg`, `surface`, `border`, `content`, `accent`, `info`, content types, and status colors.
- Preserved backward-compatible tokens such as `bg-bg-secondary`, `bg-bg-tertiary`, `bg-surface`, `border-border`, `text-content-primary`, and `text-accent`.
- Added refined shadows: `xs`, `sm`, `card`, `cardHover`, `panel`, `modal`, and `glow`.
- Expanded radius and type scales for modern panels, cards, and compact metadata.
- Updated global background to a lightweight layered gradient with consistent first paint.

## Layout changes

- App shell now uses a wider premium sidebar, compact max-width container, tighter page padding, integrated footer, and safer mobile bottom spacing.
- Sidebar, mobile navbar, and bottom nav have stronger active states, larger tap targets, and blur/surface layering.
- Major pages now use compact rounded page headers instead of sparse empty top areas.

## Component changes

- Buttons support `primary`, `secondary`, `ghost`, `subtle`, `danger`, `success`, and `icon` variants plus size and loading support.
- Inputs, textareas, selects, labels, hints, and errors have consistent surfaces, focus rings, and readable text.
- Cards, badges, dialogs, skeletons, poster fallback art, content cards, grids, feed items, list cards, and user cards were visually refreshed.
- Content cards now have stronger poster ratio treatment, gradient scrims, denser metadata, readable badges, and preserved quick action buttons.

## Page redesign summary

- Home: cinematic compact hero, search/library CTAs, polished filter tabs, tighter trending grid.
- Search: sticky search/filter panel, stronger input, improved idle/error/empty states.
- Content detail: cinematic title panel, poster panel, metadata cards, improved tracking and list panels.
- Profile: social header panel, compact stat cards, stronger library filters and empty/error states.
- Feed: polished scope tabs and compact activity cards.
- Library: dense header, grouped filters, polished empty/error panels.
- Lists/List detail: curated collection headers and richer preview cards.
- User connections: polished header and refreshed user cards.
- Auth: premium split desktop panel and compact mobile forms.
- NotFound: consistent card surface and action buttons.

## Accessibility safeguards

- Dialog focus-trap logic was preserved.
- Focus-visible rings remain visible and were strengthened on primitives.
- Icon-only controls keep accessible labels where they already existed.
- Interactive content cards remain links; quick actions remain buttons.
- Mobile tap targets remain at least 44px, with coarse-pointer support for 48px.

## Performance safeguards

- No heavy UI framework, animation library, or image background was added.
- Poster images remain lazy-loaded with async decoding.
- Existing React Query data flows were preserved.
- Decorative effects are CSS gradients, shadows, and transitions only.
- Motion-reduction media query disables transition/animation duration for users who prefer reduced motion.

## Known limitations

- This pass prioritizes systematic visual modernization over pixel-perfect manual tuning on every route.
- Dark mode was not added because the app did not expose a complete dark-mode system.
- Some route-specific forms and list item rows may still benefit from a second visual polish pass.

## Manual visual checks

Check at 360px, 390px, 768px, 1024px, and 1440px:

- Home, Search, Content detail, Profile, Feed, Library, Lists, List detail.
- Login, Register, NotFound, followers/following pages.
- AddToList modal, ConfirmDialog, offline/network/email/PWA banners.
- Long titles, long usernames, broken poster images, keyboard tab focus, hover quick actions.
