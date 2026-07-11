export const MEMORY_CARD_KEY = "awaken.memory-card";
export const MEMORY_CARD_VERSION = 1;

export function emptyMemoryCard() {
  return { version: MEMORY_CARD_VERSION, updatedAt: new Date(0).toISOString(), items: [], preferences: {}, dismissals: {} };
}

export function migrateMemoryCard(value) {
  if (!value || typeof value !== "object") return emptyMemoryCard();
  if (value.version === MEMORY_CARD_VERSION) {
    return {
      ...emptyMemoryCard(),
      ...value,
      items: Array.isArray(value.items) ? value.items.filter(validItem) : [],
      preferences: plainObject(value.preferences),
      dismissals: plainObject(value.dismissals)
    };
  }
  return emptyMemoryCard();
}

export function loadMemoryCard(storage = localStorage) {
  try {
    return migrateMemoryCard(JSON.parse(storage.getItem(MEMORY_CARD_KEY)));
  } catch {
    return emptyMemoryCard();
  }
}

export function saveMemoryCard(card, storage = localStorage) {
  const safe = migrateMemoryCard(card);
  safe.updatedAt = new Date().toISOString();
  storage.setItem(MEMORY_CARD_KEY, JSON.stringify(safe));
  return safe;
}

export function addMemoryItem(card, item) {
  if (!validItem(item)) throw new Error("Memory Card item requires id, type, and title.");
  return { ...card, items: [{ ...item, savedAt: item.savedAt || new Date().toISOString() }, ...card.items.filter((entry) => !(entry.id === item.id && entry.type === item.type))] };
}

export function removeMemoryItem(card, type, id) {
  return { ...card, items: card.items.filter((item) => !(item.type === type && item.id === id)) };
}

export function setDismissal(card, id, record) {
  return { ...card, dismissals: { ...card.dismissals, [id]: record } };
}

function validItem(item) {
  return Boolean(item && typeof item.id === "string" && typeof item.type === "string" && typeof item.title === "string");
}

function plainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export const futureSupabaseMemoryAdapter = {
  async pull() { return null; },
  async push() { return { synced: false, reason: "Authentication adapter not configured." }; }
};
