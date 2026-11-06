import type {ChallengeView} from './social.ts';
/** A delayed reconnect must not erase a confirmed claim or reopen a finished run. */
export function newerChallenge(current:ChallengeView|null,next:ChallengeView,allowSwitch=false):boolean{
 if(!current)return allowSwitch;
 if(current.id!==next.id)return allowSwitch;
 return next.serverNow>=current.serverNow&&next.strokes.length>=current.strokes.length&&current.strokes.every(s=>next.strokes.some(n=>n.id===s.id))&&!(current.finished!==null&&next.finished===null);
}
