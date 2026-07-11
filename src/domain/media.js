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
