/** Reader-first release. Enabling the writer requires the recorded device acceptance
 * and a rollback build retaining this codec and the immutable revision catalogue. */
export const COMPACT_PROGRESS_WRITES=false;
export const CONTENT_REVISION_TWO=false;

// Defined only in the isolated Vite pilot. Ordinary web and native builds stay on the released catalogue.
declare const __KT_LOCAL_JOURNEY_PILOT__:boolean;
export function localJourneyPreview(){
 return typeof __KT_LOCAL_JOURNEY_PILOT__!=='undefined' && __KT_LOCAL_JOURNEY_PILOT__ && typeof location!=='undefined' && ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
}

// The separate Capacitor build retains its own catalogue until a native release.
declare const __KT_RELEASED_WEB_JOURNEY__:boolean;
export function authoredJourneyEnabled(){
 return (typeof __KT_RELEASED_WEB_JOURNEY__!=='undefined' && __KT_RELEASED_WEB_JOURNEY__) || localJourneyPreview();
}
