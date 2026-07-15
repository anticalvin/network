# AWAKEN Media Player

The managed Media Player supports local browser-compatible audio, playlist navigation, seek, volume, duration, spectrum, oscilloscope, peaks, and a ten-band equalizer with presets. Its AudioContext is created after user interaction, reused for the window, and closed with all animation frames and object URLs when the window closes.

Apple Music, SoundCloud, and Spotify URLs are parsed by provider-specific validation in `src/domain/media.js`. Official embeds are isolated from the local equalizer because protected cross-origin streams cannot be routed through Web Audio. YouTube remains an official managed link.

Release cards are projected from the shell's public Atlas-derived catalogue. Private, disputed, unreleased, and low-confidence Atlas entities remain behind the existing fail-closed Atlas boundary. Set `upgraded_media_player_enabled` to `false` to roll back to a future fallback renderer.
