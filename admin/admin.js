import { defaultContent } from "../src/content/default-content.js";
import { ContentRepository } from "../src/data/content-repository.js";
import { safeUrl } from "../src/domain/media.js";
import { createSupabaseRestClient } from "../src/data/supabase-client.js";
import { TEAM_MEMBERS } from "../src/content/contributors.js";
import { iconManifest } from "../src/content/icon-manifest.js";

const repository = new ContentRepository();
const supabaseClient = createSupabaseRestClient();
let content = (await repository.getPublicContent()).content;
let section = "transmissions";
let selectedIndex = null;

const schemas = {
  transmissions: [
    ["internalTitle", "Internal title", "text", true], ["publicTitle", "Public title", "text", true],
    ["primaryCopy", "Primary copy", "textarea", true], ["secondaryCopy", "Secondary copy", "textarea"],
    ["destinationUrl", "Destination URL", "url", true], ["status", "Status", "select", true, ["draft", "scheduled", "published", "expired", "archived"]],
    ["startAt", "Start date", "datetime-local"], ["endAt", "End date", "datetime-local"],
    ["priority", "Priority", "number"], ["verificationStatus", "Fact check", "select", true, ["unverified", "needs_review", "verified"]],
    ["sourceRef", "Source reference", "url"]
  ],
  links: [["label", "Label", "text", true], ["detail", "Description", "textarea", true], ["url", "URL", "url", true], ["verified", "Verified", "checkbox"]],
  themes: [["label", "Label", "text", true], ["color", "Color", "color", true], ["enabled", "Enabled", "checkbox"], ["sortOrder", "Sort order", "number"]],
  fragments: [["title", "Title", "text", true], ["body", "Text", "textarea", true], ["sourceType", "Source type", "text", true], ["sourceRef", "Source record", "text", true], ["status", "Status", "select", true, ["draft", "published", "archived"]]],
  filesystem: [["name", "Name", "text", true], ["path", "Path", "text", true], ["nodeType", "Type", "select", true, ["folder", "image", "audio", "video", "document", "shortcut", "release", "application", "archive", "external_link", "unknown"]], ["visibility", "Visibility", "select", true, ["public", "unlisted", "authenticated", "team", "private"]], ["status", "Status", "select", true, ["draft", "scheduled", "published", "expired", "archived"]]],
  media: [["originalFilename", "Filename", "text", true], ["provider", "Provider", "select", true, ["local", "imgbb", "supabase", "remote"]], ["externalUrl", "External URL", "url"], ["mimeType", "MIME type", "text", true], ["caption", "Caption", "textarea"], ["altText", "Alt text", "textarea"], ["processingStatus", "Processing", "select", true, ["pending", "processing", "ready", "failed"]], ["moderationStatus", "Moderation", "select", true, ["review", "approved", "rejected"]]],
  campaigns: [["slug", "Slug", "text", true], ["title", "Title", "text", true], ["status", "Status", "select", true, ["draft", "scheduled", "published", "expired", "archived"]], ["weight", "Weight", "number"], ["startsAt", "Starts", "datetime-local"], ["endsAt", "Ends", "datetime-local"]],
  mindBridge: [["displayName", "Channel", "text", true], ["discordGuildId", "Guild ID", "text", true], ["discordChannelId", "Channel ID", "text", true], ["connectionStatus", "Connection status", "text"], ["lastSyncedAt", "Last sync", "datetime-local"], ["publicVisible", "Public visible", "checkbox"]],
  contributors: [["displayName", "Display name", "text", true], ["slug", "Slug", "text", true], ["avatarUrl", "Avatar URL", "url"], ["roleLabel", "Role label", "text"], ["biography", "Biography", "textarea"], ["externalUrl", "External URL", "url"], ["discordUserId", "Discord user ID", "text"], ["isTeam", "Team member", "checkbox"], ["isActive", "Active", "checkbox"]],
  icons: [["applicationId", "Application ID", "text", true], ["label", "Label", "text", true], ["remoteIconUrl", "Remote icon URL", "url"], ["enabled", "Enabled", "checkbox"]]
};

content.filesystem ||= [{ id: "local-community-xp", name: "XP", path: "A:\\Community\\XP", nodeType: "folder", visibility: "public", status: "published" }];
content.media ||= [{ id: "local-wallpaper-default", originalFilename: "awaken-default.webp", provider: "imgbb", externalUrl: "https://i.ibb.co/F4cCLp3t/a3a6a063-4a72-4b8a-b693-b774e7acbf81.webp", mimeType: "image/webp", processingStatus: "ready", moderationStatus: "approved" }];
content.campaigns ||= [{ id: "local-call-awaken", slug: "call-awaken", title: "CALL-AWAKEN", status: "draft", weight: 1 }];
content.mindBridge ||= [{ id: "xp", displayName: "XP", discordGuildId: "946069318473502770", discordChannelId: "1525921490414080031", connectionStatus: "Server-managed", publicVisible: true }];
content.contributors ||= TEAM_MEMBERS.map((person) => ({ ...person, isTeam: true, isActive: true }));
content.icons ||= iconManifest.map((icon) => ({ id: icon.applicationId, applicationId: icon.applicationId, label: icon.label, remoteIconUrl: icon.remoteIconUrl || "", enabled: icon.enabled }));
document.getElementById("admin-mode").textContent = supabaseClient.configured ? "Editorial preview / publishing locked" : "Local editorial preview";

document.querySelectorAll("[data-section]").forEach((button) => button.addEventListener("click", () => {
  section = button.dataset.section;
  selectedIndex = null;
  document.querySelectorAll("[data-section]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  render();
}));
document.getElementById("new-entry").addEventListener("click", createEntry);

function render() {
  document.getElementById("section-title").textContent = titleCase(section);
  const list = document.getElementById("entry-list");
  list.innerHTML = "";
  (content[section] || []).forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `entry${selectedIndex === index ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(entry.publicTitle || entry.displayName || entry.name || entry.label || entry.title || "Untitled")}</strong><small>${escapeHtml(entry.status || entry.slug || entry.applicationId || entry.url || entry.color || "draft")}</small>`;
    button.addEventListener("click", () => { selectedIndex = index; render(); });
    list.appendChild(button);
  });
  renderEditor();
}

function createEntry() {
  const id = `draft-${Date.now()}`;
  const base = section === "transmissions" ? { id, status: "draft", priority: 0, mobileEligible: true, desktopEligible: true, frequency: { scope: "browser", maxDisplays: 1 }, routes: ["desktop"], dismissal: "browser" } : { id, status: "draft" };
  content[section] = [base, ...(content[section] || [])];
  selectedIndex = 0;
  render();
}

function renderEditor() {
  const form = document.getElementById("editor-form");
  if (selectedIndex === null) { form.innerHTML = `<div class="editor-empty">Select an entry or create a new one.</div>`; return; }
  const entry = content[section][selectedIndex];
  form.innerHTML = `<h2>${escapeHtml(entry.publicTitle || entry.label || entry.title || "New entry")}</h2><div class="form-grid">${schemas[section].map((field) => fieldMarkup(field, entry)).join("")}</div><div data-warning></div><div class="form-actions"><button class="primary" type="submit">Save local preview</button><button type="button" data-duplicate>Duplicate</button><button class="danger" type="button" data-delete>Delete</button></div>`;
  form.addEventListener("submit", saveForm, { once: true });
  form.querySelector("[data-duplicate]").addEventListener("click", duplicateEntry);
  form.querySelector("[data-delete]").addEventListener("click", deleteEntry);
  showWarnings(form, entry);
}

function saveForm(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const entry = { ...content[section][selectedIndex] };
  schemas[section].forEach(([key, , type]) => {
    if (type === "checkbox") entry[key] = event.currentTarget.elements[key].checked;
    else if (type === "number") entry[key] = Number(data.get(key) || 0);
    else entry[key] = data.get(key)?.trim() || null;
  });
  const urlFields = schemas[section].filter((field) => field[2] === "url");
  if (urlFields.some(([key]) => entry[key] && !safeUrl(entry[key]))) { showStatus("Use a valid http or https URL.", true); renderEditor(); return; }
  content[section][selectedIndex] = entry;
  content = repository.saveLocalDraft(content);
  if (section === "icons") {
    const overrides = Object.fromEntries(content.icons.filter((icon) => icon.remoteIconUrl).map((icon) => [icon.applicationId, icon.remoteIconUrl]));
    localStorage.setItem("awaken.iconOverrides", JSON.stringify(overrides));
  }
  showStatus("Saved. The public desktop will use this local preview after refresh.");
  render();
}

function duplicateEntry() {
  const source = content[section][selectedIndex];
  content[section].splice(selectedIndex + 1, 0, { ...source, id: `copy-${Date.now()}`, status: source.status ? "draft" : source.status });
  selectedIndex += 1;
  render();
}

function deleteEntry() {
  if (!confirm("Delete this local entry?")) return;
  content[section].splice(selectedIndex, 1);
  selectedIndex = null;
  content = repository.saveLocalDraft(content);
  showStatus("Entry deleted from local preview.");
  render();
}

function fieldMarkup([key, label, type, required, options], entry) {
  const value = entry[key] ?? "";
  if (type === "textarea") return `<label class="field">${label}<textarea name="${key}" ${required ? "required" : ""}>${escapeHtml(value)}</textarea></label>`;
  if (type === "select") return `<label class="field">${label}<select name="${key}" ${required ? "required" : ""}>${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${titleCase(option)}</option>`).join("")}</select></label>`;
  if (type === "checkbox") return `<label class="field"><span>${label}</span><input name="${key}" type="checkbox" ${value ? "checked" : ""} /></label>`;
  const displayValue = type === "datetime-local" && value ? String(value).slice(0, 16) : value;
  return `<label class="field">${label}<input name="${key}" type="${type}" value="${escapeHtml(String(displayValue))}" ${required ? "required" : ""} /></label>`;
}

function showWarnings(form, entry) {
  const warnings = [];
  if (entry.verificationStatus && entry.verificationStatus !== "verified") warnings.push("Factual verification is incomplete.");
  if ((entry.status === "published" || entry.status === "scheduled") && !entry.sourceRef) warnings.push("Add a source reference before remote publication.");
  form.querySelector("[data-warning]").innerHTML = warnings.map((warning) => `<p class="warning">${warning}</p>`).join("");
}

function showStatus(message, error = false) { const status = document.getElementById("admin-status"); status.textContent = message; status.style.background = error ? "#9b1711" : "#1f6d35"; status.hidden = false; setTimeout(() => { status.hidden = true; }, 3500); }
function titleCase(value) { return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }

render();
