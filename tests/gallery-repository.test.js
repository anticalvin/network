import test from "node:test";
import assert from "node:assert/strict";
import { GalleryRepository } from "../src/data/gallery-repository.js";

test("approved shared Gallery records map into A drive files", async () => {
  const client = {
    configured: true,
    async request(path) {
      assert.match(path, /moderation_status=eq\.approved/);
      return [{ id: "remote", client_submission_id: "11111111-1111-4111-8111-111111111111", title: "Signal", creator: "visitor", image_path: "submissions/11111111-1111-4111-8111-111111111111.png", mime_type: "image/png", byte_size: 120, width: 900, height: 600, moderation_status: "approved", created_at: "2026-07-15T00:00:00Z" }];
    },
    publicStorageUrl(_bucket, path) { return `https://example.supabase.co/${path}`; }
  };
  const records = await new GalleryRepository(client).getApproved();
  assert.equal(records[0].path, "A:\\Gallery\\Signal.png");
  assert.equal(records[0].moderationStatus, "approved");
});

test("anonymous Gallery submission uploads a bounded image and enters review", async () => {
  const calls = [];
  const client = {
    configured: true,
    async upload(bucket, path, blob) { calls.push({ bucket, path, size: blob.size }); },
    async request(path, options) { calls.push({ path, options }); return null; },
    publicStorageUrl(_bucket, path) { return `https://example.supabase.co/${path}`; }
  };
  const repository = new GalleryRepository(client);
  const result = await repository.submit({ clientSubmissionId: "11111111-1111-4111-8111-111111111111", title: "Signal", creator: "visitor", width: 900, height: 600, imageBlob: new Blob(["png"], { type: "image/png" }) });
  assert.equal(result.moderationStatus, "review");
  assert.equal(calls[0].bucket, "gallery-submissions");
  assert.equal(calls[1].options.body.moderation_status, "review");
});

test("shared Gallery rejects oversized or unsupported blobs before upload", async () => {
  const repository = new GalleryRepository({ configured: true });
  await assert.rejects(() => repository.submit({ imageBlob: new Blob(["text"], { type: "text/plain" }) }), /accepts PNG/);
});
