# 0.44 navigation experience review

Scope: approved post-0.43 simplification only. Source reviewed: current Sites checkout at 8528623fb2cc5cf4712b5fe72e98f4ad1f9358f7. Read-only application review; no app/test changes, no runtime or physical-device claim. The user explicitly asked to remove the main Collection destination while preserving progress and rewards.

## 1. Move the destination, not the rewards

**Evidence:** `components/game/App.tsx:57,147-155,157` declares Collection as a bottom tab and top-bar title, while the avatar also leads to the same route. `components/game/Pages.tsx:62-74` mixes albums, profile and achievements; the default and browse-return state select albums (63-65). `components/game/WordTrail.tsx:12` sends newly earned badges to “Koleksiyon · Başarımlar”. `lib/game/navigation.ts:1-7` accepts the existing `?sekme=profil` link.

**Impact:** deleting just the tab leaves the old name behind, moves the rewards out of sight, and leaves avatar visits inside a Collection shell. Existing album navigation must remain discoverable.

**Smallest recommendation:** keep only Yolculuk and Arena in the primary bottom navigation. Use the existing avatar and `profil` URL for an explicitly titled Profil destination with two sections, Profil and Başarımlar. Move the existing DiscoveryAlbums, story album and dated release-stamp presentation into Journey details, preserving their save sources. Point badge copy to “Profil · Başarımlar”. Retain `profil` parsing and resolve any additional legacy Collection alias to the new profile/Journey details deliberately. The visible title and return action must match the new destination; do not delete reward schemas or migrate completed records for a navigation-only change.

**Acceptance:** old `?sekme=profil` opens a usable profile; avatar opens statistics and badges; all previously earned world pieces, story rewards and release stamps remain reachable through Journey details. Badge selection and settings still work. Two bottom tabs are correctly laid out; profile has a clear return route.

## 2. One play action on home; world detail owns the rest

**Evidence:** `components/game/JourneyHome.tsx:34-44` presents a map button, world heading, chapter count/topic, word count, play action, reward card, six chapter circles and a side-game shortcut on the same surface. `components/game/ChapterPicker.tsx:14-31` already owns unlocked/completed states, per-chapter stars, topic and play/resume action. `components/game/Discovery.tsx:52-54` owns the earned-piece details and world-to-chapter jump.

**Impact:** the additional reward/trail controls compete with the next chapter even though the same information already has a dedicated detailed view. A broad replacement would risk existing unlock and replay behavior without necessity.

**Smallest recommendation:** keep scenic world context, one clear chapter-number CTA and its short topic. Remove the home reward card, six-circle trail and explanatory count line. The existing map control becomes a clearly named Journey detail entry. In details, group the worlds with current world expanded, preserving all chapter play/replay/gate state; show world pieces/album on that world rather than on home. Keep the current chapter visible after returning from details, without switching the remembered story/main-journey preference unexpectedly.

**Acceptance:** home has one dominant play action; details expose every authored main chapter, stars, old rewards and locked status; current world is immediately apparent. Replaying a completed chapter does not change completion/gating. The complete-catalog state still has a usable chapter-list action. Validate 360/414-pixel-wide preview and large text for CTA clipping, world headers and expanded details.

## 3. Flatten side games and preserve archive return context

**Evidence:** `JourneyHome.tsx:44-49` opens Diğer oyunlar, whose fourth entry opens another Oyun arşivi list. `Pages.tsx:37-50` contains the second list (Hızlı Tur, Gizli Tema, İpucu Avı, Serbest oyun, Ek bölümler). The old album path has additional return context: `App.tsx:109,130-131` restores `browseReturn`, scrolls to `kesif-damgalari`, and distinguishes `extraOrigin.source`. `App.tsx:129,158` opens the chosen world's ChapterPicker without changing the underlying page. `Pages.tsx:65,67` consumes the archive return to select albums.

**Impact:** the two list layers add an unnecessary decision and make similar content hard to find. Moving album components without their return context would return players to an unrelated profile view or lose the previous date/scroll position.

**Smallest recommendation:** make home’s Diğer oyunlar open the existing archive directly. Put Bonus turları, Günlük bulmaca and Hikâyeler in that one list alongside the existing authored modes. Keep standalone browser routes for `arsiv` and `gunluk`. Transfer dated-album `browseReturn`, initial dataset and `kesif-damgalari` anchor handling to the new Journey-details owner; keep the parent detail open when a world album temporarily opens ChapterPicker. Do not keep an extra hidden Collection route solely to satisfy old code.

**Acceptance:** each side mode has one clearly labeled entry; all current content remains reachable; entering and returning from a dated release restores collection/date/card context from both archive and album origins. Reloading an existing daily/archive/profile link works. Returning from an album's world chapters lands in the same Journey-detail context. Test routing and source/origin handling specifically; this review does not verify runtime transitions.
