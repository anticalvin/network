# AWAKEN NETWORK v2

Static HTML/CSS/JS prototype for awakencult.com.

## What changed in v2

- Mobile-first Windows XP-style shell.
- PS2 memory card mode.
- CULTFEED social relay for Instagram/X/YouTube links and cached post-style content.
- Random fake pop-up ads, fake security scan, fake downloads, and relevant collection/music prompts.
- Draggable windows on desktop, full-screen responsive windows on mobile.
- Easter eggs: type `xp`, use the Konami code, click the terminal 5 times.
- No accounts, no backend, no dependencies.

## Where to update content

Edit `script.js`:

- `DISCORD` for the invite link.
- `SOCIAL_LINKS` for Instagram/X/YouTube.
- `socialPosts` for cached/curated social content.
- `apps` for app labels and icons.
- `popupData` for ads and interruptions.

## Deployment

Upload these files to any static host:

- `index.html`
- `styles.css`
- `script.js`

The site works from a simple static server and does not require build tools.
