export const TEAM_MEMBERS = Object.freeze([
  { id: "anticalvin", slug: "anticalvin", displayName: "anticalvin" },
  { id: "hannahlleila", slug: "hannahlleila", displayName: "hannahlleila" },
  { id: "josh-otis", slug: "josh-otis", displayName: "Josh Otis" },
  { id: "htl", slug: "htl", displayName: "HTL" },
  { id: "nashe", slug: "nashe", displayName: "Na$he" },
  { id: "typhoon", slug: "typhoon", displayName: "Typhoon" }
]);

export function contributorCreditsMarkup(contributors = []) {
  if (!contributors.length) return "";
  return `<p class="content-credits">Credits: ${contributors.map((person) => `<button type="button" data-contributor="${person.slug}">${escapeHtml(person.displayName)}</button>`).join(", ")}</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
