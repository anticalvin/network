(function () {
  function apply(content) {
    if (!content || typeof content !== "object") return;
    document.querySelectorAll("[data-managed-text]").forEach((element) => {
      const value = content[element.dataset.managedText];
      if (typeof value === "string" && value.trim()) element.textContent = value.slice(0, 240);
    });
    document.querySelectorAll("[data-managed-src]").forEach((element) => {
      const value = content[element.dataset.managedSrc];
      if (safeImageUrl(value)) element.src = /^assets\//i.test(value) ? `../${value}` : value;
    });
    document.dispatchEvent(new CustomEvent("awaken:managed-entry", { detail: content }));
  }

  function safeImageUrl(value) {
    if (/^\.\.\/assets\/[a-z0-9_./-]+$/i.test(String(value || ""))) return true;
    if (/^assets\/[a-z0-9_./-]+$/i.test(String(value || ""))) return true;
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  }

  addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.source !== parent || event.data?.type !== "awaken:managed-content") return;
    apply(event.data.interface);
  });
})();
