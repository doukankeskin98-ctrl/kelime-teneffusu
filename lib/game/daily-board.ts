import {dailySpec,makePuzzle} from './engine.ts';
import {safeSnapshot,PRESENTATION_RULES} from './board-quality.ts';

// A fixed future-day boundary preserves every already issued daily board/receipt.
// Freeze this policy: later generator changes must have another dated version.
export const SAFE_DAILY_FROM='2026-11-14';
export const STRICT_DAILY_FROM='2026-11-15';
export function dailyBoard(day:string){
 const spec=dailySpec(day),canonical=makePuzzle(spec.themeId,spec.level,spec.seed);
 return day<SAFE_DAILY_FROM?canonical:day<STRICT_DAILY_FROM?safeSnapshot(canonical,spec.seed):safeSnapshot(canonical,spec.seed,{},PRESENTATION_RULES);
}

/** Retained for compatibility checks. Issued daily receipts never use a new policy retroactively. */
export function dailyBoardV1(day:string){
 const spec=dailySpec(day),canonical=makePuzzle(spec.themeId,spec.level,spec.seed);
 return day<SAFE_DAILY_FROM?canonical:safeSnapshot(canonical,spec.seed);
}
