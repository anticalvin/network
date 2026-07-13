# MIND XP Bridge

MIND is split into two sides:

- Public desktop: read-only XP channel client using `discord_messages` through RLS-safe reads.
- Server process: Discord bot in `discord/mind-bot.js` with `discord/mind-supabase-bridge.js`.

The bridge mirrors only:

- guild `946069318473502770`
- channel `1525921490414080031`
- human-authored messages

It ignores bot messages, messages outside #xp, empty content, attachments, embeds, emails, IPs, roles, and presence data. Message bodies are normalized and capped at 1800 characters.

Run it only from a trusted server with `DISCORD_BOT_TOKEN` and `SUPABASE_SERVER_KEY` in the environment.
