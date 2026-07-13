# MIND Discord Bot

MIND runs as a separate Node.js process. It is not bundled into the static AWAKEN website and its token must never be exposed to browser code.

## Discord identifiers

- Application ID: `1525925076627620003`
- Public key: `3b70ed922a65d0262fe98b0233a74d5453340a4d7ef72c5d964edcbb32c1cb7c`
- AWAKEN guild ID: `946069318473502770`
- XP channel ID: `1525921490414080031`

## Local setup

1. Copy `.env.example` to `.env` and enter the values there.
2. Keep `DISCORD_BOT_TOKEN` only in `.env` or a trusted deployment secret manager.
3. Export the variables from `.env` into the shell environment.
4. Run `npm run discord:mind`.

The bot observes human messages only in `#xp`. It responds only to `!mind status` or a direct mention, with a per-user cooldown.

When `SUPABASE_URL` and `SUPABASE_SERVER_KEY` are present, it also mirrors permitted #xp messages into `public.discord_messages` through the trusted server process. It ignores bots, other channels, empty messages, attachments, embeds, and private profile data. Edits update the mirrored row; deletes mark the row removed for moderation/history rather than exposing stale public content.

Do not set `SUPABASE_SERVER_KEY` in `config.js` or any browser-delivered file.
