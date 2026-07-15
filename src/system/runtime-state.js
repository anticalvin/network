export function getRuntimeConfig() {
  const config = globalThis.AWAKEN_CONFIG || {};
  return {
    ...config,
    supabaseConfigured: Boolean(config.supabaseUrl && (config.supabasePublishableKey || config.supabaseAnonKey)),
    discord: config.discord || {},
    features: {
      ads_runtime_enabled: false,
      intrusion_enabled: false,
      gallery_studio_enabled: true,
      upgraded_media_player_enabled: true,
      ...(config.features || {})
    }
  };
}

const sessionState = new Map();

export function getSessionState(key, fallback = null) {
  return sessionState.has(key) ? sessionState.get(key) : fallback;
}

export function setSessionState(key, value) {
  sessionState.set(key, value);
  return value;
}

export function capabilityError(operation, source = "bundled") {
  const error = new Error(`${operation} is not available from ${source}.`);
  error.name = "CapabilityError";
  error.code = "AWAKEN_CAPABILITY_UNAVAILABLE";
  error.source = source;
  return error;
}
