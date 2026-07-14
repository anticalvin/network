# MIND XP Bridge

MIND is split into two sides:

- Public desktop: read-only XP channel client using `discord_messages` through RLS-safe reads.
- Server process: Discord bot in `discord/mind-bot.js` with `discord/mind-supabase-bridge.js`.

The bridge mirrors only:

- guild `946069318473502770`
- channel `1525921490414080031`
- human-authored messages

It ignores bot messages, messages outside #xp, embeds, emails, IPs, roles, and presence data. Message bodies are normalized and capped at 1800 characters. Up to eight HTTPS attachment records are retained with bounded file metadata; files are not copied into AWAKEN storage.

Run it only from a trusted server with `DISCORD_BOT_TOKEN` and `SUPABASE_SERVER_KEY` in the environment.

## Data path

1. Discord emits create, update, or delete events for the configured XP channel.
2. The trusted bot upserts `discord_channels` and `discord_messages` with the Discord message ID as the unique key.
3. RLS exposes only approved, public, non-deleted messages from an enabled public channel.
4. MIND performs a bounded initial REST fetch, then subscribes to `discord_messages` through Supabase Realtime.
5. Reconnects, manual refreshes, and returning to a visible tab trigger a reconciliation fetch. Messages are deduplicated by Discord message ID and ordered by the original Discord timestamp.

## Verification

Run the bot with the required environment values, post a human-authored message in the configured XP channel, and look for the structured `MIND bridge stored message` log. Confirm the row in `public.discord_messages`, then open MIND and verify it appears without a page refresh. Reload the page to verify the initial fetch and check that the message remains singular after reconnecting.

Common failures are a bot pointed at a different project, missing Discord Message Content intent, a mismatched guild/channel ID, a missing `SUPABASE_SERVER_KEY`, a public key absent from the website, a row hidden by moderation/visibility/RLS, or a table missing from the `supabase_realtime` publication.
