# Gallery Studio

Gallery Studio is registered in the desktop application list and runs inside the shared window manager. It supports brush, pencil, eraser, line, rectangle, ellipse, fill, text, selection, move, eyedropper, undo/redo, layers, visibility, locking, opacity, blend modes, duplication, deletion, flattening, zoom-independent canvas scrolling, grid, guides, snapping, image import, and PNG export.

Editable files use `.awakenproj.json` with `schemaVersion`, bounded canvas dimensions, PNG layer payloads, guides, title, creator, visibility, and optional Atlas entity ID. Imports reject unsupported versions, malformed layers, canvases over 2400 pixels per side, over 24 layers, and files over 25 MB.

`Save to Gallery` writes a bounded local fallback to `awaken.gallery.projects.v1`, adds projections under `A:\Gallery`, emits filesystem events, and adds a Memory Card reference. These files are marked local-only. Public visibility is metadata only; this flow never publishes automatically. Remote Gallery publishing remains deferred until authenticated creator identity and moderation are available.

Set `gallery_studio_enabled` to `false` for rollout rollback. The current local fallback stores at most four projects; use the existing media and filesystem repository boundary for future Blob/Storage persistence.
