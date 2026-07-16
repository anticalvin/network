# AWAKEN Internet Navigation

`src/system/network-navigation.js` is the single navigation policy for links owned by the NETWORK desktop. `script.js` injects the existing `createWindow` and `focusExistingWindow` functions; the window manager remains shell-owned.

Same-origin pages, approved `awakencult.com` subdomains, the NETWORK GitHub Pages path, and supported Apple Music, Spotify, and SoundCloud embeds can render inside the `awaken-internet` XP window. Generic external destinations open a warning view first. Native browser navigation is available only from the explicit Continue button and always uses `noopener,noreferrer`.

Downloads, Blob/data URLs, `mailto:`, `tel:`, Gallery exports, admin navigation, authentication redirects, and boot-flow navigation remain with their owning browser or application flow. MIND attachments are marked with `data-network-url`; ordinary activation routes through AWAKEN Internet while modified clicks preserve native link behavior.

The address bar accepts only validated HTTP and HTTPS destinations. The module uses DOM text properties for destination data and never inserts an untrusted URL, title, or hostname through `innerHTML`.
