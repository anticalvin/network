import { defaultContent } from "../content/default-content.js";

const CACHE_KEY = "awaken.content-cache";
const OVERRIDE_KEY = "awaken.content-admin-draft";

export class ContentRepository {
  constructor({ endpoint = globalThis.AWAKEN_CONFIG?.contentEndpoint, storage = localStorage } = {}) {
    this.endpoint = endpoint;
    this.storage = storage;
  }

  async getPublicContent() {
    const local = mergeContent(this.read(OVERRIDE_KEY) || this.read(CACHE_KEY) || defaultContent);
    if (!this.endpoint) return { content: local, source: this.read(OVERRIDE_KEY) ? "admin-local" : "bundled" };
    try {
      const response = await fetch(this.endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(2500) });
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      const remote = mergeContent(await response.json());
      this.storage.setItem(CACHE_KEY, JSON.stringify(remote));
      return { content: remote, source: "remote" };
    } catch {
      return { content: local, source: "fallback" };
    }
  }

  saveLocalDraft(content) {
    const next = { ...content, updatedAt: new Date().toISOString() };
    this.storage.setItem(OVERRIDE_KEY, JSON.stringify(next));
    return next;
  }

  clearLocalDraft() { this.storage.removeItem(OVERRIDE_KEY); }
  read(key) { try { return JSON.parse(this.storage.getItem(key)); } catch { return null; } }
}

function mergeContent(value) {
  const candidate = value && typeof value === "object" ? value : {};
  return {
    ...defaultContent,
    ...candidate,
    interface: { ...defaultContent.interface, ...(candidate.interface || {}) },
    links: Array.isArray(candidate.links) ? candidate.links : defaultContent.links,
    themes: Array.isArray(candidate.themes) ? candidate.themes : defaultContent.themes,
    transmissions: Array.isArray(candidate.transmissions) ? candidate.transmissions : defaultContent.transmissions,
    fragments: Array.isArray(candidate.fragments) ? candidate.fragments : defaultContent.fragments
  };
}
