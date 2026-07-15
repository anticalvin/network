const IMGBB_HOSTS = new Set(["ibb.co", "i.ibb.co"]);

export function normalizeMedia(input = {}) {
  const source = safeUrl(input.fullSource || input.src || input.url);
  const sourceUrl = safeUrl(input.sourceUrl);
  const host = source ? new URL(source).hostname.replace(/^www\./, "") : "";
  const provider = input.provider || (IMGBB_HOSTS.has(host) ? "imgbb" : source?.startsWith("assets/") ? "local" : host.includes("supabase") ? "supabase" : "remote");
  return {
    id: input.id || source || "missing-media",
    provider,
    thumbnail: safeUrl(input.thumbnail) || source,
    fullSource: source,
    sourceUrl,
    caption: cleanText(input.caption),
    credit: cleanText(input.credit),
    width: positiveNumber(input.width),
    height: positiveNumber(input.height),
    contentWarning: cleanText(input.contentWarning),
    missing: !source
  };
}

export function isImgBBUrl(value) {
  const url = safeUrl(value);
  return Boolean(url && IMGBB_HOSTS.has(new URL(url).hostname.replace(/^www\./, "")));
}

export function mediaProviderEmbed(provider, value) {
  const url = safeUrl(value);
  if (!url) return null;
  const parsed = new URL(url);
  if (provider === "apple" && parsed.hostname.endsWith("music.apple.com")) {
    parsed.hostname = "embed.music.apple.com";
    return parsed.href;
  }
  if (provider === "soundcloud" && parsed.hostname.endsWith("soundcloud.com")) return `https://w.soundcloud.com/player/?url=${encodeURIComponent(parsed.href)}&color=%23da4a44&auto_play=false&hide_related=true&show_comments=false`;
  if (provider === "spotify" && parsed.hostname === "open.spotify.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const index = parts.findIndex((part) => ["track", "album", "artist", "playlist", "episode", "show"].includes(part));
    if (index >= 0 && parts[index + 1]) return `https://open.spotify.com/embed/${parts[index]}/${parts[index + 1]}`;
  }
  return null;
}

export function safeUrl(value) {
  if (!value || typeof value !== "string") return null;
  if (/^assets\/[a-z0-9_./-]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

function cleanText(value) { return typeof value === "string" ? value.trim() : ""; }
function positiveNumber(value) { return Number(value) > 0 ? Number(value) : null; }
