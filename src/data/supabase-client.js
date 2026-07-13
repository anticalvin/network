import { getRuntimeConfig } from "../system/runtime-state.js";

const DEFAULT_TIMEOUT_MS = 3500;

export function createSupabaseRestClient(config = getRuntimeConfig()) {
  const url = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const key = config.supabaseAnonKey || config.supabasePublishableKey || "";
  const configured = Boolean(url && key);

  async function request(path, { method = "GET", headers = {}, body, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
    if (!configured) {
      const error = new Error("Supabase is not configured.");
      error.code = "SUPABASE_DISABLED";
      throw error;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${url}${path}`, {
        method,
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          ...headers
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal
      });
      if (!response.ok) {
        const error = new Error(`Supabase request failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      if (response.status === 204) return null;
      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    configured,
    source: configured ? "supabase" : "bundled",
    request,
    from(table) {
      return {
        select: (query = "*") => request(`/rest/v1/${table}?select=${encodeURIComponent(query)}`),
        get: (params = "") => request(`/rest/v1/${table}${params}`)
      };
    }
  };
}
