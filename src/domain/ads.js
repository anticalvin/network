const DAY_MS = 86_400_000;

export function eligibleAd(ad, context) {
  if (!ad?.id || !ad.enabled || context.disabled) return false;
  const now = Number(context.now || Date.now());
  if (now - Number(context.sessionStartedAt ?? now) < Number(ad.minimum_session_age_ms || 0)) return false;
  if (ad.start_at && now < new Date(ad.start_at).getTime()) return false;
  if (ad.end_at && now >= new Date(ad.end_at).getTime()) return false;
  if (ad.eligible_contexts?.length && !ad.eligible_contexts.includes(context.context)) return false;
  if (ad.excluded_contexts?.includes(context.context)) return false;
  if (context.blocked || context.hidden || context.openCount >= Number(context.maximumOpen || 2)) return false;
  const record = context.records?.[ad.id] || { shown: [] };
  const shown = (record.shown || []).filter((time) => now - time < DAY_MS);
  if (shown.length >= Number(ad.maximum_per_day || 1)) return false;
  if (shown.length && now - shown.at(-1) < Number(ad.cooldown_ms || 0)) return false;
  return (record.sessionCount || 0) < Number(ad.maximum_per_session || 1);
}

export function selectWeightedAd(ads, context, random = Math.random) {
  const eligible = ads.filter((ad) => eligibleAd(ad, context));
  const total = eligible.reduce((sum, ad) => sum + Math.max(0, Number(ad.weight || 0)), 0);
  if (!eligible.length || total <= 0) return null;
  let point = Math.min(0.999999, Math.max(0, random())) * total;
  return eligible.find((ad) => (point -= Math.max(0, Number(ad.weight || 0))) < 0) || eligible.at(-1);
}

export function recordAdDisplay(records, adId, now = Date.now()) {
  const previous = records[adId] || { shown: [], sessionCount: 0 };
  return { ...records, [adId]: { shown: [...previous.shown.filter((time) => now - time < DAY_MS), now], sessionCount: previous.sessionCount + 1 } };
}

export const DEFAULT_ADS = Object.freeze([
  { id: "security-memory", enabled: true, type: "security", title: "AWAKEN SECURITY CENTRE", copy: "Unregistered memory fragments were detected outside the archive.", weight: 3, minimum_session_age_ms: 45_000, cooldown_ms: 600_000, maximum_per_session: 1, maximum_per_day: 2, eligible_contexts: ["desktop"], excluded_contexts: ["gallery-dirty", "admin", "upload", "text-input"], action_type: "recover", content_reference: "recovery-default", requires_memory_card_space: true },
  { id: "messenger-unknown", enabled: true, type: "messenger", title: "AWAKEN Messenger", copy: "you left this here", weight: 2, minimum_session_age_ms: 90_000, cooldown_ms: 900_000, maximum_per_session: 1, maximum_per_day: 1, eligible_contexts: ["desktop"], excluded_contexts: ["gallery-dirty", "admin", "upload", "text-input"], action_type: "message", content_reference: "mind-recent", requires_mind_data: true },
  { id: "dialer-connection", enabled: true, type: "dialer", title: "CALL-AWAKEN Dial-Up", copy: "CONNECT 56000 / AUTH GUEST ACCEPTED", weight: 1, minimum_session_age_ms: 120_000, cooldown_ms: 1_800_000, maximum_per_session: 1, maximum_per_day: 1, eligible_contexts: ["desktop"], excluded_contexts: ["gallery-dirty", "admin", "upload", "text-input"], action_type: "connect", content_reference: "call-awaken" }
]);
