import { BaseRepository } from "./base-repository.js";
import { normalizeMedia } from "../domain/media.js";

export class MediaRepository extends BaseRepository {
  constructor({ adapter, fallback = [] } = {}) {
    super({ source: adapter?.source || "bundled" });
    this.adapter = adapter;
    this.fallback = fallback.map(normalizeMedia);
  }

  async getMany(filters = {}) {
    try {
      const rows = this.adapter ? await this.adapter.getMedia(filters) : this.fallback;
      this.source = this.adapter?.source || "bundled";
      return rows.map(normalizeMedia);
    } catch {
      this.source = "fallback";
      return this.fallback;
    }
  }
}
