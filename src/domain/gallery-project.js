export const GALLERY_PROJECT_VERSION = 1;
export const MAX_CANVAS_SIDE = 2400;
export const MAX_LAYERS = 24;

export function validateGalleryProject(value) {
  if (!value || typeof value !== "object" || value.schemaVersion !== GALLERY_PROJECT_VERSION) return { valid: false, error: "Unsupported project version." };
  const { width, height } = value.canvas || {};
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 64 || height < 64 || width > MAX_CANVAS_SIDE || height > MAX_CANVAS_SIDE) return { valid: false, error: "Canvas dimensions are invalid." };
  if (!Array.isArray(value.layers) || !value.layers.length || value.layers.length > MAX_LAYERS) return { valid: false, error: "Layer data is invalid." };
  if (value.layers.some((layer) => !layer?.id || typeof layer.name !== "string" || typeof layer.image !== "string" || !layer.image.startsWith("data:image/png;base64,"))) return { valid: false, error: "A layer is malformed." };
  return { valid: true, project: value };
}

export function createGalleryProject({ width, height, layers, guides, metadata }) {
  return { schemaVersion: GALLERY_PROJECT_VERSION, canvas: { width, height }, layers, guides: { horizontal: guides?.horizontal || [], vertical: guides?.vertical || [] }, metadata: { title: metadata?.title || "Untitled", creator: metadata?.creator || "", visibility: metadata?.visibility || "private", atlasEntityId: metadata?.atlasEntityId || null }, updatedAt: new Date().toISOString() };
}
