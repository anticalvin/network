export class SupabaseCommunityAdapter {
  constructor(client) {
    this.client = client;
    this.source = client?.configured ? "supabase" : "bundled";
  }

  async getMessages({ limit = 40, before } = {}) {
    const params = new URLSearchParams({
      select: "id,discord_message_id,author_display_name,author_avatar_url,body,discord_created_at,discord_edited_at,moderation_status,metadata",
      moderation_status: "eq.approved",
      order: "discord_created_at.desc",
      limit: String(limit)
    });
    if (before) params.set("discord_created_at", `lt.${before}`);
    const rows = await this.client.request(`/rest/v1/discord_messages?${params.toString()}`);
    return rows.reverse().map((row) => ({
      id: row.id,
      externalId: row.discord_message_id,
      authorDisplayName: row.author_display_name,
      authorAvatarUrl: row.author_avatar_url,
      body: row.body,
      createdAt: row.discord_created_at,
      editedAt: row.discord_edited_at,
      moderationStatus: row.moderation_status,
      metadata: row.metadata || {}
    }));
  }
}
