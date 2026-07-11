import test from "node:test";
import assert from "node:assert/strict";
import { isImgBBUrl, normalizeMedia, safeUrl } from "../src/domain/media.js";

test("ImgBB is normalized as a first-class provider", () => {
  const media = normalizeMedia({ src: "https://i.ibb.co/example/file.jpg", caption: " Image " });
  assert.equal(media.provider, "imgbb");
  assert.equal(media.caption, "Image");
  assert.equal(isImgBBUrl(media.fullSource), true);
});

test("unsafe URL schemes and missing media fail closed", () => {
  assert.equal(safeUrl("javascript:alert(1)"), null);
  assert.equal(normalizeMedia({ src: "javascript:alert(1)" }).missing, true);
});
