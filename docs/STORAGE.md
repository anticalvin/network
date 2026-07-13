# Storage

The live migration creates these buckets:

- Public: `public-media`, `audio-previews`, `thumbnails`
- Private: `audio-originals`, `content-drafts`, `team-private`, `community-uploads`

Anonymous visitors can read public buckets only. Upload, update, and delete policies require an authenticated user with trusted admin app metadata. Community uploads are reserved for a later moderated flow.
