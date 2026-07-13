import { BaseRepository } from "./base-repository.js";

export class FilesystemRepository extends BaseRepository {
  constructor({ adapter, fallback = [] } = {}) {
    super({ source: adapter?.source || "bundled" });
    this.adapter = adapter;
    this.fallback = fallback;
    this.cache = new Map();
  }

  async getMany(filters = {}) {
    const key = filters.parentPath || filters.parentId || "root";
    if (this.cache.has(key)) return this.cache.get(key);
    try {
      const rows = this.adapter ? await this.adapter.getFilesystemNodes(filters) : this.fallback;
      this.cache.set(key, rows);
      this.source = this.adapter?.source || "bundled";
      return rows;
    } catch {
      this.source = "fallback";
      return this.fallback;
    }
  }

  invalidate(parent = "root") {
    this.cache.delete(parent);
  }
}

export function pathFromNode(node, allNodes = []) {
  const chain = [node.name];
  let parentId = node.parentId;
  while (parentId) {
    const parent = allNodes.find((item) => item.id === parentId);
    if (!parent) break;
    chain.unshift(parent.name);
    parentId = parent.parentId;
  }
  return `A:\\${chain.join("\\")}`;
}
