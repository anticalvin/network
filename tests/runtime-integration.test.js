import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_ADS, eligibleAd, recordAdDisplay, selectWeightedAd } from "../src/domain/ads.js";
import { emptyMemoryCard } from "../src/domain/memory-card.js";
import { recoverFragments } from "../src/domain/recovery.js";
import { advanceIntrusion, cancelIntrusion, createIntrusionState } from "../src/domain/intrusion.js";
import { createGalleryProject, validateGalleryProject } from "../src/domain/gallery-project.js";
import { mediaProviderEmbed } from "../src/domain/media.js";

const context = { now: 200_000, sessionStartedAt: 0, context: "desktop", records: {}, openCount: 0, maximumOpen: 2 };

test("disabled and frequency-capped ads never spawn", () => {
  assert.equal(eligibleAd({ ...DEFAULT_ADS[0], enabled: false }, context), false);
  const records = recordAdDisplay({}, DEFAULT_ADS[0].id, context.now);
  assert.equal(eligibleAd(DEFAULT_ADS[0], { ...context, records }), false);
});

test("weighted ad selection stays within eligible definitions", () => {
  assert.equal(selectWeightedAd(DEFAULT_ADS, context, () => 0)?.id, "security-memory");
  assert.equal(selectWeightedAd(DEFAULT_ADS, { ...context, blocked: true }, () => 0), null);
});

test("recovery creates real entries and deduplicates repeat runs", () => {
  const first = recoverFragments(emptyMemoryCard());
  assert.equal(first.created.length, 3);
  assert.equal(first.card.items.length, 3);
  const second = recoverFragments(first.card);
  assert.equal(second.created.length, 0);
  assert.equal(second.card.items.length, 3);
});

test("intrusion state machine completes and cancels safely", () => {
  let state = createIntrusionState();
  while (!state.completed) state = advanceIntrusion(state);
  assert.equal(state.stage, "complete");
  assert.equal(cancelIntrusion(createIntrusionState()).cancelled, true);
});

test("Gallery projects validate bounded versioned data", () => {
  const project = createGalleryProject({ width: 900, height: 600, layers: [{ id: "one", name: "Background", image: "data:image/png;base64,AA==" }] });
  assert.equal(validateGalleryProject(project).valid, true);
  assert.equal(validateGalleryProject({ ...project, canvas: { width: 9999, height: 10 } }).valid, false);
});

test("provider embeds accept verified shapes and reject impostors", () => {
  assert.match(mediaProviderEmbed("apple", "https://music.apple.com/za/album/xp/123"), /^https:\/\/embed\.music\.apple\.com/);
  assert.equal(mediaProviderEmbed("spotify", "https://example.com/track/123"), null);
  assert.match(mediaProviderEmbed("soundcloud", "https://soundcloud.com/awakencult"), /^https:\/\/w\.soundcloud\.com/);
});
