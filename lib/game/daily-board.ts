import {dailySpec,makePuzzle} from './engine.ts';
import {safeSnapshot} from './board-quality.ts';

// A fixed future-day boundary preserves every already issued daily board/receipt.
// Freeze this policy: later generator changes must have another dated version.
export const SAFE_DAILY_FROM='2026-11-14';
export function dailyBoard(day:string){
 const spec=dailySpec(day),canonical=makePuzzle(spec.themeId,spec.level,spec.seed);
 return day<SAFE_DAILY_FROM?canonical:safeSnapshot(canonical,spec.seed);
}
