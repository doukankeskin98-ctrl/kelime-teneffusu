# 0.39.0 — Coordinated play presentation

Focus: implement the observed WoW transition quality using the game's existing scene/art/content, not an engine or content rewrite. Phone disconnected; no device install or physical claims.

Acceptance:
- Accepted word feedback remains immediate and retains720ms flight/180ms landing. Final completion waits only the remaining local flight time after server ACK, then220ms of UI withdrawal, then scenic result. Progress/score persist independently.
- Restored results, skip, reduced motion and background do not wait for animation; scope switches clean timers.
- Target rack stays fixed; selection bubble sits beside the action without replacing topic or shifting geometry.
- Arena/Meydan retain required score/time/rank and connection errors, remove duplicate permanent metadata.
- Shared contextual tools retain solo pause and competitive running-clock semantics; one prominent return action.
- Results preserve current world backdrop, put earned album progress and next topic in one clear path; no reward/ID/save schema changes.
- Required content, TS, tests, production WorkerHTTP and mobile build checks; browser layout/interaction preview; no phone testing.

Read-only specialists: flow_experience_review and flow_reliability_review. Root owns application edits.

Validation:797tests,content,typecheck,web production,mobile package+sync,695WorkerHTTP,and iOS simulator edge check passed. Browser321x570/414x736 normal play/result/tools checked. Read-only reviewer found pre-ACK background cleanup gap, fixed and covered. No physical-phone testing/install. Publication receipt stored outside tracked source after deployment.
