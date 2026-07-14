import test from "node:test";
import assert from "node:assert/strict";
import { compareMessages, mergeMindMessages } from "../src/apps/mind/mind-app.js";
import { mapDiscordMessage } from "../src/data/adapters/supabase-community-adapter.js";

test("MIND reconciliation deduplicates Discord IDs and keeps updates", () => {
  const original = { id: "db-1", externalId: "discord-1", body: "first", createdAt: "2026-07-14T10:00:00Z" };
  const updated = { ...original, body: "edited", editedAt: "2026-07-14T10:01:00Z" };
  const second = { id: "db-2", externalId: "discord-2", body: "second", createdAt: "2026-07-14T10:02:00Z" };
  const merged = mergeMindMessages([original], [second, updated]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].body, "edited");
  assert.equal(merged[1].externalId, "discord-2");
});

test("MIND orders messages by Discord creation time", () => {
  const earlier = { createdAt: "2026-07-14T09:00:00Z" };
  const later = { createdAt: "2026-07-14T11:00:00Z" };
  assert.ok(compareMessages(earlier, later) < 0);
});

test("Supabase Discord rows map to the frontend shape", () => {
  const mapped = mapDiscordMessage({
    id: "db-1",
    discord_message_id: "discord-1",
    discord_author_id: "author-1",
    author_display_name: "Member",
    author_avatar_url: null,
    body: "hello",
    attachments: [{ url: "https://example.com/a.png" }],
    discord_created_at: "2026-07-14T10:00:00Z",
    moderation_status: "approved",
    visibility: "public",
    metadata: null
  });
  assert.equal(mapped.externalId, "discord-1");
  assert.equal(mapped.authorId, "author-1");
  assert.equal(mapped.attachments.length, 1);
  assert.deepEqual(mapped.metadata, {});
});
