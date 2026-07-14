revoke insert, update, delete on public.atlas_sources, public.atlas_entities, public.atlas_relationships,
  public.atlas_entity_sources, public.atlas_relationship_sources, public.atlas_media_links from anon;

create index if not exists atlas_entities_created_by_idx on public.atlas_entities(created_by);
create index if not exists atlas_relationships_created_by_idx on public.atlas_relationships(created_by);
