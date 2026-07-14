const PAGE_SIZE = 40;

export function renderMindApp(container, { repository, inviteUrl }) {
  container.innerHTML = `
    <div class="mind-app">
      <div class="mind-toolbar">
        <strong>MIND / XP</strong>
        <span data-state role="status">Connecting</span>
        <button type="button" data-refresh>Refresh</button>
        <button type="button" data-older hidden>Older</button>
        <button type="button" data-discord>Open Discord</button>
      </div>
      <div class="mind-notice" data-notice hidden></div>
      <div class="mind-log" data-log aria-live="polite"></div>
    </div>
  `;

  const state = container.querySelector("[data-state]");
  const notice = container.querySelector("[data-notice]");
  const log = container.querySelector("[data-log]");
  const older = container.querySelector("[data-older]");
  let messages = [];
  let disposed = false;
  let loading = false;

  const render = ({ preserveScroll = false } = {}) => {
    const previousHeight = log.scrollHeight;
    const previousTop = log.scrollTop;
    const visible = messages.filter(isVisibleMessage).sort(compareMessages);
    log.innerHTML = visible.map(messageMarkup).join("") || `<div class="empty-state">No messages have been received.</div>`;
    if (preserveScroll) log.scrollTop = previousTop + log.scrollHeight - previousHeight;
    else log.scrollTop = log.scrollHeight;
  };

  const setNotice = (message = "") => {
    notice.textContent = message;
    notice.hidden = !message;
  };

  const load = async ({ before, reconcile = false } = {}) => {
    if (loading || disposed) return;
    loading = true;
    state.textContent = before ? "Loading history" : "Refreshing";
    if (!messages.length) log.innerHTML = `<div class="empty-state">Loading messages...</div>`;
    try {
      const rows = await repository.getMany({ limit: PAGE_SIZE, before });
      messages = before ? mergeMindMessages(messages, rows) : mergeMindMessages(reconcile ? messages : [], rows);
      state.textContent = navigator.onLine ? "Live" : "Offline";
      setNotice(navigator.onLine ? "" : "Connection unavailable. Showing the latest received messages.");
      older.hidden = rows.length < PAGE_SIZE;
      render({ preserveScroll: Boolean(before) });
    } catch (error) {
      state.textContent = navigator.onLine ? "Unable to connect" : "Offline";
      setNotice("Unable to load MIND. Check the connection and try again.");
      if (!messages.length) log.innerHTML = `<div class="empty-state">Unable to load messages.</div>`;
      console.warn("MIND fetch failed", { code: error?.code || "FETCH_FAILED", status: error?.status || null });
    } finally {
      loading = false;
    }
  };

  const unsubscribe = repository.subscribe({}, (event) => {
    if (disposed) return;
    if (event.type === "status") {
      if (event.status === "SUBSCRIBED") {
        state.textContent = "Live";
        setNotice("");
      } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED", "UNAVAILABLE"].includes(event.status)) {
        state.textContent = navigator.onLine ? "Reconnecting" : "Offline";
      }
      return;
    }
    if (event.row) messages = mergeMindMessages(messages, [event.row]);
    if (!event.row && event.old?.id) messages = messages.filter((message) => message.id !== event.old.id);
    render();
  });

  const reconcile = () => {
    if (!disposed && document.visibilityState === "visible") void load({ reconcile: true });
  };
  const updateNetworkState = () => {
    state.textContent = navigator.onLine ? "Reconnecting" : "Offline";
    setNotice(navigator.onLine ? "" : "Connection unavailable. Showing the latest received messages.");
    if (navigator.onLine) void load({ reconcile: true });
  };

  container.querySelector("[data-refresh]").addEventListener("click", () => void load({ reconcile: true }));
  older.addEventListener("click", () => void load({ before: messages[0]?.createdAt }));
  container.querySelector("[data-discord]").addEventListener("click", () => window.open(inviteUrl, "_blank", "noopener,noreferrer"));
  document.addEventListener("visibilitychange", reconcile);
  window.addEventListener("online", updateNetworkState);
  window.addEventListener("offline", updateNetworkState);
  void load();

  return () => {
    disposed = true;
    unsubscribe();
    document.removeEventListener("visibilitychange", reconcile);
    window.removeEventListener("online", updateNetworkState);
    window.removeEventListener("offline", updateNetworkState);
  };
}

export function mergeMindMessages(current, incoming) {
  const byExternalId = new Map();
  [...current, ...incoming].forEach((message) => {
    const key = message.externalId || message.id;
    if (key) byExternalId.set(key, message);
  });
  return [...byExternalId.values()].sort(compareMessages);
}

export function compareMessages(a, b) {
  return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
}

function isVisibleMessage(message) {
  return !message.deletedAt && message.moderationStatus === "approved" && (!message.visibility || message.visibility === "public");
}

function messageMarkup(message) {
  const avatar = safeHttpsUrl(message.authorAvatarUrl);
  const attachments = (message.attachments || []).map(attachmentMarkup).join("");
  return `
    <article class="mind-message ${message.system ? "system" : ""}" data-message-id="${escapeHtml(message.externalId || message.id || "")}">
      <div class="mind-message-head">
        ${avatar ? `<img src="${escapeHtml(avatar)}" alt="" loading="lazy" />` : `<span class="mind-avatar" aria-hidden="true">${escapeHtml((message.authorDisplayName || "?").slice(0, 1).toUpperCase())}</span>`}
        <strong>${escapeHtml(message.authorDisplayName || "Unknown member")}</strong>
        <time datetime="${escapeHtml(message.createdAt || "")}">${formatTime(message.createdAt)}</time>
        ${message.editedAt ? `<small>edited</small>` : ""}
      </div>
      ${message.body ? `<p>${escapeHtml(message.body)}</p>` : ""}
      ${attachments ? `<div class="mind-attachments">${attachments}</div>` : ""}
    </article>
  `;
}

function attachmentMarkup(attachment) {
  const url = safeHttpsUrl(attachment.url);
  if (!url) return "";
  const label = escapeHtml(attachment.name || "Attachment");
  if (String(attachment.contentType || "").startsWith("image/")) {
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(url)}" alt="${label}" loading="lazy" /></a>`;
  }
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function formatTime(value) {
  if (!value) return "--:--";
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
