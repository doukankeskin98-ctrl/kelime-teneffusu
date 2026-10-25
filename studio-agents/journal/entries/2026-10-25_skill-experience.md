# Skill-guided experience review

Scope: bounded read-only review of current home and word-selection presentation. Applied `game-ui-ux` and `game-feel`, plus feedback-recipes reference. Source evidence only; no browser, physical touch, player retention or FPS observation. Application code unchanged.

## 1. Make the current discovery the home screen's focal point

Sources: `components/game/DiscoveryStart.tsx:14-33`, `app/playful-studio.css:15`, `components/game/Pages.tsx:24-26`. Mobile hero has a 405px minimum, 150px introduction, marketing heading, separate recommendation card and shortcuts. Atlas follows immediately as another large start area. Small supporting labels range from 8 to 10px. This is a hierarchy/design risk inferred from source, not measured clipping.

Recommendation: make the current-world illustration and a single large play action the first-screen composition, with concise current chapter/resume status and readable supporting text. Keep the `nextDiscovery` recommendation and handlers authoritative. Preserve map and world shortcuts but reduce repeated introductory prose. Use the existing art asset rather than requesting another full art batch.

Acceptance: one visually dominant play action; recommendation still opens exactly the current unfinished chapter; 360x640 and 390x844 first-screen review, 200% text naturally wraps, no fixed height clipping. No progress/catalog changes.

## 2. Give the selected letters a tactile response

Sources: `components/game/Board.tsx:31-39`, `app/mobile-game.css:14`. Current drag updates SVG ink and endpoint circles, but memoized letter spans depend only on signature/paused. Individual selected letters therefore remain visually static.

Recommendation: derive selected-cell presentation from the same `preview` cells used for the SVG, with a brief small scale and clear color treatment. Keep grid dimensions and hit testing unchanged. Revert state on clear, Escape, cancel, blur and resize using existing clear path. Preserve paused obscuring and zoom two-tap behavior.

Acceptance: diagonal and reversed selection highlight exactly preview cells, no input-blocking animations or layout movement, cancellation clears presentation, reduced-motion removes transforms, keyboard selection is equally clear. This is presentation of an existing selection, not a rule change.

## 3. Scale celebration by event importance and confirmed state

Sources: `components/game/Solo.tsx:70-73`, `components/game/Solo.tsx:42`, `app/atlas-adventure.css:11,22`. Sound currently plays before `dailyClaim` confirmation. Every accepted word displays a centered overlay with a pale 72%-width, 35%-height background for1.1s, visually covering letters even though pointer events remain enabled. Reduced motion removes animation but keeps this overlay visible throughout its timer.

Recommendation: for ordinary finds, use a short compact edge/banner confirmation and highlighted accepted stroke; reserve center celebration for final completion. Move daily success chime into the confirmed API path so rejected requests do not sound successful. Keep result pause timing and pending/saved semantics explicit.

Acceptance: daily failure emits no success sound; confirmed finds emit once; ordinary confirmation leaves the middle board visible and input usable; final celebration remains distinct; reduced motion keeps clear static feedback with no particles. No score, hint, reward or save changes.

Priority suggestion: deliver these as one coherent first-screen-to-first-word polish pass, then perform supported visual QA. Do not claim a studio-quality or fun/retention outcome from source tests alone.

## Final diff pass

Reviewed Board selected-cell presentation, home route grid, Solo success event ordering and `app/crafted-play.css` once, without rerunning broad checks.

1. Blocking geometry regression identified: changing `.letter-grid` from original absolute/inset layout to `position:relative` allows intrinsic text-row height to diverge from the square SVG and pointer coordinate space. Reported immediately. Coordinator confirmed restoration of original absolute layout; only z-index2 retained.
2. Contrast regression: dark-surface `.game-app .panel-heading b` and `.game-app .panel-heading .eyebrow` colors also apply to `.game-app.sprint-app`, whose light lilac background remains. Scope these pale heading/targets treatments to non-Sprint games or restore Sprint dark heading colors. Acceptance: Sprint count/label readable on its existing light surface, including mobile transparent targets panel. This is source color/cascade evidence, not a device screenshot.
3. Daily success audio now occurs after awaited dailyClaim resolves, so rejected claims do not chime. No changed save/reward rules found. Toast no longer obscures board center; it still briefly covers a bottom strip, so actual mobile play should confirm this placement remains comfortable. Home route uses minmax(0,1fr), bounded CTA, natural wrapping and single-column fallback at360px. No further blocking source issue identified in those changes.

Review limitation remains: source/CSS reasoning only, no browser pixel geometry, real pointer input or measured performance.
