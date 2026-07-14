import { BaseRepository } from "./base-repository.js";
import { atlasGraph, filterPublicAtlasBundle, normalizeAtlasBundle } from "../domain/atlas.js";

export class AtlasRepository extends BaseRepository {
  constructor({ adapter, fallback = { entities: [], relationships: [], sources: [] } } = {}) {
    super({ source: adapter?.source || "bundled" });
    this.adapter = adapter;
    this.fallback = normalizeAtlasBundle(fallback);
    this.cache = null;
  }

  async getBundle({ publicOnly = false, force = false } = {}) {
    if (!this.cache || force) {
      try {
        this.cache = normalizeAtlasBundle(this.adapter ? await this.adapter.getAtlasBundle({ publicOnly: false }) : this.fallback);
        this.source = this.adapter?.source || "bundled";
      } catch {
        this.cache = this.fallback;
        this.source = "fallback";
      }
    }
    return publicOnly ? filterPublicAtlasBundle(this.cache) : normalizeAtlasBundle(this.cache);
  }

  async getMany(filters = {}) {
    const bundle = await this.getBundle({ publicOnly: Boolean(filters.publicOnly), force: Boolean(filters.force) });
    return bundle.entities.filter((entity) => !filters.entityType || entity.entityType === filters.entityType);
  }

  async getGraph(entityId, options = {}) { return atlasGraph(entityId, await this.getBundle(options)); }
  invalidate() { this.cache = null; }
}
