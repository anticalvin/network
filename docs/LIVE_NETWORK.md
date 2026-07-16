# AWAKEN Live Network

The desktop remains static-first. Supabase, Discord, Storage, and Realtime are optional live layers that must never block boot.

## Runtime Flow

- `index.html` hosts the approved power, BIOS, startup, and guest-login documents in a same-origin full-screen entry frame, keeping the public URL at `/`.
- BIOS continues to startup, startup continues to guest login, and guest login marks `sessionStorage.awaken.entrySequenceComplete`.
- A stage watchdog can recover a genuinely stalled embedded-browser boot, but it is disarmed at guest login and never auto-enters a visitor session.
- `?skipBoot=1` bypasses the entry sequence for development.
- `config.js` exposes the project URL, but the public browser key is read from runtime config/local storage so it is not committed.

## Live Data

- Public browser reads use RLS-safe REST calls only.
- The public desktop does not load the remote Supabase admin SDK; this reduces failure risk in Instagram and other embedded browsers.
- MIND opens a read-only XP channel window and falls back to a local system message.
- The Discord bot is the trusted bridge that writes Discord #xp messages into Supabase.
- Storage buckets are split into public approved assets and private draft/original/team areas.

## Deferred Production Work

- Running the MIND bot with the real Discord token and Supabase server key.
- End-to-end Discord edit/delete verification against the live server process.
- Public upload flows remain intentionally disabled.
