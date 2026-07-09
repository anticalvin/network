/* ============================================================
   AWAKEN NETWORK — system script
   ============================================================ */

/* ---------- content config (edit this to update the site) ---------- */
const APPS = [
  {
    id: 'readme', label: 'README.txt', glyph: 'R', type: 'notepad',
    content: `THE SYSTEM ISN'T FINISHED.

Look around. New files appear when the signal strengthens.
Join the room if you hear it first.

---
tip: type "xp" anywhere on the desktop.
tip: the logo up top has been clicked before.`
  },
  {
    id: 'music', label: 'MUSIC.EXE', glyph: 'M', type: 'winamp',
    content: {
      tracks: [
        { title: 'UNKNOWN SIGNAL', status: 'SIGNAL FOUND', quality: 'damaged', duration: '00:17', locked: false },
        { title: 'XPV2 — FRAGMENT', status: 'FILE PARTIALLY RECOVERED', quality: 'unstable', duration: '00:09', locked: false },
        { title: 'REDACTED', status: 'FULL FILE LOCKED', quality: '???', duration: '--:--', locked: true },
        { title: 'CENTRAL AFRICAN TIME — DEMO', status: 'NO PUBLIC RELEASE', quality: '???', duration: '--:--', locked: true }
      ]
    }
  },
  {
    id: 'collection', label: 'COLLECTION.EXE', glyph: 'C', type: 'inventory',
    content: {
      status: 'PACKAGE STATUS: INCOMPLETE',
      lines: ['garments detected: 04', 'public preview: disabled', 'install date: unknown', 'check back after next signal'],
      items: 4
    }
  },
  {
    id: 'discord', label: 'DISCORD.LNK', glyph: 'D', type: 'dialog',
    content: {
      title: 'AWAKEN CULT SERVER FOUND',
      message: '32+ members detected. Community channel open. Connect now?',
      cta: 'ENTER ROOM',
      link: 'https://discord.gg/3hTnm3Pgy2'
    }
  },
  {
    id: 'archive', label: 'ARCHIVE', glyph: 'A', type: 'file_explorer',
    content: {
      notice: 'Recovered files may be incomplete.\nSome folders require a stronger signal.\nDo not trust final_final.psd.',
      items: [
        { name: 'XP', size: '—', locked: true },
        { name: 'XPV2', size: '—', locked: true },
        { name: 'HATED', size: '—', locked: true },
        { name: 'STATE OF MIND', size: '—', locked: true },
        { name: 'CENTRAL AFRICAN TIME', size: '—', locked: true },
        { name: 'COLLECTION_26', size: '—', locked: true },
        { name: 'VISUALS', size: '—', locked: true },
        { name: 'UNKNOWN', size: '—', locked: true }
      ],
      secretItem: { name: 'transmission.wav', size: '2.1kb', locked: false, secret: true }
    }
  },
  {
    id: 'aim', label: 'AIM_CHAT', glyph: 'A', type: 'messenger',
    content: {
      buddies: [
        { id: 'music', name: 'music', state: 'online' },
        { id: 'collection', name: 'collection', state: 'idle' },
        { id: 'archive', name: 'archive', state: 'online' },
        { id: 'josh', name: 'josh', state: 'idle' },
        { id: 'discord', name: 'discord', state: 'online' }
      ],
      scripts: {
        music: [
          { who: 'them', text: 'signal detected' },
          { who: 'them', text: 'not public yet' },
          { who: 'them', text: 'keep the window open' }
        ],
        collection: [
          { who: 'them', text: 'package incomplete' },
          { who: 'them', text: '04 garments detected' }
        ],
        archive: [
          { who: 'them', text: 'check the archive' },
          { who: 'them', text: 'some folders need a stronger signal' }
        ],
        josh: [
          { who: 'them', text: 'still building' },
          { who: 'them', text: 'ask again later' }
        ],
        discord: [
          { who: 'them', text: 'room is open' },
          { who: 'them', text: 'https://discord.gg/3hTnm3Pgy2' }
        ],
        unknown_user: [
          { who: 'them', text: '...' },
          { who: 'them', text: 'you found this fast' },
          { who: 'them', text: 'check the archive. secret folder.' },
          { who: 'them', text: 'try the konami code' }
        ]
      }
    }
  },
  {
    id: 'memory_card', label: 'MEMORY_CARD', glyph: 'P', type: 'memory_card',
    content: {
      saves: ['XP', 'XPV2', 'HATED', 'STATE OF MIND', 'CENTRAL AFRICAN TIME', 'COLLECTION_26', 'VISUALS', 'CORRUPTED_SAVE']
    }
  },
  {
    id: 'internet', label: 'INTERNET', glyph: 'I', type: 'browser',
    content: {
      url: 'network://awakencult/home',
      marquee: 'WELCOME TO AWAKEN NETWORK  //  NEW FILES DETECTED  //  SIGNAL STRENGTHENING  //  JOIN THE ROOM  //  DO NOT CLOSE THIS WINDOW  //',
      news: ['ARCHIVE RESTORED: 64%', 'AWAKEN NETWORK UPDATED. 2 FILES ADDED. 1 FILE HIDDEN.', 'TRANSMISSION LOST. TRY AGAIN LATER.']
    }
  },
  {
    id: 'downloads', label: 'DOWNLOADS', glyph: 'DL', type: 'file_explorer',
    content: {
      notice: 'Some files are still compressing.\nOne file is real.',
      items: [
        { name: 'wallpaper_01.svg', size: '4kb', locked: false, download: true },
        { name: 'boot_audio.wav', size: '—', locked: true },
        { name: 'icon_pack.zip', size: '—', locked: true },
        { name: 'flyer_print.pdf', size: '—', locked: true }
      ]
    }
  },
  {
    id: 'trash', label: 'TRASH', glyph: 'T', type: 'trash',
    content: {
      notice: 'Rejected. Deleted. Do not resubmit.',
      items: ['logo_v3_final.psd', 'shirt_name_NO.txt', 'concept_cancelled_2024.png', 'do_not_use.ai']
    }
  },
  {
    id: 'updates', label: 'UPDATES.LOG', glyph: 'U', type: 'notepad',
    content: `AWAKEN NETWORK — PATCH NOTES

v1.0
- AWAKEN NETWORK v1.0 initialized.
- Added MUSIC.EXE
- Added COLLECTION.EXE
- Added Discord connection
- Recovered 7 archive fragments
- Hidden 3 files
- Known issue: unknown_user keeps typing`
  },
  {
    id: 'tv', label: 'TV.EXE', glyph: 'TV', type: 'tv', content: {}
  }
];

const BOOT_MESSAGES = [
  'AWAKEN NETWORK BOOTLOADER',
  'build 06.26',
  'checking memory... OK',
  'mounting /archive ...',
  'detecting signal...',
  'signal found: weak',
  'decompressing system files...',
  'archive found'
];

const TV_CHANNELS = [
  { num: '03', headline: 'COLLECTION INCOMING', phone: '1-800-AWAKEN', legal: 'Offer not available. Void where signal is weak. See DISCORD.LNK for details not included.' },
  { num: '07', headline: 'SIGNAL: DO NOT ADJUST', phone: '1-800-XP-FOUND', legal: 'This transmission has been recovered from a corrupted archive. Some content may be missing.' },
  { num: '13', headline: 'JOIN THE ROOM', phone: 'discord.gg/3hTnm3Pgy2', legal: 'Community access available now. No purchase necessary.' }
];

/* ---------- state ---------- */
const S = {
  z: 20,
  muted: localStorage.getItem('awakenMuted') === 'true',
  openWindows: new Map(), // id -> {el, appId}
  unlocked: JSON.parse(localStorage.getItem('awakenUnlocked') || '[]'),
  logoClicks: 0,
  typedBuffer: '',
  konamiIndex: 0,
  openedCollection: false,
  tvChannel: 0,
  audioCtx: null
};
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

function unlock(key){
  if(!S.unlocked.includes(key)){
    S.unlocked.push(key);
    localStorage.setItem('awakenUnlocked', JSON.stringify(S.unlocked));
  }
}
function isUnlocked(key){ return S.unlocked.includes(key); }

/* ---------- sound engine (synthesized, no external files needed) ---------- */
function ctx(){
  if(!S.audioCtx){
    try{ S.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ return null; }
  }
  return S.audioCtx;
}
function beep({freq=440, dur=0.08, type='square', gain=0.05, sweep=null} = {}){
  if(S.muted) return;
  const ac = ctx(); if(!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type; osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g); g.connect(ac.destination);
  const now = ac.currentTime;
  if(sweep) osc.frequency.exponentialRampToValueAtTime(sweep, now + dur);
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.start(now); osc.stop(now + dur + 0.02);
}
function sfxHover(){ beep({freq:900, dur:0.03, type:'sine', gain:0.02}); }
function sfxOpen(){ beep({freq:220, dur:0.12, type:'square', gain:0.05, sweep:660}); }
function sfxClose(){ beep({freq:520, dur:0.1, type:'square', gain:0.04, sweep:180}); }
function sfxBoot(){ beep({freq:110, dur:0.5, type:'sawtooth', gain:0.04, sweep:440}); }
function sfxUnlock(){ beep({freq:660, dur:0.16, type:'triangle', gain:0.06, sweep:1320}); }

let droneNodes = null;
function droneToggle(on){
  const ac = ctx(); if(!ac) return;
  if(on && !droneNodes && !S.muted){
    const osc1 = ac.createOscillator(); osc1.type='sine'; osc1.frequency.value=110;
    const osc2 = ac.createOscillator(); osc2.type='sine'; osc2.frequency.value=165.5;
    const g = ac.createGain(); g.gain.value = 0.025;
    osc1.connect(g); osc2.connect(g); g.connect(ac.destination);
    osc1.start(); osc2.start();
    droneNodes = {osc1, osc2, g};
  } else if(!on && droneNodes){
    droneNodes.g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
    setTimeout(() => { try{ droneNodes.osc1.stop(); droneNodes.osc2.stop(); }catch(e){} droneNodes = null; }, 350);
  }
}

/* ---------- boot sequence ---------- */
window.addEventListener('DOMContentLoaded', () => {
  buildNoiseLayer();
  const booted = localStorage.getItem('awakenBooted');
  if(booted){
    skipToDesktop(true);
  } else {
    runBootSequence();
  }
  document.addEventListener('keydown', globalKeyHandler);
});

function buildNoiseLayer(){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  document.getElementById('noise-layer').innerHTML = svg;
}

function runBootSequence(){
  const bootTextEl = document.getElementById('boot-text');
  const barFill = document.getElementById('boot-bar-fill');
  let i = 0;
  const total = BOOT_MESSAGES.length;
  function nextLine(){
    if(i < total){
      bootTextEl.textContent += BOOT_MESSAGES[i] + '\n';
      barFill.style.width = Math.round(((i+1)/total)*100) + '%';
      sfxBoot();
      i++;
      setTimeout(nextLine, 420 + Math.random()*260);
    } else {
      document.getElementById('boot-hint').style.display = 'block';
    }
  }
  nextLine();
  document.addEventListener('keydown', handleBootKey);
  document.getElementById('bootloader').addEventListener('click', skipBoot);
}
function handleBootKey(e){ if(e.key === 'Enter') skipBoot(); }
function skipBoot(){
  localStorage.setItem('awakenBooted', 'true');
  document.removeEventListener('keydown', handleBootKey);
  const boot = document.getElementById('bootloader');
  boot.style.transition = 'opacity 0.25s ease';
  boot.style.opacity = '0';
  setTimeout(() => { boot.style.display = 'none'; skipToDesktop(false); }, 260);
}
function skipToDesktop(instant){
  document.getElementById('desktop').style.display = 'block';
  initDesktop();
  startClock();
}

/* ---------- desktop ---------- */
function initDesktop(){
  const iconContainer = document.getElementById('icons');
  APPS.forEach(app => {
    const iconEl = document.createElement('div');
    iconEl.className = 'desktop-icon';
    iconEl.dataset.appId = app.id;
    iconEl.tabIndex = 0;

    const sprite = document.createElement('div');
    sprite.className = 'icon-sprite';
    sprite.textContent = app.glyph;

    if(app.id === 'aim' && isUnlocked('unknown_user')){
      const badge = document.createElement('div');
      badge.className = 'icon-badge'; badge.textContent = '!';
      sprite.appendChild(badge);
    }

    const label = document.createElement('div');
    label.className = 'icon-label';
    label.textContent = app.label;

    iconEl.appendChild(sprite);
    iconEl.appendChild(label);

    const activate = () => { if(app.type === 'tv'){ openTV(); } else { openApp(app); } };
    iconEl.addEventListener('dblclick', activate);
    iconEl.addEventListener('mouseenter', sfxHover);
    let touchTimer = null;
    iconEl.addEventListener('click', e => {
      document.querySelectorAll('.desktop-icon').forEach(el => el.classList.remove('selected'));
      iconEl.classList.add('selected');
      // mobile: single tap opens
      if('ontouchstart' in window){ activate(); }
    });
    iconEl.addEventListener('keydown', e => { if(e.key === 'Enter') activate(); });

    iconContainer.appendChild(iconEl);
  });

  // topbar logo easter egg
  const logo = document.getElementById('logo-click-target');
  logo.addEventListener('click', () => {
    S.logoClicks++;
    if(S.logoClicks === 5 && !isUnlocked('unknown_user')){
      unlock('unknown_user');
      sfxUnlock();
      showToast('UNKNOWN_USER unlocked in AIM_CHAT.');
      refreshAimBadge();
    }
  });

  // sound toggle
  const soundBtn = document.getElementById('sound-toggle');
  updateSoundBtn(soundBtn);
  soundBtn.addEventListener('click', () => {
    S.muted = !S.muted;
    localStorage.setItem('awakenMuted', String(S.muted));
    updateSoundBtn(soundBtn);
    if(S.muted) droneToggle(false);
  });

  document.getElementById('discord-pill').addEventListener('click', () => {
    window.open('https://discord.gg/3hTnm3Pgy2', '_blank');
  });
  document.getElementById('tb-start').addEventListener('click', () => {
    const readme = APPS.find(a => a.id === 'readme');
    openApp(readme);
  });
}

function refreshAimBadge(){
  const el = document.querySelector('.desktop-icon[data-app-id="aim"] .icon-sprite');
  if(el && !el.querySelector('.icon-badge')){
    const badge = document.createElement('div');
    badge.className = 'icon-badge'; badge.textContent = '!';
    el.appendChild(badge);
  }
}

function updateSoundBtn(btn){
  btn.textContent = S.muted ? '🔇' : '♪';
  btn.classList.toggle('active', !S.muted);
}

function startClock(){
  const el = document.getElementById('clock');
  function tick(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    el.textContent = `${hh}:${mm}:${ss}`;
  }
  tick(); setInterval(tick, 1000);
}

/* ---------- toasts ---------- */
function showToast(text){
  const stack = document.getElementById('toast-stack');
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = text;
  stack.appendChild(t);
  setTimeout(() => { t.style.transition = 'opacity 0.3s'; t.style.opacity = '0'; setTimeout(()=>t.remove(), 320); }, 4200);
}

/* ---------- global key handling: typed buffer + konami ---------- */
function globalKeyHandler(e){
  // ignore when typing in inputs
  const tag = (document.activeElement && document.activeElement.tagName) || '';
  if(tag === 'INPUT' || tag === 'TEXTAREA') {
    // still track konami even in inputs? skip to avoid disrupting typing
  } else {
    S.typedBuffer = (S.typedBuffer + e.key).slice(-8).toLowerCase();
    if(S.typedBuffer.endsWith('xp')){
      const mc = APPS.find(a => a.id === 'memory_card');
      if(!S.openWindows.has('memory_card')) { openApp(mc); showToast('typed "XP" — memory card mounted.'); }
      S.typedBuffer = '';
    }
  }
  // konami works globally
  const expected = KONAMI[S.konamiIndex];
  if(e.key === expected || e.key.toLowerCase() === expected){
    S.konamiIndex++;
    if(S.konamiIndex === KONAMI.length){
      S.konamiIndex = 0;
      if(!isUnlocked('secret_archive')){
        unlock('secret_archive');
        sfxUnlock();
        showToast('Hidden file unlocked: /archive/secret/transmission.wav');
        const archiveWin = S.openWindows.get('archive');
        if(archiveWin) renderArchiveSecret(archiveWin.el);
      }
    }
  } else {
    S.konamiIndex = (e.key === KONAMI[0]) ? 1 : 0;
  }
}

/* ---------- window manager ---------- */
function openApp(app){
  if(S.openWindows.has(app.id)){
    focusWindow(app.id);
    return;
  }
  sfxOpen();
  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.appId = app.id;

  const isMobile = window.innerWidth <= 720;
  if(!isMobile){
    win.style.top = Math.floor(50 + Math.random()*90) + 'px';
    win.style.left = Math.floor(60 + Math.random()*220) + 'px';
    win.style.width = '380px';
  }
  win.style.zIndex = ++S.z;

  const header = document.createElement('div');
  header.className = 'window-header';
  const title = document.createElement('div');
  title.className = 'window-title';
  title.textContent = app.label;
  const controls = document.createElement('div');
  controls.className = 'window-controls';
  const minBtn = document.createElement('button'); minBtn.textContent = '_'; minBtn.title = 'Minimize';
  const closeBtn = document.createElement('button'); closeBtn.textContent = '×'; closeBtn.className = 'btn-close'; closeBtn.title = 'Close';
  minBtn.addEventListener('click', () => minimizeWindow(app.id));
  closeBtn.addEventListener('click', () => closeWindow(app.id));
  controls.appendChild(minBtn); controls.appendChild(closeBtn);
  header.appendChild(title); header.appendChild(controls);
  win.appendChild(header);

  const content = document.createElement('div');
  content.className = 'window-content';
  renderAppContent(content, app);
  win.appendChild(content);

  document.getElementById('windows-container').appendChild(win);
  win.addEventListener('mousedown', () => focusWindow(app.id));
  if(!isMobile) makeDraggable(win, header);

  S.openWindows.set(app.id, { el: win, appId: app.id });
  addTaskbarItem(app);
  focusWindow(app.id);

  if(app.id === 'collection') S.openedCollection = true;
  if(app.id === 'trash' && S.openedCollection) revealTrashSecret(content);
  if(app.id === 'archive' && isUnlocked('secret_archive')) renderArchiveSecret(win);
}

function renderAppContent(content, app){
  switch(app.type){
    case 'notepad': {
      const pre = document.createElement('pre');
      pre.textContent = app.content;
      content.appendChild(pre);
      break;
    }
    case 'winamp': createWinamp(content, app.content); break;
    case 'inventory': createInventory(content, app.content); break;
    case 'dialog': createDialog(content, app.content); break;
    case 'file_explorer': createFileExplorer(content, app.content, app.id); break;
    case 'trash': createTrash(content, app.content); break;
    case 'messenger': createMessenger(content, app.content); break;
    case 'memory_card': createMemoryCard(content, app.content); break;
    case 'browser': createBrowser(content, app.content); break;
    default: {
      const p = document.createElement('pre'); p.textContent = 'CONTENT PENDING.'; content.appendChild(p);
    }
  }
}

function addTaskbarItem(app){
  const bar = document.getElementById('tb-apps');
  const item = document.createElement('div');
  item.className = 'taskbar-item active';
  item.dataset.appId = app.id;
  item.textContent = app.label;
  item.addEventListener('click', () => {
    const w = S.openWindows.get(app.id);
    if(!w) return;
    if(w.el.style.display === 'none'){ w.el.style.display = 'flex'; focusWindow(app.id); }
    else focusWindow(app.id);
  });
  bar.appendChild(item);
}
function removeTaskbarItem(appId){
  const el = document.querySelector(`.taskbar-item[data-app-id="${appId}"]`);
  if(el) el.remove();
}
function focusWindow(appId){
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  document.querySelectorAll('.taskbar-item').forEach(w => w.classList.remove('active'));
  const w = S.openWindows.get(appId);
  if(!w) return;
  w.el.style.zIndex = ++S.z;
  w.el.classList.add('focused');
  w.el.style.display = 'flex';
  const tb = document.querySelector(`.taskbar-item[data-app-id="${appId}"]`);
  if(tb) tb.classList.add('active');
}
function minimizeWindow(appId){
  const w = S.openWindows.get(appId);
  if(w) w.el.style.display = 'none';
}
function closeWindow(appId){
  const w = S.openWindows.get(appId);
  if(!w) return;
  sfxClose();
  w.el.classList.add('closing');
  setTimeout(() => { w.el.remove(); }, 130);
  S.openWindows.delete(appId);
  removeTaskbarItem(appId);
  if(appId === 'music') droneToggle(false);
}

function makeDraggable(win, header){
  let offsetX = 0, offsetY = 0, dragging = false;
  header.addEventListener('mousedown', (e) => {
    e.preventDefault();
    dragging = true;
    win.style.zIndex = ++S.z;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
    function onMove(ev){
      if(!dragging) return;
      win.style.left = Math.max(0, ev.clientX - offsetX) + 'px';
      win.style.top = Math.max(30, ev.clientY - offsetY) + 'px';
    }
    function onUp(){ dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

/* ---------- app: winamp ---------- */
function createWinamp(container, data){
  const player = document.createElement('div');
  player.className = 'winamp-player';

  const display = document.createElement('div');
  display.className = 'winamp-display';
  const nowPlaying = document.createElement('span'); nowPlaying.textContent = 'SELECT A TRACK';
  const timer = document.createElement('span'); timer.textContent = '00:00';
  display.appendChild(nowPlaying); display.appendChild(timer);

  const viz = document.createElement('div'); viz.className = 'winamp-viz';
  const bars = [];
  for(let i=0;i<24;i++){ const b = document.createElement('i'); b.style.height = '10%'; viz.appendChild(b); bars.push(b); }
  let vizRAF = null;
  function animateViz(playing){
    if(vizRAF) cancelAnimationFrame(vizRAF);
    function frame(){
      bars.forEach(b => { b.style.height = (playing ? (8 + Math.random()*90) : (4 + Math.random()*6)) + '%'; });
      vizRAF = requestAnimationFrame(frame);
    }
    frame();
  }
  animateViz(false);

  const controls = document.createElement('div'); controls.className = 'winamp-controls';
  const playBtn = document.createElement('button'); playBtn.textContent = '▶';
  const stopBtn = document.createElement('button'); stopBtn.textContent = '■';
  controls.appendChild(playBtn); controls.appendChild(stopBtn);

  let playing = false, elapsed = 0, timerInt = null, current = null;
  function stop(){
    playing = false; playBtn.textContent = '▶';
    clearInterval(timerInt); elapsed = 0; timer.textContent = '00:00';
    droneToggle(false); animateViz(false);
  }
  playBtn.addEventListener('click', () => {
    if(!current) return;
    if(!playing){
      playing = true; playBtn.textContent = '❚❚';
      droneToggle(true); animateViz(true);
      timerInt = setInterval(() => {
        elapsed++;
        const m = String(Math.floor(elapsed/60)).padStart(2,'0');
        const s = String(elapsed%60).padStart(2,'0');
        timer.textContent = `${m}:${s}`;
      }, 1000);
    } else {
      playing = false; playBtn.textContent = '▶';
      clearInterval(timerInt); droneToggle(false); animateViz(false);
    }
  });
  stopBtn.addEventListener('click', stop);

  player.appendChild(display); player.appendChild(viz); player.appendChild(controls);

  const list = document.createElement('div');
  data.tracks.forEach(t => {
    const row = document.createElement('div');
    row.className = 'winamp-track' + (t.locked ? ' locked' : '');
    row.innerHTML = `<span>${t.title}</span><span>${t.locked ? '<span class="lock">LOCKED</span>' : t.duration}</span>`;
    row.addEventListener('click', () => {
      if(t.locked){ showToast(t.status || 'FULL FILE LOCKED'); return; }
      stop();
      current = t;
      nowPlaying.textContent = t.title;
      playBtn.click();
    });
    list.appendChild(row);
  });

  player.appendChild(list);
  container.appendChild(player);
}

/* ---------- app: inventory ---------- */
function createInventory(container, data){
  const status = document.createElement('div'); status.className = 'status-line warn';
  status.textContent = data.status; container.appendChild(status);
  const pre = document.createElement('pre'); pre.style.marginTop = '8px';
  pre.textContent = data.lines.join('\n'); container.appendChild(pre);
  const grid = document.createElement('div'); grid.className = 'inv-grid';
  for(let i=0;i<data.items;i++){
    const item = document.createElement('div'); item.className = 'inv-item';
    item.textContent = `GARMENT_0${i+1}.psd`;
    grid.appendChild(item);
  }
  container.appendChild(grid);
}

/* ---------- app: dialog ---------- */
function createDialog(container, data){
  const dialog = document.createElement('div'); dialog.className = 'dialog-content';
  const icon = document.createElement('div'); icon.className = 'dlg-icon'; icon.textContent = 'AC';
  const title = document.createElement('h3'); title.textContent = data.title;
  const message = document.createElement('p'); message.textContent = data.message;
  const link = document.createElement('a'); link.className = 'btn-primary';
  link.href = data.link; link.target = '_blank'; link.rel = 'noopener'; link.textContent = data.cta;
  dialog.appendChild(icon); dialog.appendChild(title); dialog.appendChild(message); dialog.appendChild(link);
  container.appendChild(dialog);
}

/* ---------- app: file explorer / archive / downloads ---------- */
function createFileExplorer(container, data, appId){
  const notice = document.createElement('div'); notice.className = 'fx-notice';
  notice.textContent = data.notice; container.appendChild(notice);
  const list = document.createElement('ul'); list.className = 'fx-list';
  data.items.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="fx-icon">${item.locked ? '■' : '▫'}</span><span>${item.name}</span>` +
      (item.locked ? '<span class="fx-lock">LOCKED</span>' : `<span class="fx-meta">${item.size || ''}</span>`);
    li.addEventListener('click', () => {
      if(item.locked){ showToast('Signal too weak to recover this file.'); return; }
      if(item.download){ downloadWallpaper(); return; }
      showToast(`${item.name} — no preview available yet.`);
    });
    list.appendChild(li);
  });
  container.appendChild(list);
  if(appId === 'archive'){
    container.dataset.secretSlot = '1';
  }
}
function renderArchiveSecret(winEl){
  const content = winEl.el ? winEl.el.querySelector('.window-content') : winEl.querySelector('.window-content');
  if(!content || content.querySelector('.fx-secret')) return;
  const list = content.querySelector('.fx-list');
  if(!list) return;
  const li = document.createElement('li');
  li.className = 'fx-secret';
  li.innerHTML = `<span class="fx-icon">▫</span><span>transmission.wav</span><span class="fx-meta">2.1kb</span>`;
  li.addEventListener('click', () => showToast('transmission.wav — [static] ...you found it.'));
  list.appendChild(li);
}

function downloadWallpaper(){
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
    <rect width="1200" height="1200" fill="#070707"/>
    <g fill="none" stroke="#e5001a" stroke-width="1" opacity="0.5">
      ${Array.from({length: 40}).map((_,i)=>`<line x1="0" y1="${i*30}" x2="1200" y2="${i*30}"/>`).join('')}
    </g>
    <text x="600" y="600" font-family="Anton, sans-serif" font-size="120" fill="#f4f2ec" text-anchor="middle" opacity="0.9">AWAKEN</text>
    <text x="600" y="700" font-family="monospace" font-size="24" fill="#39ff14" text-anchor="middle">NETWORK.WALLPAPER.01</text>
  </svg>`;
  const blob = new Blob([svg], {type:'image/svg+xml'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'awaken_wallpaper_01.svg';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 2000);
  showToast('wallpaper_01.svg downloaded.');
}

/* ---------- app: trash ---------- */
function createTrash(container, data){
  const notice = document.createElement('div'); notice.className = 'fx-notice';
  notice.textContent = data.notice; container.appendChild(notice);
  const list = document.createElement('ul'); list.className = 'fx-list';
  data.items.forEach(name => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="fx-icon">×</span><span>${name}</span>`;
    li.addEventListener('click', () => showToast('permanently deleted. or was it.'));
    list.appendChild(li);
  });
  container.appendChild(list);
  container.dataset.trashList = '1';
}
function revealTrashSecret(container){
  if(container.querySelector('.trash-secret')) return;
  const div = document.createElement('div'); div.className = 'trash-secret';
  div.style.marginTop = '10px'; div.style.paddingTop = '10px'; div.style.borderTop = '1px dashed #333';
  const label = document.createElement('div'); label.className = 'status-line red';
  label.textContent = 'ADDITIONAL FILES FOUND (opened after COLLECTION.EXE):';
  div.appendChild(label);
  const pre = document.createElement('pre');
  pre.textContent = 'garment_05_cancelled.psd\n"final final v9 ACTUALLY FINAL.ai"\nrefund_email_draft_DO_NOT_SEND.txt';
  div.appendChild(pre);
  container.appendChild(div);
}

/* ---------- app: messenger (AIM) ---------- */
function createMessenger(container, data){
  container.style.padding = '0';
  const wrap = document.createElement('div'); wrap.className = 'messenger';

  const buddyList = document.createElement('div'); buddyList.className = 'buddy-list';
  const header = document.createElement('div'); header.className = 'buddy-list-header'; header.textContent = 'BUDDIES';
  buddyList.appendChild(header);

  const chatPane = document.createElement('div'); chatPane.className = 'chat-pane';
  const chatLog = document.createElement('div'); chatLog.className = 'chat-log';
  const typing = document.createElement('div'); typing.className = 'chat-typing'; typing.style.display = 'none';
  const inputRow = document.createElement('div'); inputRow.className = 'chat-input-row';
  const input = document.createElement('input'); input.placeholder = 'select a buddy first...'; input.disabled = true;
  const sendBtn = document.createElement('button'); sendBtn.textContent = 'send';
  inputRow.appendChild(input); inputRow.appendChild(sendBtn);
  chatPane.appendChild(chatLog); chatPane.appendChild(typing); chatPane.appendChild(inputRow);

  let activeBuddy = null;
  const buddies = [...data.buddies];
  if(isUnlocked('unknown_user')) buddies.push({ id: 'unknown_user', name: 'unknown_user', state: 'mystery' });

  function openConvo(buddy, el){
    document.querySelectorAll('.buddy').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    activeBuddy = buddy.id;
    chatLog.innerHTML = '';
    input.disabled = false; input.placeholder = `message ${buddy.name}...`;
    const script = data.scripts[buddy.id] || [];
    let i = 0;
    typing.style.display = 'block'; typing.textContent = `${buddy.name} is typing...`;
    function playNext(){
      if(i >= script.length){ typing.style.display = 'none'; return; }
      typing.style.display = 'block'; typing.textContent = `${buddy.name} is typing...`;
      setTimeout(() => {
        appendMsg(chatLog, buddy.name, script[i].text, false);
        i++;
        if(i < script.length){ setTimeout(playNext, 500); } else { typing.style.display = 'none'; }
      }, 500 + Math.random()*500);
    }
    playNext();
  }

  buddies.forEach(b => {
    const el = document.createElement('div');
    el.className = `buddy ${b.state}`;
    el.innerHTML = `<span class="dot"></span><span>${b.name}</span>`;
    el.addEventListener('click', () => openConvo(b, el));
    buddyList.appendChild(el);
  });

  function send(){
    const val = input.value.trim();
    if(!val || !activeBuddy) return;
    appendMsg(chatLog, 'you', val, true);
    input.value = '';
    setTimeout(() => {
      const replies = ['signal unclear.', 'try again later.', '...', 'check the archive.', 'not yet.'];
      appendMsg(chatLog, activeBuddy, replies[Math.floor(Math.random()*replies.length)], false);
    }, 700);
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', e => { if(e.key === 'Enter') send(); });

  wrap.appendChild(buddyList); wrap.appendChild(chatPane);
  container.appendChild(wrap);
}
function appendMsg(log, who, text, isMe){
  const div = document.createElement('div'); div.className = 'chat-msg' + (isMe ? ' me' : '');
  div.innerHTML = `<div class="who">${who}</div><div class="bubble"></div>`;
  div.querySelector('.bubble').textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

/* ---------- app: memory card ---------- */
function createMemoryCard(container, data){
  container.style.padding = '0';
  const wrap = document.createElement('div'); wrap.className = 'mc-wrap';
  const grid = document.createElement('div'); grid.className = 'mc-grid';
  data.saves.forEach(name => {
    const slot = document.createElement('div');
    slot.className = 'mc-slot' + (name === 'CORRUPTED_SAVE' ? ' corrupted' : '');
    const icon = document.createElement('div'); icon.className = 'mc-icon'; icon.textContent = name;
    const label = document.createElement('div'); label.className = 'mc-label'; label.textContent = name;
    slot.appendChild(icon); slot.appendChild(label);
    slot.addEventListener('click', () => {
      if(name === 'CORRUPTED_SAVE'){ showToast('SAVE DATA CORRUPTED. cannot load.'); return; }
      showToast(`${name} — preview locked. signal too weak.`);
    });
    grid.appendChild(slot);
  });
  wrap.appendChild(grid);
  const hint = document.createElement('div'); hint.className = 'mc-hint'; hint.textContent = 'PRESS ENTER TO LOAD  //  ESC TO CANCEL';
  wrap.appendChild(hint);
  container.appendChild(wrap);
}

/* ---------- app: browser (internet) ---------- */
function createBrowser(container, data){
  container.style.padding = '0';
  const chrome = document.createElement('div'); chrome.className = 'browser-chrome';
  const bar = document.createElement('div'); bar.className = 'browser-bar';
  bar.innerHTML = `<span>&larr;</span><span>&rarr;</span><span>&#8635;</span><div class="addr">${data.url}</div>`;
  chrome.appendChild(bar);
  container.appendChild(chrome);

  const body = document.createElement('div'); body.className = 'browser-body';

  const marquee = document.createElement('div'); marquee.className = 'marquee-wrap';
  const track = document.createElement('div'); track.className = 'marquee-track'; track.textContent = data.marquee;
  marquee.appendChild(track); body.appendChild(marquee);

  let hits = parseInt(localStorage.getItem('awakenHits') || '104829', 10) + Math.floor(Math.random()*3);
  localStorage.setItem('awakenHits', String(hits));
  const counter = document.createElement('div'); counter.className = 'hit-counter';
  String(hits).split('').forEach(d => { const i = document.createElement('i'); i.textContent = d; counter.appendChild(i); });
  body.appendChild(counter);

  const news = document.createElement('pre');
  news.textContent = data.news.join('\n');
  body.appendChild(news);

  const gb = document.createElement('div'); gb.className = 'guestbook';
  const gbTitle = document.createElement('div'); gbTitle.className = 'status-line'; gbTitle.textContent = 'GUESTBOOK';
  gb.appendChild(gbTitle);
  const entries = document.createElement('div'); entries.id = 'gb-entries';
  const saved = JSON.parse(localStorage.getItem('awakenGuestbook') || '[]');
  saved.forEach(e => entries.appendChild(gbEntryEl(e)));
  gb.appendChild(entries);
  const ta = document.createElement('textarea'); ta.placeholder = 'sign the guestbook...';
  const btn = document.createElement('button'); btn.textContent = 'SIGN';
  btn.addEventListener('click', () => {
    const val = ta.value.trim(); if(!val) return;
    const entry = { name: 'visitor_' + Math.floor(Math.random()*999), text: val, t: Date.now() };
    const list = JSON.parse(localStorage.getItem('awakenGuestbook') || '[]');
    list.unshift(entry);
    localStorage.setItem('awakenGuestbook', JSON.stringify(list.slice(0,20)));
    entries.prepend(gbEntryEl(entry));
    ta.value = '';
  });
  gb.appendChild(ta); gb.appendChild(btn);
  body.appendChild(gb);

  container.appendChild(body);
}
function gbEntryEl(e){
  const div = document.createElement('div'); div.className = 'gb-entry';
  div.innerHTML = `<span class="gb-name">${e.name}</span>: ${e.text}`;
  return div;
}

/* ---------- TV channel overlay ---------- */
function openTV(){
  const overlay = document.getElementById('tv-overlay');
  overlay.classList.add('show');
  const staticEl = document.getElementById('tv-static');
  if(!staticEl.innerHTML){
    staticEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"><filter id="tvn"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#tvn)"/></svg>`;
  }
  renderTVChannel();
  overlay.onclick = () => { S.tvChannel = (S.tvChannel + 1) % TV_CHANNELS.length; renderTVChannel(); beep({freq:200,dur:0.06,type:'square',gain:0.04}); };
}
function renderTVChannel(){
  const ch = TV_CHANNELS[S.tvChannel];
  const frame = document.getElementById('tv-frame');
  frame.innerHTML = `
    <div class="tv-channel-num">CH ${ch.num}</div>
    <div class="tv-headline">${ch.headline}</div>
    <div class="tv-phone">${ch.phone}</div>
    <div class="tv-legal">${ch.legal}</div>
    <div class="tv-hint">click to change channel &nbsp;//&nbsp; press ESC to power off</div>`;
}
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    const overlay = document.getElementById('tv-overlay');
    if(overlay.classList.contains('show')) overlay.classList.remove('show');
  }
});
