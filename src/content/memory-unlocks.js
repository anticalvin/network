export const MEMORY_UNLOCKS = Object.freeze([
  { id: "archive-signal-wallpaper", title: "Archive Signal wallpaper", trigger: { itemId: "recovery-archive-clue" }, reward: { type: "wallpaper", value: "archive-signal" } },
  { id: "paint-disc-command", title: "DISC terminal command", trigger: { itemType: "gallery" }, reward: { type: "terminal", value: "disc" } },
  { id: "network-bonus-track", title: "Bonus track reference", trigger: { itemType: "transmission" }, reward: { type: "link", value: "https://soundcloud.com/awakencult" } }
]);

export function applyMemoryUnlocks(card, savedItems = [], definitions = MEMORY_UNLOCKS) {
  const previous = card?.preferences?.unlocks && typeof card.preferences.unlocks === "object" ? card.preferences.unlocks : {};
  const unlocks = { ...previous };
  const unlocked = [];
  for (const definition of definitions) {
    if (unlocks[definition.id] || !savedItems.some((item) => matches(item, definition.trigger))) continue;
    unlocks[definition.id] = { unlockedAt: new Date().toISOString(), reward: definition.reward };
    unlocked.push(definition);
  }
  return { card: { ...card, preferences: { ...card.preferences, unlocks } }, unlocked };
}

export function hasMemoryUnlock(card, id) { return Boolean(card?.preferences?.unlocks?.[id]); }

function matches(item, trigger) {
  return Boolean(item && (!trigger.itemId || item.id === trigger.itemId) && (!trigger.itemType || item.type === trigger.itemType));
}
