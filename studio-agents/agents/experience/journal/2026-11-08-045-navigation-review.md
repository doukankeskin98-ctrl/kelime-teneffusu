# 0.45.0 experience review

Read-only source review at 0.44.1 / ca079e63538286e48c8cbd983ccab304366ba71f. Scope: transient notices, side-game hierarchy and in-play settings. No app edits, test runs or publication. The prior short native acceptance does not establish long-session or real-player quality.

## 1. The status slot must reserve height before a message exists

Evidence: `components/game/Solo.tsx:175-180` puts generic messages in the HUD; `app/play-comfort.css:7-9` first visually hides them, then makes notices absolute across the HUD. `app/focused-journey.css:77` collapses empty HUDs. `lib/game/viewport.ts:42-55` measures each board-panel child and refits the board from its real height. Thus a newly inserted conditional message below the board can shrink or move it even after the overlay is removed.

Recommendation: always mount one fixed/reserved control-adjacent status slot as part of the footer's measured wrapper. Empty and populated states must have identical outer geometry. Use a new class, rather than inheriting the old `.game-message` absolute/clip rules. Keep `FirstPlayGuide` in the HUD and the authored `StoryHud` reveal in its story layout; these are not generic transient notices. Keep one live announcement per message, not duplicate hidden and visible copies. Long action/storage errors already have dedicated surfaces and must not be truncated into this short slot.

Acceptance: on the same 375/414 viewport, board rectangle and targets remain unchanged before/during/after hint, near-miss and rotation notices. Check an empty slot, a two-line notice, guide, story reveal and daily pending notice. Existing source/hook tests cannot demonstrate absence of spatial overlap; compare browser rectangles/screenshots.

## 2. Three primary entries must preserve every secondary return path

Evidence: `components/game/Pages.tsx:31-57` has a controlled `LibraryPanel` union and eight peer actions; existing stories, bonus, riddle, theme and dated-chapter panels already own their data and callbacks. `App.tsx` keeps `libraryPanel` across play and also restores `browseReturn` for dated/studio archives. `tests/word-access.test.ts:347-350` protects remembered story selection, while `tests/achievement-loop.test.ts:108` checks the simple home entry, not all secondary archive paths.

Recommendation: three primary rows Günlük bulmaca / Kısa oyunlar / Hikâyeler; Kısa oyunlar groups the existing Bonus turları and Hızlı Tur, without merging their distinct clocks/rules. A secondary “Konuya göre” disclosure can retain Gizli Tema, İpucu Avı, Serbest oyun and Ek bölümler. Add only the parent panel needed for short games to `LibraryPanel`; do not replace existing child identities or reset archive date/filter context when those entries move. Child close should return to its visible parent, and game return should restore the child originally used.

Acceptance: each existing mode still launches once with the same config; Bonus gates remain; daily route/auth remains; theme difficulty and dated chapter return retain context. Include direct child-panel restoration in the focused navigation test, not just a three-row count.

## 3. Settings details must not close/reopen the pause owner

Evidence: `common.tsx:123-151` owns one GameToolsSheet and PlayControls' `resume` ref. `PlayPreferences.tsx:12-21` already reads shared haptics/comfort state and conditionally exposes vibration on supported runtimes. `tests/word-access.test.ts:515-539` protects timed clocks and exit-without-resume; `tests/journey-interludes-ui.test.ts:47-53` protects Bonus tools across background/remote completion. These tests do not cover opening/closing an internal detail page.

Recommendation: retain the same mounted GameToolsSheet while showing primary Ses/Titreşim and a secondary details state or disclosure for zoom/reduced-motion/help. Details navigation must only change local presentation state, never call `onClose`. Split the shared comfort controls by presentation if necessary, keeping the same context and availability check; do not introduce a second preference store. Preserve `onClose(false)` for Home. Do not change Help to `onClose(false)` without transferring ownership: Solo currently relies on normal close to release its tools pause before the help guard takes over, otherwise closing help can leave it paused.

Acceptance: primary→details→primary never toggles the pause owner, ordinary close resumes exactly once, Home does not resume, timed Arena/daily clocks continue, Bonus remains stopped through foreground return while either settings section is open. Haptics reflects the real existing preference and is not falsely advertised in unsupported web runtimes.

## Final bounded diff check

Reviewed only the requested Pages.tsx, common.tsx, PlayPreferences.tsx, Solo.tsx and focused-journey.css diff. No serious regression found: primary/secondary menu children retain their panel identities and return parents; the notice remains mounted with a 36px outer height for non-story play; StoryHud and FirstPlayGuide remain separate; native details does not call the sheet close callback; haptics retains the existing shared preference and capability check; Home still uses close(false). No new test run or device observation by this reviewer. Coordinator supplied the 414×628 before/after board/topic rectangle equality and screenshot evidence.
