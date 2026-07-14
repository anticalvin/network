# Atlas Package Merge Notes

## Merged

- Flexible Atlas entities, relationships, sources, provenance links, media links, and XP path projection.
- Repository and Supabase adapter following the existing local-fallback architecture.
- Existing admin tabs for entities and relationships, extended with source curation.
- Fail-closed tests and additive migration structure.
- Legacy favicon and application-icon assets from the SEO handoff.

## Adapted

- Verification states now match the implementation brief and distinguish official sources, source archives, inference, review, and disputes.
- Public output requires public publication state, approved verification, public visibility, and confidence of at least `0.750`.
- RLS policies use the current trusted admin-claim convention and anonymous writes are explicitly revoked.
- Team records use the owner-confirmed names `anticalvin`, `hannahlleila`, `Josh Otis`, `HTL`, `Na$he`, and `Typhoon`.
- Wasted Youth, Eyes Wide Shut, HATED, NOISE, and State Of Mind are private collection records pending fuller editorial classification.
- SEO is generated from approved Atlas records rather than copied from the older handoff.

## Skipped

- Stale copies of the XP shell, window manager, Discord bridge, admin, and repository files.
- Private X export review data and media manifests.
- Unsupported `Movement` schema, unverified founding dates and marketing claims, and a non-functional `SearchAction`.
- Public biographies, inferred memberships, unreleased products, and experimental manifesto copy.

## Follow-up

- Connect authenticated remote Atlas CRUD after the admin sign-in flow exists.
- Review collection classifications, dates, media, aliases, credits, and cross-era relationships.
- Add approved people pages only after biographies and public membership claims are sourced.
- Link Atlas entities to managed media assets and expand generated routes as records are approved.
- Run final production-domain checks after deployment, including social-card fetching and sitemap discovery.
