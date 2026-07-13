import { capabilityError } from "../system/runtime-state.js";

export class BaseRepository {
  constructor({ source = "bundled" } = {}) {
    this.source = source;
  }

  getSource() {
    return this.source;
  }

  async getMany() {
    return [];
  }

  async getById(id) {
    const rows = await this.getMany();
    return rows.find((row) => row.id === id) || null;
  }

  subscribe(_filters, callback) {
    callback({ type: "snapshot", rows: [] });
    return () => {};
  }

  async create() {
    throw capabilityError("create", this.source);
  }

  async update() {
    throw capabilityError("update", this.source);
  }

  async archive() {
    throw capabilityError("archive", this.source);
  }
}
