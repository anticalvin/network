import test from "node:test";
import assert from "node:assert/strict";
import { managedFeatureEnabled, managedFilesystemEntries, managedNetworkSites, mergeManagedIcons, mergeManagedLinks, mergeManagedThemes } from "../src/system/managed-content.js";
import { applyMemoryUnlocks } from "../src/content/memory-unlocks.js";
import { emptyMemoryCard, MEMORY_CARD_KEY, MEMORY_CARD_VERSION, moveToTrash, removeTrashItem, trashItems } from "../src/domain/memory-card.js";

test("published admin links, themes, icons, and flags safely override runtime content", () => {
  assert.equal(mergeManagedLinks({ website: "https://old.example" }, [{ id: "website", url: "https://new.example", verified: true }]).website, "https://new.example");
  assert.equal(mergeManagedLinks({}, [{ id: "bad", url: "javascript:alert(1)", verified: true }]).bad, undefined);
  const themes = mergeManagedThemes([{ id: "awaken-default", title: "Default", color: "#da4a44" }], [{ id: "sky", label: "Sky", color: "#93e3fd", enabled: true, sortOrder: 0 }]);
  assert.equal(themes[1].title, "Sky");
  assert.equal(mergeManagedIcons([{ applicationId: "paint", label: "Paint", enabled: true }], [{ applicationId: "paint", label: "Studio", enabled: false }])[0].enabled, false);
  assert.equal(managedFeatureEnabled({ featureFlags: [{ id: "runtime", adsRuntimeEnabled: false }] }, "adsRuntimeEnabled", true), false);
});

test("published public files and NETWORK sites become safe runtime records", () => {
  const files = managedFilesystemEntries([
    { id: "note", name: "NOTE.txt", path: "A:\\NETWORK\\NOTE.txt", nodeType: "document", visibility: "public", status: "published", content: "hello" },
    { id: "private", name: "NO.txt", path: "A:\\NO.txt", nodeType: "document", visibility: "private", status: "published" }
  ]);
  assert.equal(files.length, 1);
  assert.equal(files[0].type, "Text");
  assert.equal(files[0].content, "hello");
  const sites = managedNetworkSites([{ id: "feed", title: "THE FEED", body: "online", accent: "#245edb", status: "published" }]);
  assert.equal(sites[0].slug, "feed");
  assert.equal(managedNetworkSites([{ id: "draft", title: "Hidden", status: "draft" }]).length, 0);
});

test("popup Trash stays inside Memory Card preferences and can be emptied", () => {
  const item = { id: "signal", type: "ad", title: "Signal" };
  const trashed = moveToTrash(emptyMemoryCard(), item);
  assert.equal(trashItems(trashed).length, 1);
  assert.equal(trashed.version, MEMORY_CARD_VERSION);
  assert.equal(trashItems(removeTrashItem(trashed, item.type, item.id)).length, 0);
});

test("Memory Card unlocks fire once and preserve the versioned shape", () => {
  const initial = emptyMemoryCard();
  const first = applyMemoryUnlocks(initial, [{ id: "recovery-archive-clue", type: "fragment", title: "Archive clue" }]);
  const second = applyMemoryUnlocks(first.card, [{ id: "recovery-archive-clue", type: "fragment", title: "Archive clue" }]);
  assert.equal(first.unlocked.length, 1);
  assert.equal(second.unlocked.length, 0);
  assert.equal(first.card.version, MEMORY_CARD_VERSION);
  assert.equal(MEMORY_CARD_KEY, "awaken.memory-card");
  assert.deepEqual(Object.keys(first.card).sort(), ["dismissals", "items", "preferences", "updatedAt", "version"]);
});
