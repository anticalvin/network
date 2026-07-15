export const ATLAS_ENTITY_TYPES = Object.freeze([
  "person", "member", "collaborator", "group", "release", "track", "era", "collection",
  "product", "campaign", "photograph", "artwork", "poster", "video", "article", "archive_entry",
  "social_post", "manifesto", "symbol", "concept", "event", "platform", "community_project",
  "location", "source"
]);

export const ATLAS_PUBLICATION_STATES = Object.freeze([
  "draft", "unreleased", "public", "archived", "deprecated", "private"
]);

export const ATLAS_VERIFICATION_STATES = Object.freeze([
  "human_verified", "official_source_verified", "source_archive_verified",
  "inferred", "needs_review", "disputed"
]);

export const ATLAS_PUBLIC_VERIFICATION = Object.freeze([
  "human_verified", "official_source_verified", "source_archive_verified"
]);

export const ATLAS_PUBLIC_CONFIDENCE = 0.75;

export function normalizeAtlasEntity(input = {}) {
  const name = cleanText(input.name || input.title || "Untitled", 240) || "Untitled";
  const entity = {
    id: String(input.id || randomId("entity")),
    slug: slugify(input.slug || name),
    entityType: allowed(input.entityType, ATLAS_ENTITY_TYPES, "concept"),
    name,
    summary: cleanText(input.summary, 1200),
    description: cleanText(input.description, 12000),
    publicationState: allowed(input.publicationState, ATLAS_PUBLICATION_STATES, "draft"),
    verificationState: allowed(input.verificationState, ATLAS_VERIFICATION_STATES, "needs_review"),
    confidence: clamp(input.confidence ?? 0.5),
    publicVisible: Boolean(input.publicVisible),
    startDate: nullableDate(input.startDate),
    endDate: nullableDate(input.endDate),
    aliases: uniqueStrings(input.aliases),
    tags: uniqueStrings(input.tags),
    metadata: plainObject(input.metadata),
    sourceRefs: uniqueStrings(input.sourceRefs),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString()
  };
  entity.publicVisible = isAtlasEntityPublic(entity);
  return entity;
}

export function normalizeAtlasRelationship(input = {}) {
  const relationship = {
    id: String(input.id || randomId("relationship")),
    subjectId: String(input.subjectId || ""),
    predicate: slugify(input.predicate || "related_to").replaceAll("-", "_"),
    objectId: String(input.objectId || ""),
    role: cleanText(input.role, 240),
    creditOrder: finiteOrNull(input.creditOrder),
    verificationState: allowed(input.verificationState, ATLAS_VERIFICATION_STATES, "needs_review"),
    confidence: clamp(input.confidence ?? 0.5),
    publicVisible: Boolean(input.publicVisible),
    startDate: nullableDate(input.startDate),
    endDate: nullableDate(input.endDate),
    editorialNotes: cleanText(input.editorialNotes, 2000),
    metadata: plainObject(input.metadata),
    sourceRefs: uniqueStrings(input.sourceRefs)
  };
  relationship.publicVisible = isAtlasRelationshipPublic(relationship);
  return relationship;
}

export function normalizeAtlasSource(input = {}) {
  return {
    id: String(input.id || randomId("source")),
    sourceType: cleanText(input.sourceType || "internal", 80),
    title: cleanText(input.title || input.label || "Untitled source", 240),
    sourceUrl: safeHttpsUrl(input.sourceUrl),
    internalRef: cleanText(input.internalRef, 500),
    sourceDate: nullableDate(input.sourceDate),
    importedAt: input.importedAt || new Date().toISOString(),
    originalId: cleanText(input.originalId, 240),
    confidence: clamp(input.confidence ?? 0.5),
    publicSafe: Boolean(input.publicSafe),
    reviewNotes: cleanText(input.reviewNotes, 2000),
    metadata: plainObject(input.metadata)
  };
}

export function isAtlasEntityPublic(entity = {}) {
  return Boolean(
    entity.publicVisible &&
    entity.publicationState === "public" &&
    ATLAS_PUBLIC_VERIFICATION.includes(entity.verificationState) &&
    Number(entity.confidence) >= ATLAS_PUBLIC_CONFIDENCE
  );
}

export function isAtlasRelationshipPublic(relationship = {}, entityIds) {
  const endpointsVisible = !entityIds || (entityIds.has(relationship.subjectId) && entityIds.has(relationship.objectId));
  return Boolean(
    relationship.publicVisible &&
    endpointsVisible &&
    ATLAS_PUBLIC_VERIFICATION.includes(relationship.verificationState) &&
    Number(relationship.confidence) >= ATLAS_PUBLIC_CONFIDENCE
  );
}

export function normalizeAtlasBundle(value = {}) {
  return {
    entities: (value.entities || []).map(normalizeAtlasEntity),
    relationships: (value.relationships || []).map(normalizeAtlasRelationship).filter((item) => item.subjectId && item.objectId),
    sources: (value.sources || []).map(normalizeAtlasSource)
  };
}

export function filterPublicAtlasBundle(value = {}) {
  const bundle = normalizeAtlasBundle(value);
  const entities = bundle.entities.filter(isAtlasEntityPublic);
  const ids = new Set(entities.map((entity) => entity.id));
  return {
    entities,
    relationships: bundle.relationships.filter((relationship) => isAtlasRelationshipPublic(relationship, ids)),
    sources: bundle.sources.filter((source) => source.publicSafe)
  };
}

export function atlasGraph(entityId, value = {}) {
  const bundle = normalizeAtlasBundle(value);
  const entity = bundle.entities.find((item) => item.id === entityId) || null;
  if (!entity) return { entity: null, incoming: [], outgoing: [], related: [] };
  const outgoing = bundle.relationships.filter((item) => item.subjectId === entityId);
  const incoming = bundle.relationships.filter((item) => item.objectId === entityId);
  const relatedIds = new Set([...outgoing.map((item) => item.objectId), ...incoming.map((item) => item.subjectId)]);
  return { entity, incoming, outgoing, related: bundle.entities.filter((item) => relatedIds.has(item.id)) };
}

export function buildAtlasPath(entity, root = "Atlas") {
  const section = {
    person: "People", member: "People", collaborator: "Collaborators", group: "People",
    release: "Music", track: "Music", era: "Eras", collection: "Collections", product: "Collections",
    campaign: "Campaigns", photograph: "Media", artwork: "Media", poster: "Media", video: "Media",
    article: "Archive", archive_entry: "Archive", social_post: "Archive\\Social", manifesto: "Manifestos",
    symbol: "Symbols", concept: "Concepts", event: "Timeline", platform: "Platforms",
    community_project: "Community", location: "Locations", source: "Sources"
  }[entity.entityType] || "Archive";
  return `A:\\${root}\\${section}\\${entity.name}`;
}

function allowed(value, values, fallback) { return values.includes(value) ? value : fallback; }
function cleanText(value, limit) { return value == null ? "" : String(value).replace(/\s+/g, " ").trim().slice(0, limit); }
function slugify(value) { return String(value || "untitled").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 160) || "untitled"; }
function uniqueStrings(value) { return [...new Set((Array.isArray(value) ? value : String(value || "").split(",")).map((item) => String(item).trim()).filter(Boolean))]; }
function plainObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {}; }
function clamp(value) { const number = Number(value); return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0; }
function finiteOrNull(value) { const number = Number(value); return value !== "" && Number.isFinite(number) ? number : null; }
function nullableDate(value) { if (!value) return null; const date = new Date(value); return Number.isNaN(date.valueOf()) ? null : date.toISOString(); }
function safeHttpsUrl(value) { if (!value) return null; try { const url = new URL(value); return url.protocol === "https:" ? url.href : null; } catch { return null; } }
function randomId(prefix) { return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`; }
