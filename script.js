import { defaultContent } from "./src/content/default-content.js";
import { iconManifest } from "./src/content/icon-manifest.js";
import { addMemoryItem, emptyMemoryCard, loadMemoryCard, removeMemoryItem, saveMemoryCard, setDismissal } from "./src/domain/memory-card.js";
import { normalizeMedia } from "./src/domain/media.js";
import { selectTransmissions } from "./src/domain/scheduling.js";
import { ContentRepository } from "./src/data/content-repository.js";
import { brandAssets } from "./src/content/brand-assets.js";
import { AWAKEN_EVENTS, awakenBus } from "./src/system/event-bus.js";
import { createSupabaseRestClient } from "./src/data/supabase-client.js";
import { CommunityRepository } from "./src/data/community-repository.js";
import { SupabaseCommunityAdapter } from "./src/data/adapters/supabase-community-adapter.js";
import { renderMindApp } from "./src/apps/mind/mind-app.js";
import { renderMediaPlayer } from "./src/apps/media-player/media-player.js";

const BOOT_MESSAGES = [
  "AWAKEN OS v4.2",
  "A:\\",
  "Loading user profile...",
  "Restoring previous session...",
  "Loading archive index...",
  "Loading preferences...",
  "Ready."
];

const LINKS = {
  website: "https://awakencult.com/",
  instagram: "https://instagram.com/awakencult",
  x: "https://x.com/awakencult",
  youtube: "https://www.youtube.com/@awakencult",
  discord: "https://discord.gg/3hTnm3Pgy2",
  vzn: "https://vzn.awakencult.com/",
  noise: "https://noise.awakencult.com/",
  soundcloud: "https://soundcloud.com/awakencult",
  appleArtist: "https://music.apple.com/za/artist/awaken-cult/1448907538"
};

const PROJECTS = [
  {
    id: "xp",
    title: "XP",
    type: "EP",
    year: "2019",
    path: "A:\\Archive\\2019\\XP",
    installed: "2019-01-08",
    size: "5 tracks",
    health: 92,
    status: "Recovered",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/93/7f/3f/937f3f4b-ff02-3056-e2cb-7bc517439a65/628810044061.png/600x600bb.jpg",
    url: "https://music.apple.com/za/album/xp-ep/1448922005",
    tags: ["xp", "ep", "2019", "hip-hop", "archive"],
    readme: "Xp - EP. AWAKEN CULT catalog release. Copyright listed as 2017 AWAKEN CULT; Apple Music release date 2019-01-08.",
    tracks: ["Poppin' Off", "White Flowers", "Hard", "Shoot"]
  },
  {
    id: "hated",
    title: "HATED",
    type: "Album",
    year: "2019",
    path: "A:\\Archive\\2019\\HATED",
    installed: "2019-10-11",
    size: "15 tracks",
    health: 98,
    status: "Recovered",
    cover: "assets/img/hated.webp",
    url: "https://music.apple.com/za/album/hated-deluxe-edition/1483667677",
    tags: ["hated", "album", "deluxe", "2019", "josh otis", "dav33"],
    readme: "Hated (Deluxe Edition). AWAKEN CULT ENTERPRISE (PTY) LTD. Apple Music lists 15 tracks and an Alternative genre tag.",
    tracks: ["OYE", "Due Time", "Hop Out", "Welsh Ponies", "Human", "Run"]
  },
  {
    id: "xpv2",
    title: "XPV2",
    type: "EP",
    year: "2021",
    path: "A:\\Archive\\2021\\XPV2",
    installed: "2021-07-01",
    size: "4 tracks",
    health: 87,
    status: "Partial",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/6e/54/646e5467-9fa2-9c45-9d05-913edd219757/artwork.jpg/600x600bb.jpg",
    url: "https://music.apple.com/za/album/xpv2-ep/1574765564",
    tags: ["xpv2", "xp", "2021", "dav33", "nashe"],
    readme: "XPV2 - EP. AWAKEN ENTERPRISES (PTY) LTD. Apple Music release date 2021-07-01.",
    tracks: ["JUDUS.", "CRYSTAL.", "HEAVN."]
  },
  {
    id: "new-swag",
    title: "NEW SWAG WHO DIS?",
    type: "Single",
    year: "2021",
    path: "A:\\Archive\\2021\\NEW_SWAG_WHO_DIS",
    installed: "2021-08-20",
    size: "1 track",
    health: 91,
    status: "Recovered",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f9/d1/b5/f9d1b508-1832-9201-a5c4-ea4a29db210a/artwork.jpg/600x600bb.jpg",
    url: "https://music.apple.com/za/album/new-swag-who-dis-feat-josh-otis-pari%24-single/1581835842",
    tags: ["new swag", "josh otis", "pari", "single", "2021"],
    readme: "NEW SWAG WHO DIS? featuring Josh Otis and PARI$. Apple Music release date 2021-08-20.",
    tracks: ["NEW SWAG WHO DIS?"]
  },
  {
    id: "central-african-time",
    title: "CENTRAL AFRICAN TIME",
    type: "Single",
    year: "2022",
    path: "A:\\Archive\\2022\\CENTRAL_AFRICAN_TIME",
    installed: "2022-04-22",
    size: "1 track",
    health: 95,
    status: "Recovered",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/c8/01/39/c801390d-1ba5-9073-c99f-5afaa1eba600/artwork.jpg/600x600bb.jpg",
    url: "https://music.apple.com/za/album/central-african-time-feat-josh-otis-single/1620423087",
    tags: ["central african time", "cat", "josh otis", "2022", "single"],
    readme: "CENTRAL AFRICAN TIME featuring Josh Otis. Apple Music lists Hip-Hop/Rap and Worldwide genre tags.",
    tracks: ["CENTRAL AFRICAN TIME"]
  },
  {
    id: "state-of-mind",
    title: "State Of Mind",
    type: "EP",
    year: "2022",
    path: "A:\\Archive\\2022\\STATE_OF_MIND",
    installed: "2022-06-28",
    size: "5 tracks",
    health: 93,
    status: "Recovered",
    cover: "assets/img/state-of-mind-updated.jpg",
    url: "https://music.apple.com/za/album/state-of-mind-ep/1656676894",
    tags: ["state of mind", "rush hour", "piccadilly circus", "noise", "josh otis", "nashe"],
    readme: "State Of Mind - EP. Includes Rush Hour, 22, Noise, and Piccadilly Circus in verified Apple Music metadata.",
    tracks: ["Rush Hour", "22", "Noise", "Piccadilly Circus"]
  },
  {
    id: "noise",
    title: "NOISE",
    type: "Tool / Collection",
    year: "2026",
    path: "A:\\Archive\\2026\\NOISE",
    installed: "2026-07-09",
    size: "public web tool",
    health: 89,
    status: "Online",
    cover: "assets/img/secret-photo.webp",
    url: LINKS.noise,
    tags: ["noise", "artwork", "tool", "canvas", "export"],
    readme: "NOISE is live at noise.awakencult.com. Public page describes an offline node graph, mobile stack, overlays, format nodes, and export presets.",
    tracks: []
  }
];

const APPS = [
  { id: "archive", title: "Archive", kind: "Folder", icon: "A:", action: () => openExplorer("A:\\Archive") },
  { id: "memory", title: "Memory Card", kind: "Program", icon: "MC", action: openMemoryCard },
  { id: "music", title: "Media Player", kind: "Program", icon: "MP", action: openMusic },
  { id: "mind", title: "MIND", kind: "Program", icon: "AI", action: openMind },
  { id: "community", title: "Community", kind: "Program", icon: "CM", action: openCommunity },
  { id: "shop", title: "Shop", kind: "Program", icon: "$", action: openShop },
  { id: "live", title: "LIVE INTERNET", kind: "Program", icon: "IN", action: openLiveInternet },
  { id: "vzn", title: "VZN", kind: "Link", icon: "VZ", action: () => openPortal("VZN", LINKS.vzn, "Spatial social world by AWAKEN CULT.") },
  { id: "noise-app", title: "NOISE", kind: "Link", icon: "N0", action: () => openPortal("NOISE", LINKS.noise, "Artwork node graph and export tool.") },
  { id: "soundcloud", title: "SoundCloud", kind: "Link", icon: "SC", action: () => openPortal("SoundCloud", LINKS.soundcloud, "Stream tracks, albums, playlists, and AWAKEN CULT profile audio.") },
  { id: "terminal", title: "Terminal", kind: "Program", icon: ">_", action: openTerminal },
  { id: "settings", title: "Settings", kind: "Program", icon: "ST", action: openSettings },
  { id: "trash", title: "Trash", kind: "Folder", icon: "TR", action: () => openText("Trash", "A:\\Trash is empty.\nRecovered files are not deleted. They wait.") }
];

const SOCIALS = [
  { title: "Website", detail: "Official landing page", url: LINKS.website },
  { title: "Instagram", detail: "Confirmed @awakencult profile. Public metadata showed 6,909 followers, 36 following, 77 posts during research.", url: LINKS.instagram },
  { title: "X", detail: "Confirmed @awakencult profile. Public page lists Global, joined August 2017, 2,641 followers.", url: LINKS.x },
  { title: "YouTube", detail: "Confirmed @awakencult channel. Public page lists 104 subscribers and 3 videos.", url: LINKS.youtube },
  { title: "Discord", detail: "Primary community invite.", url: LINKS.discord },
  { title: "VZN", detail: "Live app: Explore AWAKEN CULT's spatial social world.", url: LINKS.vzn },
  { title: "NOISE", detail: "Live artwork tool with node graph, mobile editor, overlays, and export presets.", url: LINKS.noise },
  { title: "SoundCloud", detail: "AWAKEN CULT music profile.", url: LINKS.soundcloud },
  { title: "Apple Music", detail: "Verified artist catalog page.", url: LINKS.appleArtist }
];

const WALLPAPERS = [
  { id: "awaken-default", title: "AWAKEN Default", color: "#da4a44", image: brandAssets.wallpaperDefault, mode: "cover", detail: "standard AWAKEN system wallpaper" },
  { id: "awaken-red", title: "AWAKEN Red", color: "#da4a44", detail: "offline solid system wallpaper" },
  { id: "xp-teal", title: "XP Teal", color: "#008080", detail: "classic desktop teal" },
  { id: "xp-blue", title: "XP Blue", color: "#245edb", detail: "classic system blue" },
  { id: "xp-olive", title: "XP Olive", color: "#6f7f2a", detail: "classic olive option" },
  { id: "xp-silver", title: "XP Silver", color: "#b7bcc8", detail: "classic silver option" },
  { id: "black", title: "Black", color: "#050505", detail: "low light terminal mode" }
];

const FILES = [
  ...PROJECTS.map((project) => ({
    name: `${project.title}.pkg`,
    type: "Package",
    size: project.size,
    modified: project.installed,
    path: project.path,
    project: project.id,
    tags: project.tags
  })),
  { name: "discord.url", type: "Link", size: "invite", modified: "live", path: "A:\\Community\\discord.url", url: LINKS.discord, tags: ["discord", "community"] },
  { name: "MIND.exe", type: "App", size: "program", modified: "live", path: "A:\\Community\\XP\\MIND.exe", app: { action: openMind }, tags: ["discord", "mind", "xp", "community"] },
  { name: "vzn.lnk", type: "Link", size: "app", modified: "live", path: "A:\\Programs\\vzn.lnk", url: LINKS.vzn, tags: ["vzn", "social canvas"] },
  { name: "noise.lnk", type: "Link", size: "app", modified: "live", path: "A:\\Programs\\noise.lnk", url: LINKS.noise, tags: ["noise", "art"] },
  { name: "awaken-logo.webp", type: "Image", size: "local", modified: "asset", path: "A:\\Archive\\Assets\\awaken-logo.webp", src: "assets/img/awaken-logo.webp", tags: ["logo", "brand"] },
  { name: "hated-tyla-sabrina.webp", type: "Image", size: "local", modified: "asset", path: "A:\\Archive\\2019\\HATED\\hated-tyla-sabrina.webp", src: "assets/img/hated-tyla-sabrina.webp", tags: ["hated", "photo"] },
  { name: "otis-grade.png", type: "Image", size: "local", modified: "asset", path: "A:\\Archive\\2022\\CENTRAL_AFRICAN_TIME\\otis-grade.png", src: "assets/img/otis-grade.png", tags: ["josh otis", "photo"] },
  { name: "secret-wallpaper.webp", type: "Image", size: "local", modified: "asset", path: "A:\\Wallpapers\\secret-wallpaper.webp", src: "assets/img/secret-wallpaper.webp", tags: ["wallpaper", "anticalvin"] },
  { name: "README.txt", type: "Text", size: "3 KB", modified: "system", path: "A:\\README.txt", content: "AWAKEN NETWORK is the operating system AWAKEN members use.\nThe shell organizes real archive, music, community, VZN, NOISE, and social links.", tags: ["readme", "system"] }
];

let highestZ = 210;
let currentPath = "A:\\";
let windowCount = 0;
let terminalPath = "A:\\";
let managedContent = defaultContent;
let memoryCard = emptyMemoryCard();
const repository = new ContentRepository();
const supabaseClient = createSupabaseRestClient();
const communityRepository = new CommunityRepository({ adapter: new SupabaseCommunityAdapter(supabaseClient) });
const sessionDisplays = {};
let bootFinished = false;

const bootloader = document.getElementById("bootloader");
const osContainer = document.getElementById("os-container");
const workArea = document.getElementById("work-area");
const startMenu = document.getElementById("start-menu");
const taskButtons = document.getElementById("task-buttons");

async function init() {
  memoryCard = loadMemoryCard();
  const loaded = await repository.getPublicContent();
  managedContent = loaded.content;
  document.getElementById("boot-skip").addEventListener("click", finishBoot);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && bootloader.style.display !== "none") finishBoot();
    if (event.key === "Escape") closeStartMenu();
  });
  runBoot();
}

function runBoot() {
  const skipBoot = localStorage.getItem("awakenBooted") === "true";
  const entryComplete = sessionStorage.getItem("awaken.entrySequenceComplete") === "true";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const debugSkip = new URLSearchParams(location.search).has("skipBoot");
  if (skipBoot || entryComplete || reducedMotion || debugSkip) {
    setTimeout(finishBoot, reducedMotion || debugSkip ? 0 : 900);
    return;
  }

  const bootText = document.getElementById("boot-text");
  let index = 0;
  const tick = () => {
    if (bootloader.style.display === "none") return;
    if (index < BOOT_MESSAGES.length) {
      bootText.textContent += `${BOOT_MESSAGES[index]}\n`;
      index += 1;
      setTimeout(tick, 240);
    } else {
      bootText.textContent += "\nClick Skip Boot or press Enter.";
    }
  };
  tick();
}

function finishBoot() {
  if (bootFinished) return;
  bootFinished = true;
  localStorage.setItem("awakenBooted", "true");
  applySavedWallpaper();
  bootloader.style.display = "none";
  osContainer.style.display = "block";
  updateClock();
  setInterval(updateClock, 30000);
  buildDesktop();
  bindStartMenu();
  openExplorer("A:\\Archive");
  scheduleTransmissions();
}

function updateClock() {
  const now = new Date();
  const label = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("top-clock").textContent = label;
  document.getElementById("task-clock").textContent = label;
}

function buildDesktop() {
  const desktop = document.getElementById("desktop-icons");
  desktop.innerHTML = "";
  iconManifest.filter((icon) => icon.enabled && icon.desktop).sort((a, b) => a.sortOrder - b.sortOrder).forEach((manifest) => {
    const id = manifest.applicationId;
    const app = APPS.find((item) => item.id === id);
    if (app) desktop.appendChild(iconButton(app, manifest));
  });
}

function iconButton(app, manifest = {}) {
  const button = document.createElement("button");
  button.className = "desktop-icon";
  button.type = "button";
  const image = manifest.imageSource ? `<img src="${manifest.imageSource}" alt="${manifest.alt || ""}" loading="lazy" />` : "";
  button.innerHTML = `<span class="desktop-glyph">${image}<b>${manifest.fallbackText || app.icon}</b></span><span>${manifest.label || app.title}</span>`;
  const img = button.querySelector("img");
  if (img) img.addEventListener("error", () => img.remove());
  button.addEventListener("click", app.action);
  return button;
}

function bindStartMenu() {
  document.getElementById("start-button").addEventListener("click", toggleStartMenu);
  document.getElementById("start-search").addEventListener("input", (event) => renderStartList(event.target.value));
  document.querySelector("[data-action='run']").addEventListener("click", () => {
    closeStartMenu();
    openTerminal("run");
  });
  document.querySelector("[data-action='reboot']").addEventListener("click", () => {
    localStorage.removeItem("awakenBooted");
    location.reload();
  });
  renderStartList("");
}

function toggleStartMenu() {
  if (startMenu.hidden) {
    renderStartList("");
    startMenu.hidden = false;
    document.getElementById("start-search").value = "";
    document.getElementById("start-button").setAttribute("aria-expanded", "true");
  } else {
    closeStartMenu();
  }
}

function closeStartMenu() {
  startMenu.hidden = true;
  document.getElementById("start-button").setAttribute("aria-expanded", "false");
}

function renderStartList(term) {
  const list = document.getElementById("start-list");
  const filtered = term
    ? searchAll(term).slice(0, 18)
    : APPS.filter((app) => app.id !== "trash").map((app) => ({ title: app.title, kind: app.kind, icon: app.icon, action: app.action })).slice(0, 14);
  list.innerHTML = "";
  filtered.forEach((entry) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "start-row";
    row.innerHTML = `<span>${entry.icon || "FL"}</span><span><strong>${entry.title}</strong><small>${entry.kind}</small></span><small>${entry.path || ""}</small>`;
    row.addEventListener("click", () => {
      closeStartMenu();
      entry.action();
    });
    list.appendChild(row);
  });
}

function createWindow(title, options = {}) {
  const win = document.createElement("section");
  win.className = "window";
  win.dataset.id = `window-${++windowCount}`;
  win.style.left = `${70 + (windowCount % 5) * 28}px`;
  win.style.top = `${44 + (windowCount % 5) * 22}px`;
  win.style.zIndex = ++highestZ;
  if (options.wide) win.style.width = "min(860px, calc(100vw - 36px))";

  const header = document.createElement("div");
  header.className = "window-header";
  header.innerHTML = `<div class="window-title">${title}</div>`;

  const controls = document.createElement("div");
  controls.className = "window-controls";
  const min = document.createElement("button");
  min.className = "minimize";
  min.type = "button";
  min.textContent = "_";
  min.title = "Minimize";
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "x";
  close.title = "Close";
  controls.append(min, close);
  header.appendChild(controls);

  const content = document.createElement("div");
  content.className = "window-content";
  if (options.className) content.classList.add(options.className);

  win.append(header, content);
  workArea.appendChild(win);
  makeActive(win);
  makeDraggable(win, header);

  const task = addTask(win, title);
  close.addEventListener("click", (event) => {
    event.stopPropagation();
    win.dispatchEvent(new CustomEvent("awaken:window-close"));
    task.remove();
    win.remove();
  });
  min.addEventListener("click", (event) => {
    event.stopPropagation();
    win.hidden = true;
    task.classList.remove("active");
  });
  win.addEventListener("pointerdown", () => makeActive(win));
  return { win, content };
}

function makeActive(win) {
  document.querySelectorAll(".window").forEach((node) => node.classList.remove("active"));
  document.querySelectorAll(".task-item").forEach((node) => node.classList.remove("active"));
  win.classList.add("active");
  win.style.zIndex = ++highestZ;
  const task = document.querySelector(`[data-window-task="${win.dataset.id}"]`);
  if (task) task.classList.add("active");
}

function makeDraggable(win, handle) {
  let startX = 0;
  let startY = 0;
  let left = 0;
  let top = 0;
  handle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button") || window.matchMedia("(max-width: 760px)").matches) return;
    startX = event.clientX;
    startY = event.clientY;
    const rect = win.getBoundingClientRect();
    left = rect.left;
    top = rect.top;
    handle.setPointerCapture(event.pointerId);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop, { once: true });
  });

  function move(event) {
    win.style.left = `${Math.max(0, left + event.clientX - startX)}px`;
    win.style.top = `${Math.max(0, top + event.clientY - startY)}px`;
  }

  function stop() {
    handle.removeEventListener("pointermove", move);
  }
}

function addTask(win, title) {
  const task = document.createElement("button");
  task.type = "button";
  task.className = "task-item active";
  task.dataset.windowTask = win.dataset.id;
  task.textContent = title;
  task.addEventListener("click", () => {
    win.hidden = !win.hidden && win.classList.contains("active");
    if (!win.hidden) makeActive(win);
  });
  document.querySelectorAll(".task-item").forEach((node) => node.classList.remove("active"));
  taskButtons.appendChild(task);
  return task;
}

function openExplorer(path = "A:\\") {
  currentPath = normalizePath(path);
  document.getElementById("path-label").textContent = currentPath;
  const { content } = createWindow(`Explorer - ${currentPath}`, { wide: true });
  renderExplorer(content, currentPath);
}

function renderExplorer(content, path) {
  const entries = getEntriesForPath(path);
  content.innerHTML = "";
  const bar = document.createElement("div");
  bar.className = "explorer-bar";
  bar.innerHTML = `
    <button type="button" data-nav="back">Back</button>
    <button type="button" data-nav="up">Up</button>
    <input class="address" value="${path}" aria-label="Address" />
    <button type="button" data-nav="go">Go</button>
  `;
  content.appendChild(bar);

  const address = bar.querySelector(".address");
  bar.querySelector("[data-nav='back']").addEventListener("click", () => openExplorer("A:\\"));
  bar.querySelector("[data-nav='up']").addEventListener("click", () => openExplorer(parentPath(path)));
  bar.querySelector("[data-nav='go']").addEventListener("click", () => openExplorer(address.value));
  address.addEventListener("keydown", (event) => {
    if (event.key === "Enter") openExplorer(address.value);
  });

  const list = document.createElement("div");
  list.className = "explorer-list";
  list.innerHTML = `<div class="file-row header"><span></span><span>Name</span><span>Type</span><span>Size</span><span>Modified</span></div>`;
  entries.forEach((entry) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "file-row";
    row.innerHTML = `<span>${iconFor(entry.type)}</span><span>${entry.name}</span><span>${entry.type}</span><span>${entry.size || "--"}</span><span>${entry.modified || "--"}</span>`;
    row.addEventListener("click", () => openEntry(entry));
    list.appendChild(row);
  });
  content.appendChild(list);
}

function getEntriesForPath(path) {
  const p = normalizePath(path).toLowerCase();
  if (p === "a:\\" || p === "a:") {
    return [
      folder("Archive", "A:\\Archive"),
      folder("Packages", "A:\\Packages"),
      folder("Programs", "A:\\Programs"),
      folder("Community", "A:\\Community"),
      folder("Team", "A:\\Team"),
      folder("Wallpapers", "A:\\Wallpapers"),
      fileByName("README.txt")
    ];
  }
  if (p.includes("archive\\2019")) return packageEntries(["xp", "hated"]);
  if (p.includes("archive\\2021")) return packageEntries(["xpv2", "new-swag"]);
  if (p.includes("archive\\2022")) return packageEntries(["central-african-time", "state-of-mind"]);
  if (p.includes("archive\\2026")) return packageEntries(["noise"]);
  if (p.endsWith("archive")) {
    return [folder("2019", "A:\\Archive\\2019"), folder("2021", "A:\\Archive\\2021"), folder("2022", "A:\\Archive\\2022"), folder("2026", "A:\\Archive\\2026"), folder("Assets", "A:\\Archive\\Assets")];
  }
  if (p.endsWith("packages")) return packageEntries(PROJECTS.map((project) => project.id));
  if (p.endsWith("programs")) return APPS.filter((app) => app.id !== "trash").map((app) => ({ name: `${app.title}.exe`, type: "App", size: "program", modified: "system", app }));
  if (p.endsWith("community")) return [folder("XP", "A:\\Community\\XP"), fileByName("discord.url"), ...SOCIALS.map((link) => ({ name: `${link.title}.url`, type: "Link", size: "external", modified: "live", url: link.url, detail: link.detail }))];
  if (p.endsWith("community\\xp")) return [fileByName("MIND.exe"), { name: "xp-channel.url", type: "Link", size: "invite", modified: "live", url: LINKS.discord, detail: "Open the real AWAKEN Discord XP channel." }];
  if (p.endsWith("team")) return [{ name: "TEAM_ACCESS_REQUIRED.txt", type: "Text", size: "protected", modified: "system", content: "A:\\Team exists in the live filesystem. Access is controlled by Supabase RLS and trusted admin/team claims.", tags: ["team", "protected"] }];
  if (p.endsWith("wallpapers")) {
    return [
      ...WALLPAPERS.map((wallpaper) => ({ name: `${wallpaper.title}.theme`, type: "Theme", size: wallpaper.image ? "image" : wallpaper.color, modified: "system", wallpaper })),
      ...FILES.filter((file) => file.tags.includes("wallpaper"))
    ];
  }
  if (p.endsWith("assets")) return FILES.filter((file) => file.type === "Image");
  return [fileByName("README.txt")];
}

function folder(name, path) {
  return { name, type: "Folder", size: "--", modified: "system", path };
}

function packageEntries(ids) {
  return ids.map((id) => {
    const project = PROJECTS.find((item) => item.id === id);
    return { name: `${project.title}.pkg`, type: "Package", size: project.size, modified: project.installed, project: id, path: project.path };
  });
}

function fileByName(name) {
  return FILES.find((file) => file.name === name);
}

function openEntry(entry) {
  if (entry.type === "Folder") openExplorer(entry.path);
  if (entry.type === "Package") openPackage(entry.project);
  if (entry.type === "App") entry.app.action();
  if (entry.type === "Link") openPortal(entry.name.replace(".url", ""), entry.url, entry.detail || "External AWAKEN NETWORK link.");
  if (entry.type === "Image") openImage(entry);
  if (entry.type === "Text") openText(entry.name, entry.content);
  if (entry.type === "Theme") setWallpaper(entry.wallpaper);
}

function openPackage(id) {
  const project = PROJECTS.find((item) => item.id === id);
  if (!project) return;
  document.getElementById("path-label").textContent = project.path;
  const { content } = createWindow(`${project.title} Drive`, { wide: true });
  content.innerHTML = `
    <div class="cards">
      <article class="card">
        <img src="${project.cover}" alt="${project.title} artwork" />
        <div class="card-body">
          <strong>${project.title}</strong>
          <p>${project.type} / ${project.year}</p>
          <button type="button" data-open-link>Open Source</button>
          <button type="button" data-save>Save</button>
        </div>
      </article>
      <section>
        <h2>${project.title}</h2>
        <p>${project.readme}</p>
        <div class="meta-grid">
          <div class="meta"><strong>Installed</strong><br>${project.installed}</div>
          <div class="meta"><strong>Size</strong><br>${project.size}</div>
          <div class="meta"><strong>Status</strong><br>${project.status}</div>
          <div class="meta"><strong>Path</strong><br>${project.path}</div>
        </div>
        <div class="health" aria-label="Drive health"><span style="width:${project.health}%"></span></div>
        <h3>Contents</h3>
        <div class="explorer-list">
          ${["README.txt", "Artwork", "Music", "Photos", "Links"].map((item) => `<div class="file-row"><span>${iconFor(item)}</span><span>${item}</span><span>Folder</span><span>--</span><span>${project.year}</span></div>`).join("")}
        </div>
      </section>
    </div>
  `;
  content.querySelector("[data-open-link]").addEventListener("click", () => window.open(project.url, "_blank", "noopener"));
  content.querySelector("[data-save]").addEventListener("click", (event) => saveExplicit(event.currentTarget, { id: project.id, type: "archive", title: project.title, path: project.path, url: project.url }));
}

function openMusic() {
  const { win, content } = createWindow("AWAKEN Media Player", { wide: true, className: "media-window" });
  const cleanup = renderMediaPlayer(content, { projects: PROJECTS, links: LINKS, audio: document.getElementById("audio-snippet") });
  win.addEventListener("awaken:window-close", cleanup, { once: true });
}

function openMind() {
  const { win, content } = createWindow("MIND - XP CHANNEL", { wide: true, className: "mind-window" });
  const cleanup = renderMindApp(content, { repository: communityRepository, inviteUrl: LINKS.discord });
  win.addEventListener("awaken:window-close", cleanup, { once: true });
}

function openCommunity() {
  const { content } = createWindow("Community", { wide: true });
  content.innerHTML = `
    <div class="portal-row">
      <div><strong>Community channel open.</strong><small>Discord is the primary live community link until API/widget access is added.</small></div>
      <button type="button" data-mind>Open MIND</button>
      <button type="button" data-discord>Open Discord</button>
    </div>
    ${SOCIALS.slice(4, 8).map((item) => portalMarkup(item)).join("")}
  `;
  content.querySelector("[data-mind]").addEventListener("click", openMind);
  content.querySelector("[data-discord]").addEventListener("click", () => window.open(LINKS.discord, "_blank", "noopener"));
  bindPortalButtons(content);
}

function openShop() {
  const { win, content } = createWindow("AWAKEN Shop - In Development", { wide: true, className: "shop-window" });
  content.innerHTML = `
    <div class="shop-screen" aria-label="AWAKEN Shop in development">
      <canvas class="pipes-canvas" aria-hidden="true"></canvas>
      <div class="shop-status">
        <img src="assets/img/awaken-logo.webp" alt="AWAKEN CULT" />
        <p>SHOP.EXE</p>
        <strong>IN DEVELOPMENT</strong>
        <small>Catalog connection pending.</small>
      </div>
      <div class="shop-progress" aria-label="Development status"><span></span></div>
    </div>
  `;
  runPipes(content.querySelector(".pipes-canvas"), win);
}

function runPipes(canvas, win) {
  const context = canvas.getContext("2d");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const palette = ["#da4a44", "#00a86b", "#245edb", "#f2c94c", "#d8d8d8"];
  let width = 0;
  let height = 0;
  let frame = 0;
  let segments = [];
  let heads = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    canvas.width = Math.floor(width * scale);
    canvas.height = Math.floor(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    segments = [];
    heads = Array.from({ length: width < 500 ? 3 : 6 }, (_, index) => ({
      x: (index + 1) * width / 7,
      y: (index % 3 + 1) * height / 4,
      dx: index % 2 ? 1 : -1,
      dy: index % 3 ? 0 : 1,
      color: palette[index % palette.length]
    }));
  }

  function draw() {
    if (!win.isConnected) return;
    context.fillStyle = "#050505";
    context.fillRect(0, 0, width, height);
    context.lineCap = "round";
    segments.slice(-180).forEach((segment) => {
      context.strokeStyle = segment.color;
      context.lineWidth = 11;
      context.beginPath();
      context.moveTo(segment.x1, segment.y1);
      context.lineTo(segment.x2, segment.y2);
      context.stroke();
      context.fillStyle = "rgba(255,255,255,.45)";
      context.beginPath();
      context.arc(segment.x2, segment.y2, 3, 0, Math.PI * 2);
      context.fill();
    });

    if (!reducedMotion && frame % 8 === 0) {
      heads.forEach((head) => advancePipe(head));
    }
    frame += 1;
    if (!reducedMotion) requestAnimationFrame(draw);
  }

  function advancePipe(head) {
    const step = Math.max(22, Math.min(width, height) / 11);
    const x1 = head.x;
    const y1 = head.y;
    head.x += head.dx * step;
    head.y += head.dy * step;
    if (head.x < 16 || head.x > width - 16 || head.y < 16 || head.y > height - 16) {
      head.x = Math.min(width - 16, Math.max(16, head.x));
      head.y = Math.min(height - 16, Math.max(16, head.y));
      turnPipe(head);
    } else if (Math.random() < 0.28) {
      turnPipe(head);
    }
    segments.push({ x1, y1, x2: head.x, y2: head.y, color: head.color });
  }

  function turnPipe(head) {
    if (head.dx) {
      head.dy = Math.random() < 0.5 ? -1 : 1;
      head.dx = 0;
    } else {
      head.dx = Math.random() < 0.5 ? -1 : 1;
      head.dy = 0;
    }
    if (Math.random() < 0.18) head.color = palette[Math.floor(Math.random() * palette.length)];
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  if (reducedMotion) heads.forEach((head) => { for (let i = 0; i < 8; i += 1) advancePipe(head); });
  draw();
}

function openLiveInternet() {
  const { content } = createWindow("LIVE INTERNET", { wide: true });
  content.innerHTML = SOCIALS.map((item) => portalMarkup(item)).join("");
  bindPortalButtons(content);
}

function portalMarkup(item) {
  return `<div class="portal-row"><div><strong>${item.title}</strong><small>${item.detail}</small></div><button type="button" data-url="${item.url}">Open</button></div>`;
}

function bindPortalButtons(container) {
  container.querySelectorAll("[data-url]").forEach((button) => {
    button.addEventListener("click", () => window.open(button.dataset.url, "_blank", "noopener"));
  });
}

function openPortal(title, url, detail) {
  const { content } = createWindow(title);
  content.innerHTML = `
    <div class="portal-row">
      <div><strong>${title}</strong><small>${detail}</small></div>
      <button type="button" data-url="${url}">Open</button>
      <button type="button" data-save-link>Save</button>
    </div>
    <p>${url}</p>
  `;
  bindPortalButtons(content);
  content.querySelector("[data-save-link]").addEventListener("click", (event) => saveExplicit(event.currentTarget, { id: url, type: "link", title, url }));
}

function openImage(file) {
  const { content } = createWindow(file.name, { wide: true });
  const media = normalizeMedia({ id: file.path, src: file.src || file.url, sourceUrl: file.sourceUrl, caption: file.caption, credit: file.credit });
  content.innerHTML = media.missing
    ? `<div class="empty-state">Image unavailable.</div>`
    : `<img class="viewer-image" src="${media.fullSource}" alt="${file.name}" loading="lazy" /><p>${file.path || media.sourceUrl || ""}</p><button type="button" data-save-image>Save image</button>`;
  const image = content.querySelector("img");
  if (image) image.addEventListener("error", () => image.replaceWith(Object.assign(document.createElement("div"), { className: "empty-state", textContent: "Image unavailable." })));
  content.querySelector("[data-save-image]")?.addEventListener("click", (event) => saveExplicit(event.currentTarget, { id: media.id, type: "image", title: file.name, src: media.fullSource }));
}

function saveExplicit(button, item) {
  memoryCard = saveMemoryCard(addMemoryItem(memoryCard, item));
  button.textContent = "Saved";
  button.disabled = true;
}

function openMemoryCard() {
  const { content } = createWindow("Memory Card", { wide: true });
  renderMemoryCard(content);
}

function renderMemoryCard(content) {
  content.innerHTML = `<div class="toolbar"><strong>${memoryCard.items.length} saved</strong><button type="button" data-reset-memory>Reset card</button></div><div data-memory-items></div>`;
  const list = content.querySelector("[data-memory-items]");
  if (!memoryCard.items.length) {
    list.innerHTML = `<div class="empty-state">${escapeHtml(managedContent.interface?.memoryCardEmpty || defaultContent.interface.memoryCardEmpty)}</div>`;
  } else {
    memoryCard.items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "memory-row";
      row.innerHTML = `<div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.type)} / saved ${new Date(item.savedAt).toLocaleDateString()}</small></div><button type="button">Remove</button>`;
      row.querySelector("button").addEventListener("click", () => {
        memoryCard = saveMemoryCard(removeMemoryItem(memoryCard, item.type, item.id));
        renderMemoryCard(content);
      });
      list.appendChild(row);
    });
  }
  content.querySelector("[data-reset-memory]").addEventListener("click", () => {
    if (!confirm("Remove every saved Memory Card item and preference?")) return;
    memoryCard = saveMemoryCard(emptyMemoryCard());
    renderMemoryCard(content);
  });
}

function scheduleTransmissions() {
  const preview = new URLSearchParams(location.search).has("previewTransmissions");
  const selected = selectTransmissions(managedContent.transmissions || [], {
    now: new Date(),
    timezone: managedContent.timezone || "Africa/Johannesburg",
    mobile: matchMedia("(max-width: 760px)").matches,
    route: "desktop",
    dismissals: preview ? {} : memoryCard.dismissals,
    displayCounts: preview ? {} : sessionDisplays
  }, 1);
  selected.forEach((item) => setTimeout(() => showTransmission(item), Math.max(0, Number(item.delayMs) || 0)));
}

function showTransmission(item) {
  if (sessionDisplays[item.id]) return;
  sessionDisplays[item.id] = 1;
  awakenBus.emit(AWAKEN_EVENTS.TRANSMISSION_SHOWN, { id: item.id, destinationUrl: item.destinationUrl });
  const layer = document.getElementById("transmission-layer");
  const panel = document.createElement("aside");
  panel.className = "transmission";
  panel.innerHTML = `<div class="transmission-head"><strong>${escapeHtml(item.publicTitle)}</strong><button type="button" aria-label="Dismiss">x</button></div><p>${escapeHtml(item.primaryCopy)}</p>${item.secondaryCopy ? `<small>${escapeHtml(item.secondaryCopy)}</small>` : ""}<div class="transmission-actions"><button type="button" data-open>Open external link</button><button type="button" data-save>Save</button></div>`;
  const dismiss = () => {
    memoryCard = saveMemoryCard(setDismissal(memoryCard, item.id, { dismissed: true, at: new Date().toISOString(), scope: item.dismissal }));
    awakenBus.emit(AWAKEN_EVENTS.TRANSMISSION_DISMISSED, { id: item.id });
    panel.remove();
  };
  panel.querySelector("[aria-label='Dismiss']").addEventListener("click", dismiss);
  panel.querySelector("[data-open]").addEventListener("click", () => {
    awakenBus.emit(AWAKEN_EVENTS.TRANSMISSION_ACTION, { id: item.id, action: "open", destinationUrl: item.destinationUrl });
    window.open(item.destinationUrl, "_blank", "noopener");
  });
  panel.querySelector("[data-save]").addEventListener("click", (event) => saveExplicit(event.currentTarget, { id: item.id, type: "transmission", title: item.publicTitle, url: item.destinationUrl }));
  layer.appendChild(panel);
}

function openText(title, text) {
  const { content } = createWindow(title);
  content.innerHTML = `<pre>${escapeHtml(text || "")}</pre>`;
}

function openSettings() {
  const { content } = createWindow("Settings");
  const current = getComputedStyle(document.documentElement).getPropertyValue("--wallpaper-color").trim();
  content.innerHTML = `
    <p><strong>System restored.</strong></p>
    <p>Wallpaper color is controlled by <code>--wallpaper-color</code>. Current value: <code>${current}</code>.</p>
    <div class="settings-row">
      ${WALLPAPERS.map((wallpaper) => `<button type="button" data-wallpaper="${wallpaper.id}">${wallpaper.title}</button>`).join("")}
      <button type="button" data-reset>Show Boot Next Visit</button>
    </div>
  `;
  content.querySelectorAll("[data-wallpaper]").forEach((button) => {
    button.addEventListener("click", () => setWallpaper(WALLPAPERS.find((wallpaper) => wallpaper.id === button.dataset.wallpaper)));
  });
  content.querySelector("[data-reset]").addEventListener("click", () => localStorage.removeItem("awakenBooted"));
}

function setWallpaper(wallpaper) {
  const next = typeof wallpaper === "string" ? { color: wallpaper } : wallpaper;
  const color = next?.color || brandAssets.fallbackWallpaperColor;
  document.documentElement.style.setProperty("--wallpaper-color", color);
  document.documentElement.style.setProperty("--wallpaper-image", next?.image ? `url("${next.image}")` : "none");
  document.documentElement.style.setProperty("--wallpaper-size", next?.mode === "tile" ? "auto" : next?.mode || "cover");
  document.documentElement.style.setProperty("--wallpaper-repeat", next?.mode === "tile" ? "repeat" : "no-repeat");
  localStorage.setItem("awakenWallpaper", JSON.stringify(next || { color }));
}

function applySavedWallpaper() {
  const raw = localStorage.getItem("awakenWallpaper");
  const saved = raw ? safeJson(raw) || { color: raw } : WALLPAPERS[0];
  setWallpaper(saved);
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function openTerminal(prefill = "") {
  const { win, content } = createWindow("Terminal", { className: "terminal" });
  content.innerHTML = `<div class="terminal-output"></div><div class="terminal-input"><span>${terminalPath}&gt;</span><input aria-label="Terminal command" value="${prefill}" /></div>`;
  const output = content.querySelector(".terminal-output");
  const input = content.querySelector("input");
  print(output, ["AWAKEN NETWORK terminal", "Type help for commands."]);
  input.focus();
  win.addEventListener("click", () => input.focus());
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const command = input.value.trim();
    input.value = "";
    runCommand(command, output);
    content.querySelector(".terminal-input span").textContent = `${terminalPath}>`;
  });
}

function runCommand(command, output) {
  print(output, [`${terminalPath}> ${command}`]);
  const [cmd, ...rest] = command.split(" ");
  const arg = rest.join(" ");
  const lower = cmd.toLowerCase();
  if (!command) return;
  if (lower === "help") print(output, ["help, clear, dir, tree, cd <path>, open <name>, find <term>, type readme, scan, recover, whoami, version, discord"]);
  else if (lower === "clear") output.innerHTML = "";
  else if (lower === "dir") getEntriesForPath(terminalPath).forEach((entry) => print(output, [`${entry.type.padEnd(8)} ${entry.name}`]));
  else if (lower === "tree") print(output, ["A:\\", "  Archive\\2019\\XP", "  Archive\\2019\\HATED", "  Archive\\2021\\XPV2", "  Archive\\2022\\STATE_OF_MIND", "  Programs\\VZN", "  Programs\\NOISE"]);
  else if (lower === "cd") terminalPath = normalizePath(arg || "A:\\");
  else if (lower === "open") terminalOpen(arg, output);
  else if (lower === "find") searchAll(arg).slice(0, 12).forEach((item) => print(output, [`${item.kind}: ${item.title}`]));
  else if (lower === "type" && arg.toLowerCase() === "readme") print(output, [fileByName("README.txt").content]);
  else if (lower === "scan") print(output, ["3 live tools detected.", "7 catalog packages indexed.", "9 public network links verified."]);
  else if (lower === "recover") print(output, ["Recovered archive.", "Package incomplete.", "Signal stable."]);
  else if (lower === "whoami") print(output, ["visitor / public"]);
  else if (lower === "version") print(output, ["AWAKEN OS v4.2 static frontend"]);
  else if (lower === "discord") window.open(LINKS.discord, "_blank", "noopener");
  else print(output, [`Unknown command: ${command}`]);
  output.scrollTop = output.scrollHeight;
}

function terminalOpen(arg, output) {
  const target = arg.toLowerCase();
  const app = APPS.find((item) => item.title.toLowerCase() === target || item.id === target);
  const project = PROJECTS.find((item) => item.title.toLowerCase() === target || item.id === target);
  if (app) app.action();
  else if (project) openPackage(project.id);
  else if (target === "archive") openExplorer("A:\\Archive");
  else print(output, [`Cannot open: ${arg}`]);
}

function print(output, lines) {
  lines.forEach((line) => {
    const div = document.createElement("div");
    div.textContent = line;
    output.appendChild(div);
  });
}

function searchAll(term) {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const results = [];
  APPS.forEach((app) => {
    if (`${app.title} ${app.kind} ${app.id}`.toLowerCase().includes(q)) results.push({ title: app.title, kind: "App", icon: app.icon, action: app.action });
  });
  PROJECTS.forEach((project) => {
    if (`${project.title} ${project.type} ${project.year} ${project.tags.join(" ")} ${project.readme}`.toLowerCase().includes(q)) {
      results.push({ title: project.title, kind: `${project.type} Package`, icon: "PK", path: project.path, action: () => openPackage(project.id) });
    }
  });
  FILES.forEach((file) => {
    if (`${file.name} ${file.type} ${file.path} ${file.tags.join(" ")}`.toLowerCase().includes(q)) {
      results.push({ title: file.name, kind: file.type, icon: iconFor(file.type), path: file.path, action: () => openEntry(file) });
    }
  });
  SOCIALS.forEach((item) => {
    if (`${item.title} ${item.detail} ${item.url}`.toLowerCase().includes(q)) {
      results.push({ title: item.title, kind: "Network Link", icon: "URL", action: () => openPortal(item.title, item.url, item.detail) });
    }
  });
  return results;
}

function normalizePath(path) {
  if (!path) return "A:\\";
  let next = path.replace(/\//g, "\\").trim();
  if (!next.toLowerCase().startsWith("a:")) next = `A:\\${next}`;
  return next.replace(/\\+$/g, "") === "A:" ? "A:\\" : next.replace(/\\+$/g, "");
}

function parentPath(path) {
  const normalized = normalizePath(path);
  if (normalized === "A:\\") return normalized;
  const parts = normalized.split("\\").filter(Boolean);
  parts.pop();
  return parts.length <= 1 ? "A:\\" : parts.join("\\");
}

function iconFor(type) {
  const key = String(type).toLowerCase();
  if (key.includes("folder")) return "DIR";
  if (key.includes("package")) return "PKG";
  if (key.includes("image")) return "IMG";
  if (key.includes("link")) return "URL";
  if (key.includes("app")) return "EXE";
  if (key.includes("theme")) return "THM";
  if (key.includes("text") || key.includes("readme")) return "TXT";
  return "FILE";
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

window.addEventListener("DOMContentLoaded", init);
