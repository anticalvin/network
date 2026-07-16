import { mediaProviderEmbed } from "../domain/media.js";

export const NETWORK_DESTINATIONS = Object.freeze({
  awakenDomains: Object.freeze(["awakencult.com"]),
  awakenHosts: Object.freeze(["anticalvin.github.io"]),
  mediaHosts: Object.freeze(["music.apple.com", "embed.music.apple.com", "open.spotify.com", "soundcloud.com", "w.soundcloud.com"]),
  downloadExtensions: Object.freeze(["zip", "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "mp3", "wav", "m4a", "ogg", "png", "jpg", "jpeg", "webp", "gif", "json"])
});

const BROWSER_APP_ID = "awaken-internet";
const SAFE_PROTOCOLS = new Set(["http:", "https:"]);
const SPECIAL_PROTOCOLS = new Set(["mailto:", "tel:"]);
let defaultNavigator = null;

export function classifyNetworkUrl(value, options = {}) {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return classification("invalid", { reason: "The address is empty." });
  if (/\s/.test(raw) || /%(?![0-9a-f]{2})/i.test(raw)) return classification("invalid", { originalUrl: raw, reason: "The address contains invalid characters." });
  if (/^(blob|data):/i.test(raw)) return classification("bypass", { originalUrl: raw, bypass: true, reason: "Local browser data stays with its owning application." });

  let parsed;
  try {
    parsed = new URL(raw, options.baseUrl || currentBaseUrl());
  } catch {
    return classification("invalid", { originalUrl: raw, reason: "The address is not a valid URL." });
  }

  if (SPECIAL_PROTOCOLS.has(parsed.protocol)) return classification("special", { originalUrl: raw, url: parsed.href, protocol: parsed.protocol, bypass: true, reason: "This address uses a system protocol." });
  if (!SAFE_PROTOCOLS.has(parsed.protocol)) return classification("unsafe", { originalUrl: raw, protocol: parsed.protocol, reason: "AWAKEN Internet allows only HTTP and HTTPS addresses." });

  const base = safeBaseUrl(options.baseUrl || currentBaseUrl());
  const hostname = normalizeHostname(parsed.hostname);
  const pathname = parsed.pathname.toLowerCase();
  const extension = pathname.match(/\.([a-z0-9]{1,8})$/)?.[1] || "";
  const policy = options.policy || NETWORK_DESTINATIONS;
  const common = { originalUrl: raw, url: parsed.href, hostname, protocol: parsed.protocol };

  if (options.download || policy.downloadExtensions.includes(extension)) {
    return classification("download", { ...common, bypass: true, reason: "Downloads remain with the browser download flow." });
  }
  if (base && parsed.origin === base.origin) return classification("same-origin", { ...common, embeddable: true });
  if (isApprovedAwakenHost(hostname, parsed, policy)) return classification("awaken", { ...common, embeddable: true });

  const media = officialMediaEmbed(parsed);
  if (media) return classification("media-embed", { ...common, embeddable: true, embedUrl: media.url, provider: media.provider });

  return classification("external", { ...common, embeddable: false, requiresExternalConfirmation: true, reason: "This website cannot be guaranteed to load inside the NETWORK." });
}

export function createNetworkNavigator(adapter = {}) {
  const renderBrowser = adapter.renderBrowser || mountNetworkBrowser;
  const appId = adapter.appId || BROWSER_APP_ID;
  let activeController = null;

  function open(url, options = {}) {
    const settings = {
      title: "AWAKEN Internet",
      source: "network",
      mode: "auto",
      reuse: true,
      allowExternalFallback: true,
      ...options
    };
    const result = classifyNetworkUrl(url, { baseUrl: resolveAdapterValue(adapter.baseUrl), policy: adapter.policy, download: settings.download });
    if (result.bypass || result.kind === "invalid" || result.kind === "unsafe") return { handled: false, classification: result };

    if (settings.reuse && activeController?.isConnected?.()) {
      adapter.focusExistingWindow?.(appId);
      activeController.navigate(result, settings);
      return { handled: true, reused: true, classification: result, appId };
    }

    const safeTitle = sanitizeDisplayText(settings.title || hostnameTitle(result.hostname) || "AWAKEN Internet");
    const shell = adapter.createWindow?.(`AWAKEN Internet - ${safeTitle}`, { wide: true, className: "network-browser-window", appId });
    if (!shell?.content) return { handled: false, classification: result, reason: "AWAKEN Internet is unavailable." };
    activeController = renderBrowser(shell.content, {
      initial: result,
      options: settings,
      home: adapter.home,
      classify: (next) => classifyNetworkUrl(next, { baseUrl: resolveAdapterValue(adapter.baseUrl), policy: adapter.policy }),
      nativeOpen: adapter.nativeOpen,
      copyText: adapter.copyText
    });
    const win = shell.win || shell.content.closest?.(".window");
    win?.addEventListener?.("awaken:window-close", () => { activeController?.destroy?.(); activeController = null; }, { once: true });
    return { handled: true, reused: false, classification: result, appId };
  }

  return { open, get activeController() { return activeController; } };
}

export function configureNetworkNavigation(adapter) {
  defaultNavigator = createNetworkNavigator(adapter);
  return defaultNavigator;
}

export function openNetworkUrl(url, options) {
  if (!defaultNavigator) return { handled: false, classification: classifyNetworkUrl(url), reason: "AWAKEN Internet is not configured." };
  return defaultNavigator.open(url, options);
}

export function bindNetworkUrlElements(container, opener = openNetworkUrl) {
  if (!container?.addEventListener) return () => {};
  const onClick = (event) => {
    const link = event.target.closest?.("[data-network-url]");
    if (!link || !container.contains(link) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = link.dataset.networkUrl || link.getAttribute("href");
    const result = opener(url, { title: link.dataset.networkTitle || link.textContent, source: link.dataset.networkSource || "marked-link" });
    if (result?.handled || ["invalid", "unsafe"].includes(result?.classification?.kind)) event.preventDefault();
  };
  container.addEventListener("click", onClick);
  return () => container.removeEventListener("click", onClick);
}

export function openExternalSecurely(url, nativeOpen = globalThis.window?.open?.bind(globalThis.window)) {
  const result = classifyNetworkUrl(url);
  if (!SAFE_PROTOCOLS.has(result.protocol) || typeof nativeOpen !== "function") return false;
  const opened = nativeOpen(result.url, "_blank", "noopener,noreferrer");
  if (opened && typeof opened === "object") opened.opener = null;
  return true;
}

function mountNetworkBrowser(container, context) {
  container.replaceChildren();
  container.classList.add("network-browser");

  const toolbar = element("div", "network-browser-toolbar");
  const back = commandButton("Back", "Back");
  const forward = commandButton("Forward", "Forward");
  const stop = commandButton("Stop", "Stop");
  const refresh = commandButton("Refresh", "Refresh");
  const home = commandButton("Home", "Home");
  const address = document.createElement("input");
  address.className = "network-browser-address";
  address.type = "url";
  address.inputMode = "url";
  address.autocomplete = "off";
  address.spellcheck = false;
  address.setAttribute("aria-label", "Internet address");
  const go = commandButton("Go", "Go");
  toolbar.append(back, forward, stop, refresh, home, address, go);

  const status = element("div", "network-browser-status");
  const domain = element("strong", "network-browser-domain", "NETWORK HOME");
  const state = element("span", "network-browser-state", "Ready");
  status.append(domain, state);
  const viewport = element("div", "network-browser-viewport");
  container.append(toolbar, status, viewport);

  let history = [];
  let index = -1;
  let loadingTimer = 0;
  let frame = null;
  let currentOptions = context.options;

  function navigate(next, options = currentOptions, historyMode = "push") {
    if (!next || next.bypass || next.kind === "invalid" || next.kind === "unsafe") {
      renderError(next?.reason || "That address cannot be opened.");
      return false;
    }
    currentOptions = options;
    if (historyMode === "push") {
      history = history.slice(0, index + 1);
      history.push({ destination: next, options });
      index = history.length - 1;
    }
    address.value = next.url;
    domain.textContent = sanitizeDisplayText(next.hostname || "NETWORK").toUpperCase();
    updateHistoryControls();
    updateWindowTitle(options.title, next.hostname);
    if (!navigator.onLine) { renderError("The NETWORK is offline. Reconnect, then use Refresh.", next); return true; }
    if (next.embeddable && options.mode !== "external") renderFrame(next);
    else renderExternalWarning(next, options);
    return true;
  }

  function renderFrame(destination) {
    clearViewport();
    state.textContent = "Loading";
    container.classList.add("is-loading");
    const wrap = element("div", "network-browser-frame-wrap");
    frame = document.createElement("iframe");
    frame.className = "network-browser-frame";
    frame.title = sanitizeDisplayText(currentOptions.title || destination.hostname || "AWAKEN Internet destination");
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "autoplay; encrypted-media; fullscreen; picture-in-picture";
    const fallback = element("div", "network-browser-frame-help");
    fallback.append(element("span", "", "If this page remains blank, it may block embedded browsing."));
    if (currentOptions.allowExternalFallback !== false) {
      const external = commandButton("Continue outside NETWORK", "Continue outside NETWORK");
      external.addEventListener("click", () => openExternalSecurely(destination.url, context.nativeOpen));
      fallback.append(external);
    }
    wrap.append(frame, fallback);
    viewport.append(wrap);
    loadingTimer = window.setTimeout(() => renderBlockedFallback(destination), 9000);
    frame.addEventListener("load", () => {
      window.clearTimeout(loadingTimer);
      container.classList.remove("is-loading");
      state.textContent = "Loaded";
    }, { once: true });
    frame.addEventListener("error", () => renderBlockedFallback(destination), { once: true });
    frame.src = destination.embedUrl || destination.url;
  }

  function renderExternalWarning(destination, options) {
    clearViewport();
    state.textContent = "External destination";
    const panel = element("section", "network-browser-warning");
    panel.append(element("h2", "", sanitizeDisplayText(options.title || hostnameTitle(destination.hostname) || "External destination")));
    panel.append(detailRow("Domain", destination.hostname));
    panel.append(detailRow("Address", destination.url));
    panel.append(element("p", "", "This destination must continue outside the NETWORK because external sites may block embedded browsing or require their own security context."));
    const actions = element("div", "network-browser-actions");
    if (options.allowExternalFallback !== false) {
      const proceed = commandButton("Continue to external site", "Continue to external site");
      proceed.addEventListener("click", () => openExternalSecurely(destination.url, context.nativeOpen));
      actions.append(proceed);
    }
    const copy = commandButton("Copy address", "Copy address");
    copy.addEventListener("click", async () => {
      const copied = await copyAddress(destination.url, context.copyText);
      state.textContent = copied ? "Address copied" : "Copy unavailable";
    });
    const cancel = commandButton("Cancel", "Cancel");
    cancel.addEventListener("click", showHome);
    actions.append(copy, cancel);
    panel.append(actions);
    viewport.append(panel);
  }

  function renderBlockedFallback(destination) {
    if (!frame?.isConnected) return;
    renderExternalWarning(destination, currentOptions);
    state.textContent = "Embedding unavailable";
  }

  function renderError(message, destination) {
    clearViewport();
    state.textContent = "Unable to open";
    if (destination?.hostname) domain.textContent = sanitizeDisplayText(destination.hostname).toUpperCase();
    const panel = element("section", "network-browser-error");
    panel.append(element("h2", "", "Page unavailable"), element("p", "", sanitizeDisplayText(message)));
    const retry = commandButton("Refresh", "Refresh");
    retry.addEventListener("click", () => destination && navigate(destination, currentOptions, "replace"));
    panel.append(retry);
    viewport.append(panel);
  }

  function showHome() {
    clearViewport();
    address.value = "AWAKEN://home";
    domain.textContent = "NETWORK HOME";
    state.textContent = navigator.onLine ? "Online" : "Offline";
    const homePanel = element("section", "network-browser-home");
    homePanel.append(element("strong", "", "AWAKEN Internet"), element("h2", "", "NETWORK ONLINE"), element("p", "", "Enter a trusted HTTP or HTTPS address, or open a link from the AWAKEN desktop."));
    viewport.append(homePanel);
    updateWindowTitle("Home", "AWAKEN Internet");
  }

  function clearViewport() {
    window.clearTimeout(loadingTimer);
    frame = null;
    container.classList.remove("is-loading");
    viewport.replaceChildren();
  }

  function submitAddress() {
    const next = context.classify(address.value);
    if (["invalid", "unsafe"].includes(next.kind) || next.bypass) { renderError(next.reason); return; }
    navigate(next, { ...currentOptions, title: hostnameTitle(next.hostname), source: "address-bar" });
  }

  function updateHistoryControls() {
    back.disabled = index <= 0;
    forward.disabled = index >= history.length - 1;
  }

  function updateWindowTitle(title, hostname) {
    const node = container.closest?.(".window")?.querySelector?.(".window-title");
    if (node) node.textContent = `AWAKEN Internet - ${sanitizeDisplayText(title || hostname || "NETWORK")}`;
  }

  back.addEventListener("click", () => { if (index > 0) { index -= 1; const entry = history[index]; navigate(entry.destination, entry.options, "replace"); updateHistoryControls(); } });
  forward.addEventListener("click", () => { if (index < history.length - 1) { index += 1; const entry = history[index]; navigate(entry.destination, entry.options, "replace"); updateHistoryControls(); } });
  stop.addEventListener("click", () => { if (frame) frame.src = "about:blank"; clearViewport(); state.textContent = "Stopped"; viewport.append(element("div", "network-browser-stopped", "Navigation stopped.")); });
  refresh.addEventListener("click", () => { const entry = history[index]; if (entry) navigate(entry.destination, entry.options, "replace"); });
  home.addEventListener("click", showHome);
  go.addEventListener("click", submitAddress);
  address.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); submitAddress(); } });
  navigate(context.initial, context.options);

  return {
    navigate,
    isConnected: () => container.isConnected !== false,
    destroy: () => clearViewport(),
    get historyLength() { return history.length; }
  };
}

function officialMediaEmbed(parsed) {
  const host = normalizeHostname(parsed.hostname);
  if (host === "embed.music.apple.com") return { provider: "apple", url: parsed.href };
  if (host === "w.soundcloud.com" && parsed.pathname.startsWith("/player")) return { provider: "soundcloud", url: parsed.href };
  if (host === "open.spotify.com" && parsed.pathname.startsWith("/embed/")) return { provider: "spotify", url: parsed.href };
  const provider = host === "music.apple.com" || host.endsWith(".music.apple.com")
    ? "apple"
    : host === "soundcloud.com" || host.endsWith(".soundcloud.com")
      ? "soundcloud"
      : host === "open.spotify.com" ? "spotify" : null;
  const url = provider ? mediaProviderEmbed(provider, parsed.href) : null;
  return url ? { provider, url } : null;
}

function isApprovedAwakenHost(hostname, parsed, policy) {
  if (policy.awakenDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) return true;
  if (!policy.awakenHosts.includes(hostname)) return false;
  return hostname !== "anticalvin.github.io" || parsed.pathname === "/network" || parsed.pathname.startsWith("/network/");
}

function classification(kind, values = {}) { return { kind, embeddable: false, bypass: false, requiresExternalConfirmation: false, ...values }; }
function normalizeHostname(value = "") { return value.toLowerCase().replace(/^www\./, ""); }
function safeBaseUrl(value) { try { return new URL(value); } catch { return null; } }
function currentBaseUrl() { return globalThis.location?.href || "https://awakencult.com/"; }
function hostnameTitle(hostname = "") { return hostname.split(".").filter(Boolean).slice(-2, -1)[0]?.toUpperCase() || hostname; }
function sanitizeDisplayText(value) { return String(value || "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, 300); }
function resolveAdapterValue(value) { return typeof value === "function" ? value() : value; }
function element(tag, className = "", text = "") { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; }
function commandButton(label, title) { const button = element("button", "", label); button.type = "button"; button.title = title; return button; }
function detailRow(label, value) { const row = element("dl", "network-browser-detail"); const key = element("dt", "", label); const content = element("dd", "", sanitizeDisplayText(value)); row.append(key, content); return row; }
async function copyAddress(value, copyText) { try { if (copyText) return Boolean(await copyText(value)); await navigator.clipboard.writeText(value); return true; } catch { return false; } }
