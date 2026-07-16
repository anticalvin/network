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
    byId.set(entry.id, {
      ...previous,
      id: entry.id,
      title: String(entry.label || previous.title || entry.id).slice(0, 60),
      color: entry.color,
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

function safeHttpUrl(value) {
  if (!value) return false;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}

function safeColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}
