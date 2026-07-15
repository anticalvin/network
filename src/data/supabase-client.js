import { getRuntimeConfig } from "../system/runtime-state.js";

const DEFAULT_TIMEOUT_MS = 3500;

export function createSupabaseRestClient(config = getRuntimeConfig()) {
  const url = String(config.supabaseUrl || "").replace(/\/+$/, "");
  const key = config.supabasePublishableKey || config.supabaseAnonKey || "";
  const configured = Boolean(url && key);
  let realtimeClient;

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

  async function upload(bucket, objectPath, blob, { contentType = blob.type || "application/octet-stream", timeoutMs = 12_000 } = {}) {
    if (!configured) {
      const error = new Error("Supabase is not configured.");
      error.code = "SUPABASE_DISABLED";
      throw error;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
    try {
      const response = await fetch(`${url}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": contentType, "x-upsert": "false" },
        body: blob,
        signal: controller.signal
      });
      if (!response.ok) {
        const error = new Error(`Supabase upload failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    configured,
    source: configured ? "supabase" : "bundled",
    request,
    upload,
    publicStorageUrl(bucket, objectPath) {
      return `${url}/storage/v1/object/public/${encodeURIComponent(bucket)}/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
    },
    subscribe({ table, event = "*", filter }, callback, onStatus = () => {}) {
      const createClient = globalThis.supabase?.createClient;
      if (!configured || typeof createClient !== "function") {
        onStatus("UNAVAILABLE");
        return () => {};
      }
      realtimeClient ||= createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 4 } }
      });
      const channel = realtimeClient.channel(`awaken:${table}:${crypto.randomUUID()}`);
      channel.on("postgres_changes", { event, schema: "public", table, ...(filter ? { filter } : {}) }, callback);
      channel.subscribe(onStatus);
      return () => { void realtimeClient.removeChannel(channel); };
    },
    from(table) {
      return {
        select: (query = "*") => request(`/rest/v1/${table}?select=${encodeURIComponent(query)}`),
        get: (params = "") => request(`/rest/v1/${table}${params}`)
      };
    }
  };
}
