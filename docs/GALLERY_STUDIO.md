# AWAKEN Paint

AWAKEN Paint is registered in the desktop application list and runs inside the shared window manager. It supports brush, pencil, eraser, line, rectangle, ellipse, fill, text, selection, move, eyedropper, undo/redo, layers, visibility, locking, opacity, blend modes, duplication, deletion, flattening, zoom-independent canvas scrolling, grid, guides, snapping, image import, and PNG export.

Editable files use `.awakenproj.json` with `schemaVersion`, bounded canvas dimensions, PNG layer payloads, guides, title, creator, visibility, and optional Atlas entity ID. Imports reject unsupported versions, malformed layers, canvases over 2400 pixels per side, over 24 layers, and files over 25 MB.

`Save to A:\Gallery` writes a bounded local project, adds image and editable-project projections under `A:\Gallery`, emits filesystem events, and adds a Memory Card reference. `Submit to Shared Gallery` uploads a flattened image to the bounded `gallery-submissions` bucket and creates a review record. Approved submissions are merged into the same `A:\Gallery` folder for every visitor; editable layer data remains local.

Anonymous submissions are insert-only, image-only, UUID-named, limited to 3 MB and 1600 x 1600, and cannot self-approve. An authenticated admin with the `user_role=admin` app-metadata claim approves or rejects submissions through the existing admin dashboard or Supabase dashboard.

Set `gallery_studio_enabled` to `false` for rollout rollback. The local fallback stores at most four editable projects while approved flattened images accumulate remotely.
