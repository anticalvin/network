export class SupabaseFilesystemAdapter {
  constructor(client) {
    this.client = client;
    this.source = client?.configured ? "supabase" : "bundled";
  }

  async getFilesystemNodes({ parentId = null, limit = 80 } = {}) {
    const params = new URLSearchParams({
      select: "id,parent_id,node_type,name,slug,visibility,mime_type,byte_size,sort_order,metadata,status,published_at,updated_at",
      status: "eq.published",
      order: "sort_order.asc,name.asc",
      limit: String(limit)
    });
    params.set("parent_id", parentId ? `eq.${parentId}` : "is.null");
    const rows = await this.client.request(`/rest/v1/filesystem_nodes?${params.toString()}`);
    return rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      name: row.name,
      type: row.node_type,
      size: row.byte_size || row.metadata?.size || "--",
      modified: row.updated_at,
      metadata: row.metadata || {}
    }));
  }
}
