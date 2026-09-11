const WELCOME_KEY = "awaken.productWelcomeSeen.v1";

function byLabel(label) {
  const target = label.trim().toLowerCase();
  return [...document.querySelectorAll(".desktop-icon")].find((button) => {
    const text = button.querySelector("span:last-child")?.textContent?.trim().toLowerCase();
    return text === target;
  });
}

function openDesktopItem(label) {
  const button = byLabel(label);
  if (!button) return false;
  button.click();
  return true;
}

function openStartSearch() {
  const start = document.getElementById("start-button");
  const menu = document.getElementById("start-menu");
  const input = document.getElementById("start-search");
  if (!start || !menu || !input) return;
  if (menu.hidden) start.click();
  requestAnimationFrame(() => input.focus({ preventScroll: true }));
}

function dismissWelcome(panel) {
  localStorage.setItem(WELCOME_KEY, "true");
  panel.remove();
}

function buildWelcome() {
  if (localStorage.getItem(WELCOME_KEY) === "true") return;
  if (new URLSearchParams(location.search).has("adminPreview")) return;
  if (document.querySelector(".network-welcome")) return;

  const panel = document.createElement("section");
  panel.className = "network-welcome";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "network-welcome-title");
  panel.innerHTML = `
    <div class="network-welcome__head">
      <strong>AWAKEN NETWORK</strong>
      <button type="button" data-welcome-close aria-label="Close welcome">x</button>
    </div>
    <div class="network-welcome__body">
      <p class="network-welcome__eyebrow">PUBLIC NETWORK / GUEST SESSION</p>
      <h2 id="network-welcome-title">Start with the archive.</h2>
      <p>This is a working AWAKEN system, not a tour. Browse the catalog, listen to releases, or open MIND. Everything else stays available from Start when you need it.</p>
      <div class="network-welcome__actions">
        <button type="button" data-open="Archive"><strong>Archive</strong><span>Projects, releases and recovered material.</span></button>
        <button type="button" data-open="Media Player"><strong>Listen</strong><span>Open the catalog in AWAKEN Media Player.</span></button>
        <button type="button" data-open="MIND"><strong>MIND</strong><span>Enter the live NETWORK channel.</span></button>
      </div>
      <div class="network-welcome__foot">
        <span>Tip: press Ctrl/⌘ + K anywhere to search.</span>
        <button type="button" data-welcome-dismiss>Don't show this again</button>
      </div>
    </div>`;

  panel.querySelector("[data-welcome-close]").addEventListener("click", () => panel.remove());
  panel.querySelector("[data-welcome-dismiss]").addEventListener("click", () => dismissWelcome(panel));
  panel.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      if (openDesktopItem(button.dataset.open)) dismissWelcome(panel);
    });
  });

  document.body.appendChild(panel);
}

function installCommandHint() {
  if (matchMedia("(max-width: 760px)").matches) return;
  if (sessionStorage.getItem("awaken.commandHintSeen") === "true") return;
  const hint = document.createElement("div");
  hint.className = "network-command-hint";
  hint.textContent = "Ctrl/⌘ + K  Search NETWORK";
  document.body.appendChild(hint);
  setTimeout(() => {
    hint.remove();
    sessionStorage.setItem("awaken.commandHintSeen", "true");
  }, 5200);
}

function installShortcuts() {
  document.addEventListener("keydown", (event) => {
    const commandSearch = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
    if (commandSearch) {
      event.preventDefault();
      openStartSearch();
      return;
    }

    if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if (!isTyping) {
        event.preventDefault();
        openStartSearch();
      }
    }
  });
}

function waitForDesktop() {
  const ready = () => {
    const os = document.getElementById("os-container");
    return os && getComputedStyle(os).display !== "none" && document.querySelector(".desktop-icon");
  };

  if (ready()) {
    buildWelcome();
    installCommandHint();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!ready()) return;
    observer.disconnect();
    buildWelcome();
    installCommandHint();
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class"] });
  setTimeout(() => observer.disconnect(), 20000);
}

installShortcuts();
waitForDesktop();
