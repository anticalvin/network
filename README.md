# AWAKEN NETWORK OS

Static HTML/CSS/JavaScript application shell for `awakencult.com`.

AWAKEN NETWORK is an OS-style shell for AWAKEN CULT's real ecosystem: archive projects, music catalog links, community, VZN, NOISE, SoundCloud, social links, and future Supabase-powered content.

AWAKEN Atlas now provides the fail-closed canonical knowledge layer beneath Explorer, the existing admin, Supabase, and generated public SEO routes. See `docs/ATLAS.md` for publication rules and initial private review records.

## Current Build

- Supplied AWAKEN BIOS, startup, guest login, and ads pages under `awaken-system/`.
- Skippable, one-per-session AWAKEN console-era power beat before the unchanged BIOS flow.
- AWAKEN default image wallpaper with solid `#da4a44` offline fallback.
- Classic wallpaper themes in Settings and `A:\Wallpapers`: AWAKEN Red, XP Teal, XP Blue, XP Olive, XP Silver, and Black.
- Top status bar, bottom XP-style taskbar, Start menu, and desktop icons.
- Window manager with close/minimize, draggable desktop windows, and mobile full-screen windows.
- Versioned local Memory Card with 8MB block presentation, type-aware Open actions, explicit save feedback, persistent unlocks, remove, reset, and persistence.
- Recoverable Trash app for popup signals, with Open + Save, Restore, and permanent Delete actions.
- Scheduled, dismissible, frequency-limited transmission windows.
- Managed content repository with bundled, cached, local-preview, and optional remote paths.
- Configurable image icon manifest with safe text fallbacks.
- Normalized local, remote, Supabase Storage, and ImgBB media sources.
- Phone-friendly authenticated content editor at `/admin.html` with local draft state, verified Supabase publication receipts, and live NETWORK publishing.
- Touch-optimized AWAKEN Paint with mobile tool drawer, fit, zoom, and explicit pan mode.
- Shop app with a Windows 3D Pipes-inspired Coming Soon screen and progressive construction signal.
- Supabase migrations with structured content, media, virtual filesystem, campaigns, Discord XP mirror tables, storage buckets, Realtime publication setup, and RLS.
- MIND desktop app with a bounded initial XP fetch, Supabase Realtime updates, reconnect reconciliation, deduplication, and deliberate loading/offline/error states.
- MIND Discord bot bridge foundation for server-side #xp mirroring.
- AWAKEN Media Player with canvas visualizer, local signal playback, and external Apple Music/SoundCloud links.
- Rerunnable tweet-export importer that produces an unpublished editorial review queue.
- Automated tests for persistence, scheduling, expiry, frequency, and media safety.
- Explorer with virtual `A:\` paths.
- Package/project hubs for XP, HATED, XPV2, NEW SWAG WHO DIS?, CENTRAL AFRICAN TIME, State Of Mind, and NOISE.
- Media Player app with Apple Music and SoundCloud links.
- Community and LIVE INTERNET apps with real AWAKEN links, safe address/search routing, and admin-managed fictional NETWORK sites.
- Public-shell compatibility fallback for embedded social browsers; the admin-only Supabase SDK is no longer loaded on the public desktop.
- Terminal commands: `help`, `dir`, `tree`, `cd`, `open`, `find`, `type readme`, `scan`, `recover`, `whoami`, `version`, `discord`.

## Local Preview

```bash
python3 -m http.server 5179 --bind 127.0.0.1
```

Then open:

```txt
http://127.0.0.1:5179/
```

## Content Updates

Edit managed defaults in `src/content/default-content.js` and icon artwork in `src/content/icon-manifest.js`. Filesystem records, popup copy, feature flags, and NETWORK Sites can also be edited and published from `/admin.html`. Shell-specific catalog packages currently remain in `script.js`.

- `LINKS` for official URLs.
- `PROJECTS` for catalog/package metadata.
- `WALLPAPERS` for solid color wallpaper themes.
- `SOCIALS` for LIVE INTERNET cards.
- `FILES` for virtual Explorer entries.

Edit `styles.css`:

- `--awaken-red` for the standard wallpaper color.
- `--wallpaper-color` for runtime wallpaper state.
- `--wallpaper-image` for runtime image wallpapers.

The static frontend uses the project's public publishable key from `config.js`. This key is designed for browser use and remains constrained by RLS. The server-only key must stay on the MIND bot host.

## Verification

```bash
npm test
```

See `docs/ARCHITECTURE.md` for the audit and known limitations, and `docs/DEPLOYMENT.md` for environment, Supabase, admin, and tweet-import guidance.
