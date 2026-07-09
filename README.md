# AWAKEN NETWORK OS

Static HTML/CSS/JS frontend for `awakencult.com`.

AWAKEN NETWORK is an OS-style shell for AWAKEN CULT's real ecosystem: archive projects, music catalog links, community, VZN, NOISE, SoundCloud, social links, and future Supabase-powered content.

## Current Build

- AWAKEN OS boot screen.
- Solid default AWAKEN red wallpaper: `#da4a44`.
- Classic wallpaper themes in Settings and `A:\Wallpapers`: AWAKEN Red, XP Teal, XP Blue, XP Olive, XP Silver, and Black.
- Top status bar, bottom XP-style taskbar, Start menu, and desktop icons.
- Window manager with close/minimize, draggable desktop windows, and mobile full-screen windows.
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

Edit `script.js`:

- `LINKS` for official URLs.
- `PROJECTS` for catalog/package metadata.
- `WALLPAPERS` for solid color wallpaper themes.
- `SOCIALS` for LIVE INTERNET cards.
- `FILES` for virtual Explorer entries.

Edit `styles.css`:

- `--awaken-red` for the standard wallpaper color.
- `--wallpaper-color` for runtime wallpaper state.

## Next Upgrade Path

The current version is intentionally static. It is ready to be upgraded into a React/TypeScript + Supabase app with database-backed projects, uploads, admin tools, community music submissions, VZN/NOISE integrations, and featured content.
