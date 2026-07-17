import test from "node:test";
import assert from "node:assert/strict";
import { ContentRepository } from "../src/data/content-repository.js";

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); }
  };
}

test("public content loads the published NETWORK snapshot with an anonymous key", async () => {
  let request;
  const repository = new ContentRepository({
    storage: storage(),
    config: { supabaseUrl: "https://example.supabase.co/", supabasePublishableKey: "public-key" },
    fetcher: async (url, options) => {
      request = { url, options };
      return { ok: true, async json() { return [{ payload: { links: [{ id: "live", label: "Live" }] } }]; } };
    }
  });

  const result = await repository.getPublicContent();
  assert.equal(result.source, "remote");
  assert.equal(result.content.links[0].id, "live");
  assert.match(request.url, /network_content_snapshots\?id=eq\.live&published=eq\.true/);
  assert.equal(request.options.headers.apikey, "public-key");
});

test("an admin local preview remains private and wins over the live snapshot", async () => {
  let fetched = false;
  const repository = new ContentRepository({
    storage: storage({ "awaken.content-admin-draft": JSON.stringify({ links: [{ id: "preview", label: "Preview" }] }) }),
    config: { supabaseUrl: "https://example.supabase.co", supabasePublishableKey: "public-key" },
    fetcher: async () => { fetched = true; }
  });

  const result = await repository.getPublicContent();
  assert.equal(result.source, "admin-local");
  assert.equal(result.content.links[0].id, "preview");
  assert.equal(fetched, false);
});

test("new bundled managed sections merge safely with an older live snapshot", async () => {
  const repository = new ContentRepository({
    storage: storage(),
    config: { supabaseUrl: "https://example.supabase.co", supabasePublishableKey: "public-key" },
    fetcher: async () => ({ ok: true, async json() { return [{ payload: { filesystem: [{ id: "custom", name: "CUSTOM.txt", path: "A:\\CUSTOM.txt", nodeType: "document", visibility: "public", status: "published" }] } }]; } })
  });
  const result = await repository.getPublicContent();
  assert.ok(result.content.filesystem.some((entry) => entry.id === "universe-folder"));
  assert.ok(result.content.filesystem.some((entry) => entry.id === "custom"));
  assert.ok(result.content.networkSites.some((entry) => entry.id === "the-feed"));
  assert.equal(result.content.interfaceText[0].biosCopyright, "Copyright (C) 2016-2026 AWAKEN ENTERPRISE.");
  assert.deepEqual(result.content.media, []);
});
