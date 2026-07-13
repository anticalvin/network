# Deployment and Environment

The public app remains static-host compatible. Serve the repository root over HTTP; ES modules do not run reliably from a direct `file://` URL.

Configure `config.js` at deployment time:

- `contentEndpoint`: optional public JSON/API endpoint. Empty uses bundled/local content.
- `adminBaseUrl`: configurable admin location; no final subdomain is assumed.
- `supabaseUrl`: browser-safe project URL. This repo is wired to `https://gnfxhelagmcferkqpngr.supabase.co`.
- `supabaseAnonKey`: publishable/anon key only. Never use the service-role/server key in browser files.

Applied migrations:

- `202607130001_live_parallel_system` was applied to project `gnfxhelagmcferkqpngr` on 2026-07-13.

The live database had no recorded migration history before this update, so the original `content_items`, `media`, `content_media`, `transmission_rules`, `import_sources`, `content_sources`, and `content_revisions` schema is treated as the unregistered baseline. Keep `supabase/migrations/202607110001_transmission_update.sql` for fresh/local project rebuilds, and keep `supabase/migrations/202607130001_live_parallel_system.sql` as the additive live-system migration.

Create the admin claim only from a trusted server process. Use `app_metadata.user_role = "admin"` or the equivalent trusted `user_role` JWT claim. Production admin deployment must add authenticated Supabase repository writes before using `admin.html` for production publishing; the included admin still preserves local editorial preview mode.

For MIND server mirroring, run the bot process with:

```sh
DISCORD_BOT_TOKEN=...
DISCORD_APPLICATION_ID=1525925076627620003
DISCORD_PUBLIC_KEY=3b70ed922a65d0262fe98b0233a74d5453340a4d7ef72c5d964edcbb32c1cb7c
DISCORD_GUILD_ID=946069318473502770
DISCORD_XP_CHANNEL_ID=1525921490414080031
SUPABASE_URL=https://gnfxhelagmcferkqpngr.supabase.co
SUPABASE_SERVER_KEY=...
npm run discord:mind
```

Do not place `DISCORD_BOT_TOKEN` or `SUPABASE_SERVER_KEY` in `config.js`, browser assets, screenshots, or GitHub Actions logs.

For tweet imports:

```sh
npm run import:tweets -- /path/to/export.json tweet-review-queue.json
```

The output preserves IDs, timestamps, source type, raw provenance, media, and outbound links; removes exact/near text duplicates; marks every item `review`; and never publishes. Review and transform selected records into sourced content manually or through a future authenticated importer.

Run checks with `npm test`. Preview with `npm run serve`, then test `/` for the supplied BIOS/startup/login sequence, `/?skipBoot=1` for direct development access, and `/admin.html` for the editor.
