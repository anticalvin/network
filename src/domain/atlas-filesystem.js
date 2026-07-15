import { buildAtlasPath, filterPublicAtlasBundle } from "./atlas.js";

export function atlasEntriesForPath(path, bundle) {
  const publicBundle = filterPublicAtlasBundle(bundle);
  const normalized = String(path || "A:\\Atlas").replace(/\/+|\\+$/g, "").toLowerCase();
  const root = "a:\\atlas";
  const grouped = groupBySection(publicBundle.entities);
  if (normalized === root) {
    return [...grouped.keys()].sort().map((section) => ({ name: section, type: "Folder", path: `A:\\Atlas\\${section}`, size: "--", modified: "atlas" }));
  }
  const prefix = `${root}\\`;
  if (!normalized.startsWith(prefix)) return [];
  const section = [...grouped.keys()].find((candidate) => candidate.toLowerCase() === normalized.slice(prefix.length));
  if (!section) return [];
  return grouped.get(section).map((entity) => ({ name: entity.name, type: "Atlas Entity", size: entity.entityType, modified: entity.startDate?.slice(0, 10) || "verified", path: buildAtlasPath(entity), atlasEntity: entity }));
}

function groupBySection(entities) {
  const groups = new Map();
  for (const entity of entities) {
    const section = buildAtlasPath(entity).split("\\")[2];
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(entity);
  }
  for (const values of groups.values()) values.sort((a, b) => a.name.localeCompare(b.name));
  return groups;
}
