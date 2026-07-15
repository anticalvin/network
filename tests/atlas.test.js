import test from "node:test";
import assert from "node:assert/strict";
import { atlasSeed } from "../src/content/atlas-seed.js";
import { atlasEntriesForPath } from "../src/domain/atlas-filesystem.js";
import { filterPublicAtlasBundle, normalizeAtlasEntity, normalizeAtlasRelationship } from "../src/domain/atlas.js";
import { AtlasRepository } from "../src/data/atlas-repository.js";

test("Atlas fails closed for unreleased, disputed, and low-confidence entities", () => {
  const values = [
    { publicationState: "unreleased", verificationState: "human_verified", confidence: 1 },
    { publicationState: "public", verificationState: "disputed", confidence: 1 },
    { publicationState: "public", verificationState: "human_verified", confidence: 0.5 }
  ];
  for (const value of values) assert.equal(normalizeAtlasEntity({ name: "Private", publicVisible: true, ...value }).publicVisible, false);
});

test("Atlas public relationships require verified public endpoints", () => {
  const bundle = filterPublicAtlasBundle({
    entities: [
      { id: "a", name: "A", publicationState: "public", verificationState: "human_verified", confidence: 1, publicVisible: true },
      { id: "b", name: "B", publicationState: "private", verificationState: "human_verified", confidence: 1, publicVisible: false }
    ],
    relationships: [{ subjectId: "a", objectId: "b", predicate: "related_to", verificationState: "human_verified", confidence: 1, publicVisible: true }]
  });
  assert.equal(bundle.entities.length, 1);
  assert.equal(bundle.relationships.length, 0);
  assert.equal(normalizeAtlasRelationship({ subjectId: "a", objectId: "b", publicVisible: true, verificationState: "disputed", confidence: 1 }).publicVisible, false);
});

test("Atlas seeds use corrected team names and keep collections private", () => {
  const names = atlasSeed.entities.filter((entity) => entity.metadata?.relationshipStatus === "member").map((entity) => entity.name);
  assert.deepEqual(names, ["anticalvin", "hannahlleila", "Josh Otis", "HTL", "Na$he", "Typhoon"]);
  const collections = atlasSeed.entities.filter((entity) => entity.entityType === "collection");
  assert.deepEqual(collections.map((entity) => entity.name), ["Wasted Youth", "Eyes Wide Shut", "HATED", "NOISE", "State Of Mind"]);
  assert.ok(collections.every((entity) => entity.publicVisible === false));
});

test("Atlas filesystem projects only approved public entities", () => {
  const root = atlasEntriesForPath("A:\\Atlas", atlasSeed);
  assert.ok(root.some((entry) => entry.name === "Music"));
  assert.ok(!root.some((entry) => entry.name === "Collections"));
  const music = atlasEntriesForPath("A:\\Atlas\\Music", atlasSeed);
  assert.ok(music.some((entry) => entry.name === "State Of Mind"));
});

test("Atlas repository preserves the same public guard for fallback data", async () => {
  const repository = new AtlasRepository({ fallback: atlasSeed });
  const bundle = await repository.getBundle({ publicOnly: true });
  assert.ok(bundle.entities.every((entity) => entity.publicVisible));
  assert.ok(!bundle.entities.some((entity) => entity.name === "Na$he"));
});
