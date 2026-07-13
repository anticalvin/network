export function renderMindApp(container, { repository, inviteUrl }) {
  container.innerHTML = `
    <div class="mind-app">
      <div class="mind-toolbar">
        <strong>MIND / XP</strong>
        <span data-state>connecting...</span>
        <button type="button" data-refresh>Refresh</button>
        <button type="button" data-discord>Open Discord</button>
      </div>
      <div class="mind-log" data-log></div>
    </div>
  `;
  const state = container.querySelector("[data-state]");
  const log = container.querySelector("[data-log]");
  const render = (messages, source) => {
    state.textContent = source === "supabase" ? "live mirror" : `${source || "fallback"} cache`;
    log.innerHTML = messages.map((message) => `
      <article class="mind-message ${message.system ? "system" : ""}">
        <div><strong>${escapeHtml(message.authorDisplayName || "unknown")}</strong><time>${formatTime(message.createdAt)}</time></div>
        <p>${escapeHtml(message.body || "")}</p>
      </article>
    `).join("") || `<div class="empty-state">No approved XP messages yet.</div>`;
    log.scrollTop = log.scrollHeight;
  };
  const load = async () => {
    state.textContent = "loading...";
    const messages = await repository.getMany({ limit: 40 });
    render(messages, repository.getSource());
  };
  container.querySelector("[data-refresh]").addEventListener("click", load);
  container.querySelector("[data-discord]").addEventListener("click", () => window.open(inviteUrl, "_blank", "noopener"));
  load();
  return () => {};
}

function formatTime(value) {
  if (!value) return "--:--";
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
