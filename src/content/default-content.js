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
  filesystem: [
    { id: "universe-folder", name: "NETWORK", path: "A:\\NETWORK", nodeType: "folder", visibility: "public", status: "published" },
    { id: "universe-readme", name: "WELCOME_TO_THE_NETWORK.txt", path: "A:\\NETWORK\\WELCOME_TO_THE_NETWORK.txt", nodeType: "document", visibility: "public", status: "published", content: "You are inside the public edge of AWAKEN NETWORK. Some files are releases. Some are messages. Some are waiting for the right person to open them." },
    { id: "universe-night-shift", name: "NIGHT_SHIFT_LOG.txt", path: "A:\\NETWORK\\NIGHT_SHIFT_LOG.txt", nodeType: "document", visibility: "public", status: "published", content: "03:31 - Taskbar heard moving in an empty session.\n03:32 - User icon changed expression.\n03:33 - Incoming call from CALL-AWAKEN.\n03:34 - Operator marked incident as normal." },
    { id: "universe-guest-rules", name: "GUEST_RULES.txt", path: "A:\\NETWORK\\GUEST_RULES.txt", nodeType: "document", visibility: "public", status: "published", content: "1. Do not remove the Memory Card while saving.\n2. Do not answer a popup you do not intend to remember.\n3. Trash is not deletion.\n4. The outside internet is less reliable than it claims." },
    { id: "universe-number", name: "MISSED_CALL_0333.txt", path: "A:\\NETWORK\\MISSED_CALL_0333.txt", nodeType: "document", visibility: "public", status: "published", content: "CALLER: UNKNOWN NETWORK\nDURATION: 00:00\nMESSAGE: You were online before you arrived." },
    { id: "universe-cache", name: "DO_NOT_CLEAR_CACHE.txt", path: "A:\\NETWORK\\DO_NOT_CLEAR_CACHE.txt", nodeType: "document", visibility: "public", status: "published", content: "The cache contains weather from adjacent timelines, one unfinished chorus, and proof that the Shop nearly opened once." }
  ],
  networkSites: [
    { id: "the-feed", slug: "the-feed", title: "THE FEED", tagline: "People you know. Signals you probably should not.", body: "TRENDING NOW\n\nNO.END.THEORY changed their status to: still loading.\n\nCALL-AWAKEN posted: If the line rings twice, do not answer on the first network.\n\nNa$he uploaded a voice note from tomorrow.", accent: "#245edb", status: "published", sortOrder: 1 },
    { id: "call-awaken-classifieds", slug: "classifieds", title: "CALL-AWAKEN CLASSIFIEDS", tagline: "Local listings from the parallel system.", body: "FOR SALE\n\n1 slightly used guest login. No password included.\n\nWANTED\n\nMissing memory block, last seen near A:\\Archive\\Assets.\n\nFREE\n\nA ringtone that only plays at 03:33.", accent: "#008080", status: "published", sortOrder: 2 },
    { id: "channel-zero", slug: "channel-zero", title: "CHANNEL ZERO", tagline: "Tonight's programming may have already happened.", body: "20:00  AWAKEN PUBLIC ACCESS\n21:30  SHOPPING CHANNEL: OBJECTS WITH NO PRICE\n23:00  STATE OF MIND / LIVE FROM A CLOSED TAB\n00:00  TECHNICAL DIFFICULTIES", accent: "#da4a44", status: "published", sortOrder: 3 },
    { id: "parallel-weather", slug: "parallel-weather", title: "PARALLEL WEATHER", tagline: "Forecast for Johannesburg and adjacent timelines.", body: "NOW: 18 C / signal haze\nTONIGHT: scattered archive fragments\nTOMORROW: clear browser history with a 40% chance of coincidence\n\nNETWORK ADVISORY: keep your Memory Card inserted.", accent: "#6f7f2a", status: "published", sortOrder: 4 },
    { id: "awaken-messenger", slug: "messenger", title: "AWAKEN MESSENGER", tagline: "Everyone is away. Everyone is typing.", body: "BUDDY LIST (3/99 ONLINE)\n\nNO.END.THEORY  [away: rebuilding reality]\nNa$he           [online]\nCALL-AWAKEN     [typing...]\n\nSYSTEM MESSAGE\nYou cannot block a contact that has not happened yet.", accent: "#37a24f", status: "published", sortOrder: 5 },
    { id: "dream-authority", slug: "dream-authority", title: "DREAM AUTHORITY", tagline: "Official forms for unofficial experiences.", body: "FORM 11-B: RECURRING LOCATION REQUEST\n\nLocation: an empty mall with the AWAKEN Shop open\nFrequency: every third login\nMusic heard: unknown / familiar\n\nSTATUS: APPLICATION RETURNED\nREASON: DREAM ALREADY IN PRODUCTION", accent: "#b7bcc8", status: "published", sortOrder: 6 }
  ],
  ads: [
    { id: "security-memory", title: "AWAKEN SECURITY CENTRE", copy: "Unregistered save fragments were found. Insert Memory Card to recover bonus archive data.", enabled: true, type: "security", weight: 3, minimumSessionAgeMs: 45000, cooldownMs: 600000, maximumPerSession: 1, maximumPerDay: 2, actionType: "recover", contentReference: "recovery-default" },
    { id: "messenger-unknown", title: "AWAKEN Messenger", copy: "CALL-AWAKEN is typing a message from an unknown year.", enabled: true, type: "messenger", weight: 2, minimumSessionAgeMs: 90000, cooldownMs: 900000, maximumPerSession: 1, maximumPerDay: 1, actionType: "message", contentReference: "mind-recent" },
    { id: "shop-catalog", title: "SHOP CATALOG UPDATE", copy: "Three objects without prices were added to the coming-soon catalog.", enabled: true, type: "installer", weight: 1, minimumSessionAgeMs: 120000, cooldownMs: 1200000, maximumPerSession: 1, maximumPerDay: 1, actionType: "connect", contentReference: "SHOP.EXE / BUILD 0.37" },
    { id: "missed-call", title: "MISSED NETWORK CALL", copy: "You missed a zero-second call from your own guest session.", enabled: true, type: "dialer", weight: 1, minimumSessionAgeMs: 150000, cooldownMs: 1800000, maximumPerSession: 1, maximumPerDay: 1, actionType: "connect", contentReference: "CALL-AWAKEN / 03:33" }
  ],
  featureFlags: [
    { id: "runtime", title: "Runtime integrations", adsRuntimeEnabled: true, intrusionEnabled: true, galleryStudioEnabled: true, upgradedMediaPlayerEnabled: true, universeSitesEnabled: true }
  ]
};
