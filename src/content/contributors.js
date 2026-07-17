export const TEAM_MEMBERS = Object.freeze([
  { id: "anticalvin", slug: "anticalvin", displayName: "anticalvin", roleLabel: "AWAKEN founder and creative director", biography: "anticalvin shapes the AWAKEN world across music, software, image-making, archives, and connected experiments.", externalUrl: "https://calvinck.com/" },
  { id: "hannahlleila", slug: "hannahlleila", displayName: "hannahlleila", roleLabel: "AWAKEN member", biography: "hannahlleila is part of the people and creative history held inside the AWAKEN archive." },
  { id: "josh-otis", slug: "josh-otis", displayName: "Josh Otis", roleLabel: "AWAKEN artist and collaborator", biography: "Josh Otis appears throughout the AWAKEN catalog and its connected visual and musical archive.", externalUrl: "https://joshotis.awakencult.com/" },
  { id: "htl", slug: "htl", displayName: "HTL", roleLabel: "AWAKEN member", biography: "HTL is part of the AWAKEN network and its evolving collection of collaborative work." },
  { id: "nashe", slug: "nashe", displayName: "Na$he", roleLabel: "AWAKEN artist and collaborator", biography: "Na$he is an AWAKEN artist whose presence runs through the XP era and the wider NETWORK." },
  { id: "typhoon", slug: "typhoon", displayName: "Typhoon", roleLabel: "AWAKEN member", biography: "Typhoon is part of the AWAKEN team and the shared history collected by the NETWORK." }
]);

export function contributorCreditsMarkup(contributors = []) {
  if (!contributors.length) return "";
  return `<p class="content-credits">Credits: ${contributors.map((person) => `<button type="button" data-contributor="${person.slug}">${escapeHtml(person.displayName)}</button>`).join(", ")}</p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}
