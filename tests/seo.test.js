import test from "node:test";
import assert from "node:assert/strict";
import { atlasSeed } from "../src/content/atlas-seed.js";
import { assertUniqueCanonicals, createJsonLd, createSeoRoutes, renderRobots, renderSitemap } from "../src/seo/metadata.js";

test("SEO routes include verified releases and exclude private collections", () => {
  const routes = createSeoRoutes(atlasSeed);
  assert.ok(routes.some((route) => route.path === "/releases/state-of-mind/"));
  assert.ok(!routes.some((route) => route.path.includes("wasted-youth")));
  assert.doesNotThrow(() => assertUniqueCanonicals(routes));
});

test("sitemap contains only canonical public routes", () => {
  const xml = renderSitemap(createSeoRoutes(atlasSeed));
  assert.match(xml, /https:\/\/awakencult\.com\/music\//);
  assert.doesNotMatch(xml, /admin|private|unreleased|<loc>[^<]*\?/);
});

test("robots exposes the sitemap and excludes administrative routes", () => {
  const robots = renderRobots();
  assert.match(robots, /Disallow: \/admin\.html/);
  assert.match(robots, /Sitemap: https:\/\/awakencult\.com\/sitemap\.xml/);
});

test("structured data uses supported types without a fake search action", () => {
  const route = createSeoRoutes(atlasSeed).find((item) => item.path === "/releases/xp/");
  const json = JSON.stringify(createJsonLd(route, atlasSeed));
  assert.match(json, /MusicAlbum/);
  assert.doesNotMatch(json, /Movement|SearchAction/);
});
