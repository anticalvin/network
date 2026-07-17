import { defaultContent } from "../content/default-content.js?v=runtime-11";

const CACHE_KEY = "awaken.content-cache";
const OVERRIDE_KEY = "awaken.content-admin-draft";

export class ContentRepository {
  constructor({ endpoint = globalThis.AWAKEN_CONFIG?.contentEndpoint, storage = localStorage, fetcher = globalThis.fetch?.bind(globalThis), config = globalThis.AWAKEN_CONFIG || {} } = {}) {
    this.endpoint = endpoint;
    this.storage = storage;
    this.fetcher = fetcher;
    this.config = config;
  }

  async getPublicContent() {
    const draft = this.read(OVERRIDE_KEY);
    const local = mergeContent(draft || this.read(CACHE_KEY) || defaultContent);
    if (draft) return { content: local, source: "admin-local" };
    const request = this.remoteRequest();
    if (!request) return { content: local, source: "bundled" };
    try {
      const response = await this.fetcher(request.url, { headers: request.headers, signal: AbortSignal.timeout(2500) });
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      const payload = await response.json();
      const remote = mergeContent(this.endpoint ? payload : payload?.[0]?.payload);
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

  remoteRequest() {
    if (this.endpoint && this.fetcher) return { url: this.endpoint, headers: { Accept: "application/json" } };
    const base = String(this.config.supabaseUrl || "").replace(/\/+$/, "");
    const key = this.config.supabasePublishableKey || this.config.supabaseAnonKey;
    if (!base || !key || !this.fetcher) return null;
    return {
      url: `${base}/rest/v1/network_content_snapshots?id=eq.live&published=eq.true&select=payload&limit=1`,
      headers: { Accept: "application/json", apikey: key, Authorization: `Bearer ${key}` }
    };
  }
}

function mergeContent(value) {
  const candidate = value && typeof value === "object" ? value : {};
  return {
    ...defaultContent,
    ...candidate,
    interface: { ...defaultContent.interface, ...(candidate.interface || {}) },
    interfaceText: mergeRecords(defaultContent.interfaceText, candidate.interfaceText),
    links: Array.isArray(candidate.links) ? candidate.links : defaultContent.links,
    themes: Array.isArray(candidate.themes) ? candidate.themes : defaultContent.themes,
    transmissions: Array.isArray(candidate.transmissions) ? candidate.transmissions : defaultContent.transmissions,
    fragments: Array.isArray(candidate.fragments) ? candidate.fragments : defaultContent.fragments,
    mindPrompts: mergeRecords(defaultContent.mindPrompts, candidate.mindPrompts),
    filesystem: mergeRecords(defaultContent.filesystem, candidate.filesystem),
    networkSites: mergeRecords(defaultContent.networkSites, candidate.networkSites),
    media: mergeRecords(defaultContent.media, candidate.media),
    ads: mergeRecords(defaultContent.ads, candidate.ads),
    featureFlags: mergeRecords(defaultContent.featureFlags, candidate.featureFlags)
  };
}

function mergeRecords(base = [], overrides) {
  if (!Array.isArray(overrides)) return structuredClone(base);
  const byId = new Map(base.map((entry) => [entry.id, { ...entry }]));
  overrides.forEach((entry) => { if (entry?.id) byId.set(entry.id, { ...(byId.get(entry.id) || {}), ...entry }); });
  return [...byId.values()];
}
