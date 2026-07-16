# Memory Card Unlocks

Unlock definitions live in `src/content/memory-unlocks.js`. The evaluator only records one-time receipts in `Memory Card.preferences.unlocks`; it does not change the Memory Card version or item schema.

| Unlock | Trigger | Reward |
| --- | --- | --- |
| Archive Signal wallpaper | Recover and save `recovery-archive-clue` | Adds Archive Signal to Settings and `A:\Wallpapers` |
| DISC terminal command | Save any AWAKEN Paint work as a `gallery` item | Enables the `disc` terminal command |
| Bonus track reference | Save any `transmission` item | Records the AWAKEN SoundCloud bonus reference |

All triggers are ordinary actions in the existing shell and every unlock is idempotent.
