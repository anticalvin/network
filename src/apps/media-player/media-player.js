export function renderMediaPlayer(container, { projects, links, audio }) {
  container.innerHTML = `
    <div class="media-player">
      <aside class="media-nav">
        <strong>AWAKEN Media Player</strong>
        <button type="button" data-artist>Apple Music</button>
        <button type="button" data-soundcloud>SoundCloud</button>
        <button type="button" data-spotify>Spotify</button>
        <button type="button" data-youtube>YouTube</button>
      </aside>
      <section class="media-now">
        <canvas class="media-visualizer" width="640" height="220" aria-hidden="true"></canvas>
        <div class="media-controls">
          <button type="button" data-play>Play Preview</button>
          <button type="button" data-stop>Stop</button>
          <span data-track>AWAKEN audio preview</span>
        </div>
        <div class="media-list">
          ${projects.filter((project) => project.tracks.length).map((project) => `<button type="button" data-project="${project.id}"><img src="${project.cover}" alt=""><span>${project.title}<small>${project.type} / ${project.year}</small></span></button>`).join("")}
        </div>
      </section>
    </div>
  `;
  const canvas = container.querySelector("canvas");
  const stopViz = startVisualizer(canvas);
  container.querySelector("[data-play]").addEventListener("click", () => {
    audio.currentTime = 0;
    void audio.play();
  });
  container.querySelector("[data-stop]").addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
  });
  container.querySelector("[data-artist]").addEventListener("click", () => openExternal(links.appleArtist));
  container.querySelector("[data-soundcloud]").addEventListener("click", () => openExternal(links.soundcloud));
  container.querySelector("[data-spotify]").addEventListener("click", () => openExternal(links.spotify));
  container.querySelector("[data-youtube]").addEventListener("click", () => openExternal(links.youtube));
  container.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => openExternal(projects.find((project) => project.id === button.dataset.project)?.url));
  });
  return () => {
    stopViz();
    audio.pause();
  };
}

function openExternal(url) {
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

function startVisualizer(canvas) {
  const context = canvas.getContext("2d");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  let frame = 0;
  function draw() {
    const width = canvas.width;
    const height = canvas.height;
    context.fillStyle = "#050505";
    context.fillRect(0, 0, width, height);
    for (let i = 0; i < 34; i += 1) {
      const level = reduced ? 0.45 : (Math.sin(frame / 12 + i) + 1) / 2;
      const barHeight = 18 + level * (height - 42);
      context.fillStyle = i % 3 === 0 ? "#da4a44" : i % 3 === 1 ? "#008080" : "#d8d8d8";
      context.fillRect(12 + i * 18, height - barHeight - 12, 10, barHeight);
    }
    frame += 1;
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  draw();
  return () => cancelAnimationFrame(raf);
}
