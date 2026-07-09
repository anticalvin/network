/*
 * AWAKEN NETWORK v2.5
 *
 * This script powers the AWAKEN NETWORK prototype. It assembles a simple
 * desktop‑like environment reminiscent of late 90s/early 2000s operating
 * systems while incorporating AWAKEN CULT’s own aesthetic and content.
 *
 * Icons are defined in the APPS array below. Each entry specifies a
 * unique id, a label to display on the desktop, the icon (a Font
 * Awesome class), the type of window to open, and any additional data
 * required to render that window. New apps can be added by extending
 * this array.
 */

// List of desktop applications with configuration for each
/*
 * Application configuration for AWAKEN NETWORK v3.0.
 * This version deepens the nostalgic feel by incorporating
 * additional AWAKEN imagery, real music links, expanded archives,
 * and a robust settings app. Posts in the social feed now link
 * directly to AWAKEN CULT’s social profiles, and the memory
 * card saves expose unreleased artwork and photos. Ads point to
 * real destinations, and the Winamp player can open external
 * streaming pages.
 */

const APPS = [
  {
    id: 'readme',
    label: 'README.txt',
    icon: 'fa-file-lines',
    type: 'notepad',
    content: `The system isn't finished.\nLook around. New files appear when the signal strengthens.\nJoin the room if you hear it first.`
  },
  {
    id: 'music',
    label: 'MUSIC.EXE',
    icon: 'fa-music',
    type: 'winamp',
    // Tracks include playable local snippets and external links to
    // streaming services. If a track specifies `external`, the play
    // button will open the URL in a new tab instead of playing
    // audio directly.
    tracks: [
      {
        title: 'Unknown Signal',
        artist: 'AWAKEN CULT',
        duration: '00:17',
        src: 'audio-snippet',
        locked: false
      },
      {
        title: 'Central African Time',
        artist: 'AWAKEN CULT ft. Josh Otis',
        duration: '04:23',
        src: null,
        external: 'https://music.apple.com/us/album/central-african-time-feat-josh-otis-single/1627653559',
        locked: false
      },
      {
        title: 'XP – EP',
        artist: 'AWAKEN CULT',
        duration: '17:00',
        src: null,
        external: 'https://music.apple.com/us/album/xp-ep/1445768029',
        locked: false
      },
      {
        title: 'HATED (Deluxe)',
        artist: 'AWAKEN CULT',
        duration: '38:00',
        src: null,
        external: 'https://music.apple.com/us/album/hated-deluxe/1483912765',
        locked: false
      },
      {
        title: 'REDACTED',
        artist: '???',
        duration: '--:--',
        src: null,
        locked: true
      }
    ]
  },
  {
    id: 'collection',
    label: 'COLLECTION.EXE',
    icon: 'fa-box-open',
    type: 'collection',
    items: [
      {
        title: 'Collection Preview',
        img: 'assets/img/otis-grade.png',
        description: 'Preview of upcoming AWAKEN apparel drop featuring Josh Otis.',
        locked: false
      },
      {
        title: 'State of Mind',
        img: 'assets/img/state-of-mind-updated.jpg',
        description: 'Updated State of Mind artwork.',
        locked: false
      }
    ]
  },
  {
    id: 'archive',
    label: 'ARCHIVE',
    icon: 'fa-folder',
    type: 'archive',
    items: [
      {
        title: 'HATED',
        img: 'assets/img/hated-tyla-sabrina.webp',
        description: 'Photo from HATED featuring Tyla and Sabrina.',
        locked: false
      },
      {
        title: 'OTIS GRADE',
        img: 'assets/img/otis-grade.png',
        description: 'Josh Otis wearing unreleased clothing.',
        locked: false
      },
      {
        title: 'SECRET TRANSMISSION',
        img: 'assets/img/new-collection.webp',
        description: 'Cryptic video still from AWAKEN announcement.',
        locked: false
      },
      {
        title: 'STATE OF MIND',
        img: 'assets/img/state-of-mind-updated.jpg',
        description: 'Updated State of Mind artwork.',
        locked: false
      },
      {
        title: 'XP',
        img: null,
        description: '',
        locked: true
      },
      {
        title: 'XPV2',
        img: null,
        description: '',
        locked: true
      },
      {
        title: 'CENTRAL AFRICAN TIME',
        img: null,
        description: '',
        locked: true
      },
      {
        title: 'VISUALS',
        img: null,
        description: '',
        locked: true
      }
    ]
  },
  {
    id: 'memory',
    label: 'MEMORY',
    icon: 'fa-memory',
    type: 'memory_card',
    saves: [
      { label: 'HATED', img: 'assets/img/hated-tyla-sabrina.webp', locked: false },
      { label: 'STATE OF MIND', img: 'assets/img/state-of-mind-updated.jpg', locked: false },
      { label: 'DROP_26', img: 'assets/img/new-collection.webp', locked: false },
      { label: 'VISUALS', img: 'assets/img/otis-grade.png', locked: false },
      { label: 'LOGO', img: 'assets/img/awaken-logo.webp', locked: false },
      { label: 'SMILEY', img: 'assets/img/smiley-black.png', locked: false },
      { label: 'XP', img: null, locked: true },
      { label: 'XPV2', img: null, locked: true },
      { label: 'CENTRAL AFRICAN TIME', img: null, locked: true },
      { label: 'CORRUPTED_SAVE', img: null, locked: true }
    ]
  },
  {
    id: 'messenger',
    label: 'AIM_CHAT',
    icon: 'fa-comments',
    type: 'messenger',
    buddies: [
      { id: 'music', name: 'music', status: 'typing...' },
      { id: 'collection', name: 'collection', status: 'away' },
      { id: 'archive', name: 'archive', status: 'online' },
      { id: 'josh', name: 'josh', status: 'idle' },
      { id: 'unknown', name: 'unknown_user', status: '???' },
      { id: 'discord', name: 'discord', status: 'online' }
    ],
    messages: {
      music: [
        { from: 'music', text: 'signal detected' },
        { from: 'music', text: 'not public yet' }
      ],
      collection: [
        { from: 'collection', text: 'package incomplete' }
      ],
      archive: [
        { from: 'archive', text: 'older files will be restored soon' }
      ],
      josh: [
        { from: 'josh', text: 'this new drop is insane' }
      ],
      unknown: [
        { from: 'unknown_user', text: 'check the archive and memory card' }
      ],
      discord: [
        { from: 'discord', text: 'Real chat lives on our server. Click Discord to join.' }
      ]
    }
  },
  {
    id: 'internet',
    label: 'INTERNET',
    icon: 'fa-globe',
    type: 'internet',
    // Posts include thumbnails and external links. Each image is
    // clickable and will open the link in a new tab.
    posts: [
      { img: 'assets/img/hated-tyla-sabrina.webp', link: 'https://www.instagram.com/awakencult', caption: 'HATED – Tyla & Sabrina' },
      { img: 'assets/img/new-collection.webp', link: 'https://www.instagram.com/awakencult', caption: 'Collection preview' },
      { img: 'assets/img/otis-grade.png', link: 'https://www.instagram.com/awakencult', caption: 'Josh Otis look' },
      { img: 'assets/img/state-of-mind-updated.jpg', link: 'https://www.instagram.com/awakencult', caption: 'State of Mind updated' }
      ,
      { img: 'assets/img/secret-wallpaper.webp', link: 'https://www.instagram.com/awakencult', caption: 'Secret Wallpaper drop' },
      { img: 'assets/img/awaken-logo.webp', link: 'https://www.instagram.com/awakencult', caption: 'AWAKEN Logo' },
      { img: 'assets/img/smiley-black.png', link: 'https://www.instagram.com/awakencult', caption: 'Mascot Smiley' }
    ]
  },
  {
    id: 'downloads',
    label: 'DOWNLOADS',
    icon: 'fa-download',
    type: 'downloads',
    files: [
      { name: 'Secret Wallpaper', file: 'assets/img/secret-wallpaper.webp', description: 'Secret AWAKEN wallpaper by anticalvin' },
      { name: 'State of Mind Art', file: 'assets/img/state-of-mind-updated.jpg', description: 'High resolution State of Mind artwork' },
      { name: 'Collection Photo', file: 'assets/img/new-collection.webp', description: 'Unreleased clothing preview' },
      { name: 'HATED Photo', file: 'assets/img/hated-tyla-sabrina.webp', description: 'Tyla & Sabrina from HATED' },
      { name: 'Josh Otis Photo', file: 'assets/img/otis-grade.png', description: 'Josh Otis wearing unreleased clothing' },
      { name: 'Site Source', file: '#', description: 'Coming soon' }
      ,
      { name: 'AWAKEN Logo', file: 'assets/img/awaken-logo.webp', description: 'Main AWAKEN logo (white)' },
      { name: 'Mascot Smiley', file: 'assets/img/smiley-black.png', description: 'AWAKEN mascot smiley (black png)' }
    ]
  },
  {
    id: 'settings',
    label: 'SETTINGS',
    icon: 'fa-gear',
    type: 'settings',
    // Wallpaper options: a mix of AWAKEN artwork and classic motifs.
    wallpapers: [
      { name: 'Secret', value: 'url(assets/img/secret-wallpaper.webp)' },
      { name: 'State of Mind', value: 'url(assets/img/state-of-mind-updated.jpg)' },
      { name: 'Collection', value: 'url(assets/img/new-collection.webp)' },
      { name: 'HATED', value: 'url(assets/img/hated-tyla-sabrina.webp)' },
      { name: 'Josh Otis', value: 'url(assets/img/otis-grade.png)' },
      { name: 'AWAKEN Logo', value: 'url(assets/img/awaken-logo.webp)' },
      { name: 'Mascot', value: 'url(assets/img/smiley-black.png)' },
      { name: 'Classic XP', value: 'url(assets/img/xp-wallpaper.jpg)' },
      { name: 'Solid Color', value: null }
    ]
  },
  {
    id: 'discord',
    label: 'DISCORD.LNK',
    icon: 'fa-discord',
    type: 'dialog',
    content: {
      title: 'AWAKEN CULT SERVER FOUND',
      message: 'Community channel open. Connect now?',
      link: 'https://discord.gg/3hTnm3Pgy2',
      buttonText: 'JOIN SERVER'
    }
  },
  {
    id: 'trash',
    label: 'TRASH',
    icon: 'fa-trash',
    type: 'trash',
    items: [
      'final_final.psd',
      'shirt_FINAL_REAL.psd',
      'unused-concept.png',
      'hated-v4-mix.mp3',
      'xp_screenshot.bmp'
    ]
  }
];

// Random advertisement messages for pop‑ups
// Advertisements and interstitial pop‑ups. These rotate randomly and
// include real calls‑to‑action alongside humorous or cryptic copy.
const AD_MESSAGES = [
  {
    title: 'CALL MY LAWYER',
    body: 'Injured by XP? Call 1‑800‑AWAKEN. You may be entitled to compensation.',
    link: '#'
  },
  {
    title: 'UNLOCK HIDDEN FILES',
    body: 'Enter the Konami code on the desktop to reveal secrets.',
    link: '#'
  },
  {
    title: 'NEW COLLECTION',
    body: 'Preview the upcoming drop – click to view.',
    link: 'assets/img/new-collection.webp'
  },
  {
    title: 'STREAM CAT',
    body: 'Listen to “Central African Time” now.',
    link: 'https://music.apple.com/us/album/central-african-time-feat-josh-otis-single/1627653559'
  },
  {
    title: 'FOLLOW @AWAKENCULT',
    body: 'Stay tapped in on Instagram.',
    link: 'https://www.instagram.com/awakencult'
  },
  {
    title: 'JOIN OUR DISCORD',
    body: 'Community network open now.',
    link: 'https://discord.gg/3hTnm3Pgy2'
  },
  {
    title: 'VIRUS DETECTED',
    body: 'HATED.EXE attempted to access protected memory. Reboot recommended.',
    link: '#'
  },
  {
    title: 'WIN A FREE CD',
    body: 'Click here for a chance to win a burned AWAKEN mix CD.',
    link: 'https://www.instagram.com/awakencult'
  },
  {
    title: 'RARE WALLPAPER',
    body: 'Download the exclusive secret wallpaper.',
    link: 'assets/img/secret-wallpaper.webp'
  },
  {
    title: 'MASK OFF',
    body: 'See the mascot reveal. Click to view.',
    link: 'assets/img/smiley-black.png'
  },
  {
    title: 'ARCHIVE UPDATE',
    body: 'New files recovered. Check the archive.',
    link: '#'
  },
  {
    title: 'SYSTEM ALERT',
    body: 'A new version is available. See patch notes.',
    link: '#'
  }
];

// Track highest z‑index so new windows appear on top
let highestZ = 100;

// Boot sequence messages
const BOOT_MESSAGES = [
  'AWAKEN NETWORK',
  'bootloader build 07.09',
  'checking memory…',
  'initializing network…',
  'detecting signal…',
  'loading archives…'
];

// Run on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const booted = localStorage.getItem('awakenBooted');
  if (booted) {
    // Skip bootloader on subsequent visits
    document.getElementById('bootloader').style.display = 'none';
    document.getElementById('desktop').style.display = 'block';
    initDesktop();
  } else {
    runBootSequence();
  }
});

/**
 * Boot sequence: prints messages with a delay and waits for user input
 */
function runBootSequence() {
  const bootTextEl = document.getElementById('boot-text');
  let i = 0;
  function nextLine() {
    if (i < BOOT_MESSAGES.length) {
      bootTextEl.textContent += BOOT_MESSAGES[i] + '\n';
      i++;
      setTimeout(nextLine, 600);
    } else {
      bootTextEl.textContent += '\nPress Enter or click to continue…';
    }
  }
  nextLine();
  // Allow skipping
  document.addEventListener('keydown', handleBootKey);
  document.getElementById('bootloader').addEventListener('click', skipBoot);
}

function handleBootKey(e) {
  if (e.key === 'Enter') {
    skipBoot();
  }
}

function skipBoot() {
  localStorage.setItem('awakenBooted', 'true');
  document.removeEventListener('keydown', handleBootKey);
  document.getElementById('bootloader').style.display = 'none';
  document.getElementById('desktop').style.display = 'block';
  initDesktop();
}

/**
 * Initialize the desktop: set wallpaper, build icons, start the clock and ads
 */
function initDesktop() {
  const desktop = document.getElementById('desktop');
  // Apply stored wallpaper or default
  const savedWallpaper = localStorage.getItem('awakenWallpaper');
  if (savedWallpaper && savedWallpaper !== 'null') {
    desktop.style.backgroundImage = savedWallpaper;
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
  } else {
    desktop.style.backgroundImage = 'url(assets/img/secret-wallpaper.webp)';
    desktop.style.backgroundSize = 'cover';
    desktop.style.backgroundPosition = 'center';
  }
  // Build icons
  const iconContainer = document.getElementById('icons');
  iconContainer.innerHTML = '';
  APPS.forEach(app => {
    const iconEl = document.createElement('div');
    iconEl.className = 'desktop-icon';
    iconEl.dataset.appId = app.id;
    // Icon sprite: display a character abbreviation instead of relying on external font icons.
    const fa = document.createElement('div');
    fa.className = 'icon-sprite';
    // Abbreviation: take first two letters of the label (excluding extension and punctuation)
    const abbrevSpan = document.createElement('span');
    const baseLabel = app.label.replace(/\..*$/, '');
    const abbr = baseLabel.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase();
    abbrevSpan.textContent = abbr || '??';
    fa.appendChild(abbrevSpan);
    const label = document.createElement('div');
    label.className = 'icon-label';
    label.textContent = app.label;
    iconEl.appendChild(fa);
    iconEl.appendChild(label);
    // Event listeners
    iconEl.addEventListener('dblclick', () => openApp(app.id));
    iconEl.addEventListener('click', () => {
      document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
      iconEl.classList.add('selected');
    });
    iconContainer.appendChild(iconEl);
  });
  // Start clock
  updateClock();
  setInterval(updateClock, 60000);
  // Schedule pop‑up ads periodically
  scheduleAds();
}

/**
 * Update the clock display in the taskbar
 */
function updateClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  clockEl.textContent = `${hours}:${minutes}`;
}

/**
 * Open an application window by id
 */
function openApp(appId) {
  const app = APPS.find(a => a.id === appId);
  if (!app) return;
  // Create window container
  const win = document.createElement('div');
  win.className = 'window';
  win.style.top = Math.floor(40 + Math.random() * 80) + 'px';
  win.style.left = Math.floor(60 + Math.random() * 120) + 'px';
  win.style.zIndex = ++highestZ;
  // Header
  const header = document.createElement('div');
  header.className = 'window-header';
  const title = document.createElement('div');
  title.className = 'window-title';
  title.textContent = app.label;
  const controls = document.createElement('div');
  controls.className = 'window-controls';
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.title = 'Close';
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    win.remove();
  });
  controls.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(controls);
  win.appendChild(header);
  // Content
  const content = document.createElement('div');
  content.className = 'window-content';
  // Determine window type
  switch (app.type) {
    case 'notepad':
      createNotepad(content, app.content);
      break;
    case 'winamp':
      createWinamp(content, app.tracks);
      break;
    case 'collection':
      createCollection(content, app.items);
      break;
    case 'archive':
      createArchive(content, app.items);
      break;
    case 'memory_card':
      createMemoryCard(content, app.saves);
      break;
    case 'messenger':
      createMessenger(content, app.buddies, app.messages);
      break;
    case 'internet':
      createInternet(content, app.posts);
      break;
    case 'downloads':
      createDownloads(content, app.files);
      break;
    case 'settings':
      createSettings(content, app.wallpapers);
      break;
    case 'dialog':
      createDialog(content, app.content);
      break;
    case 'trash':
      createTrash(content, app.items);
      break;
    default:
      createNotepad(content, 'Content pending.');
  }
  win.appendChild(content);
  document.getElementById('windows-container').appendChild(win);
  makeDraggable(win, header);
}

/**
 * Basic notepad view
 */
function createNotepad(container, text) {
  const pre = document.createElement('pre');
  pre.textContent = text;
  container.appendChild(pre);
}

/**
 * Simple Winamp‑style audio player listing tracks
 */
function createWinamp(container, tracks) {
  const list = document.createElement('div');
  list.className = 'winamp-list';
  tracks.forEach((track, idx) => {
    const row = document.createElement('div');
    row.className = 'winamp-track';
    const title = document.createElement('span');
    title.textContent = `${track.title}`;
    const playBtn = document.createElement('button');
    // Label depends on whether it plays audio or opens a link
    if (track.locked) {
      playBtn.textContent = 'Locked';
      playBtn.disabled = true;
    } else if (track.external) {
      playBtn.textContent = 'Open';
    } else {
      playBtn.textContent = 'Play';
    }
    playBtn.disabled = track.locked;
    // Use existing audio element for snippet or open external link
    playBtn.addEventListener('click', () => {
      if (track.locked) return;
      // Pause other players
      document.querySelectorAll('audio').forEach(a => a.pause());
      if (track.external) {
        window.open(track.external, '_blank');
      } else if (track.src) {
        let audioEl;
        if (track.src === 'audio-snippet') {
          audioEl = document.getElementById('audio-snippet');
        } else {
          audioEl = new Audio(track.src);
        }
        audioEl.currentTime = 0;
        audioEl.play();
      }
    });
    row.appendChild(title);
    row.appendChild(playBtn);
    list.appendChild(row);
  });
  container.appendChild(list);
}

/**
 * Collection/Inventory viewer: show product items as cards
 */
function createCollection(container, items) {
  const grid = document.createElement('div');
  grid.className = 'collection-grid';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'collection-card';
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.title;
    const title = document.createElement('div');
    title.className = 'collection-title';
    title.textContent = item.title;
    const desc = document.createElement('div');
    desc.className = 'collection-desc';
    desc.textContent = item.description;
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    if (!item.locked) {
      card.addEventListener('click', () => {
        openImageViewer(item.title, item.img);
      });
    } else {
      card.classList.add('locked');
    }
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

/**
 * Archive viewer: show a list of archived items
 */
function createArchive(container, items) {
  const grid = document.createElement('div');
  grid.className = 'archive-grid';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'archive-card';
    const img = document.createElement('div');
    img.className = 'archive-thumb';
    if (item.img) {
      img.style.backgroundImage = `url(${item.img})`;
    }
    const title = document.createElement('div');
    title.className = 'archive-title';
    title.textContent = item.title;
    card.appendChild(img);
    card.appendChild(title);
    if (!item.locked && item.img) {
      card.addEventListener('click', () => {
        openImageViewer(item.title, item.img);
      });
    } else {
      card.classList.add('locked');
    }
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

/**
 * Memory card screen: PS2‑inspired grid of save icons
 */
function createMemoryCard(container, saves) {
  const grid = document.createElement('div');
  grid.className = 'memory-grid';
  saves.forEach(save => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    if (save.locked) card.classList.add('locked');
    const thumb = document.createElement('div');
    thumb.className = 'memory-thumb';
    if (save.img) {
      thumb.style.backgroundImage = `url(${save.img})`;
    }
    const label = document.createElement('div');
    label.className = 'memory-label';
    label.textContent = save.label;
    card.appendChild(thumb);
    card.appendChild(label);
    if (!save.locked && save.img) {
      card.addEventListener('click', () => {
        openImageViewer(save.label, save.img);
      });
    }
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

/**
 * Messenger (AIM/MSN style) chat window
 */
function createMessenger(container, buddies, messages) {
  const wrapper = document.createElement('div');
  wrapper.className = 'messenger-wrapper';
  const list = document.createElement('ul');
  list.className = 'buddy-list';
  const chatArea = document.createElement('div');
  chatArea.className = 'chat-area';
  let currentBuddy = null;
  function renderMessages(id) {
    chatArea.innerHTML = '';
    const msgs = messages[id] || [];
    msgs.forEach(msg => {
      const p = document.createElement('div');
      p.className = 'chat-msg';
      p.textContent = `${msg.from}: ${msg.text}`;
      chatArea.appendChild(p);
    });
  }
  buddies.forEach(b => {
    const li = document.createElement('li');
    li.className = 'buddy-item';
    li.textContent = `${b.name} (${b.status})`;
    li.addEventListener('click', () => {
      currentBuddy = b.id;
      document.querySelectorAll('.buddy-item').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      renderMessages(b.id);
    });
    list.appendChild(li);
  });
  wrapper.appendChild(list);
  wrapper.appendChild(chatArea);
  container.appendChild(wrapper);
  // Default to first buddy
  if (buddies.length > 0) {
    list.firstChild.click();
  }
}

/**
 * Social feed / Internet window: shows posts
 */
function createInternet(container, posts) {
  const grid = document.createElement('div');
  grid.className = 'internet-grid';
  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'internet-card';
    const img = document.createElement('img');
    img.src = post.img;
    img.alt = post.caption;
    const caption = document.createElement('div');
    caption.className = 'internet-caption';
    caption.textContent = post.caption;
    card.appendChild(img);
    card.appendChild(caption);
    card.addEventListener('click', () => {
      window.open(post.link, '_blank');
    });
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

/**
 * Downloads window: list downloadable files
 */
function createDownloads(container, files) {
  const list = document.createElement('ul');
  list.className = 'downloads-list';
  files.forEach(file => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.textContent = file.name;
    a.href = file.file;
    if (file.file === '#') a.addEventListener('click', (e) => { e.preventDefault(); alert('Coming soon'); });
    else a.setAttribute('download', '');
    const desc = document.createElement('span');
    desc.className = 'download-desc';
    desc.textContent = ` – ${file.description}`;
    li.appendChild(a);
    li.appendChild(desc);
    list.appendChild(li);
  });
  container.appendChild(list);
}

/**
 * Settings window: system info and wallpaper picker
 */
function createSettings(container, wallpapers) {
  const info = document.createElement('div');
  info.className = 'settings-info';
  const now = new Date();
  // Display system information such as version, build and fake hardware stats
  info.innerHTML = `<strong>AWAKEN NETWORK</strong><br>
    Version 3.0<br>
    Build ${now.getMonth()+1}.${now.getDate()}<br>
    Boot time: ${now.toLocaleString()}<br>
    Memory: 128MB<br>
    Signal: Stable<br>
    Cores: 1`;
  container.appendChild(info);
  const heading = document.createElement('h4');
  heading.textContent = 'Wallpapers';
  container.appendChild(heading);
  const grid = document.createElement('div');
  grid.className = 'wallpaper-grid';
  wallpapers.forEach(wp => {
    const thumb = document.createElement('div');
    thumb.className = 'wallpaper-thumb';
    if (wp.value) {
      thumb.style.backgroundImage = wp.value;
    } else {
      thumb.style.background = '#004db1';
    }
    thumb.title = wp.name;
    // highlight selected wallpaper
    const saved = localStorage.getItem('awakenWallpaper');
    if (saved === wp.value || (!saved && wp.name === 'Secret')) {
      thumb.classList.add('selected');
    }
    thumb.addEventListener('click', () => {
      document.querySelectorAll('.wallpaper-thumb').forEach(el => el.classList.remove('selected'));
      thumb.classList.add('selected');
      const desktop = document.getElementById('desktop');
      if (wp.value) {
        desktop.style.backgroundImage = wp.value;
        desktop.style.backgroundSize = 'cover';
        desktop.style.backgroundPosition = 'center';
        localStorage.setItem('awakenWallpaper', wp.value);
      } else {
        desktop.style.backgroundImage = '';
        desktop.style.backgroundColor = '#008080';
        localStorage.setItem('awakenWallpaper', null);
      }
    });
    grid.appendChild(thumb);
  });
  container.appendChild(grid);
}

/**
 * Simple dialog (e.g. Discord join prompt)
 */
function createDialog(container, data) {
  const dialog = document.createElement('div');
  dialog.className = 'dialog-content';
  const h3 = document.createElement('h3');
  h3.textContent = data.title;
  const p = document.createElement('p');
  p.textContent = data.message;
  const link = document.createElement('a');
  link.href = data.link;
  link.target = '_blank';
  link.textContent = data.buttonText || 'JOIN';
  dialog.appendChild(h3);
  dialog.appendChild(p);
  dialog.appendChild(link);
  container.appendChild(dialog);
}

/**
 * Trash window: list of humorous deleted items
 */
function createTrash(container, items) {
  const list = document.createElement('ul');
  list.className = 'trash-list';
  items.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    list.appendChild(li);
  });
  container.appendChild(list);
}

/**
 * Image viewer: opens a new window displaying an image
 */
function openImageViewer(title, src) {
  const imgApp = { id: 'viewer-' + Date.now(), label: title, icon: 'fa-image', type: 'viewer', src: src };
  const win = document.createElement('div');
  win.className = 'window';
  win.style.top = Math.floor(60 + Math.random() * 80) + 'px';
  win.style.left = Math.floor(80 + Math.random() * 120) + 'px';
  win.style.zIndex = ++highestZ;
  const header = document.createElement('div');
  header.className = 'window-header';
  const titleEl = document.createElement('div');
  titleEl.className = 'window-title';
  titleEl.textContent = title;
  const controls = document.createElement('div');
  controls.className = 'window-controls';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => win.remove());
  controls.appendChild(closeBtn);
  header.appendChild(titleEl);
  header.appendChild(controls);
  win.appendChild(header);
  const content = document.createElement('div');
  content.className = 'window-content image-viewer';
  const img = document.createElement('img');
  img.src = src;
  img.alt = title;
  content.appendChild(img);
  win.appendChild(content);
  document.getElementById('windows-container').appendChild(win);
  makeDraggable(win, header);
}

/**
 * Make a window draggable using its header
 */
function makeDraggable(win, header) {
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  header.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    win.style.zIndex = ++highestZ;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    function onMouseMove(ev) {
      if (!dragging) return;
      win.style.left = (ev.clientX - offsetX) + 'px';
      win.style.top = (ev.clientY - offsetY) + 'px';
    }
    function onMouseUp() {
      dragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

/**
 * Schedule periodic advertisement pop‑ups
 */
function scheduleAds() {
  // spawn first ad after 15 seconds
  setTimeout(spawnAd, 15000);
  // then every 45–90 seconds
  setInterval(spawnAd, 45000 + Math.random() * 45000);
}

function spawnAd() {
  const msg = AD_MESSAGES[Math.floor(Math.random() * AD_MESSAGES.length)];
  const win = document.createElement('div');
  win.className = 'window ad-window';
  win.style.width = '240px';
  win.style.height = '120px';
  win.style.top = Math.floor(30 + Math.random() * 60) + 'px';
  win.style.left = Math.floor(100 + Math.random() * 120) + 'px';
  win.style.zIndex = ++highestZ;
  const header = document.createElement('div');
  header.className = 'window-header';
  const title = document.createElement('div');
  title.className = 'window-title';
  title.textContent = msg.title;
  const controls = document.createElement('div');
  controls.className = 'window-controls';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => win.remove());
  controls.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(controls);
  win.appendChild(header);
  const content = document.createElement('div');
  content.className = 'window-content ad-content';
  const p = document.createElement('p');
  p.textContent = msg.body;
  const link = document.createElement('a');
  link.href = msg.link;
  link.target = '_blank';
  link.textContent = 'More';
  content.appendChild(p);
  content.appendChild(link);
  win.appendChild(content);
  document.getElementById('windows-container').appendChild(win);
  makeDraggable(win, header);
  // auto‑dismiss after 25 seconds
  setTimeout(() => win.remove(), 25000);
}