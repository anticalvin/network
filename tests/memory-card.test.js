import test from "node:test";
import assert from "node:assert/strict";
import { addMemoryItem, emptyMemoryCard, loadMemoryCard, MEMORY_CARD_KEY, removeMemoryItem, saveMemoryCard } from "../src/domain/memory-card.js";

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}

test("Memory Card saves, reloads, and removes explicit items", () => {
  const store = storage();
  let card = addMemoryItem(emptyMemoryCard(), { id: "hated", type: "archive", title: "HATED" });
  saveMemoryCard(card, store);
  card = loadMemoryCard(store);
  assert.equal(card.items[0].title, "HATED");
  card = removeMemoryItem(card, "archive", "hated");
  assert.equal(card.items.length, 0);
});

test("Memory Card safely resets corrupt and unknown data", () => {
  assert.deepEqual(loadMemoryCard(storage({ [MEMORY_CARD_KEY]: "{" })).items, []);
  assert.deepEqual(loadMemoryCard(storage({ [MEMORY_CARD_KEY]: JSON.stringify({ version: 99, items: [{ id: "x" }] }) })).items, []);
});
