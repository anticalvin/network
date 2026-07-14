import test from "node:test";
import assert from "node:assert/strict";
import { MindSupabaseBridge, normalizeAttachments, normalizeBody } from "../discord/mind-supabase-bridge.js";

function message(overrides = {}) {
  return {
    id: "123",
    guildId: "946069318473502770",
    channelId: "1525921490414080031",
    content: " hello   xp ",
    createdAt: new Date("2026-07-13T10:00:00Z"),
    editedAt: null,
    author: { id: "user-1", bot: false, username: "member", displayAvatarURL: () => "https://example.com/avatar.png" },
    member: { displayName: "XP Member" },
    ...overrides
  };
}

test("MIND ignores bots and channels outside XP", () => {
  const bridge = new MindSupabaseBridge({ supabaseUrl: "https://example.supabase.co", supabaseServerKey: "server", guildId: "946069318473502770", channelId: "1525921490414080031" });
  assert.equal(bridge.shouldMirror(message()), true);
  assert.equal(bridge.shouldMirror(message({ channelId: "other" })), false);
  assert.equal(bridge.shouldMirror(message({ author: { id: "bot", bot: true } })), false);
});

test("MIND maps Discord messages without storing extra profile data", () => {
  const bridge = new MindSupabaseBridge({ supabaseUrl: "https://example.supabase.co", supabaseServerKey: "server", guildId: "946069318473502770", channelId: "1525921490414080031" });
  const record = bridge.toRecord(message(), "channel-row");
  assert.equal(record.channel_id, "channel-row");
  assert.equal(record.author_display_name, "XP Member");
  assert.equal(record.body, "hello xp");
  assert.equal(record.discord_created_at, "2026-07-13T10:00:00.000Z");
  assert.equal("email" in record, false);
  assert.deepEqual(record.attachments, []);
  assert.equal(record.visibility, "public");
});

test("MIND bridge disabled mode is a no-op fallback", async () => {
  const bridge = new MindSupabaseBridge({ guildId: "946069318473502770", channelId: "1525921490414080031" });
  assert.equal(bridge.enabled, false);
  assert.deepEqual(await bridge.mirrorCreate(message()), { skipped: true });
});

test("message bodies are normalized and bounded", () => {
  assert.equal(normalizeBody("  a\n\n b  "), "a b");
  assert.equal(normalizeBody("x".repeat(2000)).length, 1800);
});

test("attachments retain only bounded HTTPS metadata", () => {
  const attachments = new Map([
    ["1", { id: "1", name: "image.png", url: "https://cdn.discordapp.com/image.png", contentType: "image/png", size: 20 }],
    ["2", { id: "2", name: "unsafe", url: "http://example.com/file" }]
  ]);
  assert.deepEqual(normalizeAttachments(attachments), [{
    id: "1", name: "image.png", url: "https://cdn.discordapp.com/image.png", contentType: "image/png", size: 20, width: null, height: null
  }]);
});
