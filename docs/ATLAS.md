# AWAKEN Atlas

Atlas is the canonical knowledge layer beneath the existing NETWORK OS. It extends the current repositories, Supabase schema, admin, Explorer, and static SEO build; it is not a second site.

## Public boundary

An Atlas entity is public only when all of these are true:

- `publication_state = public`
- `public_visible = true`
- verification is `human_verified`, `official_source_verified`, or `source_archive_verified`
- confidence is at least `0.750`

Relationships must pass the same verification and confidence boundary, and both endpoint entities must be public. Draft, unreleased, private, deprecated, disputed, inferred, and review records are excluded from Explorer projection, generated pages, sitemap output, JSON-LD, and anonymous API reads.

## Initial records

The owner-confirmed team names are `anticalvin`, `hannahlleila`, `Josh Otis`, `HTL`, `Na$he`, and `Typhoon`. They are stored as private people with explicit `member_of` relationships; no biographies or credits are invented.

Confirmed collection names currently include Wasted Youth, Eyes Wide Shut, HATED, NOISE, and State Of Mind. They remain private pending fuller editorial classification and source linkage. Existing verified music releases remain separate release entities.

## Projection

`src/domain/atlas-filesystem.js` projects approved records into `A:\\Atlas` without copying source data. The static SEO generator uses the same public filter to build `/about/`, `/music/`, approved release routes, `sitemap.xml`, and structured data.

## Administration

The existing `/admin.html` editor now includes Atlas Entities, Atlas Relationships, and Atlas Sources. It remains a local editorial preview until Supabase Auth-backed writes are implemented. Production writes require the existing trusted `app_metadata.user_role = admin` boundary.
