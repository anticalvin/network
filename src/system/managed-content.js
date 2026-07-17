export function mergeManagedLinks(base, entries = []) {
  const next = { ...base };
  for (const entry of entries) {
    if (!entry?.id || entry.verified === false || !safeHttpUrl(entry.url)) continue;
    next[entry.id] = entry.url;
  }
  return next;
}

export function mergeManagedThemes(base, entries = []) {
  if (!Array.isArray(entries) || !entries.length) return [...base];
  const byId = new Map(base.map((theme, index) => [theme.id, { ...theme, sortOrder: theme.sortOrder ?? index + 1 }]));
  for (const entry of entries) {
    if (!entry?.id) continue;
    if (entry.enabled === false) { byId.delete(entry.id); continue; }
    if (!safeColor(entry.color)) continue;
    const previous = byId.get(entry.id) || {};
    const hasImageField = Object.prototype.hasOwnProperty.call(entry, "imageUrl");
    const image = hasImageField ? safeImageUrl(entry.imageUrl) : previous.image;
    byId.set(entry.id, {
      ...previous,
      id: entry.id,
      title: String(entry.label || previous.title || entry.id).slice(0, 60),
      color: entry.color,
      image: image || undefined,
      mode: ["cover", "contain", "tile"].includes(entry.fitMode) ? entry.fitMode : previous.mode || "cover",
      detail: String(entry.detail || previous.detail || "Published from AWAKEN Admin").slice(0, 160),
      sortOrder: Number(entry.sortOrder ?? previous.sortOrder ?? 100)
    });
  }
  const defaultTheme = byId.get("awaken-default");
  const themes = [...byId.values()].filter((theme) => theme.id !== "awaken-default").sort((a, b) => a.sortOrder - b.sortOrder);
  return defaultTheme ? [defaultTheme, ...themes] : themes;
}

export function mergeManagedIcons(base, entries = []) {
  if (!Array.isArray(entries) || !entries.length) return [...base];
  const overrides = new Map(entries.filter((entry) => entry?.applicationId).map((entry) => [entry.applicationId, entry]));
  return base.map((icon) => {
    const entry = overrides.get(icon.applicationId);
    if (!entry) return icon;
    return {
      ...icon,
      enabled: entry.enabled !== false,
      label: String(entry.label || icon.label).slice(0, 40),
      remoteIconUrl: safeHttpUrl(entry.remoteIconUrl) ? entry.remoteIconUrl : icon.remoteIconUrl
    };
  });
}

export function managedFeatureEnabled(content, key, fallback) {
  const runtime = Array.isArray(content?.featureFlags) ? content.featureFlags.find((entry) => entry?.id === "runtime") || content.featureFlags[0] : null;
  return typeof runtime?.[key] === "boolean" ? runtime[key] : fallback;
}

export function managedFilesystemEntries(entries = [], mediaEntries = []) {
  if (!Array.isArray(entries)) return [];
  const media = new Map((Array.isArray(mediaEntries) ? mediaEntries : []).filter((item) => item?.id).map((item) => [item.id, item]));
  return entries
    .filter((entry) => entry?.id && entry?.name && entry?.path && entry.visibility === "public" && entry.status === "published")
    .map((entry) => {
      const mediaEntry = media.get(entry.mediaId);
      const candidateUrl = entry.externalUrl || mediaEntry?.externalUrl || "";
      const url = safeHttpUrl(candidateUrl) ? candidateUrl : "";
      return {
        id: String(entry.id),
        name: String(entry.name).slice(0, 100),
        path: normalizeManagedPath(entry.path),
        type: filesystemType(entry.nodeType),
        size: String(entry.size || entry.nodeType || "managed").slice(0, 40),
        modified: String(entry.modified || "published").slice(0, 40),
        content: String(entry.content || "").slice(0, 20_000),
        detail: String(entry.detail || "Published from AWAKEN Admin.").slice(0, 500),
        url,
        src: url,
        mimeType: String(mediaEntry?.mimeType || entry.mimeType || "").slice(0, 100),
        managed: true
      };
    })
    .filter((entry) => entry.path.startsWith("A:\\"));
}

export function managedNetworkSites(entries = []) {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter((entry) => entry?.id && entry?.title && entry.status === "published")
    .map((entry, index) => ({
      id: String(entry.id),
      title: String(entry.title).slice(0, 80),
      slug: String(entry.slug || entry.id).toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60),
      tagline: String(entry.tagline || "AWAKEN NETWORK service").slice(0, 180),
      body: String(entry.body || "Signal received.").slice(0, 20_000),
      accent: safeColor(entry.accent) ? entry.accent : "#da4a44",
      sortOrder: Number(entry.sortOrder ?? index)
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function safeHttpUrl(value) {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function safeImageUrl(value) {
  if (!value) return "";
  if (/^assets\/[a-z0-9_./-]+$/i.test(value)) return value;
  return safeHttpUrl(value) ? value : "";
}

function safeColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function normalizeManagedPath(value) {
  const path = String(value || "").replace(/\//g, "\\").replace(/\\+/g, "\\");
  return /^a:\\/i.test(path) ? `A:${path.slice(2)}` : `A:\\${path.replace(/^\\+/, "")}`;
}

function filesystemType(value) {
  return ({ folder: "Folder", image: "Image", audio: "Audio", video: "Video", document: "Text", external_link: "Link", shortcut: "Link", application: "Application", release: "Release", archive: "Archive" })[String(value || "").toLowerCase()] || "File";
}
