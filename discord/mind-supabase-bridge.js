const MAX_BODY_LENGTH = 1800;

export class MindSupabaseBridge {
  constructor({ supabaseUrl, supabaseServerKey, guildId, channelId, fetchImpl = fetch } = {}) {
    this.url = String(supabaseUrl || "").replace(/\/+$/, "");
    this.key = supabaseServerKey || "";
    this.guildId = guildId;
    this.channelId = channelId;
    this.fetch = fetchImpl;
    this.enabled = Boolean(this.url && this.key);
  }

  async upsertChannel() {
    if (!this.enabled) return { skipped: true };
    return this.request("/rest/v1/discord_channels?on_conflict=discord_channel_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: [{
        discord_channel_id: this.channelId,
        discord_guild_id: this.guildId,
        slug: "xp",
        display_name: "XP",
        enabled: true,
        public_visible: true
      }]
    });
  }

  async mirrorCreate(message) {
    if (!this.shouldMirror(message)) return { skipped: true };
    const channel = await this.upsertChannel();
    const channelId = Array.isArray(channel) ? channel[0]?.id : null;
    if (!channelId) return { skipped: true };
    return this.request("/rest/v1/discord_messages?on_conflict=discord_message_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: [this.toRecord(message, channelId)]
    });
  }

  async mirrorUpdate(message) {
    if (!this.shouldMirror(message)) return { skipped: true };
    return this.request(`/rest/v1/discord_messages?discord_message_id=eq.${encodeURIComponent(message.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: {
        body: normalizeBody(message.content),
        attachments: normalizeAttachments(message.attachments),
        discord_edited_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }

  async mirrorDelete(message) {
    if (!message || message.channelId !== this.channelId || message.guildId !== this.guildId) return { skipped: true };
    return this.request(`/rest/v1/discord_messages?discord_message_id=eq.${encodeURIComponent(message.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: {
        moderation_status: "removed",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }

  shouldMirror(message) {
    return Boolean(
      this.enabled &&
      message &&
      message.guildId === this.guildId &&
      message.channelId === this.channelId &&
      !message.author?.bot &&
      (normalizeBody(message.content) || normalizeAttachments(message.attachments).length)
    );
  }

  toRecord(message, channelId) {
    return {
      discord_message_id: message.id,
      channel_id: channelId,
      discord_author_id: message.author.id,
      author_display_name: message.member?.displayName || message.author.globalName || message.author.username || "unknown",
      author_avatar_url: typeof message.author.displayAvatarURL === "function" ? message.author.displayAvatarURL({ size: 64 }) : null,
      body: normalizeBody(message.content),
      attachments: normalizeAttachments(message.attachments),
      reply_to_discord_message_id: message.reference?.messageId || null,
      discord_created_at: message.createdAt?.toISOString?.() || new Date().toISOString(),
      discord_edited_at: message.editedAt?.toISOString?.() || null,
      moderation_status: "approved",
      visibility: "public",
      metadata: { source: "mind-bot", discord_channel_id: message.channelId }
    };
  }

  async request(path, { method, headers = {}, body } = {}) {
    if (!this.enabled) return { skipped: true };
    const response = await this.fetch(`${this.url}${path}`, {
      method,
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    if (!response.ok) {
      const error = new Error(`Supabase bridge failed: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }
}

export function normalizeBody(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, MAX_BODY_LENGTH);
}

export function normalizeAttachments(collection) {
  return Array.from(collection?.values?.() || []).slice(0, 8).map((item) => ({
    id: String(item.id || ""),
    name: String(item.name || "attachment").slice(0, 180),
    url: /^https:\/\//.test(item.url || "") ? item.url : null,
    contentType: item.contentType || null,
    size: Number.isFinite(item.size) ? item.size : null,
    width: Number.isFinite(item.width) ? item.width : null,
    height: Number.isFinite(item.height) ? item.height : null
  })).filter((item) => item.url);
}
