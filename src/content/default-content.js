export const CONTENT_VERSION = 1;

export const defaultContent = {
  version: CONTENT_VERSION,
  updatedAt: "2026-07-11T00:00:00+02:00",
  timezone: "Africa/Johannesburg",
  interface: {
    productName: "AWAKEN NETWORK",
    userLabel: "visitor",
    startPlaceholder: "Search apps, files, projects...",
    memoryCardEmpty: "Nothing saved yet. Save an archive item, image, link, or transmission to keep it here.",
    remoteFallback: "Showing the last safe local edition."
  },
  links: [
    { id: "website", label: "Website", detail: "Official AWAKEN CULT site.", url: "https://awakencult.com/", verified: true },
    { id: "instagram", label: "Instagram", detail: "Official @awakencult profile.", url: "https://instagram.com/awakencult", verified: true },
    { id: "x", label: "X", detail: "Official @awakencult profile.", url: "https://x.com/awakencult", verified: true },
    { id: "youtube", label: "YouTube", detail: "Official AWAKEN CULT channel.", url: "https://www.youtube.com/@awakencult", verified: true },
    { id: "discord", label: "Discord", detail: "Community invite.", url: "https://discord.gg/3hTnm3Pgy2", verified: true },
    { id: "vzn", label: "VZN", detail: "AWAKEN CULT spatial social world.", url: "https://vzn.awakencult.com/", verified: true },
    { id: "noise", label: "NOISE", detail: "Node-based artwork and export tool.", url: "https://noise.awakencult.com/", verified: true },
    { id: "soundcloud", label: "SoundCloud", detail: "AWAKEN CULT music profile.", url: "https://soundcloud.com/awakencult", verified: true },
    { id: "apple", label: "Apple Music", detail: "AWAKEN CULT artist catalog.", url: "https://music.apple.com/za/artist/awaken-cult/1448907538", verified: true }
  ],
  themes: [
    { id: "awaken-red", label: "AWAKEN Red", color: "#da4a44", enabled: true, sortOrder: 1 },
    { id: "xp-teal", label: "XP Teal", color: "#008080", enabled: true, sortOrder: 2 },
    { id: "xp-blue", label: "XP Blue", color: "#245edb", enabled: true, sortOrder: 3 },
    { id: "xp-olive", label: "XP Olive", color: "#6f7f2a", enabled: true, sortOrder: 4 },
    { id: "xp-silver", label: "XP Silver", color: "#b7bcc8", enabled: true, sortOrder: 5 },
    { id: "black", label: "Black", color: "#050505", enabled: true, sortOrder: 6 }
  ],
  transmissions: [
    {
      id: "noise-tool-2026-v1",
      internalTitle: "NOISE public tool",
      publicTitle: "NOISE",
      primaryCopy: "The node editor is available on desktop and mobile.",
      secondaryCopy: "Open the tool or save this notice to your Memory Card.",
      contentType: "project_update",
      destinationType: "external",
      destinationUrl: "https://noise.awakencult.com/",
      status: "published",
      startAt: "2026-01-01T00:00:00Z",
      endAt: null,
      recurrence: null,
      priority: 20,
      frequency: { scope: "browser", maxDisplays: 1 },
      delayMs: 1600,
      routes: ["desktop"],
      mobileEligible: true,
      desktopEligible: true,
      dismissal: "browser",
      verificationStatus: "verified",
      sourceRef: "https://noise.awakencult.com/"
    }
  ],
  fragments: [
    { id: "catalog-state-of-mind", title: "State Of Mind", body: "EP released 28 June 2022.", sourceType: "apple_music", sourceRef: "1656676894", status: "published" }
  ],
  ads: [
    { id: "security-memory", title: "AWAKEN SECURITY CENTRE", enabled: true, type: "security", weight: 3, minimumSessionAgeMs: 45000, cooldownMs: 600000, maximumPerSession: 1, maximumPerDay: 2, actionType: "recover", contentReference: "recovery-default" },
    { id: "messenger-unknown", title: "AWAKEN Messenger", enabled: true, type: "messenger", weight: 2, minimumSessionAgeMs: 90000, cooldownMs: 900000, maximumPerSession: 1, maximumPerDay: 1, actionType: "message", contentReference: "mind-recent" }
  ],
  featureFlags: [
    { id: "runtime", title: "Runtime integrations", adsRuntimeEnabled: true, intrusionEnabled: true, galleryStudioEnabled: true, upgradedMediaPlayerEnabled: true }
  ]
};
