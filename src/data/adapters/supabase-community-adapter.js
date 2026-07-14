export class SupabaseCommunityAdapter {
  constructor(client) {
    this.client = client;
    this.source = client?.configured ? "supabase" : "bundled";
  }

  async getMessages({ limit = 40, before } = {}) {
    const params = new URLSearchParams({
      select: "id,discord_message_id,discord_author_id,author_display_name,author_avatar_url,body,attachments,reply_to_discord_message_id,discord_created_at,discord_edited_at,deleted_at,moderation_status,visibility,metadata,created_at",
      moderation_status: "eq.approved",
      visibility: "eq.public",
      order: "discord_created_at.desc",
      limit: String(limit)
    });
    if (before) params.set("discord_created_at", `lt.${before}`);
    const rows = await this.client.request(`/rest/v1/discord_messages?${params.toString()}`);
    return rows.reverse().map(mapDiscordMessage);
  }

  subscribeMessages(_filters, callback) {
    return this.client.subscribe({ table: "discord_messages", event: "*" }, (payload) => {
      callback({
        type: String(payload.eventType || "update").toLowerCase(),
        row: payload.new?.id ? mapDiscordMessage(payload.new) : null,
        old: payload.old || null,
        source: "supabase"
      });
    }, (status) => callback({ type: "status", status, source: "supabase" }));
  }
}

export function mapDiscordMessage(row) {
  return {
    id: row.id,
    externalId: row.discord_message_id,
    authorId: row.discord_author_id,
    authorDisplayName: row.author_display_name,
    authorAvatarUrl: row.author_avatar_url,
    body: row.body,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    replyToExternalId: row.reply_to_discord_message_id,
    createdAt: row.discord_created_at,
    auditCreatedAt: row.created_at,
    editedAt: row.discord_edited_at,
    deletedAt: row.deleted_at,
    moderationStatus: row.moderation_status,
    visibility: row.visibility,
    metadata: row.metadata || {}
  };
}
