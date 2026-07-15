export const atlasSeed = Object.freeze({
  entities: [
    entity("group-awaken-cult", "awaken-cult", "group", "AWAKEN CULT", "AWAKEN CULT connects music, visual work, community projects, and the NETWORK OS archive.", "public", "official_source_verified", 1, true, ["official-website"]),
    person("person-anticalvin", "anticalvin", "anticalvin"),
    person("person-hannahlleila", "hannahlleila", "hannahlleila"),
    person("person-josh-otis", "josh-otis", "Josh Otis"),
    person("person-htl", "htl", "HTL"),
    person("person-nashe", "nashe", "Na$he"),
    person("person-typhoon", "typhoon", "Typhoon"),
    collection("collection-wasted-youth", "wasted-youth", "Wasted Youth"),
    collection("collection-eyes-wide-shut", "eyes-wide-shut", "Eyes Wide Shut"),
    collection("collection-hated", "hated-collection", "HATED"),
    collection("collection-noise", "noise-collection", "NOISE"),
    collection("collection-state-of-mind", "state-of-mind-collection", "State Of Mind"),
    release("release-xp", "xp", "XP", "EP released in 2019.", "2019-01-08", "https://music.apple.com/za/album/xp-ep/1448922005"),
    release("release-hated", "hated", "HATED", "Album released in 2019.", "2019-10-11", "https://music.apple.com/za/album/hated-deluxe-edition/1483667677"),
    release("release-xpv2", "xpv2", "XPV2", "EP released in 2021.", "2021-07-01", "https://music.apple.com/za/album/xpv2-ep/1574765564"),
    release("release-new-swag-who-dis", "new-swag-who-dis", "NEW SWAG WHO DIS?", "Single released in 2021.", "2021-08-20", "https://music.apple.com/za/album/new-swag-who-dis-feat-josh-otis-pari%24-single/1581835842"),
    release("release-central-african-time", "central-african-time", "CENTRAL AFRICAN TIME", "Single released in 2022.", "2022-04-22", "https://music.apple.com/za/album/central-african-time-feat-josh-otis-single/1620423087"),
    release("release-state-of-mind", "state-of-mind", "State Of Mind", "EP released in 2022.", "2022-06-28", "https://music.apple.com/za/album/state-of-mind-ep/1656676894"),
    entity("platform-soundcloud", "soundcloud", "platform", "AWAKEN SoundCloud", "Official AWAKEN CULT music profile on SoundCloud.", "public", "official_source_verified", 1, true, ["official-soundcloud"], { url: "https://soundcloud.com/awakencult" }),
    entity("concept-atlas", "awaken-atlas", "concept", "AWAKEN Atlas", "Canonical knowledge layer for the existing NETWORK.", "private", "human_verified", 1, false, ["human-atlas-handoff-2026-07-14"])
  ],
  relationships: [
    ...["person-anticalvin", "person-hannahlleila", "person-josh-otis", "person-htl", "person-nashe", "person-typhoon"].map((id, index) => ({ id: `relationship-core-member-${index + 1}`, subjectId: id, predicate: "member_of", objectId: "group-awaken-cult", role: "core member", verificationState: "human_verified", confidence: 1, publicVisible: false, sourceRefs: ["human-atlas-handoff-2026-07-14"] })),
    { id: "relationship-awaken-soundcloud", subjectId: "group-awaken-cult", predicate: "published_on", objectId: "platform-soundcloud", verificationState: "official_source_verified", confidence: 1, publicVisible: true, sourceRefs: ["official-soundcloud"] }
  ],
  sources: [
    { id: "official-website", sourceType: "official_website", title: "AWAKEN CULT", sourceUrl: "https://awakencult.com/", confidence: 1, publicSafe: true },
    { id: "official-soundcloud", sourceType: "official_platform", title: "AWAKEN CULT on SoundCloud", sourceUrl: "https://soundcloud.com/awakencult", confidence: 1, publicSafe: true },
    { id: "human-atlas-handoff-2026-07-14", sourceType: "human_testimony", title: "AWAKEN Atlas handoff corrections", internalRef: "Owner-provided project handoff, 2026-07-14", confidence: 1, publicSafe: false }
  ]
});

function person(id, slug, name) { return entity(id, slug, "person", name, "", "private", "human_verified", 1, false, ["human-atlas-handoff-2026-07-14"], { relationshipStatus: "member" }); }
function collection(id, slug, name) { return entity(id, slug, "collection", name, "", "private", "human_verified", 1, false, ["human-atlas-handoff-2026-07-14"]); }
function release(id, slug, name, summary, date, url) { return entity(id, slug, "release", name, summary, "public", "official_source_verified", 1, true, [url], { officialUrl: url, releaseDate: date }, date); }
function entity(id, slug, entityType, name, summary, publicationState, verificationState, confidence, publicVisible, sourceRefs = [], metadata = {}, startDate = null) {
  return { id, slug, entityType, name, summary, publicationState, verificationState, confidence, publicVisible, sourceRefs, metadata, startDate };
}
