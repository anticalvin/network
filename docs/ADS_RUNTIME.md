# Ads Runtime

Ads are transient managed windows in the main NETWORK desktop, coordinated through `event-bus.js`. `src/domain/ads.js` owns eligibility, weighted selection, cooldowns, per-session and per-day limits. The shell pauses scheduling while hidden, while a text field is active, during uploads, or while AWAKEN Paint is dirty. Every ad offers Open + Save or Move to Trash; the title-bar close control remains available.

The RECOVER action calls the same `recoverToMemoryCard` service as the terminal. Its result reports only entries actually created; stable IDs make repeat recovery idempotent. Messenger content is requested through the public MIND repository and falls back to approved bundled copy.

Trash records live inside the existing versioned Memory Card preferences object. Opening a trashed popup restores and saves its complete record before performing the action. This keeps the ad lifecycle local and reversible without changing selection or frequency logic.

Set `AWAKEN_CONFIG.features.ads_runtime_enabled` to `false` for immediate rollback. A visitor can also set `awaken.adsDisabled` locally. Admin preview uses `?adminPreview&previewAd=<id>` and does not write frequency state.

Ad scheduling fields are: `id`, `enabled`, `weight`, `minimum_session_age_ms`, `cooldown_ms`, `maximum_per_session`, `maximum_per_day`, `eligible_contexts`, `excluded_contexts`, `start_at`, `end_at`, `action_type`, `content_reference`, `requires_mind_data`, and `requires_memory_card_space`.
