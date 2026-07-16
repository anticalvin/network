import { defaultContent } from "../src/content/default-content.js";
import { ContentRepository } from "../src/data/content-repository.js";
import { safeUrl } from "../src/domain/media.js";
import { createSupabaseRestClient } from "../src/data/supabase-client.js";
import { TEAM_MEMBERS } from "../src/content/contributors.js";
import { iconManifest } from "../src/content/icon-manifest.js";
import { atlasSeed } from "../src/content/atlas-seed.js";
import { ATLAS_ENTITY_TYPES, ATLAS_PUBLICATION_STATES, ATLAS_VERIFICATION_STATES, isAtlasEntityPublic, isAtlasRelationshipPublic } from "../src/domain/atlas.js";
import { getRuntimeConfig } from "../src/system/runtime-state.js";

const repository = new ContentRepository();
const supabaseClient = createSupabaseRestClient();
const runtimeConfig = getRuntimeConfig();
const callbackQuery = new URLSearchParams(location.search);
const callbackHash = new URLSearchParams(location.hash.slice(1));
let authCallbackType = callbackQuery.get("type") || callbackHash.get("type") || (callbackQuery.has("code") ? "recovery" : "");
const authClient = globalThis.supabase?.createClient?.(runtimeConfig.supabaseUrl, runtimeConfig.supabasePublishableKey || runtimeConfig.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
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
  ads: [["title", "Title", "text", true], ["enabled", "Enabled", "checkbox"], ["type", "Type", "select", true, ["security", "messenger", "installer", "memory", "dialer"]], ["weight", "Weight", "number"], ["minimumSessionAgeMs", "Minimum session age (ms)", "number"], ["cooldownMs", "Cooldown (ms)", "number"], ["maximumPerSession", "Maximum per session", "number"], ["maximumPerDay", "Maximum per day", "number"], ["actionType", "Action", "select", true, ["recover", "message", "connect"]], ["contentReference", "Content reference", "text"], ["startAt", "Campaign starts", "datetime-local"], ["endAt", "Campaign ends", "datetime-local"]],
  featureFlags: [["title", "Configuration", "text", true], ["adsRuntimeEnabled", "Ads runtime enabled", "checkbox"], ["intrusionEnabled", "Intrusion enabled", "checkbox"], ["galleryStudioEnabled", "AWAKEN Paint enabled", "checkbox"], ["upgradedMediaPlayerEnabled", "Upgraded Media Player enabled", "checkbox"]],
  gallerySubmissions: [["title", "Title", "text", true], ["creator", "Creator", "text", true], ["moderationStatus", "Moderation", "select", true, ["review", "approved", "rejected"]], ["atlasEntityId", "Atlas entity", "text"], ["createdAt", "Submitted", "datetime-local"]],
  mindBridge: [["displayName", "Channel", "text", true], ["discordGuildId", "Guild ID", "text", true], ["discordChannelId", "Channel ID", "text", true], ["connectionStatus", "Connection status", "text"], ["lastSyncedAt", "Last sync", "datetime-local"], ["publicVisible", "Public visible", "checkbox"]],
  contributors: [["displayName", "Display name", "text", true], ["slug", "Slug", "text", true], ["avatarUrl", "Avatar URL", "url"], ["roleLabel", "Role label", "text"], ["biography", "Biography", "textarea"], ["externalUrl", "External URL", "url"], ["discordUserId", "Discord user ID", "text"], ["isTeam", "Team member", "checkbox"], ["isActive", "Active", "checkbox"]],
  atlasEntities: [["name", "Name", "text", true], ["slug", "Slug", "text", true], ["entityType", "Entity type", "select", true, ATLAS_ENTITY_TYPES], ["summary", "Summary", "textarea"], ["description", "Description", "textarea"], ["publicationState", "Publication", "select", true, ATLAS_PUBLICATION_STATES], ["verificationState", "Verification", "select", true, ATLAS_VERIFICATION_STATES], ["confidence", "Confidence 0-1", "number"], ["publicVisible", "Public visible", "checkbox"], ["startDate", "Start date", "datetime-local"], ["endDate", "End date", "datetime-local"], ["aliases", "Aliases (comma separated)", "csv"], ["tags", "Tags (comma separated)", "csv"], ["sourceRefs", "Source IDs (comma separated)", "csv"], ["metadata", "Typed metadata (JSON)", "json"]],
  atlasRelationships: [["subjectId", "Subject entity ID", "text", true], ["predicate", "Relationship type", "text", true], ["objectId", "Object entity ID", "text", true], ["role", "Role or credit detail", "text"], ["creditOrder", "Credit order", "number"], ["verificationState", "Verification", "select", true, ATLAS_VERIFICATION_STATES], ["confidence", "Confidence 0-1", "number"], ["publicVisible", "Public visible", "checkbox"], ["startDate", "Start date", "datetime-local"], ["endDate", "End date", "datetime-local"], ["sourceRefs", "Source IDs (comma separated)", "csv"], ["editorialNotes", "Editorial notes", "textarea"], ["metadata", "Typed metadata (JSON)", "json"]],
  atlasSources: [["title", "Source title", "text", true], ["sourceType", "Source type", "text", true], ["sourceUrl", "Public source URL", "url"], ["internalRef", "Internal reference", "text"], ["sourceDate", "Source date", "datetime-local"], ["originalId", "Original identifier", "text"], ["confidence", "Confidence 0-1", "number"], ["publicSafe", "Public safe", "checkbox"], ["reviewNotes", "Review notes", "textarea"], ["metadata", "Typed metadata (JSON)", "json"]],
  icons: [["applicationId", "Application ID", "text", true], ["label", "Label", "text", true], ["remoteIconUrl", "Remote icon URL", "url"], ["enabled", "Enabled", "checkbox"]]
};

content.filesystem ||= [{ id: "local-community-xp", name: "XP", path: "A:\\Community\\XP", nodeType: "folder", visibility: "public", status: "published" }];
content.media ||= [{ id: "local-wallpaper-default", originalFilename: "awaken-default.webp", provider: "imgbb", externalUrl: "https://i.ibb.co/F4cCLp3t/a3a6a063-4a72-4b8a-b693-b774e7acbf81.webp", mimeType: "image/webp", processingStatus: "ready", moderationStatus: "approved" }];
content.campaigns ||= [{ id: "local-call-awaken", slug: "call-awaken", title: "CALL-AWAKEN", status: "draft", weight: 1 }];
content.mindBridge ||= [{ id: "xp", displayName: "XP", discordGuildId: "946069318473502770", discordChannelId: "1525921490414080031", connectionStatus: "Server-managed", publicVisible: true }];
content.contributors ||= TEAM_MEMBERS.map((person) => ({ ...person, isTeam: true, isActive: true }));
content.atlasEntities ||= structuredClone(atlasSeed.entities);
content.atlasRelationships ||= structuredClone(atlasSeed.relationships);
content.atlasSources ||= structuredClone(atlasSeed.sources);
content.icons ||= iconManifest.map((icon) => ({ id: icon.applicationId, applicationId: icon.applicationId, label: icon.label, remoteIconUrl: icon.remoteIconUrl || "", enabled: icon.enabled }));
content.ads ||= structuredClone(defaultContent.ads);
content.featureFlags ||= structuredClone(defaultContent.featureFlags);
content.gallerySubmissions ||= [];
document.getElementById("admin-mode").textContent = supabaseClient.configured ? "Editorial preview / sign in to moderate" : "Local editorial preview";

const authForm = document.getElementById("admin-auth");
const passwordPanel = document.getElementById("admin-password-panel");
const signInButton = authForm.querySelector('button[type="submit"]');
const signOutButton = document.getElementById("admin-sign-out");
const publishButton = document.getElementById("admin-publish");

function hasAdminRole(session) {
  return session?.user?.app_metadata?.user_role === "admin";
}

function renderAuthState(session) {
  const isAdmin = hasAdminRole(session);
  signInButton.hidden = Boolean(session);
  signOutButton.hidden = !session;
  publishButton.hidden = !isAdmin;
  authForm.elements.email.disabled = Boolean(session);
  authForm.elements.password.disabled = Boolean(session);
  document.getElementById("admin-mode").textContent = session
    ? isAdmin ? "Authenticated / administrator" : "Authenticated / admin access pending"
    : "Editorial preview / publishing locked";
  if (session && ["invite", "recovery"].includes(authCallbackType)) passwordPanel.hidden = false;
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!authClient) { showStatus("Supabase Auth is unavailable.", true); return; }
  const form = new FormData(event.currentTarget);
  signInButton.disabled = true;
  signInButton.textContent = "Signing in...";
  try {
    const { data, error } = await authClient.auth.signInWithPassword({ email: String(form.get("email") || "").trim(), password: String(form.get("password") || "") });
    if (error) { showStatus(error.message, true); return; }
    const { data: refreshed } = await authClient.auth.refreshSession();
    const session = refreshed.session || data.session;
    renderAuthState(session);
    showStatus(hasAdminRole(session) ? "Signed in as an AWAKEN administrator." : "Signed in, but this account does not have the admin role.", !hasAdminRole(session));
  } catch (error) {
    showStatus(error?.message || "Sign in could not be completed.", true);
  } finally {
    signInButton.disabled = false;
    signInButton.textContent = "Sign in";
  }
});

signOutButton.addEventListener("click", async () => {
  if (!authClient) return;
  await authClient.auth.signOut();
  authForm.reset();
  passwordPanel.hidden = true;
  renderAuthState(null);
  showStatus("Signed out.");
});

publishButton.addEventListener("click", async () => {
  if (!authClient) { showStatus("Supabase Auth is unavailable.", true); return; }
  const { data: sessionData } = await authClient.auth.getSession();
  if (!hasAdminRole(sessionData.session)) { showStatus("Sign in as an administrator to publish.", true); return; }
  publishButton.disabled = true;
  publishButton.textContent = "Publishing...";
  try {
    const payload = structuredClone(content);
    delete payload.gallerySubmissions;
    payload.updatedAt = new Date().toISOString();
    const { error } = await authClient.from("network_content_snapshots").upsert({
      id: "live",
      payload,
      published: true,
      published_at: payload.updatedAt,
      updated_by: sessionData.session.user.id
    });
    if (error) { showStatus(error.message, true); return; }
    repository.clearLocalDraft();
    showStatus("Published to the live AWAKEN NETWORK.");
  } catch (error) {
    showStatus(error?.message || "Publishing could not be completed.", true);
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = "Publish NETWORK";
  }
});

document.getElementById("admin-email-setup").addEventListener("click", async () => {
  if (!authClient) { showStatus("Supabase Auth is unavailable.", true); return; }
  const email = String(authForm.elements.email.value || "").trim();
  if (!email) { showStatus("Enter the admin email address first.", true); return; }
  const redirectTo = new URL("./admin.html", location.href).href;
  const { error } = await authClient.auth.resetPasswordForEmail(email, { redirectTo });
  showStatus(error ? error.message : "A secure admin setup link has been sent.", Boolean(error));
});

document.getElementById("admin-password-setup").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!authClient) { showStatus("Supabase Auth is unavailable.", true); return; }
  const form = new FormData(event.currentTarget);
  const password = String(form.get("password") || "");
  if (password.length < 12) { showStatus("Use at least 12 characters for the admin password.", true); return; }
  if (password !== String(form.get("confirmPassword") || "")) { showStatus("The passwords do not match.", true); return; }
  const { data, error } = await authClient.auth.updateUser({ password });
  if (error) { showStatus(error.message, true); return; }
  authCallbackType = "";
  passwordPanel.hidden = true;
  history.replaceState({}, "", location.pathname);
  event.currentTarget.reset();
  renderAuthState(data.user ? { user: data.user } : null);
  showStatus("Admin password set. This account is ready to sign in.");
});

if (authClient) {
  authClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") authCallbackType = "recovery";
    renderAuthState(session);
  });
  const { data: sessionData } = await authClient.auth.getSession();
  renderAuthState(sessionData.session);
}

document.querySelectorAll("[data-section]").forEach((button) => button.addEventListener("click", async () => {
  section = button.dataset.section;
  selectedIndex = null;
  document.querySelectorAll("[data-section]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  if (section === "gallerySubmissions") await loadGallerySubmissions();
  render();
}));
document.getElementById("new-entry").addEventListener("click", createEntry);

function render() {
  document.getElementById("section-title").textContent = titleCase(section);
  const list = document.getElementById("entry-list");
  document.getElementById("new-entry").hidden = section === "gallerySubmissions";
  list.innerHTML = "";
  (content[section] || []).forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `entry${selectedIndex === index ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(entry.publicTitle || entry.displayName || entry.name || entry.label || entry.title || entry.predicate || "Untitled")}</strong><small>${escapeHtml(entry.status || entry.moderationStatus || entry.publicationState || entry.sourceType || entry.slug || entry.applicationId || entry.url || entry.color || "draft")}</small>`;
    button.addEventListener("click", () => { selectedIndex = index; render(); });
    list.appendChild(button);
  });
  renderEditor();
}

function createEntry() {
  const id = `draft-${Date.now()}`;
  const base = section === "transmissions"
    ? { id, status: "draft", priority: 0, mobileEligible: true, desktopEligible: true, frequency: { scope: "browser", maxDisplays: 1 }, routes: ["desktop"], dismissal: "browser" }
    : section === "atlasEntities"
      ? { id, entityType: "concept", publicationState: "draft", verificationState: "needs_review", confidence: 0.5, publicVisible: false }
      : section === "atlasRelationships"
        ? { id, predicate: "related_to", verificationState: "needs_review", confidence: 0.5, publicVisible: false }
        : section === "atlasSources"
          ? { id, sourceType: "internal", confidence: 0.5, publicSafe: false }
          : { id, status: "draft" };
  content[section] = [base, ...(content[section] || [])];
  selectedIndex = 0;
  render();
}

function renderEditor() {
  const form = document.getElementById("editor-form");
  if (selectedIndex === null) { form.innerHTML = `<div class="editor-empty">Select an entry or create a new one.</div>`; return; }
  const entry = content[section][selectedIndex];
  form.innerHTML = `<h2>${escapeHtml(entry.publicTitle || entry.displayName || entry.name || entry.label || entry.title || entry.predicate || "New entry")}</h2><div class="form-grid">${schemas[section].map((field) => fieldMarkup(field, entry)).join("")}</div><div data-warning></div><div class="form-actions"><button class="primary" type="submit">Save local preview</button>${section === "ads" ? `<button type="button" data-preview-ad>Preview on desktop</button>` : ""}<button type="button" data-duplicate>Duplicate</button><button class="danger" type="button" data-delete>Delete</button></div>`;
  form.addEventListener("submit", saveForm, { once: true });
  form.querySelector("[data-duplicate]").addEventListener("click", duplicateEntry);
  form.querySelector("[data-delete]").addEventListener("click", deleteEntry);
  form.querySelector("[data-preview-ad]")?.addEventListener("click", () => window.open(`./index.html?skipBoot&adminPreview&previewAd=${encodeURIComponent(entry.id)}`, "_blank", "noopener,noreferrer"));
  showWarnings(form, entry);
}

async function saveForm(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const entry = { ...content[section][selectedIndex] };
  let invalidJson = false;
  schemas[section].forEach(([key, , type]) => {
    if (type === "checkbox") entry[key] = event.currentTarget.elements[key].checked;
    else if (type === "number") entry[key] = Number(data.get(key) || 0);
    else if (type === "csv") entry[key] = String(data.get(key) || "").split(",").map((item) => item.trim()).filter(Boolean);
    else if (type === "json") {
      try { entry[key] = JSON.parse(data.get(key) || "{}"); } catch { invalidJson = true; }
    }
    else entry[key] = data.get(key)?.trim() || null;
  });
  if (invalidJson) { showStatus("Typed metadata must be valid JSON.", true); renderEditor(); return; }
  const urlFields = schemas[section].filter((field) => field[2] === "url");
  if (urlFields.some(([key]) => entry[key] && !safeUrl(entry[key]))) { showStatus("Use a valid http or https URL.", true); renderEditor(); return; }
  content[section][selectedIndex] = entry;
  if (section === "gallerySubmissions") {
    if (!authClient) { showStatus("Sign in with a Supabase admin account to moderate submissions.", true); return; }
    const { data: sessionData } = await authClient.auth.getSession();
    if (!hasAdminRole(sessionData.session)) { showStatus("This account does not have the admin role.", true); return; }
    const { error } = await authClient.from("gallery_submissions").update({ moderation_status: entry.moderationStatus, reviewed_at: new Date().toISOString(), atlas_entity_id: entry.atlasEntityId || null }).eq("id", entry.id);
    if (error) { showStatus(error.message, true); return; }
    await loadGallerySubmissions();
    showStatus(`Submission marked ${entry.moderationStatus}.`);
    render();
    return;
  }
  content = repository.saveLocalDraft(content);
  if (section === "icons") {
    const overrides = Object.fromEntries(content.icons.filter((icon) => icon.remoteIconUrl).map((icon) => [icon.applicationId, icon.remoteIconUrl]));
    localStorage.setItem("awaken.iconOverrides", JSON.stringify(overrides));
  }
  showStatus("Saved. The public desktop will use this local preview after refresh.");
  render();
}

async function loadGallerySubmissions() {
  if (!authClient) { content.gallerySubmissions = []; showStatus("Supabase Auth is unavailable.", true); return; }
  const { data: sessionData } = await authClient.auth.getSession();
  if (!sessionData.session) { content.gallerySubmissions = []; showStatus("Sign in to load Gallery submissions.", true); return; }
  if (!hasAdminRole(sessionData.session)) { content.gallerySubmissions = []; showStatus("This account does not have the admin role.", true); return; }
  const { data, error } = await authClient.from("gallery_submissions").select("id,title,creator,image_path,mime_type,byte_size,width,height,atlas_entity_id,moderation_status,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) { content.gallerySubmissions = []; showStatus(error.message, true); return; }
  content.gallerySubmissions = data.map((row) => ({ id: row.id, title: row.title, creator: row.creator, imagePath: row.image_path, mimeType: row.mime_type, byteSize: row.byte_size, width: row.width, height: row.height, atlasEntityId: row.atlas_entity_id || "", moderationStatus: row.moderation_status, createdAt: row.created_at }));
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
  if (type === "json") return `<label class="field field-wide">${label}<textarea name="${key}" spellcheck="false">${escapeHtml(JSON.stringify(value || {}, null, 2))}</textarea></label>`;
  if (type === "csv") return `<label class="field">${label}<input name="${key}" type="text" value="${escapeHtml((Array.isArray(value) ? value : [value]).filter(Boolean).join(", "))}" /></label>`;
  if (type === "select") return `<label class="field">${label}<select name="${key}" ${required ? "required" : ""}>${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${titleCase(option)}</option>`).join("")}</select></label>`;
  if (type === "checkbox") return `<label class="field"><span>${label}</span><input name="${key}" type="checkbox" ${value ? "checked" : ""} /></label>`;
  const displayValue = type === "datetime-local" && value ? String(value).slice(0, 16) : value;
  return `<label class="field">${label}<input name="${key}" type="${type}" value="${escapeHtml(String(displayValue))}" ${required ? "required" : ""} /></label>`;
}

function showWarnings(form, entry) {
  const warnings = [];
  if (entry.verificationStatus && entry.verificationStatus !== "verified") warnings.push("Factual verification is incomplete.");
  if ((entry.status === "published" || entry.status === "scheduled") && !entry.sourceRef) warnings.push("Add a source reference before remote publication.");
  if (section === "atlasEntities" && entry.publicVisible && !isAtlasEntityPublic(entry)) warnings.push("This entity fails the public publication, verification, or confidence boundary and will remain private.");
  if (section === "atlasRelationships" && entry.publicVisible && !isAtlasRelationshipPublic(entry)) warnings.push("This relationship is not verified strongly enough for public output.");
  if ((section === "atlasEntities" || section === "atlasRelationships") && !(entry.sourceRefs || []).length) warnings.push("Link at least one source before remote publication.");
  form.querySelector("[data-warning]").innerHTML = warnings.map((warning) => `<p class="warning">${warning}</p>`).join("");
}

function showStatus(message, error = false) { const status = document.getElementById("admin-status"); status.textContent = message; status.style.background = error ? "#9b1711" : "#1f6d35"; status.hidden = false; setTimeout(() => { status.hidden = true; }, 3500); }
function titleCase(value) { return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char])); }

render();
