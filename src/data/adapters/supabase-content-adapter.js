export class SupabaseContentAdapter {
  constructor(client) {
    this.client = client;
    this.source = client?.configured ? "supabase" : "bundled";
  }

  async getContentItems() {
    const params = new URLSearchParams({
      select: "id,kind,slug,public_title,body,secondary_copy,destination_type,destination_url,metadata,published_at,starts_at,ends_at,priority",
      status: "eq.published",
      verification: "eq.verified",
      order: "priority.desc"
    });
    return this.client.request(`/rest/v1/content_items?${params.toString()}`);
  }
}
