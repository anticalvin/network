import { createGalleryProject, validateGalleryProject } from "../../domain/gallery-project.js";
import { AWAKEN_EVENTS, awakenBus } from "../../system/event-bus.js";

const PALETTE = ["#111111", "#ffffff", "#da4a44", "#008080", "#245edb", "#6f7f2a", "#f0c430", "#a33bc2"];
const TOOLS = [["brush", "Brush"], ["pencil", "Pencil"], ["eraser", "Eraser"], ["line", "Line"], ["rect", "Rectangle"], ["ellipse", "Ellipse"], ["fill", "Fill"], ["text", "Text"], ["select", "Selection"], ["move", "Move"], ["eyedropper", "Eyedropper"]];
const STORE_KEY = "awaken.gallery.projects.v1";

export function renderGalleryStudio(container, { initialFile = null, onSave = () => {} } = {}) {
  container.innerHTML = markup();
  const localSaveButton = container.querySelector("[data-save-gallery]");
  localSaveButton.textContent = "Save to A:\\Gallery";
  const sharedSaveButton = document.createElement("button");
  sharedSaveButton.type = "button";
  sharedSaveButton.dataset.submitShared = "";
  sharedSaveButton.textContent = "Submit to Shared Gallery";
  localSaveButton.after(sharedSaveButton);
  container.querySelector(".gallery-tools > strong").textContent = "AWAKEN Paint";
  container.querySelector("[data-creator]").placeholder = "anonymous";
  container.querySelector("[data-image-input]").accept = "image/png,image/jpeg,image/webp";
  const find = (selector) => container.querySelector(selector);
  const composite = find("[data-composite]");
  const overlay = find("[data-overlay]");
  const context = composite.getContext("2d");
  const overlayContext = overlay.getContext("2d");
  const canvasOuter = find(".gallery-canvas-outer");
  const paper = find(".gallery-paper");
  let layers = [];
  let activeId = "";
  let tool = "brush";
  let drawing = false;
  let start = null;
  let snapshot = null;
  let dirty = false;
  let disposed = false;
  let guides = { horizontal: [], vertical: [] };
  let history = [];
  let future = [];
  let zoom = 1;
  let panMode = false;
  let panStart = null;

  function setZoom(value) {
    zoom = clamp(Number(value) || 1, 0.1, 2.5);
    [composite, overlay].forEach((canvas) => {
      canvas.style.width = `${Math.round(canvas.width * zoom)}px`;
      canvas.style.height = `${Math.round(canvas.height * zoom)}px`;
    });
    paper.style.width = `${Math.round(composite.width * zoom)}px`;
    paper.style.height = `${Math.round(composite.height * zoom)}px`;
    find("[data-zoom-value]").textContent = `${Math.round(zoom * 100)}%`;
  }

  function fitCanvas() {
    const width = Math.max(80, canvasOuter.clientWidth - 24);
    const height = Math.max(80, canvasOuter.clientHeight - 24);
    setZoom(Math.min(width / composite.width, height / composite.height, 1));
    canvasOuter.scrollTo({ left: 0, top: 0 });
  }

  function createLayer(name = `Layer ${layers.length + 1}`, image = null) {
    const canvas = document.createElement("canvas");
    canvas.width = composite.width;
    canvas.height = composite.height;
    const layer = { id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, name, canvas, context: canvas.getContext("2d", { willReadFrequently: true }), visible: true, locked: false, opacity: 100, blend: "source-over" };
    if (image) layer.context.drawImage(image, 0, 0, canvas.width, canvas.height);
    layers.push(layer);
    activeId = layer.id;
    renderLayers();
    compositeLayers();
    return layer;
  }

  function newDocument() {
    const width = clamp(Number(find("[data-width]").value) || 900, 64, 1600);
    const height = clamp(Number(find("[data-height]").value) || 600, 64, 1600);
    composite.width = overlay.width = width;
    composite.height = overlay.height = height;
    setZoom(zoom);
    const background = document.createElement("canvas");
    background.width = width; background.height = height;
    const backgroundContext = background.getContext("2d");
    backgroundContext.fillStyle = "#ffffff"; backgroundContext.fillRect(0, 0, width, height);
    layers = [{ id: "background", name: "Background", canvas: background, context: backgroundContext, visible: true, locked: false, opacity: 100, blend: "source-over" }];
    activeId = "background";
    guides = { horizontal: [], vertical: [] };
    history = []; future = [];
    setDirty(false); renderLayers(); compositeLayers(); status(`New document ${width} x ${height}`);
  }

  function activeLayer() { return layers.find((layer) => layer.id === activeId); }

  function compositeLayers() {
    context.clearRect(0, 0, composite.width, composite.height);
    layers.forEach((layer) => {
      if (!layer.visible) return;
      context.save(); context.globalAlpha = layer.opacity / 100; context.globalCompositeOperation = layer.blend; context.drawImage(layer.canvas, 0, 0); context.restore();
    });
    drawOverlay();
  }

  function drawOverlay() {
    overlayContext.clearRect(0, 0, overlay.width, overlay.height);
    if (find("[data-grid]").checked) {
      const size = clamp(Number(find("[data-grid-size]").value) || 20, 4, 200);
      overlayContext.strokeStyle = "rgba(36,94,219,.25)"; overlayContext.lineWidth = 1;
      for (let x = size; x < overlay.width; x += size) { overlayContext.beginPath(); overlayContext.moveTo(x, 0); overlayContext.lineTo(x, overlay.height); overlayContext.stroke(); }
      for (let y = size; y < overlay.height; y += size) { overlayContext.beginPath(); overlayContext.moveTo(0, y); overlayContext.lineTo(overlay.width, y); overlayContext.stroke(); }
    }
    overlayContext.strokeStyle = "#00a050"; overlayContext.setLineDash([5, 4]);
    guides.vertical.forEach((x) => { overlayContext.beginPath(); overlayContext.moveTo(x, 0); overlayContext.lineTo(x, overlay.height); overlayContext.stroke(); });
    guides.horizontal.forEach((y) => { overlayContext.beginPath(); overlayContext.moveTo(0, y); overlayContext.lineTo(overlay.width, y); overlayContext.stroke(); });
    overlayContext.setLineDash([]);
  }

  function renderLayers() {
    const list = find("[data-layers]"); list.innerHTML = "";
    [...layers].reverse().forEach((layer) => {
      const row = document.createElement("div"); row.className = `gallery-layer${layer.id === activeId ? " active" : ""}`;
      row.innerHTML = `<button type="button" data-visible aria-label="Toggle layer visibility">${layer.visible ? "ON" : "OFF"}</button><button type="button" data-select>${escapeHtml(layer.name)}</button><button type="button" data-lock aria-label="Toggle layer lock">${layer.locked ? "LOCK" : "FREE"}</button>`;
      row.querySelector("[data-visible]").addEventListener("click", () => { layer.visible = !layer.visible; setDirty(); renderLayers(); compositeLayers(); });
      row.querySelector("[data-select]").addEventListener("click", () => { activeId = layer.id; find("[data-opacity]").value = layer.opacity; find("[data-blend]").value = layer.blend; renderLayers(); });
      row.querySelector("[data-lock]").addEventListener("click", () => { layer.locked = !layer.locked; renderLayers(); });
      list.appendChild(row);
    });
  }

  function capture() {
    return { width: composite.width, height: composite.height, layers: layers.map((layer) => ({ ...layer, canvas: undefined, context: undefined, image: layer.canvas.toDataURL("image/png") })), activeId, guides: structuredClone(guides) };
  }

  function pushHistory() { history.push(capture()); if (history.length > 20) history.shift(); future = []; }

  async function restore(state) {
    composite.width = overlay.width = state.width; composite.height = overlay.height = state.height;
    setZoom(zoom);
    layers = await Promise.all(state.layers.map(async (saved) => {
      const canvas = document.createElement("canvas"); canvas.width = state.width; canvas.height = state.height;
      const layerContext = canvas.getContext("2d", { willReadFrequently: true });
      const image = await loadImage(saved.image); layerContext.drawImage(image, 0, 0);
      return { id: saved.id, name: saved.name, visible: saved.visible !== false, locked: Boolean(saved.locked), opacity: Number(saved.opacity ?? 100), blend: saved.blend || "source-over", canvas, context: layerContext };
    }));
    activeId = state.activeId || layers.at(-1)?.id; guides = state.guides || { horizontal: [], vertical: [] }; renderLayers(); compositeLayers();
  }

  function point(event) { const rect = overlay.getBoundingClientRect(); return { x: (event.clientX - rect.left) * overlay.width / rect.width, y: (event.clientY - rect.top) * overlay.height / rect.height }; }
  function snap(pointValue) { if (!find("[data-snap]").checked) return pointValue; const size = Number(find("[data-grid-size]").value) || 20; return { x: Math.round(pointValue.x / size) * size, y: Math.round(pointValue.y / size) * size }; }

  function begin(event) {
    if (panMode) {
      panStart = { x: event.clientX, y: event.clientY, left: canvasOuter.scrollLeft, top: canvasOuter.scrollTop };
      overlay.setPointerCapture(event.pointerId);
      return;
    }
    const layer = activeLayer(); if (!layer || layer.locked) { status("Select an unlocked layer."); return; }
    const p = point(event);
    if (tool === "eyedropper") { const pixel = context.getImageData(Math.floor(p.x), Math.floor(p.y), 1, 1).data; find("[data-color]").value = `#${[pixel[0], pixel[1], pixel[2]].map((value) => value.toString(16).padStart(2, "0")).join("")}`; return; }
    if (tool === "text") { const text = prompt("Text to place:"); if (text) { pushHistory(); layer.context.fillStyle = find("[data-color]").value; layer.context.font = `${Math.max(12, Number(find("[data-size]").value) * 3)}px Tahoma`; layer.context.fillText(text, p.x, p.y); setDirty(); compositeLayers(); } return; }
    if (tool === "fill") { pushHistory(); floodFill(layer.context, Math.floor(p.x), Math.floor(p.y), find("[data-color]").value); setDirty(); compositeLayers(); return; }
    pushHistory(); drawing = true; start = p; snapshot = layer.context.getImageData(0, 0, composite.width, composite.height); styleLayer(layer.context);
    layer.context.beginPath(); layer.context.moveTo(p.x, p.y); overlay.setPointerCapture(event.pointerId);
  }

  function move(event) {
    if (panMode && panStart) {
      canvasOuter.scrollLeft = panStart.left - (event.clientX - panStart.x);
      canvasOuter.scrollTop = panStart.top - (event.clientY - panStart.y);
      return;
    }
    const p = point(event); find("[data-coordinates]").textContent = `${Math.round(p.x)}, ${Math.round(p.y)}`;
    if (!drawing) return;
    const layer = activeLayer(); styleLayer(layer.context);
    if (["brush", "pencil", "eraser"].includes(tool)) {
      layer.context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      layer.context.lineWidth = tool === "pencil" ? 1 : Number(find("[data-size]").value);
      layer.context.lineTo(p.x, p.y); layer.context.stroke(); layer.context.globalCompositeOperation = "source-over"; compositeLayers(); return;
    }
    layer.context.putImageData(snapshot, 0, 0); layer.context.beginPath(); const end = snap(p);
    if (tool === "line") { layer.context.moveTo(start.x, start.y); layer.context.lineTo(end.x, end.y); }
    if (tool === "rect" || tool === "select") layer.context.rect(start.x, start.y, end.x - start.x, end.y - start.y);
    if (tool === "ellipse") layer.context.ellipse((start.x + end.x) / 2, (start.y + end.y) / 2, Math.abs(end.x - start.x) / 2, Math.abs(end.y - start.y) / 2, 0, 0, Math.PI * 2);
    if (tool === "move") { layer.context.putImageData(snapshot, Math.round(end.x - start.x), Math.round(end.y - start.y)); }
    layer.context.stroke(); compositeLayers();
  }

  function end() { if (panStart) { panStart = null; return; } if (!drawing) return; drawing = false; activeLayer()?.context.closePath(); setDirty(); compositeLayers(); }
  function styleLayer(layerContext) { layerContext.lineCap = "round"; layerContext.lineJoin = "round"; layerContext.lineWidth = Number(find("[data-size]").value); layerContext.strokeStyle = find("[data-color]").value; layerContext.fillStyle = find("[data-color]").value; }

  async function saveGallery(shared = false) {
    const title = find("[data-title]").value.trim() || "Untitled";
    const project = createGalleryProject({ width: composite.width, height: composite.height, layers: capture().layers, guides, metadata: { title, creator: find("[data-creator]").value.trim(), visibility: find("[data-visibility]").value, atlasEntityId: find("[data-atlas]").value.trim() || null } });
    const image = composite.toDataURL("image/png");
    const imageBlob = await canvasBlob(composite, "image/png");
    if (shared && imageBlob.size > 3_145_728) { status("Shared Gallery images must be 3 MB or smaller. Resize the canvas and try again."); return; }
    const record = { id: crypto.randomUUID?.() || `gallery-${Date.now()}`, name: `${title}.png`, type: "Image", path: `A:\\Gallery\\${title}.png`, image, project, localOnly: true, modified: new Date().toISOString() };
    try {
      const works = JSON.parse(sessionStorage.getItem(STORE_KEY) || "[]");
      sessionStorage.setItem(STORE_KEY, JSON.stringify([record, ...works].slice(0, 4)));
      const result = await onSave(record, { shared, imageBlob });
      setDirty(false);
      status(shared ? (result?.submitted ? `Submitted ${record.path} to the shared Gallery for review.` : `Saved locally. Shared submission failed: ${result?.reason || "service unavailable"}`) : `Saved ${record.path}`);
      awakenBus.emit(AWAKEN_EVENTS.GALLERY_SAVED, { id: record.id, path: record.path, visibility: project.metadata.visibility, localOnly: true });
    } catch { status("Save failed: local storage quota exceeded."); }
  }

  function exportProject() { const project = createGalleryProject({ width: composite.width, height: composite.height, layers: capture().layers, guides, metadata: { title: find("[data-title]").value, creator: find("[data-creator]").value, visibility: find("[data-visibility]").value, atlasEntityId: find("[data-atlas]").value } }); download(`${slug(find("[data-title]").value)}.awakenproj.json`, new Blob([JSON.stringify(project)], { type: "application/json" })); }
  function exportPng() { composite.toBlob((blob) => blob && download(`${slug(find("[data-title]").value)}.png`, blob), "image/png"); }
  async function openProject(file) { if (!file || file.size > 25_000_000) { status("Project is missing or too large."); return; } try { const parsed = JSON.parse(await file.text()); const result = validateGalleryProject(parsed); if (!result.valid) throw new Error(result.error); await restore({ width: parsed.canvas.width, height: parsed.canvas.height, layers: parsed.layers, activeId: parsed.layers.at(-1).id, guides: parsed.guides }); find("[data-title]").value = parsed.metadata.title; find("[data-creator]").value = parsed.metadata.creator; find("[data-visibility]").value = parsed.metadata.visibility; find("[data-atlas]").value = parsed.metadata.atlasEntityId || ""; setDirty(false); status("Project loaded."); } catch (error) { status(`Could not open project: ${error.message}`); } }

  container.querySelectorAll("[data-tool]").forEach((button) => button.addEventListener("click", () => { tool = button.dataset.tool; container.querySelectorAll("[data-tool]").forEach((item) => item.classList.toggle("active", item === button)); status(`Tool: ${button.title}`); }));
  find("[data-new]").addEventListener("click", () => { if (!dirty || confirm("Discard unsaved changes?")) newDocument(); });
  find("[data-add-layer]").addEventListener("click", () => { pushHistory(); createLayer(); setDirty(); });
  find("[data-duplicate-layer]").addEventListener("click", () => { const source = activeLayer(); if (!source || layers.length >= 24) return; pushHistory(); const next = createLayer(`${source.name} copy`); next.context.drawImage(source.canvas, 0, 0); setDirty(); compositeLayers(); });
  find("[data-delete-layer]").addEventListener("click", () => { if (layers.length < 2) return; pushHistory(); layers = layers.filter((layer) => layer.id !== activeId); activeId = layers.at(-1).id; setDirty(); renderLayers(); compositeLayers(); });
  find("[data-flatten]").addEventListener("click", () => { pushHistory(); const image = document.createElement("canvas"); image.width = composite.width; image.height = composite.height; image.getContext("2d").drawImage(composite, 0, 0); layers = [{ id: "flattened", name: "Flattened", canvas: image, context: image.getContext("2d", { willReadFrequently: true }), visible: true, locked: false, opacity: 100, blend: "source-over" }]; activeId = "flattened"; setDirty(); renderLayers(); compositeLayers(); });
  find("[data-opacity]").addEventListener("input", (event) => { activeLayer().opacity = Number(event.target.value); setDirty(); compositeLayers(); });
  find("[data-blend]").addEventListener("change", (event) => { activeLayer().blend = event.target.value; setDirty(); compositeLayers(); });
  find("[data-undo]").addEventListener("click", async () => { if (!history.length) return; future.push(capture()); await restore(history.pop()); setDirty(); });
  find("[data-redo]").addEventListener("click", async () => { if (!future.length) return; history.push(capture()); await restore(future.pop()); setDirty(); });
  find("[data-grid]").addEventListener("change", drawOverlay); find("[data-grid-size]").addEventListener("change", drawOverlay);
  find("[data-clear-guides]").addEventListener("click", () => { guides = { horizontal: [], vertical: [] }; setDirty(); drawOverlay(); });
  find("[data-add-guide]").addEventListener("click", () => { guides.vertical.push(Math.round(composite.width / 2)); guides.horizontal.push(Math.round(composite.height / 2)); setDirty(); drawOverlay(); });
  find("[data-import]").addEventListener("click", () => find("[data-image-input]").click());
  find("[data-image-input]").addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file?.type.startsWith("image/") || file.size > 20_000_000) return status("Choose an image under 20 MB."); const image = await loadImage(URL.createObjectURL(file), true); pushHistory(); const layer = createLayer(file.name); const scale = Math.min(composite.width / image.width, composite.height / image.height, 1); layer.context.drawImage(image, 0, 0, image.width * scale, image.height * scale); setDirty(); compositeLayers(); });
  find("[data-save-gallery]").addEventListener("click", () => saveGallery(false));
  find("[data-submit-shared]").addEventListener("click", () => saveGallery(true));
  find("[data-save-project]").addEventListener("click", exportProject); find("[data-export]").addEventListener("click", exportPng);
  find("[data-fit]").addEventListener("click", fitCanvas);
  find("[data-zoom-in]").addEventListener("click", () => setZoom(zoom + 0.1));
  find("[data-zoom-out]").addEventListener("click", () => setZoom(zoom - 0.1));
  find("[data-tools-toggle]").addEventListener("click", () => container.querySelector(".gallery-studio").classList.toggle("tools-open"));
  find("[data-pan]").addEventListener("click", (event) => {
    panMode = !panMode;
    event.currentTarget.classList.toggle("active", panMode);
    overlay.classList.toggle("pan-mode", panMode);
    status(panMode ? "Pan mode: drag the canvas viewport." : `Tool: ${tool}`);
  });
  find("[data-open-project]").addEventListener("click", () => find("[data-project-input]").click()); find("[data-project-input]").addEventListener("change", (event) => openProject(event.target.files[0]));
  overlay.addEventListener("pointerdown", begin); overlay.addEventListener("pointermove", move); overlay.addEventListener("pointerup", end); overlay.addEventListener("pointercancel", end);
  const keyHandler = (event) => { if (!container.contains(document.activeElement) || ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return; if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); find(event.shiftKey ? "[data-redo]" : "[data-undo]").click(); } };
  document.addEventListener("keydown", keyHandler);
  newDocument(); awakenBus.emit(AWAKEN_EVENTS.GALLERY_OPEN);
  if (matchMedia("(max-width: 760px)").matches) requestAnimationFrame(fitCanvas);
  if (initialFile?.project) void restore({ width: initialFile.project.canvas.width, height: initialFile.project.canvas.height, layers: initialFile.project.layers, guides: initialFile.project.guides });
  else if (initialFile?.src || initialFile?.image) {
    void loadImage(initialFile.src || initialFile.image).then((image) => {
      pushHistory();
      const layer = createLayer(initialFile.name || "Imported image");
      const scale = Math.min(composite.width / image.width, composite.height / image.height, 1);
      layer.context.drawImage(image, 0, 0, image.width * scale, image.height * scale);
      setDirty(); compositeLayers(); status(`Opened ${initialFile.path || initialFile.name}`);
    }).catch(() => status("That image could not be opened."));
  }

  return { isDirty: () => dirty, cleanup: () => { disposed = true; document.removeEventListener("keydown", keyHandler); awakenBus.emit(AWAKEN_EVENTS.GALLERY_DIRTY_STATE, { dirty: false }); }, requestClose: () => !dirty || confirm("Close AWAKEN Paint without saving your changes?") };

  function setDirty(value = true) { if (disposed || dirty === value) return; dirty = value; container.closest(".window")?.classList.toggle("gallery-dirty", dirty); awakenBus.emit(AWAKEN_EVENTS.GALLERY_DIRTY_STATE, { dirty }); }
  function status(message) { find("[data-status]").textContent = message; }
}

function markup() { return `<div class="gallery-studio"><div class="gallery-toolbar"><button type="button" data-tools-toggle>Tools</button><button type="button" data-fit>Fit</button><button type="button" data-zoom-out aria-label="Zoom out">-</button><span data-zoom-value>100%</span><button type="button" data-zoom-in aria-label="Zoom in">+</button><button type="button" data-pan>Pan</button><button type="button" data-new>New</button><button type="button" data-import>Import</button><button type="button" data-save-gallery>Save to Gallery</button><button type="button" data-save-project>Save Project</button><button type="button" data-open-project>Open Project</button><button type="button" data-export>Export PNG</button><button type="button" data-undo>Undo</button><button type="button" data-redo>Redo</button><button type="button" data-flatten>Flatten</button><label>W <input data-width type="number" min="64" max="1600" value="900"></label><label>H <input data-height type="number" min="64" max="1600" value="600"></label><label><input data-snap type="checkbox" checked> Snap</label><label><input data-grid type="checkbox"> Grid</label><input data-grid-size aria-label="Grid size" type="number" min="4" max="200" value="20"><button type="button" data-add-guide>Add guides</button><button type="button" data-clear-guides>Clear guides</button></div><div class="gallery-workspace"><aside class="gallery-tools"><strong>Tools</strong>${TOOLS.map(([id, label], index) => `<button type="button" data-tool="${id}" title="${label}" class="${index ? "" : "active"}">${label}</button>`).join("")}<label>Size <input data-size type="range" min="1" max="48" value="8"></label><label>Color <input data-color type="color" value="#111111"></label><div class="gallery-swatches">${PALETTE.map((color) => `<button type="button" style="--swatch:${color}" title="${color}" onclick="this.closest('.gallery-studio').querySelector('[data-color]').value='${color}'"></button>`).join("")}</div></aside><main class="gallery-canvas-outer"><div class="gallery-paper"><canvas data-composite width="900" height="600"></canvas><canvas data-overlay width="900" height="600"></canvas></div></main><aside class="gallery-properties"><section><h3>Layers</h3><div class="gallery-layer-actions"><button type="button" data-add-layer>Add</button><button type="button" data-duplicate-layer>Duplicate</button><button type="button" data-delete-layer>Delete</button></div><div data-layers></div><label>Opacity <input data-opacity type="range" min="0" max="100" value="100"></label><label>Blend <select data-blend><option value="source-over">Normal</option><option value="multiply">Multiply</option><option value="screen">Screen</option><option value="overlay">Overlay</option><option value="difference">Difference</option></select></label></section><section><h3>Gallery metadata</h3><label>Title <input data-title value="Untitled"></label><label>Creator <input data-creator></label><label>Visibility <select data-visibility><option value="private">Private</option><option value="unlisted">Unlisted</option><option value="public">Public</option></select></label><label>Atlas entity <input data-atlas></label></section></aside></div><footer class="gallery-status"><span data-status>Ready</span><span data-coordinates></span></footer><input hidden data-image-input type="file" accept="image/*"><input hidden data-project-input type="file" accept="application/json,.json"></div>`; }

function floodFill(context, x, y, color) { const image = context.getImageData(0, 0, context.canvas.width, context.canvas.height); const data = image.data; const start = (y * image.width + x) * 4; const target = [data[start], data[start + 1], data[start + 2], data[start + 3]]; const fill = color.match(/[a-f0-9]{2}/gi).map((value) => parseInt(value, 16)).concat(255); if (target.every((value, index) => value === fill[index])) return; const stack = [[x, y]]; const seen = new Uint8Array(image.width * image.height); let processed = 0; while (stack.length && processed < 4_000_000) { const [currentX, currentY] = stack.pop(); if (currentX < 0 || currentY < 0 || currentX >= image.width || currentY >= image.height) continue; const pixel = currentY * image.width + currentX; if (seen[pixel]) continue; seen[pixel] = 1; const index = pixel * 4; if (Math.abs(data[index] - target[0]) + Math.abs(data[index + 1] - target[1]) + Math.abs(data[index + 2] - target[2]) + Math.abs(data[index + 3] - target[3]) > 25) continue; data.set(fill, index); processed += 1; stack.push([currentX + 1, currentY], [currentX - 1, currentY], [currentX, currentY + 1], [currentX, currentY - 1]); } context.putImageData(image, 0, 0); }
function loadImage(source, revoke = false) { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => { if (revoke) URL.revokeObjectURL(source); resolve(image); }; image.onerror = () => { if (revoke) URL.revokeObjectURL(source); reject(new Error("Image could not be decoded.")); }; image.src = source; }); }
function download(name, blob) { const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 0); }
function canvasBlob(canvas, type) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Canvas export failed.")), type)); }
function slug(value) { return (value || "awaken-gallery").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "awaken-gallery"; }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]); }
