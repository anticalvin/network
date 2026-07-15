import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atlasSeed } from "../src/content/atlas-seed.js";
import { createJsonLd, createSeoRoutes, renderRobots, renderSitemap, SITE_NAME, SOCIAL_IMAGE } from "../src/seo/metadata.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const routes = createSeoRoutes(atlasSeed);

await writeFile(resolve(root, "robots.txt"), renderRobots());
await writeFile(resolve(root, "sitemap.xml"), renderSitemap(routes));

for (const record of routes.filter((item) => item.path !== "/")) {
  const output = resolve(root, record.path.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, renderPage(record));
}

function renderPage(record) {
  const release = record.entity?.entityType === "release" ? record.entity : null;
  const releases = routes.filter((item) => item.entity?.entityType === "release");
  const body = release
    ? `<p>${escapeHtml(release.summary)}</p><dl><dt>Release date</dt><dd>${escapeHtml(release.startDate.slice(0, 10))}</dd></dl><p><a class="command" href="${escapeHtml(release.metadata.officialUrl)}" rel="noopener">Open official release</a></p>`
    : record.path === "/music/"
      ? `<p>${escapeHtml(record.description)}</p><ol class="knowledge-list">${releases.map((item) => `<li><a href="${item.path}">${escapeHtml(item.entity.name)}</a><span>${escapeHtml(item.entity.startDate.slice(0, 4))}</span></li>`).join("")}</ol>`
      : `<p>${escapeHtml(record.description)}</p><p>NETWORK connects the archive, verified music sources, community, and AWAKEN creative tools.</p>`;
  return `<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(record.title)}</title>
  <meta name="description" content="${escapeHtml(record.description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${record.canonical}" />
  <meta property="og:type" content="website" /><meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${escapeHtml(record.title)}" /><meta property="og:description" content="${escapeHtml(record.description)}" />
  <meta property="og:url" content="${record.canonical}" /><meta property="og:image" content="${SOCIAL_IMAGE}" />
  <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${escapeHtml(record.title)}" />
  <meta name="twitter:description" content="${escapeHtml(record.description)}" /><meta name="twitter:image" content="${SOCIAL_IMAGE}" />
  <link rel="icon" href="/assets/icons/favicon.ico" /><link rel="stylesheet" href="/styles/public-knowledge.css" />
  <script type="application/ld+json">${safeJson(createJsonLd(record, atlasSeed))}</script>
</head><body>
  <header><a class="brand" href="/">AWAKEN CULT</a><nav aria-label="Knowledge"><a href="/about/">About</a><a href="/music/">Music</a><a href="/?skipBoot=1">Enter NETWORK</a></nav></header>
  <main><p class="path">${escapeHtml(record.path)}</p><h1>${escapeHtml(release?.name || record.title)}</h1>${body}</main>
  <footer>AWAKEN NETWORK OS</footer>
</body></html>\n`;
}

function safeJson(value) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
function escapeHtml(value) { return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char])); }
