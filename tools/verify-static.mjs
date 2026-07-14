import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { atlasSeed } from "../src/content/atlas-seed.js";
import { createSeoRoutes } from "../src/seo/metadata.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const seoPages = createSeoRoutes(atlasSeed).filter((route) => route.path !== "/").map((route) => `${route.path.slice(1)}index.html`);
const pages = ["index.html", "admin.html", "awaken-system/bios.html", "awaken-system/startup.html", "awaken-system/login.html", ...seoPages];
const required = ["script.js", "styles.css", "config.js", "robots.txt", "sitemap.xml", "site.webmanifest", "styles/public-knowledge.css", "src/apps/mind/mind-app.js", "src/apps/media-player/media-player.js"];

for (const path of [...pages, ...required]) await access(resolve(root, path));

for (const page of pages) {
  const html = await readFile(resolve(root, page), "utf8");
  const localReferences = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((value) => !/^(?:https?:|#|data:|mailto:)/.test(value));
  for (const reference of localReferences) {
    const clean = reference.split(/[?#]/)[0];
    await access(reference.startsWith("/") ? resolve(root, clean.slice(1)) : resolve(root, dirname(page), clean));
  }
}

const browserFiles = await Promise.all(["config.js", "script.js", "admin/admin.js"].map((path) => readFile(resolve(root, path), "utf8")));
if (browserFiles.some((source) => /(?:service_role|SUPABASE_SERVER_KEY|DISCORD_BOT_TOKEN)\s*[:=]\s*["'][^"']+/i.test(source))) {
  throw new Error("A server-only credential appears to be embedded in browser code.");
}

console.log("Static production files and local references verified.");
