import { filterPublicAtlasBundle } from "../domain/atlas.js";

export const SITE_URL = "https://awakencult.com/";
export const SITE_NAME = "AWAKEN CULT";
export const SOCIAL_IMAGE = `${SITE_URL}assets/img/new-collection.webp`;

export function createSeoRoutes(bundle) {
  const publicBundle = filterPublicAtlasBundle(bundle);
  const releases = publicBundle.entities.filter((entity) => entity.entityType === "release");
  const group = publicBundle.entities.find((entity) => entity.slug === "awaken-cult");
  const routes = [
    route("/", "AWAKEN CULT — NETWORK OS", "Enter the AWAKEN CULT NETWORK OS: music, archive, community projects, and connected creative tools.", "WebPage", group),
    route("/about/", "About AWAKEN CULT", group?.summary || "AWAKEN CULT connects music, visual work, community projects, and the NETWORK OS archive.", "AboutPage", group)
  ];
  if (releases.length) {
    routes.push(route("/music/", "AWAKEN CULT Music", "Browse verified AWAKEN CULT releases and official listening destinations.", "CollectionPage"));
    for (const release of releases) routes.push(route(`/releases/${release.slug}/`, `${release.name} — AWAKEN CULT`, release.summary, "MusicAlbum", release));
  }
  assertUniqueCanonicals(routes);
  return routes;
}

export function route(path, title, description, schemaType = "WebPage", entity = null) {
  const normalizedPath = path === "/" ? "/" : `/${String(path).replace(/^\/+|\/+$/g, "")}/`;
  return { path: normalizedPath, canonical: new URL(normalizedPath, SITE_URL).href, title, description, schemaType, entity };
}

export function createJsonLd(routeRecord, bundle) {
  const publicBundle = filterPublicAtlasBundle(bundle);
  const graph = [
    {
      "@type": ["Organization", "MusicGroup"],
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}assets/icons/web-app-manifest-512x512.png`,
      sameAs: ["https://soundcloud.com/awakencult", "https://www.youtube.com/@awakencult", "https://www.instagram.com/awakencult", "https://x.com/awakencult"]
    },
    { "@type": "WebSite", "@id": `${SITE_URL}#website`, name: SITE_NAME, url: SITE_URL, publisher: { "@id": `${SITE_URL}#organization` } },
    { "@type": routeRecord.schemaType === "MusicAlbum" ? "WebPage" : routeRecord.schemaType, "@id": `${routeRecord.canonical}#webpage`, name: routeRecord.title, description: routeRecord.description, url: routeRecord.canonical, isPartOf: { "@id": `${SITE_URL}#website` }, about: { "@id": `${SITE_URL}#organization` } }
  ];
  if (routeRecord.entity?.entityType === "release") {
    graph.push({
      "@type": "MusicAlbum",
      "@id": `${routeRecord.canonical}#release`,
      name: routeRecord.entity.name,
      url: routeRecord.canonical,
      datePublished: routeRecord.entity.startDate?.slice(0, 10),
      byArtist: { "@id": `${SITE_URL}#organization` },
      sameAs: routeRecord.entity.metadata?.officialUrl ? [routeRecord.entity.metadata.officialUrl] : undefined
    });
  }
  if (routeRecord.path !== "/") {
    graph.push({ "@type": "BreadcrumbList", "@id": `${routeRecord.canonical}#breadcrumbs`, itemListElement: breadcrumbItems(routeRecord) });
  }
  return { "@context": "https://schema.org", "@graph": stripUndefined(graph) };
}

export function renderSitemap(routes) {
  assertUniqueCanonicals(routes);
  const urls = routes.map((item) => `  <url>\n    <loc>${escapeXml(item.canonical)}</loc>\n  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobots() {
  return `User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /awaken-system/\nDisallow: /*?*\n\nSitemap: ${SITE_URL}sitemap.xml\n`;
}

export function assertUniqueCanonicals(routes) {
  const canonicals = routes.map((item) => item.canonical);
  if (new Set(canonicals).size !== canonicals.length) throw new Error("Duplicate canonical URL detected.");
}

function breadcrumbItems(record) {
  const items = [{ "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL }];
  if (record.path.startsWith("/releases/")) items.push({ "@type": "ListItem", position: 2, name: "Music", item: `${SITE_URL}music/` });
  items.push({ "@type": "ListItem", position: items.length + 1, name: record.entity?.name || record.title, item: record.canonical });
  return items;
}
function stripUndefined(value) { return JSON.parse(JSON.stringify(value)); }
function escapeXml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[char])); }
