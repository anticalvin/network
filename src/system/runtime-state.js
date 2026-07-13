export function getRuntimeConfig() {
  const config = globalThis.AWAKEN_CONFIG || {};
  return {
    ...config,
    supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseAnonKey),
    discord: config.discord || {}
  };
}

export function capabilityError(operation, source = "bundled") {
  const error = new Error(`${operation} is not available from ${source}.`);
  error.name = "CapabilityError";
  error.code = "AWAKEN_CAPABILITY_UNAVAILABLE";
  error.source = source;
  return error;
}
