# Experience update — September 2026

Implemented as an additive pass over the existing shell:

- Per-window Explorer Back/Forward history; managed nested folders and dynamically discovered archive years.
- Approved Atlas releases drive the player and archive, with legacy artwork/track excerpts retained as presentation fallbacks. Corrected NEW SWAG source matching. Related Atlas records are clickable and searchable.
- Release dossiers expose selected tracks, listening and connections. Image folders offer thumbnails, picture navigation, captions, keyboard arrows and swipe.
- Player opens on the six-release library and has Library / Now Playing / Streaming / EQ views. Explorer audio is handed to the existing window. Provider embeds and direct audio stop competing. Idle visualizer work is throttled.
- Durable bundled XP-style glyphs, proper image dimensions, Show Desktop, desktop resizing and compact phone controls. ImgBB share pages no longer generate invented asset URLs.
- Automatic notices share a quiet-period gate and wait until no app is open. Optional system tones respect the sound setting.
- Public visitors no longer accidentally see this device's admin draft; preview is explicit and labelled.
- Valid unsaved editor fields are saved before internal navigation. Quick photo/story/release actions, live reload with a device backup, and draft preview added.
- Publishing compares the original live revision, uses a conditional update, and stores protected restore points in the existing snapshot table. History restores to a draft for review; it does not auto-publish. No access policies changed.
- NETWORK Supabase was inactive; the existing project was restored successfully. A subsequent read found zero approved public Discord messages. MIND now distinguishes refreshed/empty state and periodically reconciles without claiming a missing realtime connection is live.

Validation: 58 Node tests, lint, syntax checks and static build passed. Browser checks covered desktop loading, Explorer Back/Forward, six-release library, phone streaming view, and editor quick-create. Authenticated publication/rollback was not exercised against production; no editorial payload was published during verification. A real-phone audio test remains advisable.

Deferred rather than invented: new historical source material, richer authored NETWORK content, complete cloud draft collaboration, public SEO regeneration from live editorial snapshots, automatic session restoration, and a full new mobile app switcher. Existing task buttons and Show Desktop remain the switching mechanism.
