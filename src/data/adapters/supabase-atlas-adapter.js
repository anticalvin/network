export class SupabaseAtlasAdapter {
  constructor(client) { this.client = client; this.source = client?.configured ? "supabase" : "bundled"; }

  async getAtlasBundle({ publicOnly = false } = {}) {
    const entityParams = new URLSearchParams({ select: "*", order: "start_date.asc.nullslast,name.asc" });
    const relationshipParams = new URLSearchParams({ select: "*" });
    if (publicOnly) {
      entityParams.set("publication_state", "eq.public");
      entityParams.set("public_visible", "eq.true");
      relationshipParams.set("public_visible", "eq.true");
    }
    const [entities, relationships, sources] = await Promise.all([
      this.client.request(`/rest/v1/atlas_entities?${entityParams}`),
      this.client.request(`/rest/v1/atlas_relationships?${relationshipParams}`),
      this.client.request("/rest/v1/atlas_sources?select=id,source_type,title,source_url,internal_ref,source_date,imported_at,original_id,confidence,public_safe,review_notes,metadata")
    ]);
    return { entities: entities.map(fromEntityRow), relationships: relationships.map(fromRelationshipRow), sources: sources.map(fromSourceRow) };
  }
}

function fromEntityRow(row) { return { id: row.id, slug: row.slug, entityType: row.entity_type, name: row.name, summary: row.summary, description: row.description, publicationState: row.publication_state, verificationState: row.verification_state, confidence: row.confidence, publicVisible: row.public_visible, startDate: row.start_date, endDate: row.end_date, aliases: row.aliases, tags: row.tags, metadata: row.metadata, sourceRefs: row.source_refs, createdAt: row.created_at, updatedAt: row.updated_at }; }
function fromRelationshipRow(row) { return { id: row.id, subjectId: row.subject_id, predicate: row.predicate, objectId: row.object_id, role: row.role, creditOrder: row.credit_order, verificationState: row.verification_state, confidence: row.confidence, publicVisible: row.public_visible, startDate: row.start_date, endDate: row.end_date, editorialNotes: row.editorial_notes, metadata: row.metadata, sourceRefs: row.source_refs }; }
function fromSourceRow(row) { return { id: row.id, sourceType: row.source_type, title: row.title, sourceUrl: row.source_url, internalRef: row.internal_ref, sourceDate: row.source_date, importedAt: row.imported_at, originalId: row.original_id, confidence: row.confidence, publicSafe: row.public_safe, reviewNotes: row.review_notes, metadata: row.metadata }; }
