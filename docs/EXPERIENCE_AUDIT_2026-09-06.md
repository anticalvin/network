# AWAKEN NETWORK experience audit

Reviewed 6 September 2026 against deployed commit e3549ee and the user's direction: a Windows XP time machine on desktop, a recognizable XP experience on a phone, and an archive the team can continually update.

## Scope and limits

Live browser review covered entry, desktop, Archive → 2019 → XP, Media Player and its XP Apple Music embed, MIND with retry, Gallery, LIVE INTERNET and THE FEED. Phone viewport: 390 × 844; desktop: approximately 1272 × 818. Also reviewed shell, media-player, admin, content repository and relevant styles. No production records were changed. No authenticated publishing, real mobile hardware, upload, complete audio-playback or exhaustive accessibility test was performed. MIND failure was observed; its backend cause was not diagnosed. This is an audit and proposed backlog, not an implementation report.

## Direction

Preserve the AWAKEN wallpaper, eye identity, taskbar, window manager, Explorer, Memory Card, Paint and existing content infrastructure. Make each interaction deliver a useful piece of AWAKEN. Add depth to existing destinations before adding more apps. Distinguish actual history from authored fictional NETWORK material.

## Priority 1: repair trust and functional gaps

1. **Broken live icons (observed):** Media Player, LIVE INTERNET and Settings displayed ImgBB “image not found” artwork. Several other icons are differently proportioned photographic tiles. Publish durable icon assets, preview them before publication, retain bundled fallbacks, and use consistent icon dimensions. An HTTP-success error image will not trigger the current image error listener.
2. **MIND connection (observed):** MIND displayed “Unable to connect” on open and retry. Diagnose the public read path and bridge separately; provide a useful approved cached feed and accurate last-sync time. Do not treat a browser failure as proof that the Discord bot is offline.
3. **Explorer history (code):** Back always navigates to A:\, rather than the previous folder. Implement window-local Back/Forward history, keep Up as the parent action, and synchronize address, task label and window title. Navigation currently replaces the task button's children, removing its new glyph and label structure.
4. **Selected audio (code):** Explorer opens audio in a separate native player. Its “Play in AWAKEN Media Player” context action opens the app without passing the selected file. Pass a canonical playable record to the existing player, including when that window is already open; clean up playback when generic media windows close.
5. **Admin edit loss (code):** Switching records or sections clears editorDirty and rerenders without saving or warning. Add a shared dirty-navigation guard or reliable draft capture. The recently added beforeunload protection only covers leaving the page.
6. **Conflicting publications (code):** Publishing overwrites the single live snapshot with the editor's entire payload. Add revision comparison and restoreable publication history so two editors cannot silently overwrite one another.
7. **Draft/live confusion (code):** The public content loader prioritizes a local admin draft over fetching the live edition. Make preview explicit and clearly labelled; provide a one-click live view that ignores local drafts.
8. **Popup coordination (code):** Ads, transmissions and the MIND assistant have separate scheduling paths. The new 30-second post-interaction quiet period only applies to ads. Use a shared eligibility gate, one interruption limit and a clearly scoped disable setting. Make dismissals and daily limits match their stated duration across sessions.
9. **Sound setting (code):** The shell stores the System sounds preference, but no matching shell sound service was found. Connect meaningful, optional sounds through one service before presenting this as a functional setting.

## Priority 2: make the archive worth exploring

10. **Era folders:** The observed Archive lists 2019, 2021, 2022, 2026 and Assets. Generate eras from published dated records rather than fixed branches. Each populated era should offer a short introduction and related releases, photos, artwork, videos, flyers, writing and projects. Empty years need no invented events.
11. **Release dossiers:** XP currently offers a short catalog paragraph, artwork and an external music link, plus decorative drive metadata. Add real tracklists, credits, making-of material, dated images and connections to people/projects. Keep publication date separate from copyright year. Label fictional drive state as aesthetic or replace it with meaningful archive metadata.
12. **Connected discovery:** Atlas relationships currently render as names rather than navigable discoveries. Link person → releases → collaborators → related images/era, with a clear route back. Extend search to published Atlas people and relationships, gallery records and useful filters.
13. **Photo exploration:** Add thumbnail/contact-sheet view, previous/next image, captions, dates, photographer credits, keyboard navigation and phone swipe. Gallery was empty during this visit; distinguish an empty collection from a loading or connection failure, and link to Paint where relevant.
14. **Useful Memory Card:** Make saving photos, releases and stories consistent; add a small recent-history list and clear device-local persistence messaging. Use unlocks to reveal approved archive material, with discoverable hints. Consider export/import for portability before requiring accounts.
15. **NETWORK sites:** THE FEED currently presents a short static fictional text block and Save button. Keep this authored character, but connect entries to actual approved media, stories and destinations. Give a few sites substantive, distinct experiences before expanding the list. Avoid invented factual claims about the collective.
16. **Returning visitors:** Offer an optional What's New text file or XP-style update panel, showing genuine publication dates and new archive additions. Avoid auto-opening it. Remember useful preferences and allow deliberate session restoration.

## Priority 3: strengthen XP behavior on both screens

17. **Desktop behavior:** Consistent icons, selection state, desktop double-click/open preference, working context menus, resize handles, window geometry persistence, predictable minimize/restore, and keyboard focus return. Keep browser shortcuts intact. Fix title/task synchronization before adding interaction flourishes.
18. **Phone behavior:** Preserve the XP frame, taskbar and wallpaper with one focused app at a time. Use a clear running-app switcher and Show Desktop action, compact titlebars and a More menu for secondary actions. Maximize should be hidden or useful when the window is already fullscreen. Offer long-press menus and large tap targets.
19. **Phone content layout:** At 390px the reviewed player had no document-level horizontal overflow, but it is a long stack of competing sections. Use Now Playing / Library / EQ / Sources views, retain playback access, and keep status copy compact. Test the keyboard, safe areas, portrait/landscape and app switching on actual phones.
20. **Entry:** The current entry traverses multiple stages before the guest desktop. Preserve a deliberate first-visit ceremony, provide a clear skip, and make returning visits fast. The guest login should not imply an account is needed. Any status/progress claims should reflect real state or clearly authored fiction.
21. **Visual hierarchy:** Use a consistent XP chrome vocabulary across Explorer, player, dialogs and admin previews. Keep icon artwork within its cell; the observed tall Community image crowds its label. Release contents currently clip at the right side in the desktop card layout. Use compact controls and spacious media where each helps.
22. **Accessibility and efficiency:** Audit all window focus paths, close/restore behavior, menus, live announcements, motion settings, text contrast and image failures. Stop visualizer work when hidden or idle rather than merely drawing a static frame repeatedly. Check media lifecycle across rapid close/reopen and source switches.

## Priority 4: simplify listening and publishing

23. **Music-first player:** Open on an inviting AWAKEN library with a clear play/preview action and source choice. The XP release successfully loaded an Apple Music embed in this review, but the local Now Playing heading still represents a different audio source. Explain the active source visually; keep local transport/EQ distinct from embed controls. Put URL entry and local file import in a secondary view. Turn the sidebar's current static labels into working navigation.
24. **One release record:** Public Atlas currently filters which hardcoded PROJECTS entries the player may display. Publishing a new Atlas release alone does not make it a complete player/library entry. Build release presentation from the canonical managed record, including artwork, tracks, sources and credits. Reuse it in Explorer and public release pages.
25. **Editorial forms:** Offer Add release, Add photo, Add story, Add video and Post update. Ask for title, date, media, caption and related people/project; derive paths and IDs. Keep raw JSON, MIME types and timing in milliseconds in advanced controls.
26. **Media management:** Bulk upload with thumbnails, crop/preview, progress, useful failure messages, alt text, credit and replacement without breaking references. Show where each asset is used. Validate links and imagery before publication.
27. **Publication workflow:** Device/cloud draft → preview desktop and phone → publish/schedule → publication receipt. Include version restoration, changed-fields review, and feedback about missing required content. Scheduling must have an actual public eligibility/enforcement path, not just a selectable status.
28. **Published-page consistency:** Managed live content updates and build-generated SEO pages have different lifecycles. Establish a deliberate regeneration/deployment process or another consistent public projection so a new release does not differ between the OS and shareable pages.
29. **Operational visibility:** Give administrators actual connection state, last successful publication, stale-content warnings, broken media and pending moderation in one place. Avoid fabricated “online” status. Keep public messages simple and maintain the existing private/public boundaries.

## Suggested implementation sequence

- **A — Reliability:** Icons, MIND diagnosis, navigation history, selected-audio handoff, dirty-editor protection, draft/live clarity and one popup gate. Verify these with user-flow tests.
- **B — XP experience:** Phone task switching, desktop window behavior, consistent icons/chrome, coherent player navigation and image viewing.
- **C — Living archive:** One complete era and one rich release dossier using real supplied material, clickable relationships, useful saved items and What's New.
- **D — Team publishing:** Friendly content forms, durable assets, revision checks/rollback and synchronized public projections. Expand the curated archive after this publishing flow is reliable.

## Completion scenarios

- First visitor reaches the desktop easily, opens an era, views a photo, discovers a related release, listens and saves it without losing their place.
- Phone visitor switches between archive and player, returns to desktop and uses Back without clipped content or inaccessible controls.
- Editor adds a dated photo from a phone, relates it to a release, previews both views, publishes, verifies it in a fresh visitor session, and can restore the previous edition.
- Failed remote content leaves useful cached material and honest status. No event interrupts boot, active editing or another event; disabling interruptions is effective across all event paths.

A full historical experience needs approved photos, writing, dates, credits and source material from AWAKEN. Code can organize and connect that material; it should not invent the history.
