# AWAKEN Admin Access

## Current route

The editorial interface is available at `/admin.html`. It is marked `noindex,nofollow` and currently operates as a local browser preview. Saving in this page writes only to that browser's local storage; it does not mutate Supabase or publish content.

## Security boundary

Remote writes are protected in Supabase with Row Level Security. An authenticated user must have `app_metadata.user_role = "admin"` to insert, update, or delete managed content, filesystem, media, campaign, contributor, icon, or MIND moderation records. The role must be assigned from a trusted server or the Supabase dashboard. Never use user-editable `user_metadata` for authorization.

The public desktop uses only `SUPABASE_PUBLISHABLE_KEY`. The Discord bridge uses `SUPABASE_SERVER_KEY` on the bot host. Never place `SUPABASE_SERVER_KEY`, `DISCORD_BOT_TOKEN`, or an Auth service-role key in frontend code or browser storage.

## Local access

1. Start the local static server with `npm run serve`.
2. Open `http://127.0.0.1:5179/admin.html`.
3. Edit entries and use **Save local preview**.
4. Refresh the desktop in the same browser to inspect the preview.

This workflow does not require an account because it cannot publish remote changes.

## Production publishing

Production publishing is intentionally locked until Supabase Auth is connected to the admin interface. To enable it safely:

1. Create the editor account in Supabase Auth.
2. Assign `app_metadata.user_role = "admin"` from a trusted server or the Supabase dashboard.
3. Add a sign-in flow that obtains a normal user session.
4. Send that user's access token with admin REST requests.
5. Keep all existing RLS policies enabled and verify denied writes with an anonymous client.

Required deployment values are `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` for public clients. The separate bot host requires `SUPABASE_SERVER_KEY`, `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_PUBLIC_KEY`, `DISCORD_GUILD_ID`, and `DISCORD_XP_CHANNEL_ID`.

## Common errors

- **Publishing locked**: expected until the Auth sign-in flow is added.
- **401**: the session or public key is missing or invalid.
- **403 / RLS violation**: the user is not authenticated, the admin claim is missing, or the JWT has not been refreshed since the role changed.
- **Local edits missing**: admin preview and desktop must use the same browser origin and storage.
# Runtime Controls

The existing admin includes Ads & Intrusion and Feature Flags sections. Local preview edits use the established ContentRepository draft storage. Ad preview opens the real desktop with frequency recording disabled. Remote writes remain locked behind the existing Supabase authentication and admin-role policy; this update does not add a service-role key or public write path.

Gallery Submissions uses Supabase Auth directly. Create or invite the admin user in Supabase Auth, then set `app_metadata.user_role` to `admin`. Sign in from `/admin.html`, open Gallery Submissions, select a review item, and save it as approved or rejected. Only approved flattened images appear in the shared `A:\Gallery`; anonymous submitters cannot update, approve, or delete records.
