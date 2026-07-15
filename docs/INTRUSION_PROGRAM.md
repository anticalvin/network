# AWAKEN Intrusion

AWAKEN Intrusion is a bounded desktop program, not a browser or device security simulation. `src/domain/intrusion.js` advances through `armed`, `initializing`, `cascading`, `terminal-takeover`, `reveal`, `recovery`, and `complete`. Runtime events expose every stage.

The sequence uses one managed window, can be cancelled with its button or Escape, is disabled on mobile, and will not start while Gallery has unsaved work. Automatic repetition is blocked for the session. Its reveal writes only approved local recovery fragments.

Set `AWAKEN_CONFIG.features.intrusion_enabled` to `false` to disable it. The terminal `scan` command is the deliberate trigger.
