# Release experience review — 2026-11-07

Role: experience; read-only implementation review. Baseline: canonical 0.40.0 source. Scope: home identity/header, continuous journey play, settings and secondary sheets. No production/device verification or implementation changes in this review.

## 1. Withdrawn — Alleged zero-gain sound-toggle bug disproven

- The initial finding based on `components/game/SoundSettings.tsx:9–12` was incorrect because it did not trace the `chime('enable')` caller through the shared sound hook.
- Root's caller tracing confirmed that `components/game/useGameSound.ts:34` explicitly restores zero gain on the enable action and notifies the settings through `SOUND_LEVEL_EVENT`.
- This is not a confirmed defect and requires no implementation change. The earlier sound finding and proposed fix are withdrawn; no further sound investigation was performed for this correction.

## 2. P2 — World completion adds two decisions before bonus gameplay, and every bonus re-entry repeats the tutorial

- Source: `components/game/Solo.tsx:167–183`, `components/game/BonusRound.tsx:30–35`, `components/game/App.tsx:108,136–137`. The normal result primary changes to Bonus turu; tapping it opens a full introduction requiring another start tap. All bonus replay/re-entry paths reset or begin with `started=false`, so the same lengthy rules repeat. After the bonus result, a new-world welcome requires another Play tap. The one-time world reveal is intentional; the repeated full rule presentation is the avoidable friction.
- Narrow fix: retain explicit start consent for a timed round, but keep full instructions only for the player's first bonus. On later entry/replay, make the ready/resume presentation compact and keep the rules in the existing help sheet. Keep the main journey action obvious on the normal result; offer the optional bonus without hiding progression or making its result introduce unrelated choices. Keep the one-time world arrival scene rather than removing it globally.
- Acceptance: same-world normal result still reaches the next board in one tap; world-completion skip reaches the once-only new-world welcome; bonus replay and interrupted-bonus resume do not repeat paragraphs; time never starts before the explicit ready action. Chapter IDs, gates, saves, bonus results, and reward calculation remain unchanged.

## 3. P2 — Main settings and help still drop into the older visual system

- Source: `components/game/App.tsx:159,162`, `components/game/common.tsx:120–127,152`, `components/game/Solo.tsx:179–180`. The main settings wrapper is a plain base Modal, whereas the in-game tools use the dark `game-tools-modal`. General/story/riddle help and daily-exit sheets still use the plain base surface. Moving through common controls therefore changes modal typography/surface treatment even though it is the same game.
- Narrow fix: use one existing themed settings/help sheet treatment, including labels, muted text, form fields, toggles, focus and disabled states; do not merely put a dark background under existing dark text. Keep account/privacy/report content and semantics available. Reuse a consistent settings row presentation for the shared preferences rather than exposing two differently worded controls for the same setting.
- Acceptance: home → settings → help → game tools → story/riddle help keeps readable foreground/background and stable close/back behavior at 321×570 and 414×736 with safe area; long report/privacy content scrolls inside its sheet and the close control remains reachable.

## Header check / review limit

`components/game/App.tsx:146–149` puts a 44px avatar opposite the wider stars-plus-settings group and centers the brand only in the remaining flex space. `app/clarity.css:4,13` makes the brand 14px/12px with ellipsis; `JourneyHome.tsx:36` retains a separate stage-wordmark placeholder that later CSS hides. This explains why identity can feel weak/off-center, but the existing 0.40.0 event screenshots do not establish clipping. Root is inspecting the actual full shell; verify balanced title positioning and the complete game name at narrow widths with large star counts before adjusting it. Avoid adding a second header or shrinking text further.

Source review only. No gesture/motion implementation was touched. No physical iPhone or auditory validation was performed. Existing first-use/new-world teaching should not be removed in a general simplification pass.
