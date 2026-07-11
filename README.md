# AWAKEN NETWORK OS

Static HTML/CSS/JavaScript application shell for `awakencult.com`.

AWAKEN NETWORK is an OS-style shell for AWAKEN CULT's real ecosystem: archive projects, music catalog links, community, VZN, NOISE, SoundCloud, social links, and future Supabase-powered content.

## Current Build

- AWAKEN OS boot screen.
- Solid default AWAKEN red wallpaper: `#da4a44`.
- Classic wallpaper themes in Settings and `A:\Wallpapers`: AWAKEN Red, XP Teal, XP Blue, XP Olive, XP Silver, and Black.
- Top status bar, bottom XP-style taskbar, Start menu, and desktop icons.
- Window manager with close/minimize, draggable desktop windows, and mobile full-screen windows.
- Versioned local Memory Card with explicit save, remove, reset, and persistence.
- Scheduled, dismissible, frequency-limited transmission windows.
- Managed content repository with bundled, cached, local-preview, and optional remote paths.
- Configurable image icon manifest with safe text fallbacks.
- Normalized local, remote, Supabase Storage, and ImgBB media sources.
- Phone-friendly content editor at `/admin.html` for local editorial preview.
- Supabase migration with structured content, media, import provenance, revisions, and RLS.
- Rerunnable tweet-export importer that produces an unpublished editorial review queue.
- Automated tests for persistence, scheduling, expiry, frequency, and media safety.
- Explorer with virtual `A:\` paths.
- Package/project hubs for XP, HATED, XPV2, NEW SWAG WHO DIS?, CENTRAL AFRICAN TIME, State Of Mind, and NOISE.
- Music/Radio app with Apple Music and SoundCloud links.
- Community and LIVE INTERNET apps with real AWAKEN links.
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

Edit managed defaults in `src/content/default-content.js` and icon artwork in `src/content/icon-manifest.js`. Shell-specific catalog packages currently remain in `script.js`.

- `LINKS` for official URLs.
- `PROJECTS` for catalog/package metadata.
- `WALLPAPERS` for solid color wallpaper themes.
- `SOCIALS` for LIVE INTERNET cards.
- `FILES` for virtual Explorer entries.

Edit `styles.css`:

- `--awaken-red` for the standard wallpaper color.
- `--wallpaper-color` for runtime wallpaper state.

## Verification

```bash
npm test
```

See `docs/ARCHITECTURE.md` for the audit and known limitations, and `docs/DEPLOYMENT.md` for environment, Supabase, admin, and tweet-import guidance.
