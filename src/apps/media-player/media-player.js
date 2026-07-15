import { mediaProviderEmbed } from "../../domain/media.js";
import { AWAKEN_EVENTS, awakenBus } from "../../system/event-bus.js";

const FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const PRESETS = { flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], bass: [8, 7, 5, 3, 1, 0, -1, -2, -2, -2], vocal: [-3, -2, -1, 1, 3, 5, 5, 3, 1, -1], bright: [-3, -2, -1, 0, 1, 2, 4, 6, 7, 8], club: [5, 4, 2, 0, -1, 1, 3, 4, 5, 4] };

export function renderMediaPlayer(container, { projects = [], links = {}, audio: previewAudio = null }) {
  container.innerHTML = playerMarkup(projects);
  const find = (selector) => container.querySelector(selector);
  const audio = document.createElement("audio");
  audio.preload = "metadata";
  let audioContext = null;
  let analyser = null;
  let filters = [];
  let playlist = [];
  let currentIndex = -1;
  let visualization = 0;
  let frame = 0;
  let disposed = false;
  let provider = "apple";

  function ensureAudioGraph() {
    if (audioContext) return audioContext;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) throw new Error("Web Audio is unavailable in this browser.");
    audioContext = new Context();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    const source = audioContext.createMediaElementSource(audio);
    filters = FREQUENCIES.map((frequency, index) => {
      const filter = audioContext.createBiquadFilter();
      filter.type = index === 0 ? "lowshelf" : index === FREQUENCIES.length - 1 ? "highshelf" : "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 1.05;
      return filter;
    });
    source.connect(filters[0]);
    filters.forEach((filter, index) => filter.connect(filters[index + 1] || analyser));
    analyser.connect(audioContext.destination);
    return audioContext;
  }

  function renderPlaylist() {
    const list = find("[data-tracks]");
    list.innerHTML = playlist.length ? "" : `<p class="media-empty">Add MP3, WAV, M4A, OGG, or other browser-supported audio.</p>`;
    playlist.forEach((track, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `media-track${index === currentIndex ? " active" : ""}`;
      button.innerHTML = `<span>${index === currentIndex && !audio.paused ? "PLAY" : "AUDIO"}</span><strong>${escapeHtml(track.name.replace(/\.[^.]+$/, ""))}</strong><small>${escapeHtml(track.duration || track.type || "local")}</small>`;
      button.addEventListener("click", () => loadTrack(index, true));
      list.appendChild(button);
    });
  }

  async function play() {
    try {
      await ensureAudioGraph().resume();
      if (currentIndex < 0 && playlist.length) loadTrack(0, false);
      if (currentIndex < 0 && previewAudio?.src) {
        playlist.push({ name: "AWAKEN audio preview", url: previewAudio.src, type: "AWAKEN preview" });
        loadTrack(0, false);
      }
      await audio.play();
      awakenBus.emit(AWAKEN_EVENTS.MEDIA_PLAY, { source: "local", title: playlist[currentIndex]?.name || "preview" });
      find("[data-status]").textContent = "Playing local audio";
      renderPlaylist();
    } catch (error) {
      find("[data-status]").textContent = error.message;
    }
  }

  function loadTrack(index, autoplay) {
    if (!playlist.length) return;
    currentIndex = (index + playlist.length) % playlist.length;
    audio.src = playlist[currentIndex].url;
    find("[data-title]").textContent = playlist[currentIndex].name.replace(/\.[^.]+$/, "");
    find("[data-artist]").textContent = "Local media / AWAKEN Gallery compatible";
    renderPlaylist();
    if (autoplay) void play();
  }

  function addFiles(files) {
    for (const file of files) {
      if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|aac|flac)$/i.test(file.name)) continue;
      const track = { name: file.name, type: file.type || "audio", url: URL.createObjectURL(file) };
      const probe = new Audio(track.url);
      probe.addEventListener("loadedmetadata", () => { track.duration = formatTime(probe.duration); renderPlaylist(); }, { once: true });
      playlist.push(track);
    }
    renderPlaylist();
    if (currentIndex < 0 && playlist.length) loadTrack(0, false);
  }

  function applyPreset(name) {
    const values = PRESETS[name] || PRESETS.flat;
    container.querySelectorAll("[data-band]").forEach((input, index) => {
      input.value = values[index];
      input.previousElementSibling.value = `${values[index] > 0 ? "+" : ""}${values[index]}`;
      if (filters[index]) filters[index].gain.value = find("[data-eq-on]").checked ? values[index] : 0;
    });
  }

  function loadEmbed(url) {
    const source = mediaProviderEmbed(provider, url);
    const frame = find("[data-stream-frame]");
    if (!source) { find("[data-status]").textContent = `That ${provider} URL is not supported.`; return; }
    frame.innerHTML = `<iframe title="Official ${provider} player" src="${escapeHtml(source)}" loading="lazy" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    find("[data-status]").textContent = `Official ${provider} embed loaded. EQ applies only to local audio.`;
  }

  find("[data-files]").addEventListener("change", (event) => addFiles(event.target.files));
  find("[data-add]").addEventListener("click", () => find("[data-files]").click());
  find("[data-play]").addEventListener("click", play);
  find("[data-pause]").addEventListener("click", () => { audio.pause(); awakenBus.emit(AWAKEN_EVENTS.MEDIA_PAUSE); renderPlaylist(); });
  find("[data-stop]").addEventListener("click", () => { audio.pause(); audio.currentTime = 0; awakenBus.emit(AWAKEN_EVENTS.MEDIA_STOP); });
  find("[data-prev]").addEventListener("click", () => loadTrack(currentIndex - 1, true));
  find("[data-next]").addEventListener("click", () => loadTrack(currentIndex + 1, true));
  find("[data-clear]").addEventListener("click", () => { audio.pause(); playlist.forEach((track) => URL.revokeObjectURL(track.url)); playlist = []; currentIndex = -1; audio.removeAttribute("src"); renderPlaylist(); });
  find("[data-volume]").addEventListener("input", (event) => { audio.volume = Number(event.target.value); });
  find("[data-seek]").addEventListener("input", (event) => { if (audio.duration) audio.currentTime = Number(event.target.value) / 1000 * audio.duration; });
  find("[data-mode]").addEventListener("click", () => { visualization = (visualization + 1) % 3; find("[data-viz-label]").textContent = ["SPECTRUM", "OSCILLOSCOPE", "PEAKS"][visualization]; });
  find("[data-preset]").addEventListener("change", (event) => applyPreset(event.target.value));
  find("[data-eq-on]").addEventListener("change", () => applyPreset(find("[data-preset]").value));
  container.querySelectorAll("[data-band]").forEach((input, index) => input.addEventListener("input", () => { input.previousElementSibling.value = input.value; if (filters[index]) filters[index].gain.value = find("[data-eq-on]").checked ? Number(input.value) : 0; }));
  container.querySelectorAll("[data-provider]").forEach((button) => button.addEventListener("click", () => { provider = button.dataset.provider; container.querySelectorAll("[data-provider]").forEach((item) => item.classList.toggle("active", item === button)); find("[data-stream-url]").placeholder = `Paste an official ${provider} URL`; }));
  find("[data-load-stream]").addEventListener("click", () => loadEmbed(find("[data-stream-url]").value.trim()));
  find("[data-clear-stream]").addEventListener("click", () => { find("[data-stream-frame]").innerHTML = ""; });
  container.querySelectorAll("[data-release]").forEach((button) => button.addEventListener("click", () => { const project = projects.find((item) => item.id === button.dataset.release); if (project?.url) { provider = "apple"; find("[data-stream-url]").value = project.url; loadEmbed(project.url); } }));

  audio.addEventListener("timeupdate", () => { find("[data-current]").textContent = formatTime(audio.currentTime); find("[data-duration]").textContent = formatTime(audio.duration); find("[data-seek]").value = audio.duration ? String(audio.currentTime / audio.duration * 1000) : "0"; });
  audio.addEventListener("ended", () => loadTrack(currentIndex + 1, true));
  drawVisualizer(find("canvas"), () => ({ analyser, visualization, disposed }), (id) => { frame = id; });
  awakenBus.emit(AWAKEN_EVENTS.MEDIA_OPEN);

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    audio.pause();
    audio.removeAttribute("src");
    playlist.forEach((track) => URL.revokeObjectURL(track.url));
    if (audioContext) void audioContext.close();
    awakenBus.emit(AWAKEN_EVENTS.MEDIA_STOP, { reason: "closed" });
  };
}

function playerMarkup(projects) {
  return `<div class="media-studio"><aside class="media-library"><strong>AWAKEN Media Player</strong><span>Media Library</span><span>Local Audio</span><span>Atlas Releases</span><span>Official Streams</span></aside><main class="media-main"><section class="media-now"><div class="media-art">A</div><div><h2 data-title>No track loaded</h2><p data-artist>AWAKEN local signal</p><div class="media-visual"><canvas width="900" height="250"></canvas><span data-viz-label>SPECTRUM</span></div></div></section><div class="media-transport"><button type="button" data-prev aria-label="Previous">|&lt;</button><button type="button" data-play aria-label="Play">Play</button><button type="button" data-pause aria-label="Pause">Pause</button><button type="button" data-stop aria-label="Stop">Stop</button><button type="button" data-next aria-label="Next">&gt;|</button><input data-seek aria-label="Seek" type="range" min="0" max="1000" value="0"><span><b data-current>0:00</b> / <b data-duration>0:00</b></span></div><section class="media-releases"><h3>Verified public Atlas releases</h3><div>${projects.filter((project) => project.tracks?.length).map((project) => `<button type="button" data-release="${escapeHtml(project.id)}"><img src="${escapeHtml(project.cover)}" alt=""><strong>${escapeHtml(project.title)}</strong><small>${escapeHtml(`${project.type} / ${project.year}`)}</small></button>`).join("")}</div></section><section class="media-stream"><div class="media-tabs"><button type="button" class="active" data-provider="apple">Apple Music</button><button type="button" data-provider="soundcloud">SoundCloud</button><button type="button" data-provider="spotify">Spotify</button></div><div><input data-stream-url placeholder="Paste an official apple URL"><button type="button" data-load-stream>Load</button><button type="button" data-clear-stream>Clear</button></div><div class="media-stream-frame" data-stream-frame></div></section><section class="media-lower"><div class="media-playlist"><div><button type="button" data-add>Add files</button><button type="button" data-clear>Clear</button><button type="button" data-mode>Visualization</button><label>Volume <input data-volume type="range" min="0" max="1" step=".01" value=".85"></label></div><div data-tracks></div></div><aside class="media-eq"><strong>Graphic Equalizer</strong><div><label><input data-eq-on type="checkbox" checked> On</label><select data-preset>${Object.keys(PRESETS).map((preset) => `<option value="${preset}">${preset}</option>`).join("")}</select></div><div class="media-bands">${FREQUENCIES.map((frequency, index) => `<label><output>0</output><input data-band="${index}" aria-label="${frequency} Hz gain" type="range" min="-12" max="12" value="0"><span>${frequency >= 1000 ? `${frequency / 1000}k` : frequency}</span></label>`).join("")}</div></aside></section><footer data-status>Ready</footer><input hidden data-files type="file" multiple accept="audio/*"></main></div>`;
}

function drawVisualizer(canvas, state, setFrame) {
  const context = canvas.getContext("2d");
  const frequency = new Uint8Array(512);
  const waveform = new Uint8Array(1024);
  let tick = 0;
  function draw() {
    const { analyser, visualization, disposed } = state();
    if (disposed) return;
    const width = canvas.width;
    const height = canvas.height;
    context.fillStyle = "#030704";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#164626";
    for (let x = 0; x < width; x += 45) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); }
    if (analyser && visualization === 1) {
      analyser.getByteTimeDomainData(waveform);
      context.strokeStyle = "#47f080";
      context.beginPath();
      waveform.forEach((value, index) => { const x = index / waveform.length * width; const y = value / 255 * height; index ? context.lineTo(x, y) : context.moveTo(x, y); });
      context.stroke();
    } else {
      if (analyser) analyser.getByteFrequencyData(frequency);
      for (let index = 0; index < 48; index += 1) {
        const level = analyser ? frequency[Math.floor(index / 48 * frequency.length * .7)] / 255 : (Math.sin(tick / 15 + index) + 1) * .12;
        const barHeight = Math.max(3, level * (height - 18));
        context.fillStyle = index % 3 === 0 ? "#da4a44" : index % 3 === 1 ? "#47f080" : "#d8ef37";
        context.fillRect(index * width / 48 + 2, height - barHeight, width / 48 - 4, barHeight);
      }
    }
    tick += 1;
    setFrame(requestAnimationFrame(draw));
  }
  draw();
}

function formatTime(seconds) { return Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}` : "0:00"; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]); }
