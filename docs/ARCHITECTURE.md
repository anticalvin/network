# Transmission Update Architecture

## Baseline audit

The repository was a dependency-free static application: `index.html`, `styles.css`, one 781-line `script.js`, and local media. It had a boot sequence, desktop, window manager, taskbar, Start menu, Explorer, packages, media viewers, terminal, links, wallpaper persistence, and mobile full-screen windows. Deployment required only static hosting. There was no router, build step, Supabase code, admin application, Memory Card, ImgBB-specific routing, automated test suite, or tweet export.

Known baseline regressions were Start focusing its search input (opening a phone keyboard), the long first boot, fabricated status-like boot copy, no failed-image state, and small mobile window controls. Wallpaper and boot were the only persisted settings.

## Current boundaries

- `script.js`: existing public shell and window integrations.
- `src/content/`: bundled safe content and replaceable icon manifest.
- `src/domain/`: pure Memory Card, scheduling, and media rules.
- `src/data/`: content/community/filesystem/media repositories with bundled, cached, local-admin, optional remote, and Supabase paths.
- `admin.html` and `admin/`: phone-friendly authenticated editorial preview and live snapshot publishing. Draft state remains local until the administrator deliberately publishes it.
- `supabase/migrations/`: relational public/admin content contract, live filesystem, campaigns, media assets, MIND bridge tables, storage setup, Realtime setup, and RLS.
- `tools/`: repeatable tweet export ingestion into a non-publishing review queue.
- `discord/`: separate server-side MIND bot process, restricted to the configured XP channel.
- `tests/`: deterministic state, scheduling, and media tests.

The public site never needs Supabase to boot. The repository returns the last safe local or cached edition when a remote request fails. A future Supabase adapter should implement the same repository boundary rather than adding data calls to window rendering functions.

The public site also never receives the Discord bot token or Supabase server key. MIND connects through a separate Node.js process and accepts only server-side environment variables. Discord-to-Supabase ingestion is opt-in, channel-specific, moderated, and stores only the minimum Discord fields needed for deduplication and display.

## Persistence

`awaken.memory-card` is versioned independently from `awaken.content-admin-draft`. Memory Card migration currently fails closed to an empty version 1 card. Unlock receipts are additive records inside `preferences.unlocks`; the storage key, version, and top-level shape are unchanged. Authenticated sync is an optional future adapter; anonymous use remains local and contains no sensitive profile data.

## Missing inputs and assumptions

- No companion voice/editorial prompt was supplied in this repository, so copy is factual and restrained; no lore was invented.
- No tweet export was supplied, so the importer and review shape are implemented but no source content was transformed.
- Supabase project `gnfxhelagmcferkqpngr` is configured. The live-system migration was applied on 2026-07-13, while the original live baseline remains unregistered in Supabase migration history.
- No ImgBB records were found in the current content. The normalized provider and viewer path are ready for managed records.
- Preview tokens, analytics, revision restoration, and the hosted MIND process require additional deployment configuration. Production admin authentication and live snapshot publication are connected through Supabase with app-metadata role checks and RLS.

## Hardcoded content moved

Community link descriptions, interface empty/fallback copy, themes, transmission copy, and Memory Card fragments now live in `src/content/default-content.js`. Icon artwork and visibility live in `src/content/icon-manifest.js`.

Catalog packages remain in `script.js` because they contain verified shell-specific presentation metadata and converting all package rendering in this phase would increase regression risk. Terminal command names, path labels, button labels, accessibility labels, and error/empty-state utility language remain code-owned because they are interface contracts rather than editorial posts.
# Runtime Creative Layer

The desktop shell remains the owner of boot, windows, taskbar, Explorer, Start, terminal, and context menus. AWAKEN Paint and Media Player are scoped app renderers under `src/apps`; they receive shell services and return cleanup handlers. Ads, recovery, intrusion, Gallery projects, scheduling, and media URL parsing live in testable domain modules. Cross-system behavior uses `AWAKEN_EVENTS`, while session-only intrusion state uses `runtime-state.js`.

`A:\Gallery` merges bounded local editable records with approved Supabase Gallery submissions through `GalleryRepository`. The canonical filesystem stays protected; anonymous writes are isolated to a constrained submission table and bucket rather than weakening filesystem-wide policies.

Mobile AWAKEN Paint applies zoom through canvas display dimensions, leaving its pointer coordinate conversion intact. Pan is an explicit mode so one-finger drawing does not compete with viewport movement.

The optional power beat is a separate `awaken-system/power.html` stage that posts into the existing entry controller. It does not replace or alter BIOS, startup, or login files and becomes static under reduced motion.
