import { addMemoryItem } from "./memory-card.js";

export const RECOVERY_FRAGMENTS = Object.freeze([
  { id: "recovery-archive-clue", type: "fragment", title: "Archive clue", body: "Look in A:\\Archive\\Assets", source: "recovery" },
  { id: "recovery-network-log", type: "fragment", title: "Network log", body: "The line was never closed.", source: "recovery" },
  { id: "recovery-memory-index", type: "fragment", title: "Memory index", body: "Public archive index restored.", source: "recovery" }
]);

export function recoverFragments(card, fragments = RECOVERY_FRAGMENTS) {
  let next = card;
  const created = [];
  for (const fragment of fragments) {
    const exists = next.items.some((item) => item.id === fragment.id && item.type === fragment.type);
    next = addMemoryItem(next, fragment);
    if (!exists) created.push(fragment);
  }
  return { card: next, created };
}
