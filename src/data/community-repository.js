import { BaseRepository } from "./base-repository.js";

const FALLBACK_MESSAGES = [
  {
    id: "mind-local-hello",
    authorDisplayName: "MIND",
    body: "XP channel cache is ready. Live bridge connects when Supabase and the bot server are online.",
    createdAt: "2026-07-12T00:00:00Z",
    system: true
  }
];

export class CommunityRepository extends BaseRepository {
  constructor({ adapter, fallback = FALLBACK_MESSAGES } = {}) {
    super({ source: adapter?.source || "bundled" });
    this.adapter = adapter;
    this.fallback = fallback;
  }

  async getMany(filters = {}) {
    try {
      const rows = this.adapter ? await this.adapter.getMessages(filters) : this.fallback;
      this.source = this.adapter?.source || "bundled";
      return rows.length ? rows : this.fallback;
    } catch {
      this.source = "fallback";
      return this.fallback;
    }
  }

  subscribe(filters, callback) {
    if (!this.adapter?.subscribeMessages) {
      callback({ type: "snapshot", rows: this.fallback, source: this.source });
      return () => {};
    }
    return this.adapter.subscribeMessages(filters, callback);
  }
}
