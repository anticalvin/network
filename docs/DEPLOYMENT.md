# Deployment and Environment

The public app remains static-host compatible. Serve the repository root over HTTP; ES modules do not run reliably from a direct `file://` URL.

Configure `config.js` at deployment time:

- `contentEndpoint`: optional public JSON/API endpoint. Empty uses bundled/local content.
- `adminBaseUrl`: configurable admin location; no final subdomain is assumed.
- `supabaseUrl`: future browser-safe project URL.
- `supabaseAnonKey`: future anon key only. Never use the service-role key in browser files.

Apply `supabase/migrations/202607110001_transmission_update.sql` through the target project's normal migration workflow after reviewing existing schema names and JWT claim policy. Create the admin claim only from a trusted server process. Production admin deployment must add authenticated Supabase repository methods and unpublished-preview authorization before exposing `admin.html`; the included admin is deliberately a local editorial preview, not a claim of completed production authentication.

For tweet imports:

```sh
npm run import:tweets -- /path/to/export.json tweet-review-queue.json
```

The output preserves IDs, timestamps, source type, raw provenance, media, and outbound links; removes exact/near text duplicates; marks every item `review`; and never publishes. Review and transform selected records into sourced content manually or through a future authenticated importer.

Run checks with `npm test`. Preview with `npm run serve`, then test `/?skipBoot=1` for direct development access and `/admin.html` for the editor.
