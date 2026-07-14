export const TEAM_MEMBERS = Object.freeze([
  { id: "josh-otis", slug: "josh-otis", displayName: "Josh Otis" },
  { id: "anti-colvin", slug: "anti-colvin", displayName: "Anti-Colvin" },
  { id: "htl", slug: "htl", displayName: "HTL" },
  { id: "nashay", slug: "nashay", displayName: "Nashay" },
  { id: "typhoon", slug: "typhoon", displayName: "Typhoon" },
  { id: "digital", slug: "digital", displayName: "Digital" }
]);

export function contributorCreditsMarkup(contributors = []) {
  if (!contributors.length) return "";
  return `<p class="content-credits">Credits: ${contributors.map((person) => `<button type="button" data-contributor="${person.slug}">${escapeHtml(person.displayName)}</button>`).join(", ")}</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
